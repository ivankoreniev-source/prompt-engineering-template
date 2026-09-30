---
description: Backend Python & FastAPI Coding Standards for QuizCraft
globs: ["backend/**"]
---

# Backend Coding Standards

These rules apply exclusively to all backend files and tasks within `backend/**`.

## Python & Typing Standards

1. **Python Version**: Python 3.12+ features and standard library typing.
2. **Type Annotations**:
   - Every function and method MUST have complete type annotations for all parameters and return types.
   - Use standard collections (`list[str]`, `dict[str, Any]`, `set[str]`, `str | None`).
   - Do not use bare `except:` or untyped parameters.
3. **Pydantic v2 Best Practices**:
   - Use `model_validate` instead of `parse_obj`.
   - Use `model_dump(mode="json")` instead of `.dict()`.
   - Use `@field_validator` and `@model_validator(mode="after")` decorators.
   - Use `Field(..., min_length=..., max_length=..., default=...)` for constraint validation.

## Error Handling & HTTP Responses

1. **HTTP Exceptions**:
   - Always raise `fastapi.HTTPException` with explicit `status_code` from `fastapi.status`.
   - Provide informative, client-friendly `detail` string messages:
     - 400: `status.HTTP_400_BAD_REQUEST` for invalid input or business rule violations (e.g. publishing tests with < 2 options).
     - 401: `status.HTTP_401_UNAUTHORIZED` for missing or invalid authentication tokens.
     - 403: `status.HTTP_403_FORBIDDEN` for attempts to edit/delete resources owned by another user.
     - 404: `status.HTTP_404_NOT_FOUND` for non-existent entities.
     - 409: `status.HTTP_409_CONFLICT` for duplicate username or email.
2. **Standardized Responses**:
   - Endpoints returning created resources must return status `201 Created`.
   - Endpoints deleting resources must return status `204 No Content`.
   - All response schemas must be declared in router decorators via `response_model`.

## Quality Tooling & Verification

1. **Linter & Formatter (`ruff`)**:
   - `ruff check .` must pass with 0 errors and 0 warnings.
   - `ruff format --check .` must pass (line length: 120, standard quote/indent style).
   - FastAPI dependency injection in router function signatures uses `B008` (configured as ignored).
2. **Static Type Checker (`mypy`)**:
   - `mypy app` and `mypy tests` must pass with 0 errors.
   - All models, services, repositories, and router parameters must be strictly typed.
   - Use `Sequence[BaseModel]` (from `collections.abc`) for repository collection parameters to maintain covariance.
3. **Automated Testing (`pytest`)**:
   - Use `pytest` for backend testing (`uv run pytest tests`).
   - All business logic, scoring formulas, authorization barriers, and sanitization endpoints must have automated pytest test cases in `backend/tests/`.
   - Tests must use `starlette.testclient.TestClient` or `httpx.AsyncClient`.
