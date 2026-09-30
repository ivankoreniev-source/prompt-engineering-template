# QuizCraft Backend Agent Rules

These directory rules apply strictly to all files and workflows within the `backend/` directory.

## Layered Architecture
1. **`app/models/`**: Pydantic v2 schemas defining input validation (`*Create`, `*Update`), domain entities (`*InDb`), and response DTOs (`*Response`). No DB or file I/O operations.
2. **`app/repositories/`**: Sole owner of JSON data persistence (`backend/data/*.json`). Manages CRUD and ensures atomic file writes via temporary files and `os.replace`. No business logic or authentication rules.
3. **`app/services/`**: Core business logic, validation workflows, password hashing, and test scoring. Interacts with repositories for persistence. No HTTP-specific transport objects.
4. **`app/routers/`**: HTTP endpoints, routing, status codes, and delegation to injected services.
5. **`app/dependencies.py`**: FastAPI dependency injection providers for services, repositories, and `get_current_user`.

## Coding & Security Standards
- Strict Python 3.12+ type hints across all functions and methods.
- Validate inputs and serializations with Pydantic v2.
- Password hashing: PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salt. No plain passwords stored or returned. Constant-time `hmac.compare_digest`.
- Public test taking (`GET /api/tests/{id}/take`): MUST omit `correct_answers` and `explanation`.
- Modifying/deleting/publishing tests requires creator authorization (`test.creator_id == current_user.id`).
- All entities persisted in `backend/data/*.json` as valid JSON arrays (`[]`). Never wipe user data.

## Quality Verification Commands
- Linter: `uv run ruff check .`
- Formatter: `uv run ruff format --check .` (auto-format: `uv run ruff format .`)
- Type Checker: `uv run mypy app` and `uv run mypy tests`
- Test Suite: `uv run pytest tests`

See detailed rules in `.agents/rules/backend-architecture.md`, `backend-coding-standards.md`, and `backend-security-and-data.md`.

