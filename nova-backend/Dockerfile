FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

COPY . .

# Create media directory
RUN mkdir -p media

# Run gunicorn
# Bind to 0.0.0.0:8000
CMD ["gunicorn", "nova_project.wsgi:application", "--bind", "0.0.0.0:8000"]
