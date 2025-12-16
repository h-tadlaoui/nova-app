# FindBack AI Service Dockerfile
# Optimized for CPU-only inference

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system dependencies
# Note: All dependencies are installed via pip, no apt packages required
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
# Using --no-cache-dir to reduce image size
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ai_service/ ./ai_service/
COPY data/ ./data/

# Create necessary directories
RUN mkdir -p data/indexes data/metadata

# Expose port (using team-assigned port range 3300-3399)
EXPOSE 3300

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3300/healthcheck')" || exit 1

# Run the application
# Using 0.0.0.0 to allow external connections
# Workers set to 1 for CPU inference (prevents model loading conflicts)
CMD ["uvicorn", "ai_service.api.main:app", "--host", "0.0.0.0", "--port", "3300", "--workers", "1"]
