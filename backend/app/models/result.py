from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field

from app.models.test import AnswerOption, QuestionType


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserAnswerSubmission(BaseModel):
    question_id: str
    selected_option_ids: list[str] = Field(default_factory=list)


class TestSubmission(BaseModel):
    answers: list[UserAnswerSubmission] = Field(default_factory=list)


class QuestionResult(BaseModel):
    question_id: str
    question_text: str
    question_type: QuestionType
    options: list[AnswerOption]
    user_answers: list[str]  # selected option IDs
    correct_answers: list[str]  # correct option IDs
    is_correct: bool
    explanation: str = ""


class ResultInDb(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    user_username: str
    test_id: str
    test_title: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    answers: list[UserAnswerSubmission]
    breakdown: list[QuestionResult]
    completed_at: datetime = Field(default_factory=_utc_now)


class ResultSummaryResponse(BaseModel):
    id: str
    user_id: str
    user_username: str
    test_id: str
    test_title: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    completed_at: datetime

    @classmethod
    def from_db(cls, item: ResultInDb) -> "ResultSummaryResponse":
        return cls(
            id=item.id,
            user_id=item.user_id,
            user_username=item.user_username,
            test_id=item.test_id,
            test_title=item.test_title,
            score=item.score,
            total_questions=item.total_questions,
            percentage=item.percentage,
            passed=item.passed,
            completed_at=item.completed_at,
        )


class ResultDetailResponse(BaseModel):
    id: str
    user_id: str
    user_username: str
    test_id: str
    test_title: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    breakdown: list[QuestionResult]
    completed_at: datetime

    @classmethod
    def from_db(cls, item: ResultInDb) -> "ResultDetailResponse":
        return cls(
            id=item.id,
            user_id=item.user_id,
            user_username=item.user_username,
            test_id=item.test_id,
            test_title=item.test_title,
            score=item.score,
            total_questions=item.total_questions,
            percentage=item.percentage,
            passed=item.passed,
            breakdown=item.breakdown,
            completed_at=item.completed_at,
        )

