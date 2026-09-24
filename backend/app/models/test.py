from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AnswerOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str = Field(min_length=1, max_length=500)


class QuestionInput(BaseModel):
    id: str | None = None
    question_text: str = Field(min_length=1, max_length=2000)
    question_type: QuestionType = QuestionType.SINGLE_CHOICE
    options: list[AnswerOption] = Field(default_factory=list)
    correct_answers: list[str] = Field(default_factory=list)  # list of option IDs
    explanation: str = Field(default="", max_length=2000)


class QuestionInDb(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    question_text: str
    question_type: QuestionType
    options: list[AnswerOption]
    correct_answers: list[str]
    explanation: str = ""


class QuestionPublic(BaseModel):
    id: str
    question_text: str
    question_type: QuestionType
    options: list[AnswerOption]


class TestBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=3000)
    category: str = Field(default="General", min_length=1, max_length=100)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Title must not be empty")
        return s


class TestCreate(TestBase):
    questions: list[QuestionInput] = Field(default_factory=list)


class TestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=3000)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    difficulty: DifficultyLevel | None = None
    questions: list[QuestionInput] | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return None
        s = v.strip()
        if not s:
            raise ValueError("Title must not be empty")
        return s


class TestInDb(TestBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    creator_id: str
    creator_username: str
    questions: list[QuestionInDb] = Field(default_factory=list)
    is_published: bool = False
    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)


class TestSummaryResponse(BaseModel):
    id: str
    creator_id: str
    creator_username: str
    title: str
    description: str
    category: str
    difficulty: DifficultyLevel
    question_count: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, item: TestInDb) -> "TestSummaryResponse":
        return cls(
            id=item.id,
            creator_id=item.creator_id,
            creator_username=item.creator_username,
            title=item.title,
            description=item.description,
            category=item.category,
            difficulty=item.difficulty,
            question_count=len(item.questions),
            is_published=item.is_published,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )


class TestDetailResponse(BaseModel):
    id: str
    creator_id: str
    creator_username: str
    title: str
    description: str
    category: str
    difficulty: DifficultyLevel
    questions: list[QuestionInDb]
    is_published: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, item: TestInDb) -> "TestDetailResponse":
        return cls(
            id=item.id,
            creator_id=item.creator_id,
            creator_username=item.creator_username,
            title=item.title,
            description=item.description,
            category=item.category,
            difficulty=item.difficulty,
            questions=item.questions,
            is_published=item.is_published,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )


class TestTakeResponse(BaseModel):
    id: str
    creator_username: str
    title: str
    description: str
    category: str
    difficulty: DifficultyLevel
    questions: list[QuestionPublic]

    @classmethod
    def from_db(cls, item: TestInDb) -> "TestTakeResponse":
        return cls(
            id=item.id,
            creator_username=item.creator_username,
            title=item.title,
            description=item.description,
            category=item.category,
            difficulty=item.difficulty,
            questions=[
                QuestionPublic(
                    id=q.id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options=q.options,
                )
                for q in item.questions
            ],
        )

