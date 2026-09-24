from pathlib import Path

from app.models.result import ResultInDb
from app.utils.json_store import read_list_file, write_list_file


class ResultRepository:
    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    def list_all(self) -> list[ResultInDb]:
        return read_list_file(self._file_path, ResultInDb)

    def list_by_user(self, user_id: str) -> list[ResultInDb]:
        items = [r for r in self.list_all() if r.user_id == user_id]
        items.sort(key=lambda r: r.completed_at, reverse=True)
        return items

    def list_by_test(self, test_id: str) -> list[ResultInDb]:
        items = [r for r in self.list_all() if r.test_id == test_id]
        items.sort(key=lambda r: r.completed_at, reverse=True)
        return items

    def get_by_id(self, result_id: str) -> ResultInDb | None:
        return next((r for r in self.list_all() if r.id == result_id), None)

    def create(self, result: ResultInDb) -> ResultInDb:
        results = self.list_all()
        results.append(result)
        write_list_file(self._file_path, results)
        return result

