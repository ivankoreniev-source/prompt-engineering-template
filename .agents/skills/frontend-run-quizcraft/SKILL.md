---
name: frontend-run-quizcraft
description: >-
  Use this skill exclusively for running or launching the QuizCraft React Vite
  frontend development server on port 5174. Do not use for backend tasks.
---

# Running the QuizCraft Frontend

This skill provides step-by-step procedures for running and verifying the React + TypeScript frontend.

## Prerequisites

- Node.js 18+ and npm installed.
- Working directory: `frontend/` or repository root.

## Execution Procedure

From the repository root:
```powershell
cd frontend
npm run dev -- --port 5174
```

Or from PowerShell in root:
```powershell
npm --prefix frontend run dev -- --port 5174
```

The Vite dev server will start at:
```
http://localhost:5174
```

## API Configuration

The frontend connects to the FastAPI backend via `src/lib/config.ts`.
By default, it uses `http://localhost:8001/api`.
To override for custom environments, set `VITE_API_BASE_URL` in an `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8001/api
```

## Verification

1. Open `http://localhost:5174` in the browser.
2. Confirm the Navbar, Hero banner, and Featured Tests or Empty State render properly.
3. Check browser developer console for any runtime errors or failed asset requests.
