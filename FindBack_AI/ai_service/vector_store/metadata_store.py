"""
Metadata store for items (lost and found).
"""
import json
from pathlib import Path
from typing import Dict, Optional, List, Any
from datetime import datetime, timezone

from ai_service.utils.logger import logger


class MetadataStore:
    """Store and manage metadata for items."""
    
    def __init__(self, metadata_path: Path):
        """
        Initialize metadata store.
        
        Args:
            metadata_path: Path to JSON metadata file
        """
        self.metadata_path = metadata_path
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self._load()
    
    def _load(self) -> None:
        """Load metadata from file."""
        if self.metadata_path.exists():
            try:
                with open(self.metadata_path, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded {len(self.metadata)} items from {self.metadata_path}")
            except Exception as e:
                logger.error(f"Failed to load metadata: {str(e)}")
                self.metadata = {}
        else:
            self.metadata = {}
            self._save()
    
    def _save(self) -> None:
        """Save metadata to file."""
        try:
            self.metadata_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.metadata_path, 'w', encoding='utf-8') as f:
                json.dump(self.metadata, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save metadata: {str(e)}")
            raise
    
    def add(
        self,
        item_id: str,
        description: Optional[str] = None,
        image_path: Optional[str] = None,
        has_image: bool = False,
        has_text: bool = False,
        **kwargs
    ) -> None:
        """
        Add or update item metadata.
        
        Args:
            item_id: Unique item identifier
            description: Text description
            image_path: Optional path to image file
            has_image: Whether item has image
            has_text: Whether item has text
            **kwargs: Additional metadata fields
        """
        self.metadata[item_id] = {
            "item_id": item_id,
            "description": description,
            "image_path": image_path,
            "has_image": has_image,
            "has_text": has_text,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            **kwargs
        }
        self._save()
        logger.debug(f"Added metadata for item: {item_id}")
    
    def get(self, item_id: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for an item.
        
        Args:
            item_id: Item identifier
            
        Returns:
            Metadata dictionary or None if not found
        """
        return self.metadata.get(item_id)
    
    def update(self, item_id: str, **kwargs) -> bool:
        """
        Update metadata for an item.
        
        Args:
            item_id: Item identifier
            **kwargs: Fields to update
            
        Returns:
            True if updated, False if item not found
        """
        if item_id not in self.metadata:
            return False
        
        self.metadata[item_id].update(kwargs)
        self.metadata[item_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._save()
        logger.debug(f"Updated metadata for item: {item_id}")
        return True
    
    def remove(self, item_id: str) -> bool:
        """
        Remove item metadata.
        
        Args:
            item_id: Item identifier
            
        Returns:
            True if removed, False if not found
        """
        if item_id in self.metadata:
            del self.metadata[item_id]
            self._save()
            logger.debug(f"Removed metadata for item: {item_id}")
            return True
        return False
    
    def list_all(self) -> List[str]:
        """
        List all item IDs.
        
        Returns:
            List of item IDs
        """
        return list(self.metadata.keys())
    
    def count(self) -> int:
        """
        Get total number of items.
        
        Returns:
            Number of items
        """
        return len(self.metadata)
    
    def exists(self, item_id: str) -> bool:
        """
        Check if item exists.
        
        Args:
            item_id: Item identifier
            
        Returns:
            True if exists, False otherwise
        """
        return item_id in self.metadata
