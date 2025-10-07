"""
Final Dental Semantic Segmentation Training
Optimized for very small datasets with proper batch handling
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
        logging.FileHandler('final_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FinalDentalDataset(Dataset):
    def __init__(self, image_paths, mask_paths, transform=None, repeat_factor=20):
        # Repeat the dataset multiple times to create more training samples
        self.image_paths = image_paths * repeat_factor
        self.mask_paths = mask_paths * repeat_factor
        self.transform = transform
        
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # Load image and mask
        image = cv2.imread(self.image_paths[idx])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        mask = cv2.imread(self.mask_paths[idx], cv2.IMREAD_GRAYSCALE)
        
        # Ensure mask is binary (0 or 1)
        mask = (mask > 127).astype(np.uint8)
        
        # Apply transformations
        if self.transform:
            augmented = self.transform(image=image, mask=mask)
            image = augmented['image']
            mask = augmented['mask']
        
        # Ensure proper tensor conversion
        if isinstance(image, torch.Tensor):
            image = image.float()
        else:
            image = torch.from_numpy(image.transpose(2, 0, 1)).float() / 255.0
            
        if isinstance(mask, torch.Tensor):
            mask = mask.long()
        else:
            mask = torch.from_numpy(mask).long()
            
        return image, mask

def get_strong_augmentation():
    """
    Very strong data augmentation
    """
    return A.Compose([
        A.Resize(224, 224),  # Smaller size for stability
        
        # Geometric transformations
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.3),
        A.RandomRotate90(p=0.5),
        A.Rotate(limit=30, p=0.7),
        A.ShiftScaleRotate(
            shift_limit=0.15,
            scale_limit=0.15,
            rotate_limit=15,
            p=0.7
        ),
        
        # Elastic deformations
        A.ElasticTransform(
            alpha=1,
            sigma=50,
            alpha_affine=50,
            p=0.3
        ),
        A.GridDistortion(p=0.3),
        
        # Intensity transformations
        A.RandomBrightnessContrast(
            brightness_limit=0.3,
            contrast_limit=0.3,
            p=0.7
        ),
        A.RandomGamma(gamma_limit=(70, 130), p=0.5),
        A.CLAHE(clip_limit=3.0, p=0.5),
        A.HueSaturationValue(
            hue_shift_limit=15,
            sat_shift_limit=25,
            val_shift_limit=25,
            p=0.5
        ),
        
        # Noise and blur
        A.OneOf([
            A.GaussNoise(var_limit=(10, 50), p=1.0),
            A.GaussianBlur(blur_limit=3, p=1.0),
            A.MotionBlur(blur_limit=3, p=1.0),
        ], p=0.4),
        
        # Normalization
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])

class SimpleCrossEntropyLoss(nn.Module):
    """
    Simple Cross Entropy Loss with class weighting
    """
    def __init__(self, weight=None):
        super(SimpleCrossEntropyLoss, self).__init__()
        self.weight = weight
        self.ce_loss = nn.CrossEntropyLoss(weight=weight)
        
    def forward(self, pred, target):
        return self.ce_loss(pred, target)

def calculate_metrics(pred, target):
    """
    Calculate evaluation metrics
    """
    pred = torch.argmax(pred, dim=1)
    
    # Accuracy
    correct = (pred == target).float().sum()
    total = target.numel()
    accuracy = correct / total
    
    # IoU and Dice for each class
    metrics = {'accuracy': accuracy.item()}
    
    for class_id in range(2):
        pred_class = (pred == class_id).float()
        target_class = (target == class_id).float()
        
        intersection = (pred_class * target_class).sum()
        union = pred_class.sum() + target_class.sum() - intersection
        
        iou = intersection / (union + 1e-8)
        dice = 2 * intersection / (pred_class.sum() + target_class.sum() + 1e-8)
        
        metrics[f'iou_class_{class_id}'] = iou.item()
        metrics[f'dice_class_{class_id}'] = dice.item()
    
    metrics['mean_iou'] = (metrics['iou_class_0'] + metrics['iou_class_1']) / 2
    metrics['mean_dice'] = (metrics['dice_class_0'] + metrics['dice_class_1']) / 2
    
    return metrics

def train_model():
    """
    Main training function
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
    
    # Create dataset with heavy augmentation and repetition
    train_dataset = FinalDentalDataset(
        image_paths, mask_paths, 
        transform=get_strong_augmentation(),
        repeat_factor=50  # Repeat each image 50 times with different augmentations
    )
    
    logger.info(f"Created training dataset with {len(train_dataset)} samples")
    
    # Create data loader with larger batch size
    train_loader = DataLoader(
        train_dataset, 
        batch_size=8,  # Larger batch size to avoid BN issues
        shuffle=True, 
        num_workers=0,
        drop_last=True  # Drop last incomplete batch
    )
    
    # Initialize model with simpler architecture
    model = smp.Unet(
        encoder_name="resnet18",  # Lighter encoder
        encoder_weights="imagenet",
        in_channels=3,
        classes=2,
        activation=None
    ).to(device)
    
    # Set model to training mode
    model.train()
    
    # Loss and optimizer
    # Weight classes to handle imbalance
    class_weights = torch.tensor([0.3, 0.7]).to(device)  # Give more weight to tooth class
    criterion = SimpleCrossEntropyLoss(weight=class_weights)
    
    optimizer = optim.AdamW(model.parameters(), lr=2e-4, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=300, eta_min=1e-6)
    
    # Training loop
    best_loss = float('inf')
    train_losses = []
    
    logger.info("Starting training...")
    
    num_epochs = 300
    for epoch in range(num_epochs):
        epoch_loss = 0.0
        epoch_metrics = {'accuracy': 0, 'mean_iou': 0, 'mean_dice': 0}
        num_batches = 0
        
        for batch_idx, (images, masks) in enumerate(train_loader):
            images, masks = images.to(device), masks.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            
            # Gradient clipping for stability
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            
            epoch_loss += loss.item()
            num_batches += 1
            
            # Calculate metrics
            with torch.no_grad():
                batch_metrics = calculate_metrics(outputs, masks)
                for key in epoch_metrics:
                    epoch_metrics[key] += batch_metrics[key]
        
        # Average metrics
        if num_batches > 0:
            epoch_loss /= num_batches
            for key in epoch_metrics:
                epoch_metrics[key] /= num_batches
        
        train_losses.append(epoch_loss)
        scheduler.step()
        
        # Logging
        if epoch % 25 == 0:
            logger.info(f"Epoch {epoch}/{num_epochs}")
            logger.info(f"Loss: {epoch_loss:.4f}")
            logger.info(f"Accuracy: {epoch_metrics['accuracy']:.4f}")
            logger.info(f"Mean IoU: {epoch_metrics['mean_iou']:.4f}")
            logger.info(f"Mean Dice: {epoch_metrics['mean_dice']:.4f}")
            logger.info(f"Learning Rate: {scheduler.get_last_lr()[0]:.6f}")
        
        # Save best model
        if epoch_loss < best_loss:
            best_loss = epoch_loss
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'loss': epoch_loss,
                'metrics': epoch_metrics
            }, 'models/dental_segmentation_best.pth')
            
            if epoch % 25 == 0:
                logger.info(f"New best model saved with loss: {best_loss:.4f}")
    
    # Save final model
    torch.save({
        'epoch': num_epochs,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'loss': epoch_loss,
        'metrics': epoch_metrics,
        'train_losses': train_losses
    }, 'models/dental_segmentation_trained.pth')
    
    logger.info("Training completed!")
    logger.info(f"Best loss achieved: {best_loss:.4f}")
    logger.info("Models saved as 'dental_segmentation_best.pth' and 'dental_segmentation_trained.pth'")
    
    # Save training history
    training_history = {
        'train_losses': train_losses,
        'best_loss': best_loss,
        'final_metrics': epoch_metrics,
        'num_epochs': num_epochs,
        'device': str(device),
        'dataset_size': len(train_dataset),
        'original_images': len(image_paths)
    }
    
    with open('final_training_history.json', 'w') as f:
        json.dump(training_history, f, indent=2)
    
    return model, training_history

if __name__ == "__main__":
    logger.info("Starting final dental segmentation training...")
    logger.info(f"Training started at: {datetime.now()}")
    
    model, history = train_model()
    
    logger.info(f"Training completed at: {datetime.now()}")
    logger.info("Check 'final_training.log' for detailed logs and 'final_training_history.json' for results")