# Test Evaluation & Results — Test Cases

| Test ID | Area | Scenario | Expected Result |
|---------|------|----------|-----------------|
| TC-RES-01 | Backend | Submit answers with 100% correct choices | Returns score matching total questions, 100.0%, `passed = true`. |
| TC-RES-02 | Backend | Submit multiple choice with partial answers | Returns 0 points for question (requires exact set match), `is_correct = false`. |
| TC-RES-03 | Backend | Submit multiple choice with full correct set | Returns 1 point for question, `is_correct = true`. |
| TC-RES-04 | Backend | Submit test with 0 correct answers | Returns score 0, 0.0%, `passed = false`. |
| TC-RES-05 | Backend | Unauthenticated submission attempt | Returns `401 Unauthorized`. |
| TC-RES-06 | Backend | Non-owner views another user's result ID | Returns `403 Forbidden`. |
| TC-RES-07 | Backend | Owner views their result by ID | Returns complete `ResultDetailResponse` with explanations. |
| TC-RES-08 | Backend | User queries `GET /api/results/my` | Returns list of tests completed by this user, ordered by date descending. |
| TC-RES-09 | Frontend | View Results summary page after submission | Renders score badge, percentage, pass/fail status, question review cards. |
| TC-RES-10 | Frontend | View "My Results" history table | Shows completed tests, links to review each result. |

