import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import tempfile
import shutil

from app.main import app
from app.dependencies import (
    get_user_repository,
    get_session_repository,
    get_test_repository,
    get_result_repository,
)
from app.repositories.user_repository import UserRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.test_repository import TestRepository
from app.repositories.result_repository import ResultRepository


@pytest.fixture(autouse=True)
def isolated_storage(tmp_path: Path):
    user_repo = UserRepository(tmp_path / "users.json")
    session_repo = SessionRepository(tmp_path / "sessions.json")
    test_repo = TestRepository(tmp_path / "tests.json")
    result_repo = ResultRepository(tmp_path / "results.json")

    app.dependency_overrides[get_user_repository] = lambda: user_repo
    app.dependency_overrides[get_session_repository] = lambda: session_repo
    app.dependency_overrides[get_test_repository] = lambda: test_repo
    app.dependency_overrides[get_result_repository] = lambda: result_repo

    yield

    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_auth_workflow(client: TestClient):
    # 1. Register Alice
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    )
    assert reg_resp.status_code == 201, reg_resp.text
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "alice"
    alice_token = data["access_token"]

    # 2. Duplicate username
    dup_resp = client.post(
        "/api/auth/register",
        json={
            "username": "Alice",
            "email": "another@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    )
    assert dup_resp.status_code == 409

    # 3. Duplicate email
    dup_email = client.post(
        "/api/auth/register",
        json={
            "username": "alice2",
            "email": "alice@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    )
    assert dup_email.status_code == 409

    # 4. Login
    login_resp = client.post(
        "/api/auth/login",
        json={
            "username_or_email": "alice",
            "password": "password123",
        },
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 5. Get me
    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "alice@example.com"

    # 6. Update profile
    prof_resp = client.patch(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"bio": "Quiz master"},
    )
    assert prof_resp.status_code == 200
    assert prof_resp.json()["bio"] == "Quiz master"

    # 7. Logout
    logout_resp = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert logout_resp.status_code == 200

    # 8. Subsequent me call should fail
    fail_me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert fail_me.status_code == 401


def test_test_management_and_scoring(client: TestClient):
    # Register Alice (creator)
    alice_reg = client.post(
        "/api/auth/register",
        json={
            "username": "creator_alice",
            "email": "creator@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    ).json()
    alice_token = alice_reg["access_token"]

    # Register Bob (test taker)
    bob_reg = client.post(
        "/api/auth/register",
        json={
            "username": "taker_bob",
            "email": "bob@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    ).json()
    bob_token = bob_reg["access_token"]

    # 1. Create a draft test
    create_payload = {
        "title": "General Knowledge Test",
        "description": "A fun test on general facts",
        "category": "Science",
        "difficulty": "medium",
        "questions": [
            {
                "question_text": "What is the capital of France?",
                "question_type": "single_choice",
                "options": [
                    {"id": "opt-1", "text": "London"},
                    {"id": "opt-2", "text": "Paris"},
                    {"id": "opt-3", "text": "Berlin"},
                ],
                "correct_answers": ["opt-2"],
                "explanation": "Paris is the capital and most populous city of France.",
            },
            {
                "question_text": "Which of these are prime numbers?",
                "question_type": "multiple_choice",
                "options": [
                    {"id": "opt-4", "text": "2"},
                    {"id": "opt-5", "text": "3"},
                    {"id": "opt-6", "text": "4"},
                ],
                "correct_answers": ["opt-4", "opt-5"],
                "explanation": "2 and 3 are prime numbers; 4 is divisible by 2.",
            },
            {
                "question_text": "The Earth is flat.",
                "question_type": "true_false",
                "options": [
                    {"id": "opt-7", "text": "True"},
                    {"id": "opt-8", "text": "False"},
                ],
                "correct_answers": ["opt-8"],
                "explanation": "The Earth is an oblate spheroid.",
            },
        ],
    }

    create_resp = client.post(
        "/api/tests",
        headers={"Authorization": f"Bearer {alice_token}"},
        json=create_payload,
    )
    assert create_resp.status_code == 201, create_resp.text
    test_data = create_resp.json()
    test_id = test_data["id"]
    assert test_data["is_published"] is False
    assert len(test_data["questions"]) == 3

    # 2. Cannot take unpublished test
    take_unpub = client.get(f"/api/tests/{test_id}/take")
    assert take_unpub.status_code == 400

    # 3. Publish the test
    pub_resp = client.post(
        f"/api/tests/{test_id}/publish",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert pub_resp.status_code == 200
    assert pub_resp.json()["is_published"] is True

    # 4. Catalog lists it
    cat_resp = client.get("/api/tests")
    assert cat_resp.status_code == 200
    assert any(t["id"] == test_id for t in cat_resp.json())

    # 5. Take test endpoint: verify correct answers and explanations are stripped!
    take_resp = client.get(f"/api/tests/{test_id}/take")
    assert take_resp.status_code == 200
    take_data = take_resp.json()
    for q in take_data["questions"]:
        assert "correct_answers" not in q
        assert "explanation" not in q

    # 6. Bob submits answers:
    # Q1: opt-2 (correct)
    # Q2: opt-4, opt-5 (correct)
    # Q3: opt-7 (incorrect - chose True)
    q1_id = take_data["questions"][0]["id"]
    q2_id = take_data["questions"][1]["id"]
    q3_id = take_data["questions"][2]["id"]

    submit_payload = {
        "answers": [
            {"question_id": q1_id, "selected_option_ids": ["opt-2"]},
            {"question_id": q2_id, "selected_option_ids": ["opt-4", "opt-5"]},
            {"question_id": q3_id, "selected_option_ids": ["opt-7"]},
        ]
    }

    sub_resp = client.post(
        f"/api/tests/{test_id}/submit",
        headers={"Authorization": f"Bearer {bob_token}"},
        json=submit_payload,
    )
    assert sub_resp.status_code == 200, sub_resp.text
    result_data = sub_resp.json()

    assert result_data["score"] == 2
    assert result_data["total_questions"] == 3
    assert result_data["percentage"] == 66.7
    assert result_data["passed"] is True
    assert len(result_data["breakdown"]) == 3
    assert result_data["breakdown"][0]["is_correct"] is True
    assert result_data["breakdown"][1]["is_correct"] is True
    assert result_data["breakdown"][2]["is_correct"] is False
    assert result_data["breakdown"][0]["explanation"] != ""

    result_id = result_data["id"]

    # 7. Bob checks My Results
    my_res = client.get(
        "/api/results/my",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert my_res.status_code == 200
    assert len(my_res.json()) == 1
    assert my_res.json()[0]["id"] == result_id

    # 8. Alice cannot view Bob's result
    alice_res_view = client.get(
        f"/api/results/{result_id}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert alice_res_view.status_code == 403

    # 9. Bob cannot edit or delete Alice's test
    bob_edit = client.put(
        f"/api/tests/{test_id}",
        headers={"Authorization": f"Bearer {bob_token}"},
        json={"title": "Hacked Title"},
    )
    assert bob_edit.status_code == 403

    bob_del = client.delete(
        f"/api/tests/{test_id}",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert bob_del.status_code == 403


def test_publishing_validation_rules(client: TestClient):
    # Register user
    reg = client.post(
        "/api/auth/register",
        json={
            "username": "validator_user",
            "email": "val@example.com",
            "password": "password123",
            "password_confirm": "password123",
        },
    ).json()
    token = reg["access_token"]

    # 1. Test with 0 questions cannot be published
    t1 = client.post(
        "/api/tests",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Empty Test", "questions": []},
    ).json()
    pub1 = client.post(
        f"/api/tests/{t1['id']}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pub1.status_code == 400
    assert "at least one question" in pub1.json()["detail"]

    # 2. Test with question missing correct answer
    t2 = client.post(
        "/api/tests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "No Answer Test",
            "questions": [
                {
                    "question_text": "Sample question?",
                    "question_type": "single_choice",
                    "options": [{"id": "o1", "text": "Opt 1"}, {"id": "o2", "text": "Opt 2"}],
                    "correct_answers": [],
                }
            ],
        },
    ).json()
    pub2 = client.post(
        f"/api/tests/{t2['id']}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pub2.status_code == 400
    assert "no correct answer" in pub2.json()["detail"]

    # 3. Unpublish flow
    t3 = client.post(
        "/api/tests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Publishable Test",
            "questions": [
                {
                    "question_text": "Sample question?",
                    "question_type": "single_choice",
                    "options": [{"id": "o1", "text": "Opt 1"}, {"id": "o2", "text": "Opt 2"}],
                    "correct_answers": ["o1"],
                }
            ],
        },
    ).json()
    pub3 = client.post(
        f"/api/tests/{t3['id']}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pub3.status_code == 200
    assert pub3.json()["is_published"] is True

    # Unpublish it
    unpub = client.post(
        f"/api/tests/{t3['id']}/unpublish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert unpub.status_code == 200
    assert unpub.json()["is_published"] is False


def test_password_change(client: TestClient):
    reg = client.post(
        "/api/auth/register",
        json={
            "username": "pwd_user",
            "email": "pwd@example.com",
            "password": "original123",
            "password_confirm": "original123",
        },
    ).json()
    token = reg["access_token"]

    # Failed change: wrong current password
    fail_change = client.patch(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
    )
    assert fail_change.status_code == 400

    # Successful change
    ok_change = client.patch(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "original123", "new_password": "newpassword123"},
    )
    assert ok_change.status_code == 200

    # Can log in with new password
    login_new = client.post(
        "/api/auth/login",
        json={"username_or_email": "pwd_user", "password": "newpassword123"},
    )
    assert login_new.status_code == 200
