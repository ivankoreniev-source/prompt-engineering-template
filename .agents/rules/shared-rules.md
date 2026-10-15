---
description: Shared Engineering Standards, Architecture, and Quality Rules for QuizCraft
globs: ["**/*"]
pathFilters: ["**/*"]
PathFilters: ["**/*"]
paths: ["**/*"]
---

# Shared Project Rules (Global)

These rules apply globally across the entire QuizCraft repository, spanning backend, frontend, documentation, and agent configurations.

## 1. Safety & Code Integrity
- **Understand Before Editing**: Always inspect existing architecture, models, and interfaces before modifying code.
- **Surgical Edits**: Do not rewrite entire modules or functions from scratch when a targeted change suffices.
- **Root Cause Resolution**: Diagnose and fix root causes rather than masking symptoms or applying temporary workarounds.
- **No Suppression**: Never silence errors with `@ts-ignore`, empty `except: pass`, or disabling linter rules unless explicitly requested.

## 2. Path-Filtered Scope Separation
- **Backend Scope (`backend/**`)**: All Python code, FastAPI endpoints, Pydantic models, JSON storage repositories, and pytest suites.
- **Frontend Scope (`frontend/**`)**: All TypeScript code, React components, Tailwind styling, RTK Query API slices, and Vite builds.
- **Documentation Scope (`docs/**`)**: Feature documentation, architectural specs, and test cases organized under feature folders.
- **Agent Configuration (`.agents/**`)**: Shared, backend-specific, and frontend-specific rules, skills, and lifecycle hooks with matching `PathFilters`.

## 3. Autonomous Verification Protocol
Before declaring any task or feature complete, verify through the corresponding tooling:
1. **Backend**:
   - `uv run ruff check .`
   - `uv run ruff format --check .`
   - `uv run mypy app tests`
   - `uv run pytest tests`
2. **Frontend**:
   - `npm run lint`
   - `npm run format:check`
   - `npm run typecheck`
   - `npm run build`
