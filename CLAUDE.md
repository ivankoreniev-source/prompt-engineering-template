# CLAUDE.md — QuizCraft Test Platform

This file contains comprehensive guidelines, commands, and architecture standards for AI assistants (Claude, Claude Code) working on the **QuizCraft (Test Platform)** codebase.

---

## 1. Project Overview

**QuizCraft** is a full-stack web application designed for creating, publishing, taking, and evaluating tests, complete with user authentication, persistent test history, and scoring analytics.

- **Backend**: Python 3.12+, **FastAPI**, **Pydantic v2**, file-based atomic JSON storage (`backend/data/`).
- **Frontend**: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **shadcn/ui**, **Redux Toolkit** (RTK Query + UI slices).
- **Architecture**: Strict layered architecture on backend (`routers` -> `services` -> `repositories` -> JSON files) and modular feature-based structure on frontend (`src/features/`, `src/store/api/`).

---

## 2. Essential Commands

### Quick Start
- **Windows One-Click Launcher**: Double-click or run `.\start.bat` (starts both backend on port `8001` and frontend on port `5174`).

### Backend (`backend/`)
Using `uv`:
```powershell
# Install / sync dependencies
uv sync

# Run development server (port 8001)
uv run uvicorn app.main:app --reload --port 8001

# Run tests
uv run pytest tests -v

# Run linter
uv run ruff check .

# Check formatting
uv run ruff format --check .

# Auto-format code
uv run ruff format .

# Type checking
uv run mypy app tests
```

### Frontend (`frontend/`)
Using `npm`:
```powershell
# Install dependencies
npm install

# Run Vite development server (port 5174)
npm run dev

# Run linter (oxlint)
npm run lint

# Check formatting (Prettier)
npm run format:check

# Auto-format code (Prettier)
npm run format

# Static type check (TypeScript)
npm run typecheck

# Production build
npm run build
```

---

## 3. Code Quality Tooling: Linter, Formatter & Type Checker

This project enforces strict code quality across both Python backend and TypeScript frontend using three complementary categories of tools:

| Category | Backend (Python) | Frontend (TypeScript/React) | Purpose |
| :--- | :--- | :--- | :--- |
| **Linter** | `ruff check` | `oxlint` | Analyzes code for potential bugs, dead code, logic errors, unused imports, bad practices, and security smells without executing the code. |
| **Formatter** | `ruff format` | `prettier` | Enforces consistent mechanical styling (indentation, line breaks, quotes, commas) across all files, avoiding code style arguments. |
| **Type Checker** | `mypy` | `tsc -b` (TypeScript) | Statically verifies data types and contracts, catching `None`/`undefined` errors, invalid function signatures, and broken API contracts before runtime. |

### Why All Three Are Necessary:
1. **Linter vs Formatter**:
   - The *formatter* cares only about aesthetics and visual consistency (spacing, quotes, line wraps).
   - The *linter* cares about code correctness and quality (e.g. unused variables, shadowed names, missing dependency array in hooks, unsafe patterns).
2. **Type Checker vs Linter**:
   - The *linter* checks syntactic rules and known bad idioms.
   - The *type checker* builds an entire semantic type graph to ensure that every object, property, parameter, and return value strictly conforms to its declared interface.

---

## 4. Architecture & Key Conventions

### Backend Layered Architecture (`backend/app/`)
1. **`routers/`**: HTTP request handlers only. Validate query/path parameters, call services, and return standard HTTP status codes (`201` Created, `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found).
2. **`services/`**: Pure business logic (e.g., scoring algorithms, test submission handling, user authentication, password hashing with PBKDF2).
3. **`repositories/`**: Data persistence abstraction. Reads and writes data to `backend/data/*.json`. Writes must be atomic (write to temp file then replace) to prevent corruption.
4. **`models/` & `types/`**: Pydantic schemas representing request bodies, response models, and internal domain models.
5. **CRITICAL SECURITY RULE**: When serving `GET /api/tests/{id}/take`, NEVER include `correct_answers` or `explanation` in the returned payload.

### Frontend Architecture (`frontend/src/`)
1. **`features/`**: Modular page components (`auth/`, `tests/`, `taking/`, `results/`, `dashboard/`).
2. **`store/api/`**: RTK Query endpoints (`baseApi`, `authApi`, `testsApi`, `resultsApi`) providing cached data fetching and automatic cache invalidation (`providesTags`/`invalidatesTags`).
3. **`store/slices/`**: Redux state slices for UI state (e.g. `navigationSlice`, `uiSlice`, `authSlice`).
4. **`components/ui/`**: Reusable primitive UI components built with Tailwind and Radix UI (shadcn/ui style).

---

## 5. Agent Customizations (`.agents/`) & PathFilters

The repository includes specialized configurations for AI assistants, partitioned strictly by `PathFilters` to prevent cross-domain interference:
- **Rules** (`.agents/rules/`):
  - Shared: `shared-rules.md` (`PathFilters: ["**/*"]`) — universal safety and engineering standards.
  - Backend: `backend-architecture.md`, `backend-coding-standards.md`, `backend-security-and-data.md` (`PathFilters: ["backend/**"]`).
  - Frontend: `frontend-architecture.md`, `frontend-coding-standards.md`, `frontend-security-and-data.md` (`PathFilters: ["frontend/**"]`).
- **Skills** (`.agents/skills/`):
  - Backend: `backend-run-quizcraft`, `backend-test-quizcraft`, `backend-add-quizcraft-feature` (`PathFilters: ["backend/**"]`).
  - Frontend: `frontend-run-quizcraft`, `frontend-test-quizcraft`, `frontend-add-quizcraft-feature` (`PathFilters: ["frontend/**"]`).
- **Hooks** (`.agents/hooks.json` & `.agents/hooks/`):
  - Configured with `PathFilters` in `hooks.json` and internal path detection:
    - Backend hooks (`PathFilters: ["backend/**"]`): `backend-safety-guard`, `backend-architecture-reminder`, `backend-post-tool-audit`.
    - Frontend hooks (`PathFilters: ["frontend/**"]`): `frontend-safety-guard`, `frontend-architecture-reminder`, `frontend-post-tool-audit`.
