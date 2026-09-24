# Tests Authoring & Catalog — Business Requirements

## Purpose

Allow registered users to create, configure, edit, delete, publish, and search tests. Provide an intuitive catalog of published tests for users to discover and take.

## Business Need

- Test creators need rich authoring capabilities to configure questions, multiple choice options, correct answers, and feedback explanations.
- Tests must be safely authored in Draft status until the creator chooses to publish them.
- Incomplete or invalid tests must never be published.
- Users need an easy way to search and filter available tests by category and difficulty.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| BR-TEST-01 | Registered users can create tests with `title`, `description`, `category`, and `difficulty` (`easy`, `medium`, `hard`). |
| BR-TEST-02 | Creators can add questions of 3 types: `single_choice`, `multiple_choice`, and `true_false`. |
| BR-TEST-03 | Each question contains question text, answer options, one or more designated correct answers, and optional explanation. |
| BR-TEST-04 | For `single_choice`, exactly one option must be marked correct. For `true_false`, options are automatically 'True' and 'False' with one marked correct. For `multiple_choice`, at least one option must be marked correct. |
| BR-TEST-05 | A test cannot be published if it has zero questions, if any question has no options, if any question has no correct answer, or if required fields are blank. |
| BR-TEST-06 | Creators can edit any test fields or questions while authored. Only the test owner can edit or delete a test. |
| BR-TEST-07 | Creators can publish or unpublish tests at any time (provided validation rules pass). |
| BR-TEST-08 | Public catalog displays only published tests with title, description, creator username, question count, difficulty badge, and category. |
| BR-TEST-09 | Support text search and filtering by category and difficulty in the catalog. |
| BR-TEST-10 | "My Tests" page displays all tests created by the logged-in user with status (Draft/Published), question counts, and quick actions. |

