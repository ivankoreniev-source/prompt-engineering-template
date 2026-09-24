from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user, get_result_service
from app.models.result import (
    ResultDetailResponse,
    ResultSummaryResponse,
    TestSubmission,
)
from app.models.user import UserInDb
from app.services.result_service import ResultService

router = APIRouter(tags=["results"])


@router.post(
    "/tests/{test_id}/submit",
    response_model=ResultDetailResponse,
    status_code=status.HTTP_200_OK,
)
def submit_test(
    test_id: str,
    submission: TestSubmission,
    current_user: UserInDb = Depends(get_current_user),
    service: ResultService = Depends(get_result_service),
) -> ResultDetailResponse:
    return service.evaluate_submission(test_id, current_user, submission)


@router.get(
    "/results/my",
    response_model=list[ResultSummaryResponse],
    status_code=status.HTTP_200_OK,
)
def list_my_results(
    current_user: UserInDb = Depends(get_current_user),
    service: ResultService = Depends(get_result_service),
) -> list[ResultSummaryResponse]:
    return service.list_my_results(current_user)


@router.get(
    "/results/{result_id}",
    response_model=ResultDetailResponse,
    status_code=status.HTTP_200_OK,
)
def get_result(
    result_id: str,
    current_user: UserInDb = Depends(get_current_user),
    service: ResultService = Depends(get_result_service),
) -> ResultDetailResponse:
    return service.get_result_by_id(result_id, current_user)

