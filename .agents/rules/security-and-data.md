# QuizCraft Security and Data Rules

Security constraints that must never be bypassed under any circumstances.

## 1. Password Hashing
- Passwords must be hashed using PBKDF2-HMAC-SHA256 with at least 100,000 iterations and a unique 16-byte random cryptographic salt.
- Plain text passwords must never be stored in files, logged, or returned in API responses.

## 2. Test Taking Answer Protection
- The public test-taking endpoint `GET /api/tests/{id}/take` MUST sanitize question objects before sending them across the network:
  - `correct_answers` MUST be omitted.
  - `explanation` MUST be omitted.
- Students must not be able to inspect network payloads or DOM state to reveal correct answers during test taking.

## 3. Authorization & Permissions
- Modifying, deleting, publishing, or unpublishing a test requires authentication and strict creator verification:
  - `test.creator_id == current_user.id`.
- Draft tests must never appear in the public test catalog.
- Only the creator can view or edit their draft tests.

## 4. Persistent Storage Protection
- All entities are stored in `backend/data/*.json`:
  - `users.json`
  - `tests.json`
  - `results.json`
  - `sessions.json`
- Files must always remain valid JSON formatted arrays (`[]`).
- Never wipe or corrupt existing legitimate user data during tests or refactoring.
