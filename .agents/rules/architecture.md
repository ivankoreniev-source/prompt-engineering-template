# QuizCraft Architecture Rules

All code contributions to this repository must conform to the layered architectural boundaries.

## 1. Backend Layering (FastAPI)
The backend follows strict separation of concerns across dedicated packages:

1. **`app/models/`**:
   - Pydantic v2 schemas defining input validation (`*Create`, `*Update`), domain entities (`*InDb`), and response DTOs (`*Response`).
   - Models must never contain database or file I/O operations.
2. **`app/repositories/`**:
   - Sole owner of data storage access (`backend/data/*.json`).
   - Manages CRUD operations and ensures atomic file writes (saving valid JSON arrays).
   - Repositories must not contain business rules or request authentication logic.
3. **`app/services/`**:
   - Implements core business logic, validation workflows, password hashing, and test scoring.
   - Interacts with repositories for persistence.
   - Services must not deal with HTTP-specific objects (e.g. `Request`, status codes).
4. **`app/routers/`**:
   - Defines HTTP endpoints, routes, status codes, and delegates execution to injected services.
   - Endpoints must consume and return Pydantic models.
5. **`app/dependencies.py`**:
   - Provides FastAPI dependency injection providers for services, repositories, and `get_current_user`.

## 2. Frontend Layering (React + Redux Toolkit)
The frontend organizes code by feature slices and reusable UI primitives:

1. **`src/features/<feature>/`**:
   - Contains feature-specific views and components (e.g. `auth/`, `tests/`, `taking/`, `results/`, `dashboard/`).
2. **`src/store/api/`**:
   - RTK Query API slice definitions (`baseApi.ts`, `authApi.ts`, `testsApi.ts`, `resultsApi.ts`).
   - Use automated cache invalidation via tags (`User`, `Test`, `Result`).
3. **`src/store/slices/`**:
   - Redux state slices for UI and client-only state (`authSlice.ts`, `uiSlice.ts`, `navigationSlice.ts`).
4. **`src/components/ui/`**:
   - Presentational UI primitives based on `shadcn/ui` and Radix.
5. **`src/lib/config.ts`**:
   - Central configuration resolver for `API_BASE_URL`. Never hardcode API host addresses directly in components.

## 3. Documentation Consolidation
- Every feature must be documented in a single consolidated folder under `docs/<feature>/`:
  - `business-requirements.md` (unified requirements for both FE & BE)
  - `architecture.md` (unified technical architecture)
  - `test-cases.md` (unified test cases covering frontend and backend)
