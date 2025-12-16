"""
Configuration management for the AI service.
"""
from pathlib import Path


class Config:
    """Application configuration."""
    
    # Model settings
    CLIP_MODEL_NAME: str = "ViT-B/32"
    DEVICE: str = "cpu"
    
    # Image preprocessing
    IMAGE_SIZE: int = 224
    CLIP_MEAN: tuple = (0.48145466, 0.4578275, 0.40821073)
    CLIP_STD: tuple = (0.26862954, 0.24768475, 0.25532175)
    
    # FAISS settings
    EMBEDDING_DIM: int = 512  # CLIP ViT-B/32 produces 512-dim embeddings
    INDEX_TYPE: str = "L2"
    
    # Storage paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    INDEXES_DIR: Path = DATA_DIR / "indexes"
    METADATA_DIR: Path = DATA_DIR / "metadata"
    
    # API settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_TEXT_LENGTH: int = 1000
    
    # Search settings
    DEFAULT_TOP_K: int = 10
    MIN_SIMILARITY_SCORE: float = 0.0
    
    @classmethod
    def initialize_directories(cls) -> None:
        """Create necessary directories if they don't exist."""
        cls.INDEXES_DIR.mkdir(parents=True, exist_ok=True)
        cls.METADATA_DIR.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_lost_items_index_path(cls) -> Path:
        """Get path to lost items FAISS index."""
        return cls.INDEXES_DIR / "lost_items.index"
    
    @classmethod
    def get_found_items_index_path(cls) -> Path:
        """Get path to found items FAISS index."""
        return cls.INDEXES_DIR / "found_items.index"
    
    @classmethod
    def get_lost_items_metadata_path(cls) -> Path:
        """Get path to lost items metadata store."""
        return cls.METADATA_DIR / "lost_items.json"
    
    @classmethod
    def get_found_items_metadata_path(cls) -> Path:
        """Get path to found items metadata store."""
        return cls.METADATA_DIR / "found_items.json"
