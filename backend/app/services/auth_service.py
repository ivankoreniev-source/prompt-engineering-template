from datetime import datetime, timezone
import hashlib
import hmac
import secrets

from fastapi import HTTPException, status

from app.models.user import (
    AuthTokenResponse,
    SessionInDb,
    UserInDb,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        session_repo: SessionRepository,
    ) -> None:
        self._user_repo = user_repo
        self._session_repo = session_repo

    @staticmethod
    def _hash_password(password: str, salt: str) -> str:
        return hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000,
        ).hex()

    def register(self, dto: UserRegister) -> AuthTokenResponse:
        # Check uniqueness
        if self._user_repo.get_by_username(dto.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{dto.username}' is already taken",
            )
        if self._user_repo.get_by_email(dto.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{dto.email}' is already registered",
            )

        salt = secrets.token_hex(16)
        password_hash = self._hash_password(dto.password, salt)

        user = UserInDb(
            username=dto.username,
            email=dto.email,
            password_hash=password_hash,
            salt=salt,
        )
        saved_user = self._user_repo.create(user)

        # Create session
        token = secrets.token_urlsafe(32)
        session = SessionInDb(token=token, user_id=saved_user.id)
        self._session_repo.create(session)

        return AuthTokenResponse(
            access_token=token,
            user=UserResponse.from_db(saved_user),
        )

    def login(self, dto: UserLogin) -> AuthTokenResponse:
        identifier = dto.username_or_email.strip()
        user = self._user_repo.get_by_username(identifier) or self._user_repo.get_by_email(identifier)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        calculated = self._hash_password(dto.password, user.salt)
        if not hmac.compare_digest(calculated, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        token = secrets.token_urlsafe(32)
        session = SessionInDb(token=token, user_id=user.id)
        self._session_repo.create(session)

        return AuthTokenResponse(
            access_token=token,
            user=UserResponse.from_db(user),
        )

    def logout(self, token: str) -> None:
        self._session_repo.delete_by_token(token)

    def get_user_by_token(self, token: str) -> UserInDb | None:
        session = self._session_repo.get_by_token(token)
        if not session:
            return None
        return self._user_repo.get_by_id(session.user_id)

    def update_profile(self, user: UserInDb, dto: UserProfileUpdate) -> UserResponse:
        updated = False

        if dto.email and dto.email.lower() != user.email.lower():
            existing = self._user_repo.get_by_email(dto.email)
            if existing and existing.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Email '{dto.email}' is already in use",
                )
            user.email = dto.email
            updated = True

        if dto.bio is not None and dto.bio != user.bio:
            user.bio = dto.bio
            updated = True

        if dto.new_password:
            if not dto.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password",
                )
            current_hash = self._hash_password(dto.current_password, user.salt)
            if not hmac.compare_digest(current_hash, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password does not match",
                )
            user.salt = secrets.token_hex(16)
            user.password_hash = self._hash_password(dto.new_password, user.salt)
            updated = True

        if updated:
            user.updated_at = _utc_now()
            self._user_repo.update(user)

        return UserResponse.from_db(user)

