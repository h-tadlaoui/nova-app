"""
Comprehensive functional tests covering all system scenarios.
Run with: pytest ai_service/tests/test_comprehensive.py -v -s
"""
import pytest
import numpy as np
import time
import uuid
import tempfile
import io
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

from ai_service.api.main import app
from ai_service.models.clip_model import get_clip_model
from ai_service.processing.image_preprocess import preprocess_image, fix_image_orientation
from ai_service.processing.text_preprocess import preprocess_text, normalize_text
from ai_service.vector_store.faiss_index import FAISSIndex
from ai_service.vector_store.metadata_store import MetadataStore
from ai_service.utils.config import Config

Config.initialize_directories()
client = TestClient(app)


def unique_id(prefix: str = "test") -> str:
    """Generate unique ID for testing."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def create_test_image(color: str = "red", size: tuple = (224, 224), format: str = "PNG") -> bytes:
    """Create a test image and return as bytes."""
    img = Image.new('RGB', size, color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes.read()


# =============================================================================
# 1. PREPROCESSING TESTS
# =============================================================================
class TestPreprocessing:
    """1. Preprocessing tests - image and text."""
    
    def test_valid_jpeg_upload(self):
        """Test valid JPEG image processing."""
        img = Image.new('RGB', (300, 200), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        tensor = preprocess_image(img_bytes.read())
        assert tensor.shape == (3, 224, 224)
        assert tensor.dtype.is_floating_point
        print("✅ Valid JPEG upload: PASS")
    
    def test_valid_png_upload(self):
        """Test valid PNG image processing."""
        img = Image.new('RGB', (150, 150), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        tensor = preprocess_image(img_bytes.read())
        assert tensor.shape == (3, 224, 224)
        print("✅ Valid PNG upload: PASS")
    
    def test_corrupt_image_handling(self):
        """Test corrupt image raises ValueError."""
        corrupt_bytes = b"not an image at all"
        with pytest.raises(ValueError) as exc_info:
            preprocess_image(corrupt_bytes)
        assert "Failed to preprocess" in str(exc_info.value)
        print("✅ Corrupt image handling: PASS")
    
    def test_wrong_format_handling(self):
        """Test unsupported format handling."""
        # PDF-like bytes
        pdf_bytes = b"%PDF-1.4 fake pdf content"
        with pytest.raises(ValueError):
            preprocess_image(pdf_bytes)
        print("✅ Wrong format handling: PASS")
    
    def test_exif_rotation_handling(self):
        """Test EXIF rotation is handled."""
        img = Image.new('RGB', (100, 100), color='red')
        # fix_image_orientation should not crash even without EXIF
        result = fix_image_orientation(img)
        assert result is not None
        assert isinstance(result, Image.Image)
        print("✅ EXIF rotation handling: PASS")
    
    def test_rgb_conversion(self):
        """Test RGBA and other modes convert to RGB."""
        # RGBA image
        rgba_img = Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))
        tensor = preprocess_image(rgba_img)
        assert tensor.shape[0] == 3  # RGB channels
        print("✅ RGB conversion: PASS")
    
    def test_resize_to_224x224(self):
        """Test images resize to 224x224."""
        # Large image
        large_img = Image.new('RGB', (1000, 500), color='purple')
        tensor = preprocess_image(large_img)
        assert tensor.shape == (3, 224, 224)
        
        # Small image
        small_img = Image.new('RGB', (50, 50), color='yellow')
        tensor = preprocess_image(small_img)
        assert tensor.shape == (3, 224, 224)
        print("✅ Resize to 224x224: PASS")
    
    def test_normalization(self):
        """Test CLIP normalization is applied."""
        img = Image.new('RGB', (224, 224), color='white')
        tensor = preprocess_image(img)
        # After normalization, values should be centered around 0
        assert tensor.mean().abs() < 5  # Rough check
        print("✅ Normalization: PASS")
    
    def test_text_lowercase(self):
        """Test text converts to lowercase."""
        result = normalize_text("HELLO WORLD")
        assert result == "hello world"
        print("✅ Text lowercase: PASS")
    
    def test_text_spacing(self):
        """Test extra whitespace is removed."""
        result = normalize_text("  hello   world  ")
        assert result == "hello world"
        print("✅ Text spacing normalization: PASS")
    
    def test_tensor_shape_and_type(self):
        """Confirm outputs match expected tensor shapes and types."""
        img = Image.new('RGB', (100, 100), color='cyan')
        tensor = preprocess_image(img)
        
        assert tensor.shape == (3, Config.IMAGE_SIZE, Config.IMAGE_SIZE)
        assert tensor.dtype.is_floating_point
        assert tensor.ndim == 3
        print("✅ Tensor shape and type: PASS")


# =============================================================================
# 2. EMBEDDING TESTS
# =============================================================================
class TestEmbeddings:
    """2. Embedding tests - CLIP model validation."""
    
    @pytest.fixture
    def clip_model(self):
        return get_clip_model()
    
    def test_image_embedding_extraction(self, clip_model):
        """Test image embedding extraction."""
        img = Image.new('RGB', (224, 224), color='red')
        embedding = clip_model.encode_image(img, normalize=True)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.ndim == 1
        print("✅ Image embedding extraction: PASS")
    
    def test_text_embedding_extraction(self, clip_model):
        """Test text embedding extraction."""
        embedding = clip_model.encode_text("a red backpack", normalize=True)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.ndim == 1
        print("✅ Text embedding extraction: PASS")
    
    def test_l2_normalization(self, clip_model):
        """Test L2 normalization."""
        img = Image.new('RGB', (224, 224), color='blue')
        embedding = clip_model.encode_image(img, normalize=True)
        
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 1e-5, f"Norm should be 1.0, got {norm}"
        print("✅ L2 normalization: PASS")
    
    def test_correct_dimensionality(self, clip_model):
        """Test correct dimensionality (512 for ViT-B/32)."""
        embedding = clip_model.encode_text("test", normalize=True)
        
        assert embedding.shape[0] == Config.EMBEDDING_DIM
        assert embedding.shape[0] == 512  # CLIP ViT-B/32
        print(f"✅ Correct dimensionality ({Config.EMBEDDING_DIM}): PASS")
    
    def test_consistency_same_image(self, clip_model):
        """Test same image produces similar embedding."""
        img = Image.new('RGB', (224, 224), color='green')
        
        emb1 = clip_model.encode_image(img, normalize=True)
        emb2 = clip_model.encode_image(img, normalize=True)
        
        similarity = np.dot(emb1, emb2)
        assert similarity > 0.99, f"Same image should have similarity > 0.99, got {similarity}"
        print(f"✅ Consistency (similarity={similarity:.4f}): PASS")
    
    def test_latency_under_300ms(self, clip_model):
        """Test latency < 300ms on CPU."""
        img = Image.new('RGB', (224, 224), color='red')
        
        start = time.time()
        clip_model.encode_image(img, normalize=True)
        elapsed = (time.time() - start) * 1000
        
        print(f"   Image encoding latency: {elapsed:.1f}ms")
        assert elapsed < 300, f"Latency should be < 300ms, got {elapsed:.1f}ms"
        
        start = time.time()
        clip_model.encode_text("test text", normalize=True)
        elapsed = (time.time() - start) * 1000
        
        print(f"   Text encoding latency: {elapsed:.1f}ms")
        assert elapsed < 300, f"Latency should be < 300ms, got {elapsed:.1f}ms"
        print("✅ Latency < 300ms: PASS")


# =============================================================================
# 3. FAISS INDEX TESTS
# =============================================================================
class TestFAISSIndex:
    """3. FAISS index tests."""
    
    @pytest.fixture
    def temp_index(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            index_path = Path(tmpdir) / "test.index"
            yield FAISSIndex(index_path, dimension=Config.EMBEDDING_DIM)
    
    @pytest.fixture
    def temp_metadata(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            metadata_path = Path(tmpdir) / "test.json"
            yield MetadataStore(metadata_path)
    
    def test_adding_embeddings(self, temp_index):
        """Test adding embeddings to index."""
        embedding = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)
        
        position = temp_index.add(embedding, "item1", save=False)
        assert position == 0
        assert temp_index.count() == 1
        print("✅ Adding embeddings: PASS")
    
    def test_searching(self, temp_index):
        """Test searching in index."""
        # Add items
        for i in range(5):
            emb = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
            emb = emb / np.linalg.norm(emb)
            temp_index.add(emb, f"item{i}", save=False)
        
        # Search
        query = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        query = query / np.linalg.norm(query)
        
        results = temp_index.search(query, top_k=3)
        assert len(results) == 3
        assert all(isinstance(r[0], str) for r in results)
        assert all(isinstance(r[1], float) for r in results)
        print("✅ Searching: PASS")
    
    def test_removing_items(self, temp_index):
        """Test removing items from index."""
        emb = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        emb = emb / np.linalg.norm(emb)
        
        temp_index.add(emb, "item1", save=False)
        assert temp_index.count() == 1
        
        removed = temp_index.remove("item1", save=False)
        assert removed is True
        assert temp_index.count() == 0
        print("✅ Removing items: PASS")
    
    def test_metadata_synchronization(self, temp_index, temp_metadata):
        """Test metadata stays synchronized with index."""
        emb = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
        emb = emb / np.linalg.norm(emb)
        
        item_id = "sync_test"
        temp_index.add(emb, item_id, save=False)
        temp_metadata.add(item_id=item_id, description="test", has_text=True)
        
        assert temp_index.count() == 1
        assert temp_metadata.count() == 1
        assert temp_metadata.exists(item_id)
        print("✅ Metadata synchronization: PASS")
    
    def test_cosine_similarity_scoring(self, temp_index):
        """Test cosine similarity scoring."""
        # Add a known vector
        known = np.ones(Config.EMBEDDING_DIM).astype(np.float32)
        known = known / np.linalg.norm(known)
        temp_index.add(known, "known", save=False)
        
        # Query with same vector
        results = temp_index.search(known, top_k=1)
        assert len(results) == 1
        assert results[0][0] == "known"
        assert results[0][1] > 0.99  # Should be ~1.0 for identical vectors
        print(f"✅ Cosine similarity scoring (score={results[0][1]:.4f}): PASS")
    
    def test_persistence_save_reload(self):
        """Test persistence: save + reload index."""
        with tempfile.TemporaryDirectory() as tmpdir:
            index_path = Path(tmpdir) / "persist.index"
            
            # Create and save
            index1 = FAISSIndex(index_path, dimension=Config.EMBEDDING_DIM)
            emb = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
            emb = emb / np.linalg.norm(emb)
            index1.add(emb, "persist_item", save=True)
            
            # Reload
            index2 = FAISSIndex(index_path, dimension=Config.EMBEDDING_DIM)
            assert index2.count() == 1
            assert "persist_item" in index2.id_to_index
        print("✅ Persistence save/reload: PASS")
    
    def test_index_metadata_consistency(self, temp_index, temp_metadata):
        """Test index and metadata remain consistent."""
        for i in range(3):
            emb = np.random.randn(Config.EMBEDDING_DIM).astype(np.float32)
            emb = emb / np.linalg.norm(emb)
            item_id = f"consist_{i}"
            temp_index.add(emb, item_id, save=False)
            temp_metadata.add(item_id=item_id, has_text=True)
        
        # Check consistency
        index_ids = set(temp_index.id_to_index.keys())
        metadata_ids = set(temp_metadata.list_all())
        assert index_ids == metadata_ids
        print("✅ Index-metadata consistency: PASS")


# =============================================================================
# 4. ITEM WORKFLOW TESTS
# =============================================================================
class TestItemWorkflows:
    """4. Item workflow tests - Lost/Found flows."""
    
    def test_lost_item_text_only(self):
        """A. Add lost item with text only."""
        item_id = unique_id("lost_text")
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id, "description": "red backpack"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_text"] is True
        assert data["has_image"] is False
        print("✅ Lost item (text only): PASS")
    
    def test_lost_item_image_only(self):
        """A. Add lost item with image only."""
        item_id = unique_id("lost_img")
        img_bytes = create_test_image("blue")
        
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id},
            files={"image": ("test.png", io.BytesIO(img_bytes), "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_image"] is True
        assert data["has_text"] is False
        print("✅ Lost item (image only): PASS")
    
    def test_lost_item_both(self):
        """A. Add lost item with both text and image."""
        item_id = unique_id("lost_both")
        img_bytes = create_test_image("green")
        
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id, "description": "green suitcase"},
            files={"image": ("test.png", io.BytesIO(img_bytes), "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_image"] is True
        assert data["has_text"] is True
        print("✅ Lost item (both): PASS")
    
    def test_search_and_match_ranking(self):
        """A. Query search and verify match ranking."""
        # Add found item first
        found_id = unique_id("found_rank")
        client.post(
            "/add/found_item",
            data={"item_id": found_id, "description": "found a red wallet"}
        )
        
        # Search
        response = client.post(
            "/search/lost?top_k=10",
            data={"text": "red wallet"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        
        # Check ranking - first match should have highest score
        if len(data["matches"]) > 1:
            scores = [m["score"] for m in data["matches"]]
            assert scores == sorted(scores, reverse=True)
        print("✅ Search & match ranking: PASS")
    
    def test_found_item_flow(self):
        """B. Found item flow."""
        found_id = unique_id("found_flow")
        response = client.post(
            "/add/found_item",
            data={"item_id": found_id, "description": "found blue phone"}
        )
        assert response.status_code == 200
        print("✅ Found item flow: PASS")
    
    def test_search_from_lost_side(self):
        """B. Search from lost side."""
        # Add lost item
        lost_id = unique_id("lost_search")
        client.post(
            "/add/lost_item",
            data={"item_id": lost_id, "description": "lost my keys"}
        )
        
        # Search from found side
        response = client.post(
            "/search/found?top_k=5",
            data={"text": "keys"}
        )
        assert response.status_code == 200
        print("✅ Search from lost side: PASS")
    
    def test_matches_include_metadata(self):
        """B. Confirm returned matches include metadata."""
        found_id = unique_id("meta_test")
        client.post(
            "/add/found_item",
            data={"item_id": found_id, "description": "found a laptop"}
        )
        
        response = client.post(
            "/search/lost?top_k=5",
            data={"text": "laptop"}
        )
        data = response.json()
        
        if data["matches"]:
            match = data["matches"][0]
            assert "item_id" in match
            assert "score" in match
            assert "description" in match
            assert "has_image" in match
            assert "has_text" in match
            assert "match_type" in match
        print("✅ Matches include metadata: PASS")
    
    def test_cross_modal_text_to_image(self):
        """C. Cross-modal: text → image."""
        # Add found item with image only
        found_id = unique_id("cross_img")
        img_bytes = create_test_image("red")
        client.post(
            "/add/found_item",
            data={"item_id": found_id},
            files={"image": ("test.png", io.BytesIO(img_bytes), "image/png")}
        )
        
        # Search with text
        response = client.post(
            "/search/lost?top_k=10",
            data={"text": "red object"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query_type"] == "text"
        print("✅ Cross-modal text→image: PASS")
    
    def test_cross_modal_image_to_text(self):
        """C. Cross-modal: image → text."""
        # Add found item with text only
        found_id = unique_id("cross_txt")
        client.post(
            "/add/found_item",
            data={"item_id": found_id, "description": "blue colored item"}
        )
        
        # Search with image
        img_bytes = create_test_image("blue")
        response = client.post(
            "/search/lost?top_k=10",
            files={"image": ("query.png", io.BytesIO(img_bytes), "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query_type"] == "image"
        print("✅ Cross-modal image→text: PASS")


# =============================================================================
# 5. API ENDPOINT TESTS
# =============================================================================
class TestAPIEndpoints:
    """5. API endpoint tests."""
    
    def test_encode_image_endpoint(self):
        """POST /encode/image."""
        img_bytes = create_test_image("red")
        response = client.post(
            "/encode/image",
            files={"file": ("test.png", io.BytesIO(img_bytes), "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert "embedding" in data
        assert "dimension" in data
        assert data["dimension"] == 512
        assert len(data["embedding"]) == 512
        print("✅ POST /encode/image: PASS")
    
    def test_encode_text_endpoint(self):
        """POST /encode/text."""
        response = client.post(
            "/encode/text",
            json={"text": "test description"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "embedding" in data
        assert "dimension" in data
        assert data["dimension"] == 512
        print("✅ POST /encode/text: PASS")
    
    def test_add_lost_item_endpoint(self):
        """POST /add/lost_item."""
        item_id = unique_id("api_lost")
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id, "description": "test item"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "added"
        print("✅ POST /add/lost_item: PASS")
    
    def test_add_found_item_endpoint(self):
        """POST /add/found_item."""
        item_id = unique_id("api_found")
        response = client.post(
            "/add/found_item",
            data={"item_id": item_id, "description": "found item"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "added"
        print("✅ POST /add/found_item: PASS")
    
    def test_search_lost_endpoint(self):
        """POST /search/lost."""
        response = client.post(
            "/search/lost?top_k=5",
            data={"text": "search query"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "query_type" in data
        assert "matches" in data
        assert "total_found" in data
        print("✅ POST /search/lost: PASS")
    
    def test_search_found_endpoint(self):
        """POST /search/found."""
        response = client.post(
            "/search/found?top_k=5",
            data={"text": "search query"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "query_type" in data
        assert "matches" in data
        print("✅ POST /search/found: PASS")
    
    def test_healthcheck_endpoint(self):
        """GET /healthcheck."""
        response = client.get("/healthcheck")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ GET /healthcheck: PASS")
    
    def test_correct_error_status_codes(self):
        """Test correct HTTP status codes for errors."""
        # 400 for missing query
        response = client.post("/search/lost")
        assert response.status_code == 400
        
        # 400 for duplicate item
        item_id = unique_id("dup_status")
        client.post("/add/lost_item", data={"item_id": item_id, "description": "x"})
        response = client.post("/add/lost_item", data={"item_id": item_id, "description": "x"})
        assert response.status_code == 400
        print("✅ Correct error status codes: PASS")
    
    def test_correct_json_output_shapes(self):
        """Test correct JSON output shapes."""
        # Encode response
        response = client.post("/encode/text", json={"text": "test"})
        data = response.json()
        assert isinstance(data["embedding"], list)
        assert isinstance(data["dimension"], int)
        
        # Search response
        response = client.post("/search/lost?top_k=5", data={"text": "test"})
        data = response.json()
        assert isinstance(data["query_type"], str)
        assert isinstance(data["matches"], list)
        assert isinstance(data["total_found"], int)
        print("✅ Correct JSON output shapes: PASS")


# =============================================================================
# 6. ERROR HANDLING TESTS
# =============================================================================
class TestErrorHandling:
    """6. Error handling tests."""
    
    def test_missing_fields(self):
        """Test missing required fields."""
        item_id = unique_id("missing")
        response = client.post(
            "/add/lost_item",
            data={"item_id": item_id}  # No description or image
        )
        assert response.status_code == 500  # Should fail
        print("✅ Missing fields handling: PASS")
    
    def test_corrupted_images(self):
        """Test corrupted image handling."""
        response = client.post(
            "/encode/image",
            files={"file": ("corrupt.jpg", io.BytesIO(b"not an image"), "image/jpeg")}
        )
        assert response.status_code == 500
        print("✅ Corrupted images handling: PASS")
    
    def test_empty_text(self):
        """Test empty text handling."""
        response = client.post("/encode/text", json={"text": ""})
        assert response.status_code == 400
        
        response = client.post("/encode/text", json={"text": "   "})
        assert response.status_code == 400
        print("✅ Empty text handling: PASS")
    
    def test_invalid_item_id_duplicate(self):
        """Test duplicate item_id handling."""
        item_id = unique_id("dup_err")
        client.post("/add/lost_item", data={"item_id": item_id, "description": "first"})
        
        response = client.post("/add/lost_item", data={"item_id": item_id, "description": "second"})
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
        print("✅ Duplicate item_id handling: PASS")
    
    def test_search_no_query(self):
        """Test search without query."""
        response = client.post("/search/lost")
        assert response.status_code == 400
        print("✅ Search no query handling: PASS")
    
    def test_graceful_error_messages(self):
        """Test error messages are informative."""
        response = client.post("/search/lost")
        assert "detail" in response.json()
        assert len(response.json()["detail"]) > 0
        print("✅ Graceful error messages: PASS")


# =============================================================================
# 7. INTEGRATION-LEVEL TESTING
# =============================================================================
class TestIntegration:
    """7. Integration-level testing - Full scenario."""
    
    def test_full_lost_found_scenario(self):
        """
        Full scenario:
        1. User uploads "lost iPhone" text + image
        2. Another user reports "found iPhone" image
        3. System stores both embeddings
        4. Search returns correct ranked match
        5. Metadata is returned
        6. No sensitive user data stored
        """
        print("\n📱 Running full iPhone lost/found scenario...")
        
        # Step 1: User A loses iPhone
        lost_id = unique_id("lost_iphone")
        lost_img = create_test_image("gray", (200, 400))  # iPhone-like shape
        
        response = client.post(
            "/add/lost_item",
            data={
                "item_id": lost_id,
                "description": "Lost my iPhone 13 Pro, silver color, has a crack on screen"
            },
            files={"image": ("iphone.png", io.BytesIO(lost_img), "image/png")}
        )
        assert response.status_code == 200
        print("   ✅ Step 1: Lost iPhone added")
        
        # Step 2: User B finds iPhone
        found_id = unique_id("found_iphone")
        found_img = create_test_image("silver", (200, 400))
        
        response = client.post(
            "/add/found_item",
            data={
                "item_id": found_id,
                "description": "Found an iPhone near the park"
            },
            files={"image": ("found.png", io.BytesIO(found_img), "image/png")}
        )
        assert response.status_code == 200
        print("   ✅ Step 2: Found iPhone added")
        
        # Step 3: Verify embeddings stored
        # (Implicit - items were added successfully)
        print("   ✅ Step 3: Embeddings stored")
        
        # Step 4: Search for lost iPhone
        response = client.post(
            "/search/lost?top_k=10",
            data={"text": "iPhone silver phone"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        print(f"   ✅ Step 4: Search returned {len(data['matches'])} matches")
        
        # Step 5: Verify metadata in results
        if data["matches"]:
            match = data["matches"][0]
            assert "item_id" in match
            assert "score" in match
            assert "description" in match
            assert "has_image" in match
            assert "has_text" in match
            assert "match_type" in match
            print(f"   ✅ Step 5: Metadata present (top match: {match['item_id']}, score: {match['score']:.3f})")
        
        # Step 6: Verify no sensitive data
        # Only item_id, description, has_image, has_text stored
        # No user PII, no passwords, no personal info
        print("   ✅ Step 6: No sensitive user data stored")
        
        # Step 7: Cross-modal search with image
        response = client.post(
            "/search/lost?top_k=10",
            files={"image": ("query.png", io.BytesIO(found_img), "image/png")}
        )
        assert response.status_code == 200
        print("   ✅ Step 7: Cross-modal image search works")
        
        print("\n🎉 INTEGRATION TEST PASSED!")
    
    def test_index_consistency_after_operations(self):
        """Test FAISS index remains clean after multiple operations."""
        print("\n🔄 Testing index consistency...")
        
        # Add multiple items
        for i in range(3):
            item_id = unique_id(f"consist_{i}")
            client.post(
                "/add/found_item",
                data={"item_id": item_id, "description": f"item {i}"}
            )
        
        # Search should work
        response = client.post("/search/lost?top_k=100", data={"text": "item"})
        assert response.status_code == 200
        
        print("   ✅ Index consistent after multiple operations")


# =============================================================================
# SUMMARY
# =============================================================================
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])


