# Test Taking — Architecture

## Overview

The test-taking subsystem implements privacy-first delivery of test questions and robust client-side answer state management.

```mermaid
sequenceDiagram
    participant User as Test Taker
    participant UI as TakeTestPage (React)
    participant API as /api/tests/{id}/take
    participant Submitter as /api/tests/{id}/submit
    participant Results as ResultService

    User->>UI: Click "Start Test"
    UI->>API: GET /api/tests/{id}/take
    API-->>UI: TestTakeResponse (questions WITHOUT correct answers)
    loop Answering
        User->>UI: Select option(s), navigate Next / Prev
        UI->>UI: Update answers state map [questionId -> optionIds]
    end
    User->>UI: Click "Review & Submit"
    UI->>User: Display Review Modal & Confirmation
    User->>UI: Confirm "Submit Now"
    UI->>Submitter: POST /api/tests/{id}/submit (User Answers)
    Submitter->>Results: Grade submission
    Results-->>UI: Complete ResultDetailResponse
    UI->>User: Navigate to #result/:resultId
```

## Security & Sanitization

- Server-side DTO `TestTakeResponse` specifically strips out `correct_answers` and `explanation`.
- Inspecting network requests in browser DevTools reveals zero hints about which options are correct.
- Submission payload: `answers: list[UserAnswerSubmission]` where each entry is `{ question_id: str, selected_option_ids: list[str] }`.

## Client-Side State Management

- Answers stored in local React state keyed by `question_id: string[]`.
- Unsaved changes alert when attempting to navigate away before submission.

