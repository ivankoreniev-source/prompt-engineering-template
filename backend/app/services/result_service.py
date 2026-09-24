from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.models.result import (
    QuestionResult,
    ResultDetailResponse,
    ResultInDb,
    ResultSummaryResponse,
    TestSubmission,
)
from app.models.test import QuestionType
from app.models.user import UserInDb
from app.repositories.result_repository import ResultRepository
from app.repositories.test_repository import TestRepository


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ResultService:
    def __init__(
        self,
        result_repo: ResultRepository,
        test_repo: TestRepository,
    ) -> None:
        self._result_repo = result_repo
        self._test_repo = test_repo

    def evaluate_submission(
        self,
        test_id: str,
        user: UserInDb,
        submission: TestSubmission,
    ) -> ResultDetailResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if not test.is_published:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot submit answers for an unpublished test",
            )

        # Index user answers by question ID
        user_answers_map: dict[str, list[str]] = {
            ans.question_id: ans.selected_option_ids for ans in submission.answers
        }

        score = 0
        breakdown: list[QuestionResult] = []

        for q in test.questions:
            user_selected = user_answers_map.get(q.id, [])
            is_correct = False

            if q.question_type in (QuestionType.SINGLE_CHOICE, QuestionType.TRUE_FALSE):
                # Must select exactly 1 and it must be the correct answer
                if len(user_selected) == 1 and user_selected[0] in q.correct_answers:
                    is_correct = True
            elif q.question_type == QuestionType.MULTIPLE_CHOICE:
                # Must match the exact set of correct answers
                if (
                    len(user_selected) > 0
                    and set(user_selected) == set(q.correct_answers)
                ):
                    is_correct = True

            if is_correct:
                score += 1

            breakdown.append(
                QuestionResult(
                    question_id=q.id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options=q.options,
                    user_answers=user_selected,
                    correct_answers=q.correct_answers,
                    is_correct=is_correct,
                    explanation=q.explanation,
                )
            )

        total_questions = len(test.questions)
        percentage = (
            round((score / total_questions) * 100, 1) if total_questions > 0 else 0.0
        )
        passed = percentage >= 60.0

        result = ResultInDb(
            user_id=user.id,
            user_username=user.username,
            test_id=test.id,
            test_title=test.title,
            score=score,
            total_questions=total_questions,
            percentage=percentage,
            passed=passed,
            answers=submission.answers,
            breakdown=breakdown,
            completed_at=_utc_now(),
        )

        saved = self._result_repo.create(result)
        return ResultDetailResponse.from_db(saved)

    def list_my_results(self, user: UserInDb) -> list[ResultSummaryResponse]:
        results = self._result_repo.list_by_user(user.id)
        return [ResultSummaryResponse.from_db(r) for r in results]

    def get_result_by_id(
        self,
        result_id: str,
        user: UserInDb,
    ) -> ResultDetailResponse:
        result = self._result_repo.get_by_id(result_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Result with ID '{result_id}' not found",
            )
        if result.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this test result",
            )
        return ResultDetailResponse.from_db(result)

