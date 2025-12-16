"""
Tests for image and text preprocessing.
"""
import pytest
import numpy as np
from PIL import Image
import torch

from ai_service.processing.image_preprocess import preprocess_image, preprocess_image_batch
from ai_service.processing.text_preprocess import preprocess_text, preprocess_text_batch
from ai_service.utils.config import Config


class TestImagePreprocessing:
    """Tests for image preprocessing."""
    
    def test_preprocess_pil_image(self):
        """Test preprocessing PIL Image."""
        # Create a test image
        img = Image.new('RGB', (100, 100), color='red')
        tensor = preprocess_image(img)
        
        assert isinstance(tensor, torch.Tensor)
        assert tensor.shape == (3, Config.IMAGE_SIZE, Config.IMAGE_SIZE)
        assert tensor.dtype == torch.float32
    
    def test_preprocess_numpy_array(self):
        """Test preprocessing numpy array."""
        # Create a test image as numpy array
        img_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        tensor = preprocess_image(img_array)
        
        assert isinstance(tensor, torch.Tensor)
        assert tensor.shape == (3, Config.IMAGE_SIZE, Config.IMAGE_SIZE)
    
    def test_preprocess_batch(self):
        """Test batch preprocessing."""
        images = [
            Image.new('RGB', (50, 50), color='blue'),
            Image.new('RGB', (200, 200), color='green')
        ]
        batch = preprocess_image_batch(images)
        
        assert isinstance(batch, torch.Tensor)
        assert batch.shape == (2, 3, Config.IMAGE_SIZE, Config.IMAGE_SIZE)
    
    def test_invalid_input(self):
        """Test invalid input handling."""
        with pytest.raises(ValueError):
            preprocess_image(None)


class TestTextPreprocessing:
    """Tests for text preprocessing."""
    
    def test_normalize_text(self):
        """Test text normalization."""
        from ai_service.processing.text_preprocess import normalize_text
        
        text = "  Hello   World  "
        normalized = normalize_text(text)
        
        assert normalized == "hello world"
        assert isinstance(normalized, str)
    
    def test_preprocess_text(self):
        """Test text preprocessing."""
        text = "  Lost: Red Backpack  "
        processed = preprocess_text(text)
        
        assert processed == "lost: red backpack"
        assert isinstance(processed, str)
    
    def test_preprocess_text_max_length(self):
        """Test text truncation."""
        long_text = "a" * 2000
        processed = preprocess_text(long_text, max_length=100)
        
        assert len(processed) <= 100
    
    def test_preprocess_text_batch(self):
        """Test batch text preprocessing."""
        texts = ["  Text One  ", "TEXT TWO", "  text three  "]
        processed = preprocess_text_batch(texts)
        
        assert len(processed) == 3
        assert processed[0] == "text one"
        assert processed[1] == "text two"
        assert processed[2] == "text three"
    
    def test_empty_text(self):
        """Test empty text handling."""
        with pytest.raises(ValueError):
            preprocess_text("")
    
    def test_non_string_input(self):
        """Test non-string input handling."""
        from ai_service.processing.text_preprocess import normalize_text
        
        with pytest.raises(ValueError):
            normalize_text(123)


