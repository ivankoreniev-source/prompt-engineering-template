from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.test import (
    AnswerOption,
    QuestionInDb,
    QuestionInput,
    QuestionType,
    TestCreate,
    TestDetailResponse,
    TestInDb,
    TestSummaryResponse,
    TestTakeResponse,
    TestUpdate,
)
from app.models.user import UserInDb
from app.repositories.test_repository import TestRepository


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TestService:
    def __init__(self, test_repo: TestRepository) -> None:
        self._test_repo = test_repo

    def _convert_questions(self, inputs: list[QuestionInput]) -> list[QuestionInDb]:
        questions: list[QuestionInDb] = []
        for q in inputs:
            q_id = q.id if q.id else str(uuid4())
            # Ensure options have IDs
            options: list[AnswerOption] = []
            for opt in q.options:
                opt_id = opt.id if opt.id else str(uuid4())
                options.append(AnswerOption(id=opt_id, text=opt.text.strip()))

            # If true/false and options are empty, generate standard True/False options
            if q.question_type == QuestionType.TRUE_FALSE and len(options) == 0:
                options = [
                    AnswerOption(id=str(uuid4()), text="True"),
                    AnswerOption(id=str(uuid4()), text="False"),
                ]

            questions.append(
                QuestionInDb(
                    id=q_id,
                    question_text=q.question_text.strip(),
                    question_type=q.question_type,
                    options=options,
                    correct_answers=q.correct_answers,
                    explanation=q.explanation.strip(),
                )
            )
        return questions

    def create_test(self, user: UserInDb, dto: TestCreate) -> TestDetailResponse:
        questions = self._convert_questions(dto.questions)
        test = TestInDb(
            creator_id=user.id,
            creator_username=user.username,
            title=dto.title,
            description=dto.description,
            category=dto.category,
            difficulty=dto.difficulty,
            questions=questions,
            is_published=False,
        )
        saved = self._test_repo.create(test)
        return TestDetailResponse.from_db(saved)

    def update_test(
        self,
        test_id: str,
        user: UserInDb,
        dto: TestUpdate,
    ) -> TestDetailResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if test.creator_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this test",
            )

        if dto.title is not None:
            test.title = dto.title
        if dto.description is not None:
            test.description = dto.description
        if dto.category is not None:
            test.category = dto.category
        if dto.difficulty is not None:
            test.difficulty = dto.difficulty
        if dto.questions is not None:
            test.questions = self._convert_questions(dto.questions)

        test.updated_at = _utc_now()
        saved = self._test_repo.update(test)
        return TestDetailResponse.from_db(saved)

    def delete_test(self, test_id: str, user: UserInDb) -> None:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if test.creator_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this test",
            )
        self._test_repo.delete(test_id)

    def validate_for_publishing(self, test: TestInDb) -> None:
        if not test.title or not test.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test title cannot be empty",
            )
        if not test.questions or len(test.questions) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A test must contain at least one question to be published",
            )

        for idx, q in enumerate(test.questions, start=1):
            if not q.question_text or not q.question_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question #{idx} text cannot be empty",
                )
            if len(q.options) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question #{idx} ('{q.question_text[:30]}...') must have at least 2 answer options",
                )
            if not q.correct_answers or len(q.correct_answers) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question #{idx} ('{q.question_text[:30]}...') has no correct answer configured",
                )

            valid_option_ids = {opt.id for opt in q.options}
            for ca in q.correct_answers:
                if ca not in valid_option_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Question #{idx} references an invalid correct answer option",
                    )

            if q.question_type in (QuestionType.SINGLE_CHOICE, QuestionType.TRUE_FALSE):
                if len(q.correct_answers) != 1:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Question #{idx} must have exactly one correct answer",
                    )
            elif q.question_type == QuestionType.MULTIPLE_CHOICE:
                if len(q.correct_answers) < 1:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Question #{idx} must have at least one correct answer",
                    )

    def publish_test(self, test_id: str, user: UserInDb) -> TestDetailResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if test.creator_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to publish this test",
            )

        self.validate_for_publishing(test)
        test.is_published = True
        test.updated_at = _utc_now()
        saved = self._test_repo.update(test)
        return TestDetailResponse.from_db(saved)

    def unpublish_test(self, test_id: str, user: UserInDb) -> TestDetailResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if test.creator_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to unpublish this test",
            )
        test.is_published = False
        test.updated_at = _utc_now()
        saved = self._test_repo.update(test)
        return TestDetailResponse.from_db(saved)

    def list_published(
        self,
        search: str | None = None,
        category: str | None = None,
        difficulty: str | None = None,
    ) -> list[TestSummaryResponse]:
        tests = self._test_repo.list_published(search, category, difficulty)
        return [TestSummaryResponse.from_db(t) for t in tests]

    def list_my_tests(self, user: UserInDb) -> list[TestSummaryResponse]:
        tests = self._test_repo.list_by_creator(user.id)
        return [TestSummaryResponse.from_db(t) for t in tests]

    def get_test_for_creator(self, test_id: str, user: UserInDb) -> TestDetailResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if test.creator_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view full draft details of this test",
            )
        return TestDetailResponse.from_db(test)

    def get_test_for_taking(self, test_id: str) -> TestTakeResponse:
        test = self._test_repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID '{test_id}' not found",
            )
        if not test.is_published:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This test is not published and cannot be taken",
            )
        return TestTakeResponse.from_db(test)

