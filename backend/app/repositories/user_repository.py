from pathlib import Path

from app.models.user import UserInDb
from app.utils.json_store import read_list_file, write_list_file


class UserRepository:
    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    def list_all(self) -> list[UserInDb]:
        return read_list_file(self._file_path, UserInDb)

    def get_by_id(self, user_id: str) -> UserInDb | None:
        return next((u for u in self.list_all() if u.id == user_id), None)

    def get_by_username(self, username: str) -> UserInDb | None:
        target = username.lower()
        return next((u for u in self.list_all() if u.username.lower() == target), None)

    def get_by_email(self, email: str) -> UserInDb | None:
        target = email.lower()
        return next((u for u in self.list_all() if u.email.lower() == target), None)

    def create(self, user: UserInDb) -> UserInDb:
        users = self.list_all()
        users.append(user)
        write_list_file(self._file_path, users)
        return user

    def update(self, user: UserInDb) -> UserInDb:
        users = self.list_all()
        for idx, existing in enumerate(users):
            if existing.id == user.id:
                users[idx] = user
                write_list_file(self._file_path, users)
                return user
        raise KeyError(user.id)

    def delete(self, user_id: str) -> bool:
        users = self.list_all()
        filtered = [u for u in users if u.id != user_id]
        if len(filtered) == len(users):
            return False
        write_list_file(self._file_path, filtered)
        return True

