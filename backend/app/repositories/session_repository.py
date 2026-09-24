from pathlib import Path

from app.models.user import SessionInDb
from app.utils.json_store import read_list_file, write_list_file


class SessionRepository:
    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    def list_all(self) -> list[SessionInDb]:
        return read_list_file(self._file_path, SessionInDb)

    def get_by_token(self, token: str) -> SessionInDb | None:
        return next((s for s in self.list_all() if s.token == token), None)

    def create(self, session: SessionInDb) -> SessionInDb:
        sessions = self.list_all()
        sessions.append(session)
        write_list_file(self._file_path, sessions)
        return session

    def delete_by_token(self, token: str) -> bool:
        sessions = self.list_all()
        filtered = [s for s in sessions if s.token != token]
        if len(filtered) == len(sessions):
            return False
        write_list_file(self._file_path, filtered)
        return True

    def delete_by_user_id(self, user_id: str) -> None:
        sessions = self.list_all()
        filtered = [s for s in sessions if s.user_id != user_id]
        write_list_file(self._file_path, filtered)

