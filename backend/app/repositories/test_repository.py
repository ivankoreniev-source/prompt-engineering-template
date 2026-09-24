from pathlib import Path

from app.models.test import TestInDb
from app.utils.json_store import read_list_file, write_list_file


class TestRepository:
    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    def list_all(self) -> list[TestInDb]:
        return read_list_file(self._file_path, TestInDb)

    def list_published(
        self,
        search: str | None = None,
        category: str | None = None,
        difficulty: str | None = None,
    ) -> list[TestInDb]:
        items = [t for t in self.list_all() if t.is_published]
        if search:
            q = search.lower()
            items = [
                t
                for t in items
                if q in t.title.lower()
                or q in t.description.lower()
                or q in t.creator_username.lower()
            ]
        if category and category.lower() != "all":
            items = [t for t in items if t.category.lower() == category.lower()]
        if difficulty and difficulty.lower() != "all":
            items = [t for t in items if t.difficulty.value.lower() == difficulty.lower()]
        # Sort newest first
        items.sort(key=lambda t: t.created_at, reverse=True)
        return items

    def list_by_creator(self, creator_id: str) -> list[TestInDb]:
        items = [t for t in self.list_all() if t.creator_id == creator_id]
        items.sort(key=lambda t: t.created_at, reverse=True)
        return items

    def get_by_id(self, test_id: str) -> TestInDb | None:
        return next((t for t in self.list_all() if t.id == test_id), None)

    def create(self, test: TestInDb) -> TestInDb:
        tests = self.list_all()
        tests.append(test)
        write_list_file(self._file_path, tests)
        return test

    def update(self, test: TestInDb) -> TestInDb:
        tests = self.list_all()
        for idx, existing in enumerate(tests):
            if existing.id == test.id:
                tests[idx] = test
                write_list_file(self._file_path, tests)
                return test
        raise KeyError(test.id)

    def delete(self, test_id: str) -> bool:
        tests = self.list_all()
        filtered = [t for t in tests if t.id != test_id]
        if len(filtered) == len(tests):
            return False
        write_list_file(self._file_path, filtered)
        return True

