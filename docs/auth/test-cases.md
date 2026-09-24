# Authentication & User Management — Test Cases

| Test ID | Area | Scenario | Expected Result |
|---------|------|----------|-----------------|
| TC-AUTH-01 | Backend | Register new user with valid data | Returns `201 Created` with auth token and sanitized user profile; saved in `users.json`. |
| TC-AUTH-02 | Backend | Register with duplicate username | Returns `409 Conflict` with clear error message. |
| TC-AUTH-03 | Backend | Register with duplicate email | Returns `409 Conflict` with clear error message. |
| TC-AUTH-04 | Backend | Register with mismatching passwords | Returns `422 Unprocessable Entity` validation error. |
| TC-AUTH-05 | Backend | Login with valid username and password | Returns `200 OK` with session token and user info; creates session in `sessions.json`. |
| TC-AUTH-06 | Backend | Login with valid email and password | Returns `200 OK` with session token and user info. |
| TC-AUTH-07 | Backend | Login with incorrect password | Returns `401 Unauthorized`. |
| TC-AUTH-08 | Backend | Request `GET /api/auth/me` with valid token | Returns `200 OK` with authenticated user profile. |
| TC-AUTH-09 | Backend | Request `GET /api/auth/me` with invalid/missing token | Returns `401 Unauthorized`. |
| TC-AUTH-10 | Backend | Logout with active token | Returns `200 OK`, deletes token from `sessions.json`. Subsequent `GET /api/auth/me` returns `401`. |
| TC-AUTH-11 | Frontend | Submit valid registration form | Redirects to dashboard/home, displays logged-in user header, token stored in `localStorage`. |
| TC-AUTH-12 | Frontend | Display validation errors on login | Shows user-friendly message when credentials fail. |
| TC-AUTH-13 | Frontend | Click logout | Clears `localStorage`, resets auth state, redirects to login/home. |

