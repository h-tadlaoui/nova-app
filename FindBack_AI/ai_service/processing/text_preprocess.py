"""
Text preprocessing utilities for CLIP model.
"""
import re
from typing import List, Optional

from ai_service.utils.logger import logger


def normalize_text(text: str) -> str:
    """
    Normalize text for CLIP encoding.
    
    Steps:
    1. Convert to lowercase
    2. Remove extra whitespace
    3. Strip leading/trailing whitespace
    
    Args:
        text: Input text string
        
    Returns:
        Normalized text string
    """
    if not isinstance(text, str):
        raise ValueError(f"Text must be a string, got {type(text)}")
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def preprocess_text(text: str, max_length: Optional[int] = None) -> str:
    """
    Preprocess text for CLIP model.
    
    Args:
        text: Input text string
        max_length: Optional maximum length (truncate if longer)
        
    Returns:
        Preprocessed text string
        
    Raises:
        ValueError: If text is invalid
    """
    if not text:
        raise ValueError("Text cannot be empty")
    
    # Normalize
    processed = normalize_text(text)
    
    # Truncate if necessary
    if max_length and len(processed) > max_length:
        processed = processed[:max_length].rstrip()
        logger.warning(f"Text truncated to {max_length} characters")
    
    return processed


def preprocess_text_batch(texts: List[str], max_length: Optional[int] = None) -> List[str]:
    """
    Preprocess a batch of texts.
    
    Args:
        texts: List of text strings
        max_length: Optional maximum length
        
    Returns:
        List of preprocessed text strings
    """
    return [preprocess_text(text, max_length) for text in texts]
