# Test Evaluation & Results — Business Requirements

## Purpose

Calculate test scores server-side immediately upon submission, record persistent attempt history, and present comprehensive result breakdowns to users.

## Business Need

- Test takers need instant feedback on their performance, including total points, percentages, pass/fail status, and detailed reviews showing their answers, correct answers, and author explanations.
- Test history must be permanently saved so users can review previous attempts on their "My Results" page.
- Test results must be immutable once created; users cannot alter prior scores.
- Test takers can only view their own test results.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| BR-RES-01 | Server grades submissions by comparing user selected answers to stored correct answers. |
| BR-RES-02 | Single Choice: Award 1 point if selected option ID matches designated correct answer ID. |
| BR-RES-03 | True / False: Award 1 point if selected option matches correct True/False answer ID. |
| BR-RES-04 | Multiple Choice: Award 1 point if the set of selected option IDs exactly matches the set of correct answer IDs. |
| BR-RES-05 | Calculate overall percentage: `round((score / total_questions) * 100, 1)`. |
| BR-RES-06 | Mark `passed = true` if percentage is 60% or higher. |
| BR-RES-07 | Persist every test attempt permanently in `backend/data/results.json`. |
| BR-RES-08 | Return detailed question breakdown including question text, user answers, correct answers, correctness status, and explanations. |
| BR-RES-09 | "My Results" page lists all tests completed by the logged-in user with date, score, percentage, status, and link to full report. |
| BR-RES-10 | A user cannot view another user's private result breakdown (`403 Forbidden`). |

