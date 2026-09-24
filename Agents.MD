# Project agents guide

This repository is a full-stack boilerplate: **FastAPI** backend and **React (TypeScript)** frontend.

## Layout

- `backend/` — API with layered architecture (`types`, `models`, `repositories`, `services`, `routers`, `utils`). Data is stored in JSON files under `backend/data/` (one file per entity, contents are a JSON array). Uses **uv**, **Pydantic**, and FastAPI dependency injection (routers depend on services; services use repositories).
- `frontend/` — **React + TypeScript**, **shadcn/ui**, **Redux Toolkit** (RTK Query for API, slices for UI state).
- `docs/` — Feature documentation organized per feature (`docs/<feature>/`), with unified `business-requirements.md`, `architecture.md`, and `test-cases.md` covering both frontend and backend for that feature.

## Current scope

**Test Platform (QuizCraft)**: A complete web platform for creating, publishing, taking, and evaluating tests, with full authentication, persistent history, and result analytics.

## Working conventions

- Add new features under the same layer folders on the backend and under `src/features/` on the frontend.
- Document each feature under a single consolidated folder: `docs/<feature>/`.
- Keep AI assistant entry points minimal: this file is the source of truth; `Claude.md` points here.

## Local development

1. Backend: from `backend/`, run `uv sync` then `uv run dev` (see `[tool.uv.scripts]` in `pyproject.toml`).
2. Frontend: from `frontend/`, run `npm install` then `npm run dev` (dev server port **5174**; default API base: `http://localhost:8001/api`).

VS Code: `.vscode/launch.json` starts the backend; `.vscode/tasks.json` installs dependencies and runs the frontend dev server.
