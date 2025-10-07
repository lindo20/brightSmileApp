"""
Dental X-Ray Semantic Segmentation Model
Based on the Kaggle implementation with DeepLabV3Plus architecture
Achieves mIoU of 0.8+ for dental cavity detection
"""

import os
import torch
import cv2
import numpy as np
import albumentations as A
from PIL import Image
from glob import glob
from torch.utils.data import Dataset, DataLoader, random_split
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
from torch.nn import functional as F
import time
from tqdm import tqdm
# Optional matplotlib for training/evaluation visualizations; not required for API runtime
try:
    import matplotlib.pyplot as plt
except Exception:
    plt = None
import random
from torchvision import transforms as tfs

# Enable loading of truncated images
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

class CustomSegmentationDataset(Dataset):
    """
    Custom dataset for dental X-ray semantic segmentation
    Expects dataset structure:
    - root/all-images/*.png (original X-ray images)
    - root/unet-masks/*.png (segmentation masks)
    """
    
    def __init__(self, root, transformations=None):
        self.im_paths = sorted(glob(f"{root}/all-images/*.png"))
        self.gt_paths = sorted(glob(f"{root}/unet-masks/*.png"))
        self.transformations = transformations
        self.n_cls = 2  # Binary segmentation: background and cavity
        
        assert len(self.im_paths) == len(self.gt_paths), f"Mismatch: {len(self.im_paths)} images vs {len(self.gt_paths)} masks"
        
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
    
    def __len__(self):
        return len(self.im_paths)

    def apply_transformations(self, im, gt):
        transformed = self.transformations(image=im, mask=gt)
        return transformed["image"], transformed["mask"]

class Metrics:
    """
    Comprehensive metrics for semantic segmentation evaluation
    Includes Pixel Accuracy (PA) and mean Intersection over Union (mIoU)
    """
    
    def __init__(self, pred, gt, loss_fn, eps=1e-10, n_cls=2):
        self.pred = torch.argmax(F.softmax(pred, dim=1), dim=1)  # (batch, width, height)
        self.gt = gt
        self.loss_fn = loss_fn
        self.eps = eps
        self.n_cls = n_cls
        self.pred_ = pred
        
    def to_contiguous(self, inp):
        return inp.contiguous().view(-1)
    
    def PA(self):
        """Pixel Accuracy calculation"""
        with torch.no_grad():
            match = torch.eq(self.pred, self.gt).int()
        return float(match.sum()) / float(match.numel())

    def mIoU(self):
        """Mean Intersection over Union calculation"""
        with torch.no_grad():
            pred, gt = self.to_contiguous(self.pred), self.to_contiguous(self.gt)
            iou_per_class = []
            
            for c in range(self.n_cls):
                match_pred = pred == c
                match_gt = gt == c

                if match_gt.long().sum().item() == 0:
                    iou_per_class.append(np.nan)
                else:
                    intersect = torch.logical_and(match_pred, match_gt).sum().float().item()
                    union = torch.logical_or(match_pred, match_gt).sum().float().item()
                    iou = (intersect + self.eps) / (union + self.eps)
                    iou_per_class.append(iou)
                    
            return np.nanmean(iou_per_class)
    
    def loss(self):
        return self.loss_fn(self.pred_, self.gt.long())

