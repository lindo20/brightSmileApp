#!/usr/bin/env python3
"""
Comprehensive Model Evaluation Script for Dental Segmentation
Calculates all metrics needed for presentation: Accuracy, Precision, Recall, IoU, Dice
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import os
import json
import logging
from datetime import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
import segmentation_models_pytorch as smp

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DentalDataset(torch.utils.data.Dataset):
    def __init__(self, image_dir, mask_dir):
        self.image_dir = Path(image_dir)
        self.mask_dir = Path(mask_dir)
        
        # Get all image files
        self.image_files = sorted([f for f in os.listdir(image_dir) if f.endswith('.png')])
        self.mask_files = sorted([f for f in os.listdir(mask_dir) if f.endswith('.png')])
        
        logger.info(f"Found {len(self.image_files)} images and {len(self.mask_files)} masks")
        
    def __len__(self):
        return len(self.image_files)
    
    def __getitem__(self, idx):
        # Load image
        img_path = self.image_dir / self.image_files[idx]
        image = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
        image = cv2.resize(image, (256, 256))
        image = image.astype(np.float32) / 255.0
        image = np.expand_dims(image, axis=0)  # Add channel dimension
        
        # Load mask
        mask_path = self.mask_dir / self.mask_files[idx]
        mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
        mask = cv2.resize(mask, (256, 256))
        mask = (mask > 127).astype(np.int64)  # Binary mask
        
        return torch.FloatTensor(image), torch.LongTensor(mask)

def calculate_metrics(pred_mask, true_mask, num_classes=2):
    """Calculate comprehensive metrics for segmentation"""
    pred_mask = pred_mask.flatten()
    true_mask = true_mask.flatten()
    
    # Overall accuracy
    accuracy = (pred_mask == true_mask).float().mean().item()
    
    # Per-class metrics
    metrics = {}
    
    for class_id in range(num_classes):
        # True positives, false positives, false negatives
        tp = ((pred_mask == class_id) & (true_mask == class_id)).float().sum().item()
        fp = ((pred_mask == class_id) & (true_mask != class_id)).float().sum().item()
        fn = ((pred_mask != class_id) & (true_mask == class_id)).float().sum().item()
        tn = ((pred_mask != class_id) & (true_mask != class_id)).float().sum().item()
        
        # Precision, Recall, IoU, Dice
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        iou = tp / (tp + fp + fn) if (tp + fp + fn) > 0 else 0.0
        dice = 2 * tp / (2 * tp + fp + fn) if (2 * tp + fp + fn) > 0 else 0.0
        
        metrics[f'class_{class_id}'] = {
            'precision': precision,
            'recall': recall,
            'iou': iou,
            'dice': dice,
            'tp': tp,
            'fp': fp,
            'fn': fn,
            'tn': tn
        }
    
    # Mean metrics (excluding background class 0 for dental segmentation)
    if num_classes > 1:
        mean_precision = metrics['class_1']['precision']
        mean_recall = metrics['class_1']['recall']
        mean_iou = metrics['class_1']['iou']
        mean_dice = metrics['class_1']['dice']
    else:
        mean_precision = metrics['class_0']['precision']
        mean_recall = metrics['class_0']['recall']
        mean_iou = metrics['class_0']['iou']
        mean_dice = metrics['class_0']['dice']
    
    return {
        'accuracy': accuracy,
        'mean_precision': mean_precision,
        'mean_recall': mean_recall,
        'mean_iou': mean_iou,
        'mean_dice': mean_dice,
        'per_class_metrics': metrics
    }

def evaluate_model():
    """Main evaluation function"""
    logger.info("Starting comprehensive model evaluation...")
    
    # Device setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Dataset setup
    dataset_dir = Path("dataset")
    image_dir = dataset_dir / "all-images"
    mask_dir = dataset_dir / "unet-masks"
    
    if not image_dir.exists() or not mask_dir.exists():
        logger.error(f"Dataset directories not found: {image_dir}, {mask_dir}")
        return
    
    # Create dataset
    dataset = DentalDataset(image_dir, mask_dir)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=1, shuffle=False)
    
    # Try to load the best trained model
    model_paths = [
        "models/dental_segmentation_best.pth",
        "models/dental_segmentation_simple.pth",
        "best_dental_model.pth",
        "final_dental_model.pth",
        "dental_segmentation_model.pth"
    ]
    
    model = None
    model_path_used = None
    
    for model_path in model_paths:
        if os.path.exists(model_path):
            try:
                logger.info(f"Loading model from {model_path}")
                
                # Create model architecture
                model = smp.Unet(
                    encoder_name="resnet18",
                    encoder_weights=None,
                    in_channels=1,
                    classes=2,
                    activation=None
                )
                
                # Load state dict
                checkpoint = torch.load(model_path, map_location=device)
                if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                    model.load_state_dict(checkpoint['model_state_dict'])
                else:
                    model.load_state_dict(checkpoint)
                
                model.to(device)
                model.eval()
                model_path_used = model_path
                logger.info(f"Successfully loaded model from {model_path}")
                break
                
            except Exception as e:
                logger.warning(f"Failed to load model from {model_path}: {e}")
                continue
    
    if model is None:
        logger.error("No trained model found. Please ensure training has completed and model is saved.")
        # Create a dummy model for demonstration
        logger.info("Creating untrained model for baseline evaluation...")
        model = smp.Unet(
            encoder_name="resnet18",
            encoder_weights="imagenet",
            in_channels=1,
            classes=2,
            activation=None
        )
        model.to(device)
        model.eval()
        model_path_used = "untrained_baseline"
    
    # Evaluation
    logger.info("Running model evaluation...")
    
    all_predictions = []
    all_targets = []
    sample_results = []
    
    with torch.no_grad():
        for idx, (images, masks) in enumerate(dataloader):
            images = images.to(device)
            masks = masks.to(device)
            
            # Forward pass
            outputs = model(images)
            predictions = torch.argmax(outputs, dim=1)
            
            # Store for overall metrics
            all_predictions.append(predictions.cpu())
            all_targets.append(masks.cpu())
            
            # Calculate per-sample metrics
            sample_metrics = calculate_metrics(predictions.cpu(), masks.cpu())
            sample_results.append({
                'sample_id': idx,
                'filename': dataset.image_files[idx],
                **sample_metrics
            })
            
            logger.info(f"Sample {idx+1}/{len(dataset)}: "
                       f"Acc={sample_metrics['accuracy']:.4f}, "
                       f"IoU={sample_metrics['mean_iou']:.4f}, "
                       f"Dice={sample_metrics['mean_dice']:.4f}")
    
    # Calculate overall metrics
    all_predictions = torch.cat(all_predictions, dim=0)
    all_targets = torch.cat(all_targets, dim=0)
    
    overall_metrics = calculate_metrics(all_predictions, all_targets)
    
    # Prepare results
    evaluation_results = {
        'evaluation_timestamp': datetime.now().isoformat(),
        'model_path': model_path_used,
        'dataset_size': len(dataset),
        'device_used': str(device),
        'overall_metrics': {
            'accuracy': f"{overall_metrics['accuracy']:.4f}",
            'precision': f"{overall_metrics['mean_precision']:.4f}",
            'recall': f"{overall_metrics['mean_recall']:.4f}",
            'iou': f"{overall_metrics['mean_iou']:.4f}",
            'dice': f"{overall_metrics['mean_dice']:.4f}"
        },
        'detailed_metrics': overall_metrics,
        'per_sample_results': sample_results
    }
    
    # Save results
    results_file = "comprehensive_evaluation_results.json"
    with open(results_file, 'w') as f:
        json.dump(evaluation_results, f, indent=2)
    
    logger.info(f"Evaluation results saved to {results_file}")
    
    # Print presentation-ready summary
    print("\n" + "="*60)
    print("DENTAL SEGMENTATION MODEL - EVALUATION RESULTS")
    print("="*60)
    print(f"Model: {model_path_used}")
    print(f"Dataset Size: {len(dataset)} images")
    print(f"Evaluation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "-"*40)
    print("PERFORMANCE METRICS FOR PRESENTATION:")
    print("-"*40)
    print(f"Accuracy:  {overall_metrics['accuracy']*100:.2f}%")
    print(f"Precision: {overall_metrics['mean_precision']*100:.2f}%")
    print(f"Recall:    {overall_metrics['mean_recall']*100:.2f}%")
    print(f"IoU:       {overall_metrics['mean_iou']*100:.2f}%")
    print(f"Dice:      {overall_metrics['mean_dice']*100:.2f}%")
    print("="*60)
    
    return evaluation_results

if __name__ == "__main__":
    results = evaluate_model()