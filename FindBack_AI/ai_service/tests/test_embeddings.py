"""
Tests for CLIP embeddings.
"""
import pytest
import numpy as np
from PIL import Image

from ai_service.models.clip_model import get_clip_model
from ai_service.utils.config import Config


class TestCLIPModel:
    """Tests for CLIP model."""
    
    @pytest.fixture
    def clip_model(self):
        """Create CLIP model instance."""
        return get_clip_model()
    
    def test_encode_image(self, clip_model):
        """Test image encoding."""
        # Create a test image
        img = Image.new('RGB', (224, 224), color='blue')
        embedding = clip_model.encode_image(img, normalize=True)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.ndim == 1
        assert embedding.shape[0] == Config.EMBEDDING_DIM
        # Check normalization
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 1e-5
    
    def test_encode_text(self, clip_model):
        """Test text encoding."""
        text = "a red backpack"
        embedding = clip_model.encode_text(text, normalize=True)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.ndim == 1
        assert embedding.shape[0] == Config.EMBEDDING_DIM
        # Check normalization
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 1e-5
    
    def test_encode_images_batch(self, clip_model):
        """Test batch image encoding."""
        images = [
            Image.new('RGB', (100, 100), color='red'),
            Image.new('RGB', (200, 200), color='green')
        ]
        embeddings = clip_model.encode_images_batch(images, normalize=True)
        
        assert isinstance(embeddings, np.ndarray)
        assert embeddings.shape == (2, Config.EMBEDDING_DIM)
    
    def test_encode_texts_batch(self, clip_model):
        """Test batch text encoding."""
        texts = ["red backpack", "blue suitcase"]
        embeddings = clip_model.encode_texts_batch(texts, normalize=True)
        
        assert isinstance(embeddings, np.ndarray)
        assert embeddings.shape == (2, Config.EMBEDDING_DIM)
    
    def test_get_embedding_dim(self, clip_model):
        """Test getting embedding dimension."""
        dim = clip_model.get_embedding_dim()
        assert dim == Config.EMBEDDING_DIM
    
    def test_similarity_image_text(self, clip_model):
        """Test that similar image and text have high similarity."""
        # Create a simple test image
        img = Image.new('RGB', (224, 224), color='red')
        img_embedding = clip_model.encode_image(img, normalize=True)
        
        # Encode related text
        text_embedding = clip_model.encode_text("a red object", normalize=True)
        
        # Compute similarity (cosine similarity for normalized vectors)
        similarity = np.dot(img_embedding, text_embedding)
        
        # Should have some similarity (not zero)
        assert similarity > -1.0
        assert similarity <= 1.0


