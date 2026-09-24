from datetime import datetime, timezone
import re
from uuid import uuid4

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6, max_length=100)
    password_confirm: str = Field(min_length=6, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        trimmed = value.strip()
        if not USERNAME_REGEX.match(trimmed):
            raise ValueError("Username must be 3-30 characters and contain only letters, numbers, and underscores")
        return trimmed

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        trimmed = value.strip().lower()
        if "@" not in trimmed or "." not in trimmed.split("@")[-1]:
            raise ValueError("Invalid email format")
        return trimmed

    @model_validator(mode="after")
    def passwords_match(self) -> "UserRegister":
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    username_or_email: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=100)

    @field_validator("username_or_email")
    @classmethod
    def trim_identifier(cls, value: str) -> str:
        return value.strip()


class UserProfileUpdate(BaseModel):
    email: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=500)
    current_password: str | None = Field(default=None, max_length=100)
    new_password: str | None = Field(default=None, min_length=6, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email_opt(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip().lower()
        if "@" not in trimmed or "." not in trimmed.split("@")[-1]:
            raise ValueError("Invalid email format")
        return trimmed


class UserInDb(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    username: str
    email: str
    password_hash: str
    salt: str
    bio: str = ""
    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    bio: str
    created_at: datetime

    @classmethod
    def from_db(cls, user: UserInDb) -> "UserResponse":
        return cls(
            id=user.id,
            username=user.username,
            email=user.email,
            bio=user.bio,
            created_at=user.created_at,
        )


class SessionInDb(BaseModel):
    token: str
    user_id: str
    created_at: datetime = Field(default_factory=_utc_now)


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

