"""
Dataset Setup Script for Dental Semantic Segmentation
This script helps organize your dataset into the required structure
"""

import os
import shutil
import glob
from pathlib import Path

def create_dataset_structure(base_path="dataset"):
    """
    Create the required dataset structure:
    dataset/
    ├── all-images/     # Original X-ray images
    └── unet-masks/     # Segmentation masks
    """
    images_dir = os.path.join(base_path, "all-images")
    masks_dir = os.path.join(base_path, "unet-masks")
    
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(masks_dir, exist_ok=True)
    
    print(f"Created dataset structure:")
    print(f"  📁 {images_dir}")
    print(f"  📁 {masks_dir}")
    
    return images_dir, masks_dir

def copy_files_to_dataset(source_images_dir, source_masks_dir, target_base="dataset"):
    """
    Copy files from source directories to the dataset structure
    """
    images_dir, masks_dir = create_dataset_structure(target_base)
    
    # Copy images
    if os.path.exists(source_images_dir):
        image_files = glob.glob(os.path.join(source_images_dir, "*.png"))
        for img_file in image_files:
            filename = os.path.basename(img_file)
            shutil.copy2(img_file, os.path.join(images_dir, filename))
        print(f"Copied {len(image_files)} images to {images_dir}")
    else:
        print(f"Source images directory not found: {source_images_dir}")
    
    # Copy masks
    if os.path.exists(source_masks_dir):
        mask_files = glob.glob(os.path.join(source_masks_dir, "*.png"))
        for mask_file in mask_files:
            filename = os.path.basename(mask_file)
            shutil.copy2(mask_file, os.path.join(masks_dir, filename))
        print(f"Copied {len(mask_files)} masks to {masks_dir}")
    else:
        print(f"Source masks directory not found: {source_masks_dir}")

def download_kaggle_dataset():
    """
    Instructions for downloading the Kaggle dataset
    """
    print("📋 To download the Kaggle dataset:")
    print("1. Install Kaggle API: pip install kaggle")
    print("2. Set up Kaggle credentials (kaggle.json)")
    print("3. Download dataset: kaggle datasets download -d killa92/a-collection-of-dental-x-ray-images-for-analysis")
    print("4. Extract the downloaded zip file")
    print("5. Run this script with the extracted folder path")

def validate_dataset(dataset_path="dataset"):
    """
    Validate the dataset structure and files
    """
    images_dir = os.path.join(dataset_path, "all-images")
    masks_dir = os.path.join(dataset_path, "unet-masks")
    
    if not os.path.exists(images_dir):
        print(f"❌ Images directory missing: {images_dir}")
        return False
    
    if not os.path.exists(masks_dir):
        print(f"❌ Masks directory missing: {masks_dir}")
        return False
    
    # Count files
    image_files = glob.glob(os.path.join(images_dir, "*.png"))
    mask_files = glob.glob(os.path.join(masks_dir, "*.png"))
    
    print(f"📊 Dataset validation:")
    print(f"  Images: {len(image_files)} files")
    print(f"  Masks:  {len(mask_files)} files")
    
    if len(image_files) == 0:
        print("❌ No image files found")
        return False
    
    if len(mask_files) == 0:
        print("❌ No mask files found")
        return False
    
    if len(image_files) != len(mask_files):
        print(f"⚠️  Warning: Mismatch between images ({len(image_files)}) and masks ({len(mask_files)})")
        return False
    
    print("✅ Dataset validation passed!")
    return True

def create_sample_dataset():
    """
    Create a sample dataset structure with placeholder files for testing
    """
    import numpy as np
    from PIL import Image
    
    images_dir, masks_dir = create_dataset_structure("sample_dataset")
    
    # Create sample images and masks
    for i in range(5):
        # Create sample X-ray image (grayscale)
        img_array = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        img.save(os.path.join(images_dir, f"sample_xray_{i:03d}.png"))
        
        # Create sample mask (binary)
        mask_array = np.random.randint(0, 2, (256, 256), dtype=np.uint8) * 255
        mask = Image.fromarray(mask_array, mode='L')
        mask.save(os.path.join(masks_dir, f"sample_xray_{i:03d}.png"))
    
    print(f"✅ Created sample dataset with 5 image-mask pairs")
    print(f"📁 Location: sample_dataset/")

def main():
    print("🦷 Dental Semantic Segmentation Dataset Setup")
    print("=" * 50)
    
    while True:
        print("\nChoose an option:")
        print("1. Create empty dataset structure")
        print("2. Copy files from existing directories")
        print("3. Create sample dataset for testing")
        print("4. Validate existing dataset")
        print("5. Show Kaggle download instructions")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == "1":
            create_dataset_structure()
            print("\n✅ Empty dataset structure created!")
            print("📝 Next steps:")
            print("   - Add your X-ray images to dataset/all-images/")
            print("   - Add your segmentation masks to dataset/unet-masks/")
            
        elif choice == "2":
            source_images = input("Enter path to images directory: ").strip()
            source_masks = input("Enter path to masks directory: ").strip()
            target = input("Enter target dataset name (default: dataset): ").strip() or "dataset"
            
            copy_files_to_dataset(source_images, source_masks, target)
            
        elif choice == "3":
            create_sample_dataset()
            print("\n📝 You can now test training with: python train_semantic_model.py --dataset sample_dataset")
            
        elif choice == "4":
            dataset_path = input("Enter dataset path (default: dataset): ").strip() or "dataset"
            validate_dataset(dataset_path)
            
        elif choice == "5":
            download_kaggle_dataset()
            
        elif choice == "6":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()