# Tests Authoring & Catalog — Test Cases

| Test ID | Area | Scenario | Expected Result |
|---------|------|----------|-----------------|
| TC-TEST-01 | Backend | Create test with valid data | Returns `201 Created` with draft test record; stored in `tests.json`. |
| TC-TEST-02 | Backend | Unauthenticated test creation | Returns `401 Unauthorized`. |
| TC-TEST-03 | Backend | Attempt to publish test with 0 questions | Returns `400 Bad Request` with clear validation message. |
| TC-TEST-04 | Backend | Attempt to publish test with question missing correct answer | Returns `400 Bad Request` specifying question validation error. |
| TC-TEST-05 | Backend | Publish valid test | Returns `200 OK`, `is_published = true`. Test now appears in public catalog. |
| TC-TEST-06 | Backend | Non-owner attempts to edit or delete test | Returns `403 Forbidden`. |
| TC-TEST-07 | Backend | Owner deletes test | Returns `204 No Content`. Test removed from `tests.json`. |
| TC-TEST-08 | Backend | Search public catalog by keyword / category | Returns only published tests matching search criteria. |
| TC-TEST-09 | Frontend | Render Test Editor and add all 3 question types | Dynamic inputs reflect choices; validation errors show if fields blank. |
| TC-TEST-10 | Frontend | Filter catalog by category/difficulty | Cards update immediately without full reload. |

