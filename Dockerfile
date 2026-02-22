# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy frontend source
COPY frontend/ ./

# Set build-time env variable for API URL (will use relative path)
ENV REACT_APP_BACKEND_URL=""

# Build the frontend
RUN yarn build

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/build ./static

# Create a modified server that serves static files
RUN echo 'import os\n\
from pathlib import Path\n\
from fastapi.staticfiles import StaticFiles\n\
from fastapi.responses import FileResponse\n\
\n\
# Import everything from the original server\n\
from server import app, api_router\n\
\n\
# Serve static files\n\
static_path = Path(__file__).parent / "static"\n\
\n\
if static_path.exists():\n\
    # Serve static assets\n\
    app.mount("/static", StaticFiles(directory=str(static_path / "static")), name="static")\n\
    \n\
    # Serve index.html for all non-API routes (SPA fallback)\n\
    @app.get("/{full_path:path}")\n\
    async def serve_spa(full_path: str):\n\
        # If path starts with api, let it pass through\n\
        if full_path.startswith("api"):\n\
            return None\n\
        \n\
        # Check if file exists in static folder\n\
        file_path = static_path / full_path\n\
        if file_path.exists() and file_path.is_file():\n\
            return FileResponse(file_path)\n\
        \n\
        # Return index.html for SPA routing\n\
        return FileResponse(static_path / "index.html")\n\
' > /app/main.py

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/')" || exit 1

# Start the server
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
