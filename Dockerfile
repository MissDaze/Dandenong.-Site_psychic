# ============================================
# STAGE 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend

WORKDIR /frontend

# Copy package files
COPY frontend/package.json ./
COPY frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source
COPY frontend/ ./

# Build with empty backend URL for relative API calls
ENV REACT_APP_BACKEND_URL=""
RUN yarn build

# ============================================
# STAGE 2: Production Server
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/server.py .

# Copy frontend build
COPY --from=frontend /frontend/build ./static

# Port
ENV PORT=8080
EXPOSE 8080

# Start server
CMD uvicorn server:app --host 0.0.0.0 --port $PORT
