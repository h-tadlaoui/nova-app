"""
Main FastAPI application for FindBack AI service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from ai_service.api.routers import encode, items, search
from ai_service.utils.config import Config
from ai_service.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    # Startup
    logger.info("Starting FindBack AI service...")
    Config.initialize_directories()
    logger.info("FindBack AI service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FindBack AI service...")


# Create FastAPI app
app = FastAPI(
    title="FindBack AI Service",
    description="AI backend for FindBack lost & found matching system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(encode.router)
app.include_router(items.router)
app.include_router(search.router)


@app.get("/healthcheck")
async def healthcheck() -> dict:
    """
    Health check endpoint.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "FindBack AI",
        "version": "1.0.0"
    }


@app.get("/")
async def root() -> dict:
    """
    Root endpoint.
    
    Returns:
        API information
    """
    return {
        "service": "FindBack AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "healthcheck": "/healthcheck"
    }
