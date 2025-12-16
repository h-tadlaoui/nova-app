"""
FAISS vector index management for similarity search.
"""
import faiss
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional
import pickle

from ai_service.utils.config import Config
from ai_service.utils.logger import logger


class FAISSIndex:
    """FAISS index wrapper for vector similarity search."""
    
    def __init__(self, index_path: Path, dimension: int = Config.EMBEDDING_DIM):
        """
        Initialize FAISS index.
        
        Args:
            index_path: Path to save/load index
            dimension: Embedding dimension
        """
        self.index_path = index_path
        self.dimension = dimension
        self.index: Optional[faiss.Index] = None
        self.id_to_index: dict = {}  # Map item_id to FAISS index position
        self.index_to_id: dict = {}  # Map FAISS index position to item_id
        self._initialize_index()
    
    def _initialize_index(self) -> None:
        """Initialize or load FAISS index."""
        if self.index_path.exists():
            try:
                self._load()
                logger.info(f"Loaded FAISS index from {self.index_path} with {self.index.ntotal} vectors")
            except Exception as e:
                logger.warning(f"Failed to load index, creating new one: {str(e)}")
                self._create_new_index()
        else:
            self._create_new_index()
    
    def _create_new_index(self) -> None:
        """Create a new FAISS index."""
        # Use IndexFlatIP (Inner Product) for cosine similarity with normalized vectors
        # Since embeddings are L2-normalized, inner product = cosine similarity
        self.index = faiss.IndexFlatIP(self.dimension)
        self.id_to_index = {}
        self.index_to_id = {}
        logger.info(f"Created new FAISS index with dimension {self.dimension}")
    
    def add(
        self,
        embedding: np.ndarray,
        item_id: str,
        save: bool = True
    ) -> int:
        """
        Add a vector to the index.
        
        Args:
            embedding: Embedding vector (1D array)
            item_id: Unique item identifier
            save: Whether to save index after adding
            
        Returns:
            Index position of added vector
        """
        # Ensure embedding is 2D
        if embedding.ndim == 1:
            embedding = embedding.reshape(1, -1)
        
        # Ensure embedding is float32
        embedding = embedding.astype(np.float32)
        
        # Check dimension
        if embedding.shape[1] != self.dimension:
            raise ValueError(
                f"Embedding dimension {embedding.shape[1]} "
                f"does not match index dimension {self.dimension}"
            )
        
        # Add to index
        position = self.index.ntotal
        self.index.add(embedding)
        
        # Update mappings
        self.id_to_index[item_id] = position
        self.index_to_id[position] = item_id
        
        if save:
            self._save()
        
        logger.debug(f"Added vector for item {item_id} at position {position}")
        return position
    
    def remove(self, item_id: str, save: bool = True) -> bool:
        """
        Remove a vector from the index.
        
        Note: FAISS doesn't support direct removal. We rebuild the index.
        
        Args:
            item_id: Item identifier
            save: Whether to save after removal
            
        Returns:
            True if removed, False if not found
        """
        if item_id not in self.id_to_index:
            return False
        
        # Get all vectors except the one to remove
        all_vectors = self.index.reconstruct_n(0, self.index.ntotal)
        positions_to_keep = [
            pos for pos, iid in self.index_to_id.items()
            if iid != item_id
        ]
        
        if not positions_to_keep:
            # Empty index
            self._create_new_index()
        else:
            # Rebuild index without removed vector
            # Store mappings before clearing
            id_to_vector = {}
            for pos in positions_to_keep:
                item_id_to_keep = self.index_to_id[pos]
                vector = all_vectors[pos]
                id_to_vector[item_id_to_keep] = vector
            
            # Recreate index and re-add vectors
            self._create_new_index()
            for item_id_to_keep, vector in id_to_vector.items():
                self.add(vector, item_id_to_keep, save=False)
        
        if save:
            self._save()
        
        logger.debug(f"Removed vector for item {item_id}")
        return True
    
    def update(
        self,
        embedding: np.ndarray,
        item_id: str,
        save: bool = True
    ) -> bool:
        """
        Update a vector in the index.
        
        Args:
            embedding: New embedding vector
            item_id: Item identifier
            save: Whether to save after update
            
        Returns:
            True if updated, False if not found
        """
        if item_id not in self.id_to_index:
            return False
        
        # Remove and re-add
        self.remove(item_id, save=False)
        self.add(embedding, item_id, save=save)
        
        logger.debug(f"Updated vector for item {item_id}")
        return True
    
    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = Config.DEFAULT_TOP_K
    ) -> List[Tuple[str, float]]:
        """
        Search for similar vectors.
        
        Args:
            query_embedding: Query embedding vector (1D array)
            top_k: Number of results to return
            
        Returns:
            List of (item_id, similarity_score) tuples, sorted by score (descending)
        """
        if self.index.ntotal == 0:
            return []
        
        # Ensure query is 2D and float32
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        query_embedding = query_embedding.astype(np.float32)
        
        # Search
        scores, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))
        
        # Convert to results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # FAISS returns -1 for empty slots
                continue
            item_id = self.index_to_id.get(idx)
            if item_id:
                # Convert inner product to similarity (already cosine similarity for normalized vectors)
                results.append((item_id, float(score)))
        
        return results
    
    def get_vector(self, item_id: str) -> Optional[np.ndarray]:
        """
        Get vector for an item.
        
        Args:
            item_id: Item identifier
            
        Returns:
            Embedding vector or None if not found
        """
        if item_id not in self.id_to_index:
            return None
        
        position = self.id_to_index[item_id]
        vector = self.index.reconstruct(position)
        return vector
    
    def count(self) -> int:
        """
        Get total number of vectors in index.
        
        Returns:
            Number of vectors
        """
        return self.index.ntotal
    
    def _save(self) -> None:
        """Save index and mappings to disk."""
        try:
            self.index_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Save FAISS index
            faiss.write_index(self.index, str(self.index_path))
            
            # Save mappings
            mappings_path = self.index_path.with_suffix('.mappings.pkl')
            with open(mappings_path, 'wb') as f:
                pickle.dump({
                    'id_to_index': self.id_to_index,
                    'index_to_id': self.index_to_id
                }, f)
            
            logger.debug(f"Saved FAISS index to {self.index_path}")
        except Exception as e:
            logger.error(f"Failed to save index: {str(e)}")
            raise
    
    def _load(self) -> None:
        """Load index and mappings from disk."""
        try:
            # Load FAISS index
            self.index = faiss.read_index(str(self.index_path))
            
            # Load mappings
            mappings_path = self.index_path.with_suffix('.mappings.pkl')
            if mappings_path.exists():
                with open(mappings_path, 'rb') as f:
                    mappings = pickle.load(f)
                    self.id_to_index = mappings.get('id_to_index', {})
                    self.index_to_id = mappings.get('index_to_id', {})
            else:
                # Rebuild mappings from index (if possible)
                self.id_to_index = {}
                self.index_to_id = {}
                logger.warning("Mappings file not found, mappings will be empty")
            
        except Exception as e:
            logger.error(f"Failed to load index: {str(e)}")
            raise
