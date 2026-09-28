---
name: test-quizcraft
description: >-
  Use this skill whenever the user asks to test, validate, run pytest, or build the QuizCraft
  application across backend and frontend codebases.
---

# Test and Validate QuizCraft

This skill provides step-by-step instructions for running test suites and validating the QuizCraft codebase.

## 1. Backend Automated Testing

The backend test suite covers authentication, permissions, test creation, question sanitization, scoring, and persistence.

From the `backend/` directory:
```bash
# Using uv:
uv run pytest

# Or with verbose output:
uv run pytest -v
```

### Key Test Assertions Verified:
- User registration and duplicate account prevention.
- Session token generation and validation on `/api/auth/me`.
- Public test-taking sanitization (confirming `correct_answers` and `explanation` are absent).
- Accurate scoring for Single Choice, Multiple Choice (exact set matching), and True/False questions.
- Pass/Fail evaluation based on the 60% threshold.

## 2. Frontend Build and Type Checking

The frontend uses TypeScript and Vite. Ensure all type checks and production bundling pass without errors.

From the `frontend/` directory:
```bash
npm run build
```

This executes:
1. `tsc -b`: Project-wide TypeScript compiler checking for syntax and type errors.
2. `vite build`: Production asset compilation and bundling.

## 3. End-to-End Local Smoke Test

To verify complete end-to-end functionality locally:
1. Start backend and frontend (see `run-quizcraft` skill).
2. Register a temporary user: `POST /api/auth/register`.
3. Fetch published tests: `GET /api/tests`.
4. Fetch sanitized test: `GET /api/tests/{id}/take`.
5. Submit answers: `POST /api/tests/{id}/submit`.
6. Confirm response includes points, percentage, and detailed breakdown.
7. Verify attempt is listed under `GET /api/results/my`.
