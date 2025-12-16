"""
Tests for API endpoints.
"""
import pytest
import uuid
from fastapi.testclient import TestClient
from PIL import Image
import io

from ai_service.api.main import app
from ai_service.utils.config import Config

# Initialize directories for tests
Config.initialize_directories()

client = TestClient(app)


def unique_id(prefix: str = "test") -> str:
    """Generate a unique ID for testing."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


class TestHealthCheck:
    """Tests for health check endpoint."""
    
    def test_healthcheck(self):
        """Test health check endpoint."""
        response = client.get("/healthcheck")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestEncodeEndpoints:
    """Tests for encoding endpoints."""
    
    def test_encode_text(self):
        """Test text encoding endpoint."""
        response = client.post(
            "/encode/text",
            json={"text": "a red backpack"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "embedding" in data
        assert "dimension" in data
        assert len(data["embedding"]) == Config.EMBEDDING_DIM
    
    def test_encode_image(self):
        """Test image encoding endpoint."""
        # Create a test image
        img = Image.new('RGB', (224, 224), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        response = client.post(
            "/encode/image",
            files={"file": ("test.png", img_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert "embedding" in data
        assert "dimension" in data
        assert len(data["embedding"]) == Config.EMBEDDING_DIM


class TestItemEndpoints:
    """Tests for item management endpoints."""
    
    def test_add_lost_item_text_only(self):
        """Test adding lost item with text only."""
        item_id = unique_id("lost")
        response = client.post(
            "/add/lost_item",
            data={
                "item_id": item_id,
                "description": "a red backpack"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["item_id"] == item_id
        assert data["status"] == "added"
        assert data["has_text"] is True
    
    def test_add_lost_item_with_image(self):
        """Test adding lost item with image."""
        item_id = unique_id("lost_img")
        # Create a test image
        img = Image.new('RGB', (224, 224), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        response = client.post(
            "/add/lost_item",
            data={
                "item_id": item_id,
                "description": "a blue suitcase"
            },
            files={"image": ("test.png", img_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["item_id"] == item_id
        assert data["has_image"] is True
        assert data["has_text"] is True
    
    def test_add_found_item(self):
        """Test adding found item."""
        item_id = unique_id("found")
        response = client.post(
            "/add/found_item",
            data={
                "item_id": item_id,
                "description": "found a red backpack"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["item_id"] == item_id
        assert data["status"] == "added"
    
    def test_duplicate_item(self):
        """Test adding duplicate item."""
        item_id = unique_id("dup")
        # Add first time
        client.post(
            "/add/lost_item",
            data={
                "item_id": item_id,
                "description": "test item"
            }
        )
        
        # Try to add again with same ID
        response = client.post(
            "/add/lost_item",
            data={
                "item_id": item_id,
                "description": "test item"
            }
        )
        assert response.status_code == 400


class TestSearchEndpoints:
    """Tests for search endpoints."""
    
    def test_search_lost_text(self):
        """Test searching for lost items with text query."""
        # First add a found item
        item_id = unique_id("found_search")
        client.post(
            "/add/found_item",
            data={
                "item_id": item_id,
                "description": "found a red backpack"
            }
        )
        
        # Search for it
        response = client.post(
            "/search/lost?top_k=5",
            data={"text": "red backpack"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        assert "query_type" in data
        assert data["query_type"] == "text"
    
    def test_search_lost_image(self):
        """Test searching for lost items with image query."""
        # Add a found item
        item_id = unique_id("found_img_search")
        client.post(
            "/add/found_item",
            data={
                "item_id": item_id,
                "description": "found item"
            }
        )
        
        # Create query image
        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        response = client.post(
            "/search/lost?top_k=5",
            files={"image": ("query.png", img_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        assert data["query_type"] == "image"
    
    def test_search_found(self):
        """Test searching for found items."""
        # Add a lost item
        item_id = unique_id("lost_search")
        client.post(
            "/add/lost_item",
            data={
                "item_id": item_id,
                "description": "lost a blue suitcase"
            }
        )
        
        # Search for it
        response = client.post(
            "/search/found?top_k=5",
            data={"text": "blue suitcase"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
    
    def test_search_no_query(self):
        """Test search without query."""
        response = client.post("/search/lost")
        assert response.status_code == 400
    
    def test_search_with_both_text_and_image(self):
        """Test searching with both text and image query."""
        # Add a found item
        item_id = unique_id("found_both")
        client.post(
            "/add/found_item",
            data={
                "item_id": item_id,
                "description": "found a yellow umbrella"
            }
        )
        
        # Create query image
        img = Image.new('RGB', (224, 224), color='yellow')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Search with both text and image
        response = client.post(
            "/search/lost?top_k=5",
            data={"text": "yellow umbrella"},
            files={"image": ("query.png", img_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query_type"] == "both"


class TestEdgeCases:
    """Tests for edge cases and error handling."""
    
    def test_add_item_image_only(self):
        """Test adding item with image only (no description)."""
        item_id = unique_id("img_only")
        img = Image.new('RGB', (224, 224), color='purple')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id},
            files={"image": ("test.png", img_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_image"] is True
        assert data["has_text"] is False
    
    def test_add_item_no_content(self):
        """Test adding item without image or description fails."""
        item_id = unique_id("no_content")
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id}
        )
        assert response.status_code == 500  # Should fail validation
    
    def test_add_item_empty_description(self):
        """Test adding item with empty description fails."""
        item_id = unique_id("empty_desc")
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id, "description": "   "}
        )
        assert response.status_code == 500  # Whitespace-only description should fail
    
    def test_encode_empty_text(self):
        """Test encoding empty text fails."""
        response = client.post(
            "/encode/text",
            json={"text": ""}
        )
        assert response.status_code == 400  # Now returns 400 with proper validation
    
    def test_encode_whitespace_only_text(self):
        """Test encoding whitespace-only text fails."""
        response = client.post(
            "/encode/text",
            json={"text": "   "}
        )
        assert response.status_code == 400
    
    def test_root_endpoint(self):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "docs" in data

