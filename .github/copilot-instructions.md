# Copilot Coding Agent Instructions

- **Stack & layout**: FastAPI backend in `backend/server.py`; React (CRA via CRACO) frontend in `frontend/`. Dockerfile builds the frontend then runs FastAPI (serves `frontend/build`), default port `8001`.
- **Package managers**: Python 3.11 with `pip`; Node 20 with `yarn` v1.22.22. Repo intentionally has no lockfile—use `yarn install --no-lockfile` to avoid creating one.
- **Environment**: Backend expects `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, optional `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and `CORS_ORIGINS`. `.env` can live in `backend/`.
- **Run locally**: `cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001`. In another shell, `cd frontend && yarn start` (CRA dev server on `3000`).
- **Build/Test**: `cd frontend && yarn build` for production assets. Tests currently absent; use `cd frontend && CI=true yarn test --watch=false --passWithNoTests` to satisfy runners.
- **Conventions**: Keep changes minimal, avoid adding dependencies unless required, and do not commit secrets or generated artefacts (e.g., `node_modules`, build outputs).
