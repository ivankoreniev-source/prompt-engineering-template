---
description: Frontend Security, Session, and Data Privacy Rules
globs: ["frontend/**"]
---

# Frontend Security & Data Rules

These rules apply exclusively to all frontend files and tasks within `frontend/**`.

## Authentication & Credential Protection

1. **Session Storage**:
   - Bearer tokens are stored in `sessionStorage` or Redux memory via `authSlice.ts`.
   - Never log bearer tokens or credentials to the browser console.
2. **Password Security**:
   - Plaintext passwords must NEVER be saved in `localStorage`, cookies, or persistent storage.
   - Password fields must always use `type="password"`.
   - Provide client-side password confirmation matching validation before making network requests.

## Test Integrity & Answer Protection

1. **Client Answer Key Isolation**:
   - The test-taking interface (`TakeTestPage.tsx`) consumes the sanitized `TestTake` endpoint.
   - It MUST NEVER expect, render, or inspect `correct_answers` or `explanation` prior to test submission.
   - Only after successful submission and evaluation can results and explanations be viewed in `ResultDetailPage.tsx`.
2. **Ownership & Access Guards**:
   - Test creator actions (Edit Test, Publish, Unpublish, Delete Test) must only be shown to and executable by the authenticated creator (`test.creator_id === currentUser?.id`).
   - Non-authenticated users visiting protected routes (e.g. `test-editor`, `my-tests`, `my-results`, `profile`) must be redirected to `login`.
