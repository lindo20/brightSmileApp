#!/usr/bin/env python3
"""
Quick Model Evaluation Script for Presentation
Provides essential metrics: Accuracy, Precision, Recall, IoU
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np
from PIL import Image
import os
import json
from datetime import datetime
import cv2
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
from torch.nn import functional as F

# Enable loading of truncated images
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

class DentalDataset(Dataset):
    def __init__(self, root, transformations=None):
        self.im_paths = sorted([os.path.join(root, 'all-images', f) for f in os.listdir(os.path.join(root, 'all-images')) if f.endswith('.png')])
        self.gt_paths = sorted([os.path.join(root, 'unet-masks', f) for f in os.listdir(os.path.join(root, 'unet-masks')) if f.endswith('.png')])
        self.transformations = transformations
        self.n_cls = 2  # Binary segmentation
        
        assert len(self.im_paths) == len(self.gt_paths), f"Mismatch: {len(self.im_paths)} images vs {len(self.gt_paths)} masks"
    
    def __len__(self):
        return len(self.im_paths)
    
    def __getitem__(self, idx):
        im, gt = self.get_im_gt(self.im_paths[idx], self.gt_paths[idx])
        
        if self.transformations:
            im, gt = self.apply_transformations(im, gt)
        
        return im, (gt / 255.).int()
    
    def get_im_gt(self, im_path, gt_path):
        return self.read_im(im_path, gray=True), self.read_im(gt_path, gray=False)

    def read_im(self, path, gray=None):
        if gray:
            return cv2.cvtColor(cv2.imread(path, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
        else:
            return cv2.cvtColor(cv2.imread(path, cv2.IMREAD_COLOR), cv2.COLOR_BGR2GRAY)
    
    def apply_transformations(self, im, gt):
        transformed = self.transformations(image=im, mask=gt)
        return transformed["image"], transformed["mask"]

def calculate_metrics(pred, target, threshold=0.5):
    """Calculate IoU, Dice, Precision, Recall, Accuracy"""
    pred_binary = (pred > threshold).float()
    target_binary = target.float()
    
    # Flatten tensors
    pred_flat = pred_binary.view(-1)
    target_flat = target_binary.view(-1)
    
    # Calculate basic metrics
    intersection = (pred_flat * target_flat).sum()
    union = pred_flat.sum() + target_flat.sum() - intersection
    
    # IoU (Intersection over Union)
    iou = intersection / (union + 1e-8)
    
    # Dice Coefficient
    dice = (2 * intersection) / (pred_flat.sum() + target_flat.sum() + 1e-8)
    
    # Precision, Recall, Accuracy
    tp = intersection
    fp = pred_flat.sum() - intersection
    fn = target_flat.sum() - intersection
    tn = len(pred_flat) - tp - fp - fn
    
    precision = tp / (tp + fp + 1e-8)
    recall = tp / (tp + fn + 1e-8)
    accuracy = (tp + tn) / (tp + tn + fp + fn + 1e-8)
    
    return {
        'iou': iou.item(),
        'dice': dice.item(),
        'precision': precision.item(),
        'recall': recall.item(),
        'accuracy': accuracy.item()
    }

def main():
    print("🔍 Quick Model Evaluation for Presentation")
    print("=" * 50)
    
    # Device setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load model - DeepLabV3Plus architecture
    model_path = 'models/dental_segmentation_simple.pth'
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        return
    
    # Load the entire model (not just state_dict) as saved in training
    try:
        model = torch.load(model_path, map_location=device)
        model.to(device)
        model.eval()
        print("✅ Model loaded successfully")
        print(f"Model type: {type(model)}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        # Fallback: try creating model with default parameters
        try:
            model = smp.DeepLabV3Plus(classes=2)
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            print("✅ Model loaded with fallback method")
        except Exception as e2:
            print(f"❌ Fallback also failed: {e2}")
            return
    
    # Create test transformations (same as training)
    test_transforms = A.Compose([
        A.Resize(256, 256),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2()
    ])
    
    # Create test dataset
    test_dataset = DentalDataset('dataset', transformations=test_transforms)
    test_loader = DataLoader(test_dataset, batch_size=1, shuffle=False)
    
    print(f"📊 Evaluating on {len(test_dataset)} test samples...")
    
    # Evaluation
    all_metrics = []
    
    with torch.no_grad():
        for i, (images, masks) in enumerate(test_loader):
            images, masks = images.to(device), masks.to(device)
            
            # Forward pass
            outputs = model(images)
            
            # Convert model output to binary prediction
            # DeepLabV3Plus outputs logits for each class
            pred_probs = F.softmax(outputs, dim=1)  # Convert to probabilities
            pred_binary = torch.argmax(pred_probs, dim=1).float()  # Get class predictions
            
            # Convert masks to binary (0 or 1)
            masks_binary = masks.float()
            
            # Calculate metrics for this sample
            metrics = calculate_metrics(pred_binary.unsqueeze(1), masks_binary.unsqueeze(1))
            all_metrics.append(metrics)
            
            print(f"Sample {i+1}: IoU={metrics['iou']:.3f}, Dice={metrics['dice']:.3f}, "
                  f"Precision={metrics['precision']:.3f}, Recall={metrics['recall']:.3f}")
    
    # Calculate average metrics
    avg_metrics = {}
    for key in all_metrics[0].keys():
        avg_metrics[key] = np.mean([m[key] for m in all_metrics])
        avg_metrics[f'{key}_std'] = np.std([m[key] for m in all_metrics])
    
    # Print results
    print("\n" + "=" * 50)
    print("📈 FINAL EVALUATION RESULTS")
    print("=" * 50)
    print(f"🎯 Average IoU (Intersection over Union): {avg_metrics['iou']:.3f} ± {avg_metrics['iou_std']:.3f}")
    print(f"🎯 Average Dice Coefficient: {avg_metrics['dice']:.3f} ± {avg_metrics['dice_std']:.3f}")
    print(f"🎯 Average Precision: {avg_metrics['precision']:.3f} ± {avg_metrics['precision_std']:.3f}")
    print(f"🎯 Average Recall: {avg_metrics['recall']:.3f} ± {avg_metrics['recall_std']:.3f}")
    print(f"🎯 Average Accuracy: {avg_metrics['accuracy']:.3f} ± {avg_metrics['accuracy_std']:.3f}")
    
    # Convert to percentages for presentation
    print("\n📊 PRESENTATION-READY METRICS (Percentages):")
    print("-" * 40)
    print(f"IoU Score: {avg_metrics['iou']*100:.1f}%")
    print(f"Dice Score: {avg_metrics['dice']*100:.1f}%")
    print(f"Precision: {avg_metrics['precision']*100:.1f}%")
    print(f"Recall: {avg_metrics['recall']*100:.1f}%")
    print(f"Accuracy: {avg_metrics['accuracy']*100:.1f}%")
    
    # Save results
    results = {
        'evaluation_date': datetime.now().isoformat(),
        'model_path': model_path,
        'test_samples': len(test_dataset),
        'device': str(device),
        'metrics': {
            'iou_mean': avg_metrics['iou'],
            'iou_std': avg_metrics['iou_std'],
            'dice_mean': avg_metrics['dice'],
            'dice_std': avg_metrics['dice_std'],
            'precision_mean': avg_metrics['precision'],
            'precision_std': avg_metrics['precision_std'],
            'recall_mean': avg_metrics['recall'],
            'recall_std': avg_metrics['recall_std'],
            'accuracy_mean': avg_metrics['accuracy'],
            'accuracy_std': avg_metrics['accuracy_std']
        },
        'presentation_metrics': {
            'iou_percentage': f"{avg_metrics['iou']*100:.1f}%",
            'dice_percentage': f"{avg_metrics['dice']*100:.1f}%",
            'precision_percentage': f"{avg_metrics['precision']*100:.1f}%",
            'recall_percentage': f"{avg_metrics['recall']*100:.1f}%",
            'accuracy_percentage': f"{avg_metrics['accuracy']*100:.1f}%"
        }
    }
    
    with open('evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to 'evaluation_results.json'")
    print("✅ Evaluation complete!")

if __name__ == "__main__":
    main()