---
description: Backend Security and Data Persistence Rules for QuizCraft
globs: ["backend/**"]
---

# Backend Security & Data Rules

These rules apply exclusively to all backend files and tasks within `backend/**`.

## Authentication & Password Hashing

1. **Password Hashing Algorithm**:
   - MUST use PBKDF2-HMAC-SHA256 (`hashlib.pbkdf2_hmac("sha256", password, salt, 100_000)`).
   - Salt MUST be a cryptographically secure random 16-byte hex string (`secrets.token_hex(16)`).
   - NEVER store or log plaintext passwords.
   - Use constant-time comparison `hmac.compare_digest` for verifying password hashes to prevent timing attacks.
2. **Session Management**:
   - Bearer tokens MUST be generated using `secrets.token_urlsafe(32)`.
   - Active tokens are stored in `backend/data/sessions.json`.
   - Logging out must delete the active session token.

## Test Taking Sanitization (Answer Key Protection)

1. The test taking endpoint `GET /api/tests/{id}/take` MUST return `TestTakeResponse` where:
   - `correct_answers` is completely omitted from all question objects.
   - `explanation` is completely omitted from all question objects.
2. Only `is_published == True` tests can be fetched for taking. Unpublished/draft tests return `400 Bad Request`.
3. Only the test creator can view full test details including answer keys via `GET /api/tests/{id}`.

## Resource Ownership & Access Control

1. **Test Modification/Deletion**:
   - Only `creator_id == current_user.id` can edit, publish, unpublish, or delete a test. Attempting to modify another user's test MUST raise `403 Forbidden`.
2. **Results Isolation**:
   - `GET /api/results/{id}` is private to the user who completed the test (`result.user_id == current_user.id`).
   - `GET /api/results/my` returns exclusively results of the authenticated user.

## Atomic JSON File Persistence

1. All persistence is file-based in `backend/data/*.json` (`users.json`, `tests.json`, `results.json`, `sessions.json`).
2. Storage files MUST always remain valid JSON arrays (`[]`).
3. Writes MUST be atomic:
   - Serialize with `json.dumps(payload, indent=2)`.
   - Write to a temporary file in the same directory (`.tmp`).
   - Flush and sync to disk.
   - Atomically replace the target file via `os.replace`.
4. Never wipe or destroy existing user records during testing or operations.
