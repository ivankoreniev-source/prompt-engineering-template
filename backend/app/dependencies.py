from functools import lru_cache

from fastapi import Depends, Header, HTTPException, status

from app.models.user import UserInDb
from app.repositories.result_repository import ResultRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.test_repository import TestRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.result_service import ResultService
from app.services.test_service import TestService
from app.utils.paths import get_data_dir


@lru_cache
def get_user_repository() -> UserRepository:
    data_dir = get_data_dir()
    return UserRepository(data_dir / "users.json")


@lru_cache
def get_session_repository() -> SessionRepository:
    data_dir = get_data_dir()
    return SessionRepository(data_dir / "sessions.json")


@lru_cache
def get_test_repository() -> TestRepository:
    data_dir = get_data_dir()
    return TestRepository(data_dir / "tests.json")


@lru_cache
def get_result_repository() -> ResultRepository:
    data_dir = get_data_dir()
    return ResultRepository(data_dir / "results.json")


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    session_repo: SessionRepository = Depends(get_session_repository),
) -> AuthService:
    return AuthService(user_repo=user_repo, session_repo=session_repo)


def get_test_service(
    test_repo: TestRepository = Depends(get_test_repository),
) -> TestService:
    return TestService(test_repo=test_repo)


def get_result_service(
    result_repo: ResultRepository = Depends(get_result_repository),
    test_repo: TestRepository = Depends(get_test_repository),
) -> ResultService:
    return ResultService(result_repo=result_repo, test_repo=test_repo)


def get_current_user(
    authorization: str | None = Header(default=None),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserInDb:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.removeprefix("Bearer ").strip()
    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_optional_user(
    authorization: str | None = Header(default=None),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserInDb | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    return auth_service.get_user_by_token(token)
