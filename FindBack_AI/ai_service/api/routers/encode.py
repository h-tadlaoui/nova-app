"""
API endpoints for encoding images and text.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import List

from ai_service.models.clip_model import get_clip_model
from ai_service.utils.config import Config
from ai_service.utils.logger import logger

router = APIRouter(prefix="/encode", tags=["encoding"])


class TextEncodeRequest(BaseModel):
    """Request model for text encoding."""
    text: str = Field(..., description="Text to encode", max_length=1000)


class TextEncodeResponse(BaseModel):
    """Response model for text encoding."""
    embedding: List[float] = Field(..., description="Text embedding vector")
    dimension: int = Field(..., description="Embedding dimension")


@router.post("/text", response_model=TextEncodeResponse)
async def encode_text(request: TextEncodeRequest) -> TextEncodeResponse:
    """
    Encode text to embedding vector.
    
    Args:
        request: Text encoding request
        
    Returns:
        Text embedding vector
    """
    try:
        # Validate non-empty text
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty or whitespace only")
        
        clip_model = get_clip_model()
        embedding = clip_model.encode_text(request.text, normalize=True)
        
        return TextEncodeResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error encoding text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to encode text: {str(e)}")


@router.post("/image")
async def encode_image(file: UploadFile = File(...)) -> dict:
    """
    Encode image to embedding vector.
    
    Args:
        file: Uploaded image file
        
    Returns:
        Image embedding vector
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Check image size
        if len(image_bytes) > Config.MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Image too large. Maximum size is {Config.MAX_IMAGE_SIZE // (1024*1024)}MB"
            )
        
        # Encode
        clip_model = get_clip_model()
        embedding = clip_model.encode_image(image_bytes, normalize=True)
        
        return {
            "embedding": embedding.tolist(),
            "dimension": len(embedding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to encode image: {str(e)}")
