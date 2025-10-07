"""
Improved Dental Semantic Segmentation Training
Optimized for small datasets with real data only
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import segmentation_models_pytorch as smp
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2
import numpy as np
import os
import glob
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import KFold
import json
import logging
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ImprovedDentalDataset(Dataset):
    def __init__(self, image_paths, mask_paths, transform=None, is_training=True):
        self.image_paths = image_paths
        self.mask_paths = mask_paths
        self.transform = transform
        self.is_training = is_training
        
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # Load image and mask
        image = cv2.imread(self.image_paths[idx])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        mask = cv2.imread(self.mask_paths[idx], cv2.IMREAD_GRAYSCALE)
        
        # Ensure mask is binary
        mask = (mask > 127).astype(np.uint8)
        
        # Apply transformations
        if self.transform:
            augmented = self.transform(image=image, mask=mask)
            image = augmented['image']
            mask = augmented['mask']
        
        # Convert to tensor if not already
        if not isinstance(image, torch.Tensor):
            image = torch.from_numpy(image.transpose(2, 0, 1)).float() / 255.0
        if not isinstance(mask, torch.Tensor):
            mask = torch.from_numpy(mask.astype(np.int64)).long()
            
        return image, mask

def get_aggressive_augmentation():
    """
    Aggressive data augmentation for small datasets
    """
    return A.Compose([
        # Geometric transformations
        A.Resize(512, 512),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.3),
        A.RandomRotate90(p=0.5),
        A.Rotate(limit=30, p=0.7),
        A.ShiftScaleRotate(
            shift_limit=0.1,
            scale_limit=0.2,
            rotate_limit=15,
            p=0.7
        ),
        
        # Elastic transformations
        A.ElasticTransform(
            alpha=1,
            sigma=50,
            alpha_affine=50,
            p=0.3
        ),
        A.GridDistortion(p=0.3),
        A.OpticalDistortion(p=0.3),
        
        # Intensity transformations
        A.RandomBrightnessContrast(
            brightness_limit=0.3,
            contrast_limit=0.3,
            p=0.7
        ),
        A.RandomGamma(gamma_limit=(80, 120), p=0.5),
        A.CLAHE(clip_limit=2.0, p=0.5),
        A.HueSaturationValue(
            hue_shift_limit=10,
            sat_shift_limit=20,
            val_shift_limit=20,
            p=0.5
        ),
        
        # Noise and blur
        A.GaussNoise(var_limit=(10, 50), p=0.3),
        A.GaussianBlur(blur_limit=3, p=0.3),
        A.MotionBlur(blur_limit=3, p=0.3),
        
        # Normalization
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])

def get_validation_transform():
    """
    Simple validation transform
    """
    return A.Compose([
        A.Resize(512, 512),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])

class CombinedLoss(nn.Module):
    """
    Combined loss function for better segmentation
    """
    def __init__(self, alpha=0.5, beta=0.5):
        super(CombinedLoss, self).__init__()
        self.alpha = alpha
        self.beta = beta
        self.dice_loss = smp.losses.DiceLoss(mode='multiclass')
        self.focal_loss = smp.losses.FocalLoss(mode='multiclass')
        
    def forward(self, pred, target):
        dice = self.dice_loss(pred, target)
        focal = self.focal_loss(pred, target)
        return self.alpha * dice + self.beta * focal

def calculate_metrics(pred, target):
    """
    Calculate IoU and Dice metrics
    """
    pred = torch.argmax(pred, dim=1)
    
    # Calculate for each class
    metrics = {}
    for class_id in range(2):  # 0: background, 1: tooth
        pred_class = (pred == class_id).float()
        target_class = (target == class_id).float()
        
        intersection = (pred_class * target_class).sum()
        union = pred_class.sum() + target_class.sum() - intersection
        
        iou = intersection / (union + 1e-8)
        dice = 2 * intersection / (pred_class.sum() + target_class.sum() + 1e-8)
        
        metrics[f'iou_class_{class_id}'] = iou.item()
        metrics[f'dice_class_{class_id}'] = dice.item()
    
    # Overall metrics
    pred_flat = pred.view(-1)
    target_flat = target.view(-1)
    
    correct = (pred_flat == target_flat).float().sum()
    total = target_flat.numel()
    accuracy = correct / total
    
    metrics['accuracy'] = accuracy.item()
    metrics['mean_iou'] = (metrics['iou_class_0'] + metrics['iou_class_1']) / 2
    metrics['mean_dice'] = (metrics['dice_class_0'] + metrics['dice_class_1']) / 2
    
    return metrics

class EarlyStopping:
    """
    Early stopping to prevent overfitting
    """
    def __init__(self, patience=10, min_delta=0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float('inf')
        
    def __call__(self, val_loss):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            return False
        else:
            self.counter += 1
            return self.counter >= self.patience

def train_fold(model, train_loader, val_loader, fold, device, num_epochs=100):
    """
    Train a single fold
    """
    criterion = CombinedLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    early_stopping = EarlyStopping(patience=15)
    
    best_val_loss = float('inf')
    train_losses = []
    val_losses = []
    
    logger.info(f"Starting training for fold {fold}")
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        train_loss = 0.0
        train_metrics = {'accuracy': 0, 'mean_iou': 0, 'mean_dice': 0}
        
        for batch_idx, (images, masks) in enumerate(train_loader):
            images, masks = images.to(device), masks.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            
            # Calculate metrics
            with torch.no_grad():
                batch_metrics = calculate_metrics(outputs, masks)
                for key in train_metrics:
                    train_metrics[key] += batch_metrics[key]
        
        # Average training metrics
        train_loss /= len(train_loader)
        for key in train_metrics:
            train_metrics[key] /= len(train_loader)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_metrics = {'accuracy': 0, 'mean_iou': 0, 'mean_dice': 0}
        
        with torch.no_grad():
            for images, masks in val_loader:
                images, masks = images.to(device), masks.to(device)
                outputs = model(images)
                loss = criterion(outputs, masks)
                val_loss += loss.item()
                
                # Calculate metrics
                batch_metrics = calculate_metrics(outputs, masks)
                for key in val_metrics:
                    val_metrics[key] += batch_metrics[key]
        
        # Average validation metrics
        val_loss /= len(val_loader)
        for key in val_metrics:
            val_metrics[key] /= len(val_loader)
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        
        # Learning rate scheduling
        scheduler.step(val_loss)
        
        # Logging
        if epoch % 10 == 0:
            logger.info(f"Fold {fold}, Epoch {epoch}/{num_epochs}")
            logger.info(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
            logger.info(f"Train IoU: {train_metrics['mean_iou']:.4f}, Val IoU: {val_metrics['mean_iou']:.4f}")
            logger.info(f"Train Dice: {train_metrics['mean_dice']:.4f}, Val Dice: {val_metrics['mean_dice']:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), f'models/best_model_fold_{fold}.pth')
        
        # Early stopping
        if early_stopping(val_loss):
            logger.info(f"Early stopping at epoch {epoch}")
            break
    
    return train_losses, val_losses, best_val_loss

def cross_validation_training():
    """
    Main training function with cross-validation
    """
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Load data paths
    image_dir = "dataset/all-images"
    mask_dir = "dataset/unet-masks"
    
    image_paths = sorted(glob.glob(os.path.join(image_dir, "*.png")))
    mask_paths = sorted(glob.glob(os.path.join(mask_dir, "*.png")))
    
    logger.info(f"Found {len(image_paths)} images and {len(mask_paths)} masks")
    
    # Cross-validation setup
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    fold_results = []
    
    for fold, (train_idx, val_idx) in enumerate(kfold.split(image_paths)):
        logger.info(f"\n{'='*50}")
        logger.info(f"FOLD {fold + 1}")
        logger.info(f"{'='*50}")
        
        # Split data
        train_images = [image_paths[i] for i in train_idx]
        train_masks = [mask_paths[i] for i in train_idx]
        val_images = [image_paths[i] for i in val_idx]
        val_masks = [mask_paths[i] for i in val_idx]
        
        # Create datasets with aggressive augmentation for training
        train_dataset = ImprovedDentalDataset(
            train_images, train_masks, 
            transform=get_aggressive_augmentation(),
            is_training=True
        )
        val_dataset = ImprovedDentalDataset(
            val_images, val_masks,
            transform=get_validation_transform(),
            is_training=False
        )
        
        # Create data loaders with higher batch size due to augmentation
        train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=4, shuffle=False, num_workers=0)
        
        # Initialize model
        model = smp.DeepLabV3Plus(
            encoder_name="resnet34",
            encoder_weights="imagenet",
            in_channels=3,
            classes=2,
            activation=None
        ).to(device)
        
        # Train fold
        train_losses, val_losses, best_val_loss = train_fold(
            model, train_loader, val_loader, fold + 1, device
        )
        
        fold_results.append({
            'fold': fold + 1,
            'best_val_loss': best_val_loss,
            'train_losses': train_losses,
            'val_losses': val_losses
        })
    
    # Save results
    with open('cross_validation_results.json', 'w') as f:
        json.dump(fold_results, f, indent=2)
    
    # Calculate average performance
    avg_val_loss = np.mean([result['best_val_loss'] for result in fold_results])
    logger.info(f"\nCross-validation completed!")
    logger.info(f"Average validation loss: {avg_val_loss:.4f}")
    
    # Train final model on all data
    logger.info("\nTraining final model on all data...")
    
    # Create full dataset
    full_dataset = ImprovedDentalDataset(
        image_paths, mask_paths,
        transform=get_aggressive_augmentation(),
        is_training=True
    )
    full_loader = DataLoader(full_dataset, batch_size=8, shuffle=True, num_workers=0)
    
    # Initialize final model
    final_model = smp.DeepLabV3Plus(
        encoder_name="resnet34",
        encoder_weights="imagenet",
        in_channels=3,
        classes=2,
        activation=None
    ).to(device)
    
    # Train final model
    criterion = CombinedLoss()
    optimizer = optim.AdamW(final_model.parameters(), lr=1e-4, weight_decay=1e-5)
    
    final_model.train()
    for epoch in range(200):  # More epochs for final model
        epoch_loss = 0.0
        for images, masks in full_loader:
            images, masks = images.to(device), masks.to(device)
            
            optimizer.zero_grad()
            outputs = final_model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        if epoch % 20 == 0:
            logger.info(f"Final model epoch {epoch}, Loss: {epoch_loss/len(full_loader):.4f}")
    
    # Save final model
    torch.save(final_model.state_dict(), 'models/dental_segmentation_improved.pth')
    logger.info("Final model saved as 'models/dental_segmentation_improved.pth'")
    
    return fold_results

if __name__ == "__main__":
    logger.info("Starting improved dental segmentation training...")
    logger.info(f"Training started at: {datetime.now()}")
    
    results = cross_validation_training()
    
    logger.info(f"Training completed at: {datetime.now()}")
    logger.info("Check 'training.log' for detailed logs and 'cross_validation_results.json' for results")