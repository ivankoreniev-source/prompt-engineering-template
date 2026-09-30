# QuizCraft Frontend Agent Rules

These directory rules apply strictly to all files and workflows within the `frontend/` directory.

## Layered Architecture

1. **`src/features/<feature>/`**: Feature-specific views and components (`auth/`, `tests/`, `taking/`, `results/`, `dashboard/`).
2. **`src/store/api/`**: RTK Query API slice definitions (`baseApi.ts`, `authApi.ts`, `testsApi.ts`, `resultsApi.ts`) with tag-based cache invalidation.
3. **`src/store/slices/`**: Redux state slices for UI and client-only state (`authSlice.ts`, `uiSlice.ts`, `navigationSlice.ts`).
4. **`src/components/ui/`**: Reusable UI primitives based on `shadcn/ui` and Radix.
5. **`src/lib/config.ts`**: Central configuration resolver for `API_BASE_URL`. Never hardcode API URLs in components.

## Coding & Security Standards

- Strict TypeScript typing (`strict: true`). No `any` unless absolutely unavoidable.
- All HTTP calls must use RTK Query hooks from `src/store/api/` (no raw `fetch`/`axios` inside components).
- Handle loading, error, and empty states gracefully.
- Display errors via `uiSlice.ts` (`addToast`) and clear form validation messages.
- Sensitive user credentials (passwords) must never be stored in persistent client storage (`localStorage`).
- Test taking UI must never expose or expect correct answers in DOM or client state before submission.
- Creator-only actions (edit, delete, publish) must be restricted behind authentication and creator verification.

## Quality Verification Commands

- Linter: `npm run lint` (`oxlint`)
- Formatter: `npm run format:check` (`prettier`, auto-format: `npm run format`)
- Type Checker: `npm run typecheck` (`tsc -b`)
- Production Build: `npm run build`

See detailed rules in `.agents/rules/frontend-architecture.md`, `frontend-coding-standards.md`, and `frontend-security-and-data.md`.
