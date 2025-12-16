"""
API endpoints for searching lost and found items.
"""
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Form
from pydantic import BaseModel, Field
from typing import List, Optional
from pathlib import Path

from ai_service.models.clip_model import get_clip_model
from ai_service.vector_store.faiss_index import FAISSIndex
from ai_service.vector_store.metadata_store import MetadataStore
from ai_service.utils.config import Config
from ai_service.utils.logger import logger

router = APIRouter(prefix="/search", tags=["search"])


class MatchResult(BaseModel):
    """Single search result."""
    item_id: str = Field(..., description="Item identifier")
    score: float = Field(..., description="Similarity score")
    description: Optional[str] = Field(None, description="Item description")
    has_image: bool = Field(..., description="Whether item has image")
    has_text: bool = Field(..., description="Whether item has text")
    match_type: str = Field(..., description="Type of match")


class SearchResponse(BaseModel):
    """Search response."""
    query_type: str = Field(..., description="Type of query (image, text, both)")
    matches: List[MatchResult] = Field(..., description="List of matches")
    total_found: int = Field(..., description="Total number of matches")


def _search_items(
    query_embedding: np.ndarray,
    index_path: Path,
    metadata_path: Path,
    query_type: str,
    top_k: int = 10
) -> List[MatchResult]:
    """
    Internal function to search for items.
    
    Args:
        query_embedding: Query embedding vector
        index_path: Path to FAISS index
        metadata_path: Path to metadata store
        query_type: Type of query ("image", "text", or "both")
        top_k: Number of results
        
    Returns:
        List of match results
    """
    try:
        # Initialize stores
        index = FAISSIndex(index_path)
        metadata_store = MetadataStore(metadata_path)
        
        # Search
        results = index.search(query_embedding, top_k=top_k)
        
        # Enrich with metadata
        match_results = []
        for item_id, score in results:
            metadata = metadata_store.get(item_id)
            if metadata:
                has_image = metadata.get("has_image", False)
                has_text = metadata.get("has_text", False)
                
                # Determine match type based on query type and item type
                if query_type == "image":
                    if has_image and has_text:
                        match_type = "image→both"
                    elif has_image:
                        match_type = "image→image"
                    elif has_text:
                        match_type = "image→text"
                    else:
                        match_type = "image→none"
                elif query_type == "text":
                    if has_image and has_text:
                        match_type = "text→both"
                    elif has_image:
                        match_type = "text→image"
                    elif has_text:
                        match_type = "text→text"
                    else:
                        match_type = "text→none"
                else:  # query_type == "both"
                    if has_image and has_text:
                        match_type = "both→both"
                    elif has_image:
                        match_type = "both→image"
                    elif has_text:
                        match_type = "both→text"
                    else:
                        match_type = "both→none"
                
                match_results.append(MatchResult(
                    item_id=item_id,
                    score=score,
                    description=metadata.get("description"),
                    has_image=has_image,
                    has_text=has_text,
                    match_type=match_type
                ))
        
        return match_results
        
    except Exception as e:
        logger.error(f"Error searching items: {str(e)}")
        raise


@router.post(
    "/lost",
    response_model=SearchResponse,
    summary="Search for lost items",
    description="Search for lost items by searching in the found items index.",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string"},
                            "image": {"type": "string", "format": "binary"}
                        }
                    }
                }
            }
        }
    }
)
async def search_lost(
    top_k: int = Query(10, ge=1, le=100, description="Number of results to return"),
    text: Optional[str] = Form(None, description="Optional text query"),
    image: Optional[UploadFile] = File(None, description="Optional image file")
) -> SearchResponse:
    """
    Search for lost items (search in found items index).
    
    Args:
        text: Optional text query
        image: Optional image query
        top_k: Number of results
        
    Returns:
        Search results
    """
    try:
        clip_model = get_clip_model()
        has_text = text is not None and text.strip() != ""
        has_image = image is not None
        
        if not has_text and not has_image:
            raise HTTPException(
                status_code=400,
                detail="Must provide either text or image query"
            )
        
        # Encode query
        image_embedding = None
        text_embedding = None
        
        if has_image:
            image_bytes = await image.read()
            if len(image_bytes) > Config.MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image too large. Maximum size is {Config.MAX_IMAGE_SIZE // (1024*1024)}MB"
                )
            image_embedding = clip_model.encode_image(image_bytes, normalize=True)
        
        if has_text:
            text_embedding = clip_model.encode_text(text, normalize=True)
        
        # Combine embeddings if both present
        if image_embedding is not None and text_embedding is not None:
            combined = (image_embedding + text_embedding) / 2.0
            norm = np.linalg.norm(combined)
            if norm > 0:
                query_embedding = combined / norm
            else:
                query_embedding = combined
            query_type = "both"
        elif image_embedding is not None:
            query_embedding = image_embedding
            query_type = "image"
        else:
            query_embedding = text_embedding
            query_type = "text"
        
        # Search in found items index
        matches = _search_items(
            query_embedding,
            Config.get_found_items_index_path(),
            Config.get_found_items_metadata_path(),
            query_type,
            top_k
        )
        
        return SearchResponse(
            query_type=query_type,
            matches=matches,
            total_found=len(matches)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_lost: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search: {str(e)}")


@router.post(
    "/found",
    response_model=SearchResponse,
    summary="Search for found items",
    description="Search for found items by searching in the lost items index.",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string"},
                            "image": {"type": "string", "format": "binary"}
                        }
                    }
                }
            }
        }
    }
)
async def search_found(
    top_k: int = Query(10, ge=1, le=100, description="Number of results to return"),
    text: Optional[str] = Form(None, description="Optional text query"),
    image: Optional[UploadFile] = File(None, description="Optional image file")
) -> SearchResponse:
    """
    Search for found items (search in lost items index).
    
    Args:
        text: Optional text query
        image: Optional image query
        top_k: Number of results
        
    Returns:
        Search results
    """
    try:
        clip_model = get_clip_model()
        has_text = text is not None and text.strip() != ""
        has_image = image is not None
        
        if not has_text and not has_image:
            raise HTTPException(
                status_code=400,
                detail="Must provide either text or image query"
            )
        
        # Encode query
        image_embedding = None
        text_embedding = None
        
        if has_image:
            image_bytes = await image.read()
            if len(image_bytes) > Config.MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image too large. Maximum size is {Config.MAX_IMAGE_SIZE // (1024*1024)}MB"
                )
            image_embedding = clip_model.encode_image(image_bytes, normalize=True)
        
        if has_text:
            text_embedding = clip_model.encode_text(text, normalize=True)
        
        # Combine embeddings if both present
        if image_embedding is not None and text_embedding is not None:
            combined = (image_embedding + text_embedding) / 2.0
            norm = np.linalg.norm(combined)
            if norm > 0:
                query_embedding = combined / norm
            else:
                query_embedding = combined
            query_type = "both"
        elif image_embedding is not None:
            query_embedding = image_embedding
            query_type = "image"
        else:
            query_embedding = text_embedding
            query_type = "text"
        
        # Search in lost items index
        matches = _search_items(
            query_embedding,
            Config.get_lost_items_index_path(),
            Config.get_lost_items_metadata_path(),
            query_type,
            top_k
        )
        
        return SearchResponse(
            query_type=query_type,
            matches=matches,
            total_found=len(matches)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search: {str(e)}")
