from fastapi import APIRouter, Depends, Query, status

from app.dependencies import get_current_user, get_test_service
from app.models.test import (
    TestCreate,
    TestDetailResponse,
    TestSummaryResponse,
    TestTakeResponse,
    TestUpdate,
)
from app.models.user import UserInDb
from app.services.test_service import TestService

router = APIRouter(prefix="/tests", tags=["tests"])


@router.get(
    "",
    response_model=list[TestSummaryResponse],
    status_code=status.HTTP_200_OK,
)
def list_published_tests(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    service: TestService = Depends(get_test_service),
) -> list[TestSummaryResponse]:
    return service.list_published(search=search, category=category, difficulty=difficulty)


@router.get(
    "/my",
    response_model=list[TestSummaryResponse],
    status_code=status.HTTP_200_OK,
)
def list_my_tests(
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> list[TestSummaryResponse]:
    return service.list_my_tests(current_user)


@router.get(
    "/{test_id}",
    response_model=TestDetailResponse,
    status_code=status.HTTP_200_OK,
)
def get_test_details(
    test_id: str,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> TestDetailResponse:
    return service.get_test_for_creator(test_id, current_user)


@router.get(
    "/{test_id}/take",
    response_model=TestTakeResponse,
    status_code=status.HTTP_200_OK,
)
def get_test_for_taking(
    test_id: str,
    service: TestService = Depends(get_test_service),
) -> TestTakeResponse:
    return service.get_test_for_taking(test_id)


@router.post(
    "",
    response_model=TestDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_test(
    dto: TestCreate,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> TestDetailResponse:
    return service.create_test(current_user, dto)


@router.put(
    "/{test_id}",
    response_model=TestDetailResponse,
    status_code=status.HTTP_200_OK,
)
def update_test(
    test_id: str,
    dto: TestUpdate,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> TestDetailResponse:
    return service.update_test(test_id, current_user, dto)


@router.post(
    "/{test_id}/publish",
    response_model=TestDetailResponse,
    status_code=status.HTTP_200_OK,
)
def publish_test(
    test_id: str,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> TestDetailResponse:
    return service.publish_test(test_id, current_user)


@router.post(
    "/{test_id}/unpublish",
    response_model=TestDetailResponse,
    status_code=status.HTTP_200_OK,
)
def unpublish_test(
    test_id: str,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> TestDetailResponse:
    return service.unpublish_test(test_id, current_user)


@router.delete(
    "/{test_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_test(
    test_id: str,
    current_user: UserInDb = Depends(get_current_user),
    service: TestService = Depends(get_test_service),
) -> None:
    service.delete_test(test_id, current_user)

