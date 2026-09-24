# Authentication & User Management — Business Requirements

## Purpose

Provide secure user registration, authentication, session management, and profile access for the Test Platform so creators and test-takers can securely own, manage, and track tests and results.

## Business Need

- Tests and test results must be associated with real, authenticated user accounts.
- Test creators must be able to manage tests without interference from other users.
- Users must be able to log in securely, retain session state across page refreshes, and log out on demand.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| BR-AUTH-01 | Support user registration with `username`, `email`, `password`, and `password_confirm`. |
| BR-AUTH-02 | Validate registration fields: username must be 3–30 alphanumeric/underscore characters; email must be a valid email format; password must be at least 6 characters; password and confirmation must match. |
| BR-AUTH-03 | Enforce uniqueness of `username` (case-insensitive) and `email` (case-insensitive). Return clear validation errors on collision. |
| BR-AUTH-04 | Passwords must never be stored in plain text. Passwords must be hashed using PBKDF2 with SHA-256 and unique cryptographic salt. |
| BR-AUTH-05 | Support user login using either username or email with password. Return `401 Unauthorized` on invalid credentials. |
| BR-AUTH-06 | Issue secure session tokens upon successful registration or login, stored in persistent JSON storage (`backend/data/sessions.json`) and client `localStorage`. |
| BR-AUTH-07 | Support session validation and retrieval of the current authenticated user via `GET /api/auth/me`. |
| BR-AUTH-08 | Support user logout via `POST /api/auth/logout`, invalidating the session token on both client and server. |
| BR-AUTH-09 | Allow users to update their profile (email, bio) and change their password (requiring current password verification). |

## Non-Goals

- Third-party OAuth providers (Google, GitHub) in the initial release.
- Email verification links or password reset emails.

