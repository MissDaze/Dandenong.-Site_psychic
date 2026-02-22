# ── Stage 1: build the React frontend ───────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package manifest first for layer caching
COPY frontend/package.json ./
RUN yarn install --network-timeout 600000

COPY frontend/ ./
RUN yarn build

# ── Stage 2: Python backend + pre-built frontend ─────────────────────────────
FROM python:3.11-slim

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy React build artefacts so FastAPI can serve them
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

EXPOSE 8001

# Railway injects $PORT; default to 8001 for local Docker use
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
