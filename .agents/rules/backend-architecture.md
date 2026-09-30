---
description: Backend Layered Architecture Rules for FastAPI (QuizCraft)
globs: ["backend/**"]
---

# Backend Architecture Rules

These rules apply exclusively to all backend files and tasks within `backend/**`.

## Layered Hierarchy & Dependencies

QuizCraft backend follows a strict unidirectional layered architecture:
```
app/routers/ (HTTP, Routing, Status Codes)
     │
     ▼
app/services/ (Business Logic, Validation, Scoring, Security)
     │
     ▼
app/repositories/ (JSON Persistence, CRUD, Atomic Writes)
     │
     ▼
backend/data/*.json (File-based JSON Array Storage)
```

Shared horizontal layers:
- `app/models/` — Pydantic v2 schemas (`*Create`, `*Update`, `*InDb`, `*Response`, `*Public`). Accessible by all layers.
- `app/types/` — Shared enums (`QuestionType`, `DifficultyLevel`) and type definitions.
- `app/dependencies.py` — Dependency injection factories using FastAPI `Depends`.
- `app/utils/` — Cross-cutting utilities (atomic JSON persistence, path resolution).

## Layer Responsibilities & Strict Boundaries

1. **Routers (`app/routers/`)**:
   - MUST only handle HTTP routing, query parameters, request body parsing, and HTTP status codes.
   - MUST delegate all business operations to injected service instances from `app/dependencies.py`.
   - MUST NOT perform direct repository calls or file I/O.
   - MUST NOT contain business rules (e.g. calculating test scores, verifying passwords).

2. **Services (`app/services/`)**:
   - Sole home for business logic, publishing validation, test grading/evaluation, and password hashing.
   - MUST communicate with data storage exclusively through injected repository interfaces.
   - MUST NOT touch FastAPI `Request`, `Response`, or lower-level HTTP transport details directly (except raising standard `HTTPException`).

3. **Repositories (`app/repositories/`)**:
   - Sole owners of data persistence in `backend/data/*.json`.
   - MUST implement atomic file writing using temporary files and atomic replacement (`os.replace`).
   - MUST return and receive Pydantic domain models (`*InDb`).
   - MUST NOT contain business validation or authentication logic.

4. **Models (`app/models/`)**:
   - Pydantic v2 models only (`BaseModel`, `Field`, `@field_validator`, `@model_validator`).
   - Input validation models must strictly validate fields before they reach services.
   - Public DTOs must sanitize sensitive fields (e.g., `TestTakeResponse` must NEVER include `correct_answers` or `explanation`).
   - MUST NOT execute any file operations or external side effects.

5. **Dependencies (`app/dependencies.py`)**:
   - Provide `@lru_cache` singletons for repositories.
   - Provide factory dependencies for services.
   - Provide `get_current_user` and `get_optional_user` authentication helpers.