class DentalSemanticSegmentation:
    """
    Main class for dental semantic segmentation model
    Uses DeepLabV3Plus architecture with comprehensive training pipeline
    """
    
    def __init__(self, model_path=None):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.n_cls = 2
        self.im_h, self.im_w = 256, 256
        self.mean = [0.485, 0.456, 0.406]
        self.std = [0.229, 0.224, 0.225]
        
        # Prefer provided model_path, otherwise fallback to known checkpoints
        default_paths = [
            "models/dental_semantic_best.pth",
            "models/dental_segmentation_simple.pth",
            "models/dental_segmentation_improved.pth",
        ]
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            found = None
            for p in default_paths:
                if os.path.exists(p):
                    found = p
                    break
            if found:
                print(f"Loading default checkpoint: {found}")
                self.load_model(found)
            else:
                self.create_model()
    
    def create_model(self):
        """Create DeepLabV3Plus model"""
        self.model = smp.DeepLabV3Plus(classes=self.n_cls)
        self.model.to(self.device)
        print(f"Created DeepLabV3Plus model on {self.device}")
    
    def get_model_info(self):
        """Expose model metadata for downstream consumers"""
        return {
            "architecture": "DeepLabV3Plus",
            "num_classes": self.n_cls,
            "input_size": [self.im_h, self.im_w],
            "device": self.device,
            "preprocessing": {"mean": self.mean, "std": self.std},
        }
    
    def load_model(self, model_path):
        """Load a pre-trained model checkpoint (supports full model or state_dict)"""
        try:
            checkpoint = torch.load(model_path, map_location=self.device)
            # Case 1: Full model object saved via torch.save(model)
            if isinstance(checkpoint, torch.nn.Module):
                self.model = checkpoint.to(self.device)
                print(f"Loaded full model from {model_path}")
            # Case 2: state_dict saved via torch.save(model.state_dict())
            elif isinstance(checkpoint, dict):
                # Ensure a model instance exists to load weights into
                if self.model is None:
                    self.create_model()
                missing, unexpected = self.model.load_state_dict(checkpoint, strict=False)
                self.model.to(self.device)
                self.model.eval()
                print(f"Loaded state_dict from {model_path} (missing={len(missing)}, unexpected={len(unexpected)})")
            else:
                print(f"Unknown checkpoint type: {type(checkpoint)} — creating a fresh model")
                self.create_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            self.create_model()
    
    def get_transforms(self):
        """Get image transformations for training/inference"""
        return A.Compose([
            A.Resize(self.im_h, self.im_w),
            A.Normalize(mean=self.mean, std=self.std),
            ToTensorV2(transpose_mask=True)
        ], is_check_shapes=False)
    
    def get_dataloaders(self, root, batch_size=16, num_workers=4):
        """Create train, validation, and test dataloaders"""
        transformations = self.get_transforms()
        dataset = CustomSegmentationDataset(root=root, transformations=transformations)
        
        total_len = len(dataset)
        
        # Handle small datasets
        if total_len < 10:
            # For very small datasets, use simple split
            tr_len = max(1, total_len - 2)  # At least 1 for training
            val_len = max(1, (total_len - tr_len) // 2)  # At least 1 for validation
            test_len = total_len - (tr_len + val_len)
        else:
            # Normal split for larger datasets
            tr_len = int(total_len * 0.9)
            val_len = int(total_len * 0.05)
            test_len = total_len - (tr_len + val_len)
        
        # Data split
        tr_ds, val_ds, test_ds = random_split(dataset, [tr_len, val_len, test_len])
        
        print(f"\nDataset split:")
        print(f"Training: {len(tr_ds)} images")
        print(f"Validation: {len(val_ds)} images")
        print(f"Test: {len(test_ds)} images\n")
        
        # Create dataloaders
        tr_dl = DataLoader(tr_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
        val_dl = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
        test_dl = DataLoader(test_ds, batch_size=1, shuffle=False, num_workers=num_workers)
        
        return tr_dl, val_dl, test_dl
    
    def train(self, root, epochs=10, batch_size=16, lr=3e-4, save_path="models"):
        """
        Train the semantic segmentation model
        """
        # Create dataloaders
        tr_dl, val_dl, test_dl = self.get_dataloaders(root, batch_size)
        
        # Setup training components
        loss_fn = torch.nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
        
        # Training tracking
        tr_loss, tr_pa, tr_iou = [], [], []
        val_loss, val_pa, val_iou = [], [], []
        tr_len, val_len = len(tr_dl), len(val_dl)
        best_loss = np.inf
        not_improve = 0
        early_stop_threshold = 5
        
        os.makedirs(save_path, exist_ok=True)
        
        print("Starting training process...")
        train_start = time.time()
        
        for epoch in range(1, epochs + 1):
            epoch_start = time.time()
            tr_loss_, tr_iou_, tr_pa_ = 0, 0, 0
            
            # Training phase
            self.model.train()
            print(f"Epoch {epoch} training started...")
            
            for idx, batch in enumerate(tqdm(tr_dl, desc=f"Training Epoch {epoch}")):
                ims, gts = batch
                ims, gts = ims.to(self.device), gts.to(self.device)
                
                preds = self.model(ims)
                
                met = Metrics(preds, gts, loss_fn, n_cls=self.n_cls)
                loss_ = met.loss()
                
                tr_iou_ += met.mIoU()
                tr_pa_ += met.PA()
                tr_loss_ += loss_.item()
                
                loss_.backward()
                optimizer.step()
                optimizer.zero_grad()
            
            # Validation phase
            print(f"Epoch {epoch} validation started...")
            self.model.eval()
            val_loss_, val_iou_, val_pa_ = 0, 0, 0

            with torch.no_grad():
                for idx, batch in enumerate(tqdm(val_dl, desc=f"Validation Epoch {epoch}")):
                    ims, gts = batch
                    ims, gts = ims.to(self.device), gts.to(self.device)

                    preds = self.model(ims)
                    met = Metrics(preds, gts, loss_fn, n_cls=self.n_cls)

                    val_loss_ += met.loss().item()
                    val_iou_ += met.mIoU()
                    val_pa_ += met.PA()

            # Calculate averages
            tr_loss_ /= tr_len
            tr_iou_ /= tr_len
            tr_pa_ /= tr_len
            val_loss_ /= val_len
            val_iou_ /= val_len
            val_pa_ /= val_len

            # Print results
            epoch_time = time.time() - epoch_start
            print(f"\n{'='*50}")
            print(f"Epoch {epoch} Results:")
            print(f"Time: {epoch_time:.3f}s")
            print(f"Train - Loss: {tr_loss_:.3f}, PA: {tr_pa_:.3f}, IoU: {tr_iou_:.3f}")
            print(f"Val   - Loss: {val_loss_:.3f}, PA: {val_pa_:.3f}, IoU: {val_iou_:.3f}")

            # Store metrics
            tr_loss.append(tr_loss_)
            tr_iou.append(tr_iou_)
            tr_pa.append(tr_pa_)
            val_loss.append(val_loss_)
            val_iou.append(val_iou_)
            val_pa.append(val_pa_)
            
            # Model saving and early stopping
            if val_loss_ < best_loss:
                print(f"Loss improved from {best_loss:.3f} to {val_loss_:.3f}!")
                best_loss = val_loss_
                not_improve = 0
                model_save_path = f"{save_path}/dental_semantic_best.pth"
                torch.save(self.model.state_dict(), model_save_path)
                print(f"Model saved to {model_save_path}")
            else:
                not_improve += 1
                print(f"No improvement for {not_improve} epoch(s)")
                if not_improve == early_stop_threshold:
                    print(f"Early stopping after {early_stop_threshold} epochs without improvement")
                    break
            
            print(f"{'='*50}\n")
        
        total_time = (time.time() - train_start) / 60
        print(f"Training completed in {total_time:.3f} minutes")
        
        return {
            "tr_loss": tr_loss, "tr_iou": tr_iou, "tr_pa": tr_pa,
            "val_loss": val_loss, "val_iou": val_iou, "val_pa": val_pa
        }
    
    def predict(self, image_path):
        """
        Predict segmentation mask for a single image
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")
        
        # Load and preprocess image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Apply transformations
        transform = self.get_transforms()
        transformed = transform(image=image)
        input_tensor = transformed["image"].unsqueeze(0).to(self.device)
        
        # Predict with autocast on CUDA for faster inference
        self.model.eval()
        with torch.no_grad():
            if self.device == "cuda":
                with torch.cuda.amp.autocast():
                    prediction = self.model(input_tensor)
            else:
                prediction = self.model(input_tensor)
            mask = torch.argmax(F.softmax(prediction, dim=1), dim=1)
            mask = mask.cpu().numpy().squeeze()
        
        return mask
    
    def predict_batch(self, image_paths, batch_size=8):
        """
        Predict segmentation masks for multiple images efficiently with batching
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")
        
        results = []
        transform = self.get_transforms()
        self.model.eval()
        with torch.no_grad():
            for i in range(0, len(image_paths), batch_size):
                batch_paths = image_paths[i:i+batch_size]
                tensors = []
                for image_path in batch_paths:
                    image = cv2.imread(image_path)
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    transformed = transform(image=image)
                    tensors.append(transformed["image"])  # CHW torch tensor
                if len(tensors) == 0:
                    continue
                input_batch = torch.stack(tensors, dim=0).to(self.device)
                if self.device == "cuda":
                    with torch.cuda.amp.autocast():
                        prediction = self.model(input_batch)
                else:
                    prediction = self.model(input_batch)
                masks = torch.argmax(F.softmax(prediction, dim=1), dim=1).cpu().numpy()
                results.extend([m for m in masks])
        return results

def tic_toc(start_time=None):
    """Utility function for timing"""
    return time.time() if start_time is None else time.time() - start_time

# Example usage
if __name__ == "__main__":
    # Initialize model
    model = DentalSemanticSegmentation()
    
    # Example training (uncomment when dataset is available)
    # history = model.train(root="dataset", epochs=10, batch_size=16)
    
    # Example prediction (uncomment when model is trained)
    # mask = model.predict("path/to/xray/image.png")
    
    print("Dental Semantic Segmentation model initialized successfully!")