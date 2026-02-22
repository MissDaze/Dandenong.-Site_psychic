# Here are your Instructions

## Deploying on Railway

This repository contains a **React (CRA/CRACO) frontend** and a **FastAPI (Python) backend** that are bundled together into a single Docker image for production.

### Quick deploy

1. [Create a new Railway project](https://railway.app/new) and choose **"Deploy from GitHub repo"**.
2. Select this repository.
3. Railway will detect the `Dockerfile` at the repo root and build it automatically.

### Required environment variables

Set the following variables in your Railway service's **Variables** tab:

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string (e.g. `mongodb+srv://…`) |
| `DB_NAME` | MongoDB database name |
| `JWT_SECRET` | Secret used to sign admin JWTs |
| `OPENROUTER_API_KEY` | API key for the OpenRouter AI chat integration |
| `OPENROUTER_MODEL` | *(optional)* OpenRouter model to use (default: `meta-llama/llama-3.1-8b-instruct:free`) |
| `CORS_ORIGINS` | Comma-separated allowed origins (default: `*`) |

> **Note:** Railway automatically injects `PORT` – no manual configuration needed.

### How it works

The `Dockerfile` uses a two-stage build:

1. **Stage 1 (Node 20)** – installs frontend dependencies and runs `yarn build`.
2. **Stage 2 (Python 3.11)** – installs Python dependencies, copies the compiled frontend assets, and starts the FastAPI server with:
   ```
   uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
   ```

The FastAPI backend serves the compiled React app as static files when the `frontend/build` directory is present (production/Docker only). The `/api/*` routes are unaffected.

### Local development

Local development is unchanged – run the backend and frontend separately:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
yarn install
yarn start        # React dev server on http://localhost:3000
```

### Assumptions

- A MongoDB instance is accessible at the `MONGO_URL` you provide (e.g. MongoDB Atlas free tier).
- The admin account is initialised by calling `POST /api/init-admin` once after first deploy.
- `OPENROUTER_API_KEY` is required only for the AI chat feature; the rest of the app works without it.
- The AI chat feature calls `https://api.openrouter.ai/v1/chat/completions`.
- If `OPENROUTER_MODEL` is not set, the default model `meta-llama/llama-3.1-8b-instruct:free` is used.

