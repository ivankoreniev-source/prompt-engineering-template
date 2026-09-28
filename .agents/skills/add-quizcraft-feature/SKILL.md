---
name: add-quizcraft-feature
description: >-
  Use this skill whenever adding a new domain feature or capability to the QuizCraft
  full-stack application, ensuring full architectural alignment across backend, frontend, and docs.
---

# Add a New Feature to QuizCraft

Follow this multi-step procedure to implement a new feature cleanly across the full stack.

## Step 1: Document the Feature
Create a single consolidated folder under `docs/<feature-name>/` containing:
- `business-requirements.md`: User stories, acceptance criteria, and edge cases.
- `architecture.md`: Data contracts, API endpoints, Redux state, and UI components.
- `test-cases.md`: Test scenarios covering backend endpoints and frontend user interactions.

## Step 2: Implement Backend Layers
Implement the feature from the data model upward:
1. **Model** (`backend/app/models/<feature>.py`): Pydantic request/response schemas and DB entity.
2. **Repository** (`backend/app/repositories/<feature>_repository.py`): Inherits file-based JSON store logic.
3. **Service** (`backend/app/services/<feature>_service.py`): Implements business rules and validation.
4. **Router** (`backend/app/routers/<feature>.py`): Exposes API routes using dependency injection.
5. **Register Router**: Include the router in `backend/app/main.py`.

## Step 3: Implement Frontend Layers
1. **Types** (`frontend/src/types/<feature>.ts`): TypeScript interfaces matching backend models.
2. **API Slice** (`frontend/src/store/api/<feature>Api.ts`): RTK Query endpoints with cache tags.
3. **Store Integration** (`frontend/src/store/store.ts`): Add reducer and middleware if necessary.
4. **UI Components** (`frontend/src/features/<feature>/`): React components using `shadcn/ui` primitives.

## Step 4: Verification
1. Add backend automated test cases under `backend/tests/`.
2. Run backend pytest: `uv run pytest`.
3. Run frontend build: `npm run build`.
4. Perform local verification to ensure zero regressions.
