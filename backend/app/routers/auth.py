from fastapi import APIRouter, Depends, Header, status

from app.dependencies import get_auth_service, get_current_user
from app.models.user import (
    AuthTokenResponse,
    UserInDb,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    dto: UserRegister,
    service: AuthService = Depends(get_auth_service),
) -> AuthTokenResponse:
    return service.register(dto)


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    dto: UserLogin,
    service: AuthService = Depends(get_auth_service),
) -> AuthTokenResponse:
    return service.login(dto)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def logout(
    authorization: str | None = Header(default=None),
    service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        service.logout(token)
    return {"message": "Logged out successfully"}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: UserInDb = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.from_db(current_user)


@router.patch(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def update_profile(
    dto: UserProfileUpdate,
    current_user: UserInDb = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    return service.update_profile(current_user, dto)

