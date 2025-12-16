"""
CLIP model wrapper for encoding images and text.
"""
import torch
import clip
from typing import Union, List, Optional
import numpy as np

from ai_service.utils.config import Config
from ai_service.utils.logger import logger
from ai_service.processing.image_preprocess import preprocess_image, preprocess_image_batch
from ai_service.processing.text_preprocess import preprocess_text, preprocess_text_batch


class CLIPModel:
    """Wrapper for OpenAI CLIP model."""
    
    def __init__(self, model_name: str = Config.CLIP_MODEL_NAME, device: str = Config.DEVICE):
        """
        Initialize CLIP model.
        
        Args:
            model_name: CLIP model name (e.g., "ViT-B/32", "RN50")
            device: Device to run on ("cpu" or "cuda")
        """
        self.model_name = model_name
        self.device = device
        self.model = None
        self.preprocess = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load CLIP model and preprocessing function."""
        try:
            logger.info(f"Loading CLIP model: {self.model_name} on {self.device}")
            self.model, self.preprocess = clip.load(self.model_name, device=self.device)
            self.model.eval()  # Set to evaluation mode
            logger.info("CLIP model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load CLIP model: {str(e)}")
            raise
    
    def encode_image(
        self,
        image_input: Union[str, bytes, torch.Tensor],
        normalize: bool = True
    ) -> np.ndarray:
        """
        Encode image to embedding vector.
        
        Args:
            image_input: Image as file path, bytes, or preprocessed tensor
            normalize: Whether to L2-normalize the embedding
            
        Returns:
            Image embedding as numpy array
        """
        with torch.no_grad():
            # Preprocess if not already a tensor
            if isinstance(image_input, torch.Tensor):
                if image_input.dim() == 3:
                    image_tensor = image_input.unsqueeze(0).to(self.device)
                else:
                    image_tensor = image_input.to(self.device)
            else:
                image_tensor = preprocess_image(image_input).unsqueeze(0).to(self.device)
            
            # Encode
            image_features = self.model.encode_image(image_tensor)
            
            # Normalize if requested
            if normalize:
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embedding = image_features.cpu().numpy().squeeze()
            
            return embedding
    
    def encode_text(
        self,
        text: str,
        normalize: bool = True
    ) -> np.ndarray:
        """
        Encode text to embedding vector.
        
        Args:
            text: Text string
            normalize: Whether to L2-normalize the embedding
            
        Returns:
            Text embedding as numpy array
        """
        with torch.no_grad():
            # Preprocess text
            processed_text = preprocess_text(text)
            
            # Tokenize
            text_tokens = clip.tokenize([processed_text], truncate=True).to(self.device)
            
            # Encode
            text_features = self.model.encode_text(text_tokens)
            
            # Normalize if requested
            if normalize:
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embedding = text_features.cpu().numpy().squeeze()
            
            return embedding
    
    def encode_images_batch(
        self,
        images: List[Union[str, bytes, torch.Tensor]],
        normalize: bool = True
    ) -> np.ndarray:
        """
        Encode a batch of images.
        
        Args:
            images: List of image inputs
            normalize: Whether to L2-normalize embeddings
            
        Returns:
            Array of embeddings (N, D)
        """
        with torch.no_grad():
            # Preprocess batch
            if isinstance(images[0], torch.Tensor):
                image_tensors = torch.stack([img if img.dim() == 3 else img.squeeze(0) 
                                            for img in images]).to(self.device)
            else:
                image_tensors = preprocess_image_batch(images).to(self.device)
            
            # Encode
            image_features = self.model.encode_image(image_tensors)
            
            # Normalize if requested
            if normalize:
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embeddings = image_features.cpu().numpy()
            
            return embeddings
    
    def encode_texts_batch(
        self,
        texts: List[str],
        normalize: bool = True
    ) -> np.ndarray:
        """
        Encode a batch of texts.
        
        Args:
            texts: List of text strings
            normalize: Whether to L2-normalize embeddings
            
        Returns:
            Array of embeddings (N, D)
        """
        with torch.no_grad():
            # Preprocess texts
            processed_texts = preprocess_text_batch(texts)
            
            # Tokenize
            text_tokens = clip.tokenize(processed_texts, truncate=True).to(self.device)
            
            # Encode
            text_features = self.model.encode_text(text_tokens)
            
            # Normalize if requested
            if normalize:
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            # Convert to numpy
            embeddings = text_features.cpu().numpy()
            
            return embeddings
    
    def get_embedding_dim(self) -> int:
        """
        Get the dimension of embeddings produced by this model.
        
        Returns:
            Embedding dimension
        """
        # Create a dummy input to get dimension
        dummy_text = "test"
        embedding = self.encode_text(dummy_text, normalize=False)
        return embedding.shape[0]


# Global model instance (lazy loaded)
_model_instance: Optional[CLIPModel] = None


def get_clip_model() -> CLIPModel:
    """
    Get or create global CLIP model instance.
    
    Returns:
        CLIPModel instance
    """
    global _model_instance
    if _model_instance is None:
        _model_instance = CLIPModel()
    return _model_instance

