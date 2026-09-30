---
name: frontend-test-quizcraft
description: >-
  Use this skill exclusively for running frontend builds, typechecking (`tsc -b`),
  linting (`oxlint`), formatting (`prettier`), and verifying code quality for QuizCraft. Do not use for backend tasks.
---

# Testing & Verifying the QuizCraft Frontend

This skill provides procedures for running builds, typechecks, formatters, and linters across the frontend codebase.

## Prerequisites

- Node.js 18+ and npm installed.
- Working directory: `frontend/`.

## Execution Procedures

### 1. Code Quality Suite (Linter, Formatter & Type Checker)

From `frontend/`:
```powershell
# 1. Fast Linter (oxlint)
npm run lint

# 2. Prettier Formatting Check
npm run format:check

# Format files if needed:
# npm run format

# 3. TypeScript Type Checker (tsc -b)
npm run typecheck
```

From repository root:
```powershell
npm --prefix frontend run lint
npm --prefix frontend run format:check
npm --prefix frontend run typecheck
```

### 2. TypeScript & Vite Production Build

Verifies all TypeScript types, component interfaces, RTK Query types, and asset bundle pipelines:

```powershell
npm --prefix frontend run build
```

Or from `frontend/`:
```powershell
npm run build
```

Expected result:
```
✓ built in ...ms
```

## Quality Checklist

- 0 TypeScript compiler errors (`npm run typecheck` / `tsc -b`).
- 0 linter errors and warnings (`npm run lint` / `oxlint`).
- 0 formatting discrepancies (`npm run format:check` / `prettier`).
- No direct synchronous `setState()` in `useEffect()` bodies.
- Clean component export structure (components exported individually or isolated variant definitions).
