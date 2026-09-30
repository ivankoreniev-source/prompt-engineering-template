---
name: backend-test-quizcraft
description: >-
  Use this skill exclusively for running pytest, ruff linter/formatter, mypy type checker,
  validating API contracts, or executing backend unit and integration tests for QuizCraft. Do not use for frontend tasks.
---

# Testing & Verifying the QuizCraft Backend

This skill provides procedures for running backend automated tests, type checking, formatting, and linting.

## Prerequisites

- Virtual environment `backend/.venv` installed (`uv sync`).
- Python tools: `ruff`, `mypy`, `pytest`, and `httpx`.

## Execution Procedures

### 1. Code Quality Suite (Linter, Formatter & Type Checker)

From `backend/` directory:
```powershell
# 1. Check linting rules
uv run ruff check .

# 2. Check code formatting
uv run ruff format --check .

# Auto-format if needed:
# uv run ruff format .

# 3. Static type checking
uv run mypy app
uv run mypy tests
```

From repository root:
```powershell
uv --directory backend run ruff check .
uv --directory backend run ruff format --check .
uv --directory backend run mypy app
uv --directory backend run mypy tests
```

### 2. Run Complete Pytest Suite

From `backend/` directory:
```powershell
uv run pytest tests -v
```

From repository root:
```powershell
uv --directory backend run pytest tests -v
```

### 3. Run Specific Test Cases

From `backend/`:
```powershell
# Run only authentication tests
uv run pytest tests -k "auth" -v

# Run only scoring tests
uv run pytest tests -k "score or submit" -v

# Run with stdout printing enabled
uv run pytest tests -s -v
```

## Verification Checklist

When adding or verifying backend code, ensure:
1. `ruff check .` returns 0 errors and 0 warnings.
2. `ruff format --check .` confirms all files follow Ruff formatting standards.
3. `mypy app` and `mypy tests` pass with 0 type errors.
4. All pytest assertions pass with 0 failures and 0 errors.
5. Status codes match API contracts (`201` for creation, `204` for deletion, `400` for invalid inputs, `401` for unauthenticated, `403` for forbidden actions).
6. Test taking sanitization is verified (`GET /api/tests/{id}/take` does NOT return `correct_answers` or `explanation`).
7. Password verification and PBKDF2 hashing are tested with valid and invalid passwords.
8. Multiple-choice exact set matching and single-choice exact matching are verified.
