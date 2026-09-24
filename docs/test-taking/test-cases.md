# Test Taking — Test Cases

| Test ID | Area | Scenario | Expected Result |
|---------|------|----------|-----------------|
| TC-TAKE-01 | Backend | Request `GET /api/tests/{id}/take` for published test | Returns `200 OK` with questions. Response schema strictly excludes `correct_answers` and `explanation`. |
| TC-TAKE-02 | Backend | Request `GET /api/tests/{id}/take` for draft test | Returns `400 Bad Request` ("Test is not published"). |
| TC-TAKE-03 | Frontend | Select single choice option | Previous selection is replaced; question marked as answered. |
| TC-TAKE-04 | Frontend | Select multiple choice options | Allows toggling multiple checkboxes without clearing existing. |
| TC-TAKE-05 | Frontend | Select true/false option | Toggles between true and false choices. |
| TC-TAKE-06 | Frontend | Navigate via Previous/Next and number grid | Preserves selected answers when moving across questions. |
| TC-TAKE-07 | Frontend | Click Submit Test | Displays confirmation dialog warning of any unanswered questions. |
| TC-TAKE-08 | Frontend | Confirm submission | Dispatches submit request and immediately routes to results page. |

