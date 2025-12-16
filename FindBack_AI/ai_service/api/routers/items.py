"""
API endpoints for adding lost and found items.
"""
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from ai_service.models.clip_model import get_clip_model
from ai_service.vector_store.faiss_index import FAISSIndex
from ai_service.vector_store.metadata_store import MetadataStore
from ai_service.utils.config import Config
from ai_service.utils.logger import logger

router = APIRouter(prefix="/add", tags=["items"])


def _add_item(
    item_id: str,
    index: FAISSIndex,
    metadata_store: MetadataStore,
    description: Optional[str] = None,
    image_bytes: Optional[bytes] = None
) -> dict:
    """
    Internal function to add an item to index and metadata store.
    
    Args:
        item_id: Unique item identifier
        index: FAISS index instance
        metadata_store: Metadata store instance
        description: Optional text description
        image_bytes: Optional image bytes
        
    Returns:
        Result dictionary
    """
    try:
        clip_model = get_clip_model()
        has_image = image_bytes is not None
        has_text = description is not None and description.strip() != ""
        
        if not has_image and not has_text:
            raise ValueError("Item must have at least an image or text description")
        
        # Encode image if provided
        image_embedding = None
        if has_image:
            image_embedding = clip_model.encode_image(image_bytes, normalize=True)
        
        # Encode text if provided
        text_embedding = None
        if has_text:
            text_embedding = clip_model.encode_text(description, normalize=True)
        
        # Combine embeddings (average if both present)
        if image_embedding is not None and text_embedding is not None:
            # Average the embeddings and re-normalize
            combined_embedding = (image_embedding + text_embedding) / 2.0
            # L2-normalize the combined embedding
            norm = np.linalg.norm(combined_embedding)
            if norm > 0:
                combined_embedding = combined_embedding / norm
            final_embedding = combined_embedding
        elif image_embedding is not None:
            final_embedding = image_embedding
        elif text_embedding is not None:
            final_embedding = text_embedding
        else:
            raise ValueError("No valid embedding generated")
        
        # Add to FAISS index
        index.add(final_embedding, item_id, save=True)
        
        # Add to metadata store
        metadata_store.add(
            item_id=item_id,
            description=description,
            has_image=has_image,
            has_text=has_text
        )
        
        logger.info(f"Added item {item_id} (image: {has_image}, text: {has_text})")
        
        return {
            "item_id": item_id,
            "status": "added",
            "has_image": has_image,
            "has_text": has_text
        }
        
    except Exception as e:
        logger.error(f"Error adding item {item_id}: {str(e)}")
        raise


@router.post(
    "/lost_item",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "item_id": {"type": "string"},
                            "description": {"type": "string"},
                            "image": {"type": "string", "format": "binary"}
                        },
                        "required": ["item_id"]
                    }
                }
            }
        }
    }
)
async def add_lost_item(
    item_id: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
) -> dict:
    """
    Add a lost item.
    
    Args:
        item_id: Unique item identifier
        description: Optional text description
        image: Optional image file
        
    Returns:
        Result dictionary
    """
    try:
        # Read image if provided
        image_bytes = None
        
        if image:
            image_bytes = await image.read()
            # Validate image size
            if len(image_bytes) > Config.MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image too large. Maximum size is {Config.MAX_IMAGE_SIZE // (1024*1024)}MB"
                )
        
        # Initialize stores
        index = FAISSIndex(Config.get_lost_items_index_path())
        metadata_store = MetadataStore(Config.get_lost_items_metadata_path())
        
        # Check if item already exists
        if metadata_store.exists(item_id):
            raise HTTPException(status_code=400, detail=f"Item {item_id} already exists")
        
        return _add_item(item_id, index, metadata_store, description, image_bytes)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in add_lost_item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add lost item: {str(e)}")


@router.post(
    "/found_item",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "item_id": {"type": "string"},
                            "description": {"type": "string"},
                            "image": {"type": "string", "format": "binary"}
                        },
                        "required": ["item_id"]
                    }
                }
            }
        }
    }
)
async def add_found_item(
    item_id: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
) -> dict:
    """
    Add a found item.
    
    Args:
        item_id: Unique item identifier
        description: Optional text description
        image: Optional image file
        
    Returns:
        Result dictionary
    """
    try:
        # Read image if provided
        image_bytes = None
        
        if image:
            image_bytes = await image.read()
            # Validate image size
            if len(image_bytes) > Config.MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image too large. Maximum size is {Config.MAX_IMAGE_SIZE // (1024*1024)}MB"
                )
        
        # Initialize stores
        index = FAISSIndex(Config.get_found_items_index_path())
        metadata_store = MetadataStore(Config.get_found_items_metadata_path())
        
        # Check if item already exists
        if metadata_store.exists(item_id):
            raise HTTPException(status_code=400, detail=f"Item {item_id} already exists")
        
        return _add_item(item_id, index, metadata_store, description, image_bytes)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in add_found_item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add found item: {str(e)}")
