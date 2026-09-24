# Test Taking — Business Requirements

## Purpose

Provide a clean, distraction-free, and tamper-resistant environment for users to take published tests, navigate questions, review answers, and submit responses.

## Business Need

- Test takers need an intuitive interface that clearly tracks progress, answered vs unanswered questions, and allows free navigation before final submission.
- The server must never expose correct answers, answer keys, or explanations in network responses before a test is submitted.
- Test takers must be protected from accidental data loss while navigating between questions.
- A clear confirmation modal must prevent accidental early submissions.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| BR-TAKE-01 | Only published tests can be taken. Draft tests return `404 Not Found` or `400 Bad Request` to test-takers. |
| BR-TAKE-02 | The backend endpoint `GET /api/tests/{id}/take` must strip all `correct_answers` and `explanation` fields. |
| BR-TAKE-03 | The UI displays one question at a time or structured sections, with a question index navigator indicating which questions have answers selected. |
| BR-TAKE-04 | For `single_choice`, clicking an option selects it and deselects any previously selected option. |
| BR-TAKE-05 | For `true_false`, clicking 'True' or 'False' selects that boolean answer. |
| BR-TAKE-06 | For `multiple_choice`, checkboxes allow selecting one or multiple answers. |
| BR-TAKE-07 | Provide 'Next', 'Previous', and direct question jump buttons. |
| BR-TAKE-08 | Provide a 'Review' view summarizing answered vs unanswered questions prior to submission. |
| BR-TAKE-09 | Require explicit confirmation via dialog before final submission (`Submit Test`). |
| BR-TAKE-10 | Submission sends all user answers to `POST /api/tests/{id}/submit` and redirects directly to the results view. |

