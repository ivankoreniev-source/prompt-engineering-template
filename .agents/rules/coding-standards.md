# QuizCraft Coding Standards

Guidelines and constraints for writing clean, reliable code in this project.

## 1. Type Safety
- **Backend**: Strict Python type hints on all functions and methods. Validate inputs and serializations with Pydantic v2.
- **Frontend**: Strict TypeScript typing (`strict: true`). Do not use `any` unless absolutely unavoidable. Use shared interface definitions under `src/types/`.

## 2. API Communication
- All client-side HTTP calls to the backend must go through RTK Query API endpoints under `src/store/api/`.
- Do not make raw `fetch` or `axios` calls directly inside React components.
- Always handle loading, error, and empty states gracefully in UI components.

## 3. Data Integrity & Completeness
- Never invent placeholder requirements or use mocked fake data where real persistent data is expected.
- No unfinished TODOs or dead code left in production paths.
- Ensure all forms have client-side validation paired with backend Pydantic validation.

## 4. Error Handling
- Backend errors must return standard FastAPI `HTTPException` with informative `detail` strings or structured error objects.
- Frontend must catch API errors and display user-friendly toast notifications via `uiSlice.ts` (`showNotification`).
