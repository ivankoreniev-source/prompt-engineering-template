---
name: run-quizcraft
description: >-
  Use this skill whenever the user asks to run, start, launch, or verify the QuizCraft
  application (both FastAPI backend and React frontend) locally.
---

# Run QuizCraft Locally

This skill outlines the procedures for starting and verifying the QuizCraft platform.

## Method 1: Using the Root Launcher Script (Windows)

On Windows, the easiest way to launch the full platform is via `start.bat`:

1. Run the launcher from the repository root:
   ```cmd
   .\start.bat
   ```
2. The script will:
   - Verify Node.js and Python / uv dependencies.
   - Automatically install missing dependencies (`uv sync` or `pip install`, and `npm install`).
   - Launch the FastAPI backend on `http://127.0.0.1:8001` in a dedicated window.
   - Launch the Vite frontend on `http://localhost:5174` in a dedicated window.
   - Open `http://localhost:5174` in the default browser.

## Method 2: Manual Terminal Startup

If running in separate terminals or cross-platform (Linux / macOS / WSL):

### 1. Start the Backend Server
```bash
cd backend
# If using uv (recommended):
uv sync
uv run uvicorn app.main:app --reload --port 8001

# If using standard Python venv:
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
* Backend URL: `http://127.0.0.1:8001`
* Interactive API Docs (Swagger): `http://127.0.0.1:8001/docs`

### 2. Start the Frontend Server
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend URL: `http://localhost:5174`

## Verification Checks

Verify that both servers are healthy:
1. Backend health check:
   ```bash
   curl http://127.0.0.1:8001/api/health
   # Expected response: {"status": "ok", "app": "QuizCraft"}
   ```
2. Frontend response:
   ```bash
   curl -I http://localhost:5174
   # Expected response: HTTP/1.1 200 OK
   ```
