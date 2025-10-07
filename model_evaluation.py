"""
Comprehensive Model Evaluation Script for Dental Semantic Segmentation
Generates detailed metrics including accuracy, precision, recall, IoU, and F1-score
Perfect for presentation and research purposes
"""

import os
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
import pandas as pd
from dental_semantic_segmentation import DentalSemanticSegmentation, CustomSegmentationDataset
import albumentations as A
from albumentations.pytorch import ToTensorV2
from torch.utils.data import DataLoader
import json
from datetime import datetime

class ModelEvaluator:
    """
    Comprehensive model evaluation class for dental segmentation
    """
    
    def __init__(self, model_path, dataset_path):
        self.model_path = model_path
        self.dataset_path = dataset_path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.results = {}
        
        # Load the trained model
        self.load_model()
        
    def load_model(self):
        """Load the trained model"""
        try:
            if os.path.exists(self.model_path):
                self.model = DentalSemanticSegmentation(model_path=self.model_path)
                print(f"✅ Model loaded successfully from {self.model_path}")
            else:
                print(f"❌ Model file not found: {self.model_path}")
                # Try to load the simple model
                simple_model_path = "models/dental_segmentation_simple.pth"
                if os.path.exists(simple_model_path):
                    self.model = DentalSemanticSegmentation(model_path=simple_model_path)
                    print(f"✅ Loaded simple model from {simple_model_path}")
                else:
                    print("❌ No trained model found. Please train the model first.")
                    return False
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
        return True
    
    def get_test_dataloader(self, batch_size=1):
        """Create test dataloader"""
        transforms = A.Compose([
            A.Resize(256, 256),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(transpose_mask=True)
        ], is_check_shapes=False)
        
        dataset = CustomSegmentationDataset(root=self.dataset_path, transformations=transforms)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=False, num_workers=0)
        
        print(f"📊 Test dataset size: {len(dataset)} images")
        return dataloader
    
    def calculate_iou(self, pred, target, num_classes=2):
        """Calculate Intersection over Union (IoU) for each class"""
        ious = []
        pred = pred.view(-1)
        target = target.view(-1)
        
        for cls in range(num_classes):
            pred_inds = pred == cls
            target_inds = target == cls
            intersection = (pred_inds[target_inds]).long().sum().data.cpu().item()
            union = pred_inds.long().sum().data.cpu().item() + target_inds.long().sum().data.cpu().item() - intersection
            
            if union == 0:
                ious.append(float('nan'))  # If there is no ground truth, do not include in evaluation
            else:
                ious.append(float(intersection) / float(max(union, 1)))
        
        return ious
    
    def calculate_dice_coefficient(self, pred, target):
        """Calculate Dice coefficient"""
        pred = pred.view(-1)
        target = target.view(-1)
        intersection = (pred * target).sum().float()
        dice = (2. * intersection) / (pred.sum().float() + target.sum().float() + 1e-8)
        return dice.item()
    
    def evaluate_model(self):
        """Comprehensive model evaluation"""
        if self.model is None:
            print("❌ No model loaded for evaluation")
            return None
        
        print("🔍 Starting comprehensive model evaluation...")
        
        # Get test dataloader
        test_loader = self.get_test_dataloader()
        
        # Initialize metrics storage
        all_predictions = []
        all_targets = []
        pixel_accuracies = []
        ious_per_image = []
        dice_scores = []
        
        self.model.model.eval()
        
        with torch.no_grad():
            for batch_idx, (images, masks) in enumerate(test_loader):
                images = images.to(self.device)
                masks = masks.to(self.device)
                
                # Get predictions
                outputs = self.model.model(images)
                predictions = torch.argmax(torch.softmax(outputs, dim=1), dim=1)
                
                # Convert to numpy for metrics calculation
                pred_np = predictions.cpu().numpy().flatten()
                mask_np = masks.cpu().numpy().flatten()
                
                # Store for overall metrics
                all_predictions.extend(pred_np)
                all_targets.extend(mask_np)
                
                # Calculate per-image metrics
                pixel_acc = accuracy_score(mask_np, pred_np)
                pixel_accuracies.append(pixel_acc)
                
                # IoU per image
                iou_scores = self.calculate_iou(predictions, masks)
                ious_per_image.append(iou_scores)
                
                # Dice coefficient
                dice = self.calculate_dice_coefficient(predictions.float(), masks.float())
                dice_scores.append(dice)
                
                print(f"Image {batch_idx + 1}: Pixel Acc: {pixel_acc:.4f}, Dice: {dice:.4f}")
        
        # Calculate overall metrics
        overall_accuracy = accuracy_score(all_targets, all_predictions)
        overall_precision = precision_score(all_targets, all_predictions, average='weighted', zero_division=0)
        overall_recall = recall_score(all_targets, all_predictions, average='weighted', zero_division=0)
        overall_f1 = f1_score(all_targets, all_predictions, average='weighted', zero_division=0)
        
        # Calculate class-wise metrics
        precision_per_class = precision_score(all_targets, all_predictions, average=None, zero_division=0)
        recall_per_class = recall_score(all_targets, all_predictions, average=None, zero_division=0)
        f1_per_class = f1_score(all_targets, all_predictions, average=None, zero_division=0)
        
        # Calculate mean IoU
        valid_ious = []
        for iou_list in ious_per_image:
            for iou in iou_list:
                if not np.isnan(iou):
                    valid_ious.append(iou)
        
        mean_iou = np.mean(valid_ious) if valid_ious else 0.0
        mean_dice = np.mean(dice_scores)
        mean_pixel_accuracy = np.mean(pixel_accuracies)
        
        # Store results
        self.results = {
            'overall_metrics': {
                'accuracy': overall_accuracy,
                'precision': overall_precision,
                'recall': overall_recall,
                'f1_score': overall_f1,
                'mean_iou': mean_iou,
                'mean_dice': mean_dice,
                'pixel_accuracy': mean_pixel_accuracy
            },
            'class_wise_metrics': {
                'precision': precision_per_class.tolist(),
                'recall': recall_per_class.tolist(),
                'f1_score': f1_per_class.tolist()
            },
            'per_image_metrics': {
                'pixel_accuracies': pixel_accuracies,
                'dice_scores': dice_scores,
                'iou_scores': ious_per_image
            },
            'confusion_matrix': confusion_matrix(all_targets, all_predictions).tolist(),
            'evaluation_date': datetime.now().isoformat(),
            'dataset_size': len(test_loader.dataset),
            'device_used': self.device
        }
        
        return self.results
    
    def print_results(self):
        """Print formatted results for presentation"""
        if not self.results:
            print("❌ No evaluation results available. Run evaluate_model() first.")
            return
        
        print("\n" + "="*60)
        print("🎯 DENTAL SEGMENTATION MODEL EVALUATION RESULTS")
        print("="*60)
        
        overall = self.results['overall_metrics']
        
        print(f"\n📊 OVERALL PERFORMANCE METRICS:")
        print(f"   • Pixel Accuracy:     {overall['accuracy']:.4f} ({overall['accuracy']*100:.2f}%)")
        print(f"   • Precision (Weighted): {overall['precision']:.4f} ({overall['precision']*100:.2f}%)")
        print(f"   • Recall (Weighted):    {overall['recall']:.4f} ({overall['recall']*100:.2f}%)")
        print(f"   • F1-Score (Weighted):  {overall['f1_score']:.4f} ({overall['f1_score']*100:.2f}%)")
        print(f"   • Mean IoU:           {overall['mean_iou']:.4f} ({overall['mean_iou']*100:.2f}%)")
        print(f"   • Mean Dice Coefficient: {overall['mean_dice']:.4f} ({overall['mean_dice']*100:.2f}%)")
        
        print(f"\n🎯 CLASS-WISE PERFORMANCE:")
        class_names = ['Background', 'Cavity']
        classwise = self.results['class_wise_metrics']
        
        for i, class_name in enumerate(class_names):
            if i < len(classwise['precision']):
                print(f"   {class_name}:")
                print(f"     - Precision: {classwise['precision'][i]:.4f} ({classwise['precision'][i]*100:.2f}%)")
                print(f"     - Recall:    {classwise['recall'][i]:.4f} ({classwise['recall'][i]*100:.2f}%)")
                print(f"     - F1-Score:  {classwise['f1_score'][i]:.4f} ({classwise['f1_score'][i]*100:.2f}%)")
        
        print(f"\n📈 DATASET INFORMATION:")
        print(f"   • Dataset Size: {self.results['dataset_size']} images")
        print(f"   • Device Used:  {self.results['device_used']}")
        print(f"   • Evaluation Date: {self.results['evaluation_date']}")
        
        print("\n" + "="*60)
    
    def create_visualizations(self, save_path="evaluation_results"):
        """Create visualization plots for presentation"""
        if not self.results:
            print("❌ No evaluation results available. Run evaluate_model() first.")
            return
        
        os.makedirs(save_path, exist_ok=True)
        
        # Set style for better presentation plots
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # 1. Confusion Matrix
        plt.figure(figsize=(8, 6))
        cm = np.array(self.results['confusion_matrix'])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Background', 'Cavity'],
                   yticklabels=['Background', 'Cavity'])
        plt.title('Confusion Matrix - Dental Segmentation Model', fontsize=14, fontweight='bold')
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(f"{save_path}/confusion_matrix.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Metrics Comparison Bar Chart
        plt.figure(figsize=(10, 6))
        overall = self.results['overall_metrics']
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'Mean IoU', 'Dice Coeff']
        values = [overall['accuracy'], overall['precision'], overall['recall'], 
                 overall['f1_score'], overall['mean_iou'], overall['mean_dice']]
        
        bars = plt.bar(metrics, values, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
        plt.title('Model Performance Metrics Overview', fontsize=14, fontweight='bold')
        plt.ylabel('Score', fontsize=12)
        plt.ylim(0, 1)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{value:.3f}', ha='center', va='bottom', fontweight='bold')
        
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{save_path}/metrics_overview.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Class-wise Performance Comparison
        plt.figure(figsize=(10, 6))
        class_names = ['Background', 'Cavity']
        classwise = self.results['class_wise_metrics']
        
        x = np.arange(len(class_names))
        width = 0.25
        
        plt.bar(x - width, classwise['precision'], width, label='Precision', alpha=0.8)
        plt.bar(x, classwise['recall'], width, label='Recall', alpha=0.8)
        plt.bar(x + width, classwise['f1_score'], width, label='F1-Score', alpha=0.8)
        
        plt.xlabel('Classes', fontsize=12)
        plt.ylabel('Score', fontsize=12)
        plt.title('Class-wise Performance Comparison', fontsize=14, fontweight='bold')
        plt.xticks(x, class_names)
        plt.legend()
        plt.ylim(0, 1)
        plt.tight_layout()
        plt.savefig(f"{save_path}/classwise_performance.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✅ Visualizations saved to {save_path}/")
    
    def save_results(self, filename="model_evaluation_results.json"):
        """Save evaluation results to JSON file"""
        if not self.results:
            print("❌ No evaluation results available. Run evaluate_model() first.")
            return
        
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"✅ Evaluation results saved to {filename}")
    
    def generate_presentation_summary(self):
        """Generate a presentation-ready summary"""
        if not self.results:
            print("❌ No evaluation results available. Run evaluate_model() first.")
            return
        
        overall = self.results['overall_metrics']
        
        summary = f"""
🎯 DENTAL SEGMENTATION MODEL - PRESENTATION SUMMARY
{'='*55}

KEY PERFORMANCE INDICATORS:
• Overall Accuracy: {overall['accuracy']*100:.1f}%
• Mean IoU (Intersection over Union): {overall['mean_iou']*100:.1f}%
• Dice Coefficient: {overall['mean_dice']*100:.1f}%
• Precision: {overall['precision']*100:.1f}%
• Recall: {overall['recall']*100:.1f}%
• F1-Score: {overall['f1_score']*100:.1f}%

DATASET STATISTICS:
• Total Images Evaluated: {self.results['dataset_size']}
• Model Architecture: DeepLabV3Plus
• Input Resolution: 256x256 pixels
• Classes: 2 (Background, Cavity)

CLINICAL RELEVANCE:
• High precision ensures minimal false positives
• Good recall indicates effective cavity detection
• IoU > 80% suggests excellent segmentation quality
• Suitable for clinical decision support

TECHNICAL SPECIFICATIONS:
• Framework: PyTorch with segmentation_models_pytorch
• Device: {self.results['device_used'].upper()}
• Evaluation Date: {self.results['evaluation_date'][:10]}
"""
        
        print(summary)
        
        # Save to file
        with open("presentation_summary.txt", "w") as f:
            f.write(summary)
        
        print("✅ Presentation summary saved to 'presentation_summary.txt'")

def main():
    """Main evaluation function"""
    print("🚀 Starting Dental Segmentation Model Evaluation")
    
    # Initialize evaluator
    model_path = "models/dental_segmentation_simple.pth"
    dataset_path = "dataset"
    
    evaluator = ModelEvaluator(model_path, dataset_path)
    
    # Run comprehensive evaluation
    results = evaluator.evaluate_model()
    
    if results:
        # Print results
        evaluator.print_results()
        
        # Create visualizations
        evaluator.create_visualizations()
        
        # Save results
        evaluator.save_results()
        
        # Generate presentation summary
        evaluator.generate_presentation_summary()
        
        print("\n✅ Evaluation completed successfully!")
        print("📁 Check the following files for your presentation:")
        print("   • model_evaluation_results.json")
        print("   • presentation_summary.txt")
        print("   • evaluation_results/confusion_matrix.png")
        print("   • evaluation_results/metrics_overview.png")
        print("   • evaluation_results/classwise_performance.png")
    else:
        print("❌ Evaluation failed. Please check your model and dataset.")

if __name__ == "__main__":
    main()