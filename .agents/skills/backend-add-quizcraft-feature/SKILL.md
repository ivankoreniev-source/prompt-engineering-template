---
name: backend-add-quizcraft-feature
description: >-
  Use this skill exclusively when implementing or modifying backend features,
  data models, repositories, business services, or API routers in `backend/`. Do not use for frontend tasks.
---

# Adding a Backend Feature to QuizCraft

This skill guides you through the layered implementation workflow for new backend features according to the QuizCraft architecture and BRD.

## Layer-by-Layer Workflow

Follow this strict sequence whenever adding or modifying a backend capability:

### Step 1: Types & Enums (`backend/app/types/`)
- Define any new domain enums, literals, or type aliases (e.g. `QuestionType`, `DifficultyLevel`).

### Step 2: Pydantic v2 Models (`backend/app/models/`)
- Define request DTOs with input validation (`*Create`, `*Update`).
- Define database entity schemas (`*InDb`) with defaults and timestamps.
- Define public response models (`*Response`, `*DetailResponse`, `*SummaryResponse`).
- Define sanitized taking models if the entity has sensitive answers (e.g. `QuestionPublic`).

### Step 3: Repository Layer (`backend/app/repositories/`)
- Implement file-backed CRUD operations reading/writing to `backend/data/<entity>.json`.
- Use `read_list_file` and `write_list_file` from `app.utils.json_store`.
- Maintain atomic file writes via temporary files and `os.replace`.

### Step 4: Business Logic Service (`backend/app/services/`)
- Implement business rules, validations, calculations, and access control.
- Inject repository dependencies in `__init__`.
- Raise standard `HTTPException` with explicit status codes.
- NEVER access HTTP request objects directly in services.

### Step 5: FastAPI Router (`backend/app/routers/`)
- Declare router with prefix and tags (`APIRouter(prefix="/...", tags=["..."])`).
- Inject services via `Depends(get_<entity>_service)`.
- Inject current user via `Depends(get_current_user)` when authentication is required.
- Set explicit `status_code` and `response_model` on router decorators.

### Step 6: Register Dependencies & App
- Expose dependency factories in `backend/app/dependencies.py`.
- Mount router in `backend/app/main.py`.

### Step 7: Automated Tests (`backend/tests/`)
- Add integration tests covering success paths, validation rejections, and access control.
- Verify tests pass with `backend\.venv\Scripts\pytest backend/tests`.
