"""
Tests for FAISS search functionality.
"""
import pytest
import numpy as np
import tempfile
from pathlib import Path

from ai_service.vector_store.faiss_index import FAISSIndex
from ai_service.vector_store.metadata_store import MetadataStore
from ai_service.utils.config import Config


class TestFAISSIndex:
    """Tests for FAISS index."""
    
    @pytest.fixture
    def temp_index_path(self):
        """Create temporary index path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield Path(tmpdir) / "test.index"
    
    @pytest.fixture
    def faiss_index(self, temp_index_path):
        """Create FAISS index instance."""
        return FAISSIndex(temp_index_path, dimension=Config.EMBEDDING_DIM)
    
    def test_add_vector(self, faiss_index):
        """Test adding a vector."""
        embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)  # Normalize
        
        position = faiss_index.add(embedding, "item1", save=False)
        
        assert position == 0
        assert faiss_index.count() == 1
    
    def test_search(self, faiss_index):
        """Test vector search."""
        # Add some vectors
        for i in range(5):
            embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
            embedding = embedding / np.linalg.norm(embedding)
            faiss_index.add(embedding, f"item{i}", save=False)
        
        # Create query vector
        query = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        query = query / np.linalg.norm(query)
        
        # Search
        results = faiss_index.search(query, top_k=3)
        
        assert len(results) <= 3
        assert all(isinstance(r, tuple) and len(r) == 2 for r in results)
        assert all(isinstance(item_id, str) for item_id, _ in results)
        assert all(isinstance(score, float) for _, score in results)
    
    def test_remove_vector(self, faiss_index):
        """Test removing a vector."""
        embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)
        
        faiss_index.add(embedding, "item1", save=False)
        assert faiss_index.count() == 1
        
        removed = faiss_index.remove("item1", save=False)
        assert removed is True
        assert faiss_index.count() == 0
    
    def test_update_vector(self, faiss_index):
        """Test updating a vector."""
        embedding1 = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        
        faiss_index.add(embedding1, "item1", save=False)
        
        embedding2 = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding2 = embedding2 / np.linalg.norm(embedding2)
        
        updated = faiss_index.update(embedding2, "item1", save=False)
        assert updated is True
        assert faiss_index.count() == 1
    
    def test_get_vector(self, faiss_index):
        """Test getting a vector."""
        embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)
        
        faiss_index.add(embedding, "item1", save=False)
        
        retrieved = faiss_index.get_vector("item1")
        assert retrieved is not None
        assert retrieved.shape == (Config.EMBEDDING_DIM,)
    
    def test_save_load(self, temp_index_path):
        """Test saving and loading index."""
        # Create and add vectors
        index1 = FAISSIndex(temp_index_path, dimension=Config.EMBEDDING_DIM)
        for i in range(3):
            embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
            embedding = embedding / np.linalg.norm(embedding)
            index1.add(embedding, f"item{i}", save=True)
        
        # Load in new instance
        index2 = FAISSIndex(temp_index_path, dimension=Config.EMBEDDING_DIM)
        assert index2.count() == 3


class TestMetadataStore:
    """Tests for metadata store."""
    
    @pytest.fixture
    def temp_metadata_path(self):
        """Create temporary metadata path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield Path(tmpdir) / "test_metadata.json"
    
    @pytest.fixture
    def metadata_store(self, temp_metadata_path):
        """Create metadata store instance."""
        return MetadataStore(temp_metadata_path)
    
    def test_add_metadata(self, metadata_store):
        """Test adding metadata."""
        metadata_store.add(
            item_id="item1",
            description="a red backpack",
            has_image=True,
            has_text=True
        )
        
        assert metadata_store.exists("item1")
        assert metadata_store.count() == 1
    
    def test_get_metadata(self, metadata_store):
        """Test getting metadata."""
        metadata_store.add(
            item_id="item1",
            description="test description",
            has_image=False,
            has_text=True
        )
        
        metadata = metadata_store.get("item1")
        assert metadata is not None
        assert metadata["item_id"] == "item1"
        assert metadata["description"] == "test description"
    
    def test_update_metadata(self, metadata_store):
        """Test updating metadata."""
        metadata_store.add(
            item_id="item1",
            description="old description",
            has_text=True
        )
        
        updated = metadata_store.update("item1", description="new description")
        assert updated is True
        
        metadata = metadata_store.get("item1")
        assert metadata["description"] == "new description"
    
    def test_remove_metadata(self, metadata_store):
        """Test removing metadata."""
        metadata_store.add(item_id="item1", has_text=True)
        assert metadata_store.exists("item1")
        
        removed = metadata_store.remove("item1")
        assert removed is True
        assert not metadata_store.exists("item1")
    
    def test_list_all(self, metadata_store):
        """Test listing all items."""
        for i in range(5):
            metadata_store.add(item_id=f"item{i}", has_text=True)
        
        all_items = metadata_store.list_all()
        assert len(all_items) == 5
        assert "item0" in all_items


