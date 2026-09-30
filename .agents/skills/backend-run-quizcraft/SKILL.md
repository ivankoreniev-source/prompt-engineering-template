---
name: backend-run-quizcraft
description: >-
  Use this skill exclusively for running, starting, or serving the QuizCraft
  FastAPI backend server on port 8001. Do not use for frontend tasks.
---

# Running the QuizCraft Backend

This skill provides step-by-step instructions for starting and verifying the FastAPI backend service.

## Prerequisites

- Python 3.12+ (available via virtual environment `backend/.venv` or system Python).
- Working directory: `backend` or repository root.

## Execution Procedure

### 1. Using Virtual Environment (Recommended on Windows)

Run Uvicorn directly from the virtual environment:

```powershell
backend\.venv\Scripts\uvicorn app.main:app --reload --port 8001
```

Or from within the `backend/` directory:

```powershell
.\.venv\Scripts\uvicorn app.main:app --reload --port 8001
```

### 2. Using uv (If available)

```powershell
uv run uvicorn app.main:app --reload --port 8001
```

## Verification & Health Check

Once the server is running, verify it responds with HTTP 200:

1. Root health check: `http://localhost:8001/health`
2. API health check: `http://localhost:8001/api/health`
3. OpenAPI Documentation: `http://localhost:8001/docs`

Expected response:
```json
{
  "status": "ok",
  "app": "QuizCraft"
}
```

## Common Issues & Troubleshooting

- **Port 8001 in use**: Check running processes on port 8001 (`Get-NetTCPConnection -LocalPort 8001`).
- **Missing dependencies**: Run `uv sync` or `pip install -r requirements.txt` within the `backend` environment.
- **Data directory**: Ensure `backend/data/` exists and contains valid JSON arrays (`users.json`, `tests.json`, `results.json`, `sessions.json`).
