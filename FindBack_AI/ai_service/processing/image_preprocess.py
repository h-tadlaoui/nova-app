"""
Image preprocessing utilities for CLIP model.
"""
import torch
import numpy as np
from PIL import Image
import cv2
from typing import Union, List
import io

from ai_service.utils.config import Config
from ai_service.utils.logger import logger


def fix_image_orientation(image: Image.Image) -> Image.Image:
    """
    Fix EXIF orientation issues.
    
    Args:
        image: PIL Image
        
    Returns:
        Corrected PIL Image
    """
    try:
        # Check for EXIF orientation tag
        exif = image._getexif()
        if exif is not None:
            orientation = exif.get(274)  # EXIF orientation tag
            if orientation == 3:
                image = image.rotate(180, expand=True)
            elif orientation == 6:
                image = image.rotate(270, expand=True)
            elif orientation == 8:
                image = image.rotate(90, expand=True)
    except (AttributeError, KeyError, TypeError):
        # No EXIF data or error reading it
        pass
    
    return image


def preprocess_image(
    image_input: Union[str, bytes, Image.Image, np.ndarray],
    size: int = Config.IMAGE_SIZE
) -> torch.Tensor:
    """
    Preprocess image for CLIP model.
    
    Steps:
    1. Load image (from file path, bytes, PIL Image, or numpy array)
    2. Fix EXIF orientation
    3. Convert to RGB
    4. Resize to square
    5. Normalize using CLIP statistics
    6. Convert to tensor
    
    Args:
        image_input: Image as file path, bytes, PIL Image, or numpy array
        size: Target size (default 224)
        
    Returns:
        Preprocessed image tensor of shape (3, H, W)
        
    Raises:
        ValueError: If image cannot be processed
    """
    try:
        # Load image based on input type
        if isinstance(image_input, str):
            # File path
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            # Bytes data
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            # PIL Image
            image = image_input.convert("RGB")
        elif isinstance(image_input, np.ndarray):
            # NumPy array (from OpenCV)
            if image_input.dtype != np.uint8:
                image_input = (image_input * 255).astype(np.uint8)
            image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")
        
        # Fix orientation
        image = fix_image_orientation(image)
        
        # Resize to 224x224 while maintaining aspect ratio (center padding)
        # Thumbnail maintains aspect ratio, then we center it on a 224x224 canvas
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Create a new image with the target size and paste centered
        new_image = Image.new("RGB", (size, size), (0, 0, 0))
        paste_x = (size - image.width) // 2
        paste_y = (size - image.height) // 2
        new_image.paste(image, (paste_x, paste_y))
        
        # Convert to numpy array and normalize
        img_array = np.array(new_image).astype(np.float32) / 255.0
        
        # Normalize using CLIP statistics
        mean = np.array(Config.CLIP_MEAN).reshape(1, 1, 3)
        std = np.array(Config.CLIP_STD).reshape(1, 1, 3)
        img_array = (img_array - mean) / std
        
        # Convert to tensor: (H, W, C) -> (C, H, W)
        img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).float()
        
        return img_tensor
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise ValueError(f"Failed to preprocess image: {str(e)}")


def preprocess_image_batch(
    images: List[Union[str, bytes, Image.Image, np.ndarray]],
    size: int = Config.IMAGE_SIZE
) -> torch.Tensor:
    """
    Preprocess a batch of images.
    
    Args:
        images: List of image inputs
        size: Target size
        
    Returns:
        Batch tensor of shape (N, 3, H, W)
    """
    processed = [preprocess_image(img, size) for img in images]
    return torch.stack(processed)
