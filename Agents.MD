# Project agents guide

This repository is a full-stack web application: **FastAPI** backend and **React (TypeScript)** frontend for the **Test Platform (QuizCraft)**.

## Layout

- `backend/` — API with layered architecture (`types`, `models`, `repositories`, `services`, `routers`). Data is stored in JSON files under `backend/data/` (one file per entity, contents are a JSON array). Uses **uv** / **pip**, **Pydantic v2**, and FastAPI dependency injection (routers depend on services; services use repositories).
- `frontend/` — **React + TypeScript**, **Vite**, **shadcn/ui**, **Redux Toolkit** (RTK Query for API, slices for UI state).
- `docs/` — Feature documentation organized per feature (`docs/<feature>/`), with unified `business-requirements.md`, `architecture.md`, and `test-cases.md` covering both frontend and backend for that feature. Includes `docs/brd.txt` (authoritative Business Requirements Document & prompt).
- `.agents/` — Antigravity agent customizations organized into Frontend & Backend configurations:
  - `rules/`:
    - Backend: `backend-architecture.md`, `backend-coding-standards.md`, `backend-security-and-data.md` (scoped to `backend/**`)
    - Frontend: `frontend-architecture.md`, `frontend-coding-standards.md`, `frontend-security-and-data.md` (scoped to `frontend/**`)
    - Directory rules: `backend/AGENTS.md`, `frontend/AGENTS.md`
  - `skills/`:
    - Backend: `backend-run-quizcraft`, `backend-test-quizcraft`, `backend-add-quizcraft-feature`
    - Frontend: `frontend-run-quizcraft`, `frontend-test-quizcraft`, `frontend-add-quizcraft-feature`
  - `hooks.json` & `hooks/`:
    - Backend hooks: `backend-safety-guard`, `backend-architecture-reminder`, `backend-post-tool-audit`
    - Frontend hooks: `frontend-safety-guard`, `frontend-architecture-reminder`, `frontend-post-tool-audit`

## Current scope

**Test Platform (QuizCraft)**: A complete web platform for creating, publishing, taking, and evaluating tests, with full authentication, persistent history, and result analytics.

## Working conventions

- Add new features under the same layer folders on the backend and under `src/features/` on the frontend.
- Document each feature under a single consolidated folder: `docs/<feature>/`.
- Keep AI assistant entry points minimal: this file is the source of truth; `Claude.md` points here.
- Adhere to the rules in `.agents/rules/`.

## Local development & Quality tooling

- One-click launcher (Windows): double-click or run `start.bat`.
- Manual:
  1. Backend: from `backend/`, run `uv sync` then `uv run uvicorn app.main:app --reload --port 8001` (or activate venv and run `python -m uvicorn app.main:app --reload --port 8001`).
  2. Frontend: from `frontend/`, run `npm install` then `npm run dev` (dev server port **5174**; default API base: `http://localhost:8001/api`).

- Backend Code Quality Suite (`backend/`):
  - Linter: `uv run ruff check .`
  - Formatter: `uv run ruff format --check .` (auto-format: `uv run ruff format .`)
  - Type Checker: `uv run mypy app` and `uv run mypy tests`
  - Automated Tests: `uv run pytest tests`

- Frontend Code Quality Suite (`frontend/`):
  - Linter: `npm run lint` (`oxlint`)
  - Formatter: `npm run format:check` (`prettier`, auto-format: `npm run format`)
  - Type Checker: `npm run typecheck` (`tsc -b`)
  - Production Build: `npm run build`

VS Code: `.vscode/launch.json` starts the backend; `.vscode/tasks.json` installs dependencies and runs the frontend dev server.
