"""
Backend Architecture Reminder Hook
Runs before model invocation (PreInvocation).
Injects contextual reminders ONLY when backend development is actively in scope:
- Checks the most recent tool calls in reverse order for immediate domain target.
- Ignores tasks that are strictly frontend or cross-cutting / general reviews.
- Strict layer separation: Routers -> Services -> Repositories
- Pydantic v2 schemas and validation
- Atomic writes for JSON storage
- Complete answer sanitization in take endpoints
"""
import json
import os
import sys


def detect_active_context(transcript_path: str) -> str | None:
    if not transcript_path or not os.path.exists(transcript_path):
        return None
    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception:
        return None

    last_user_input = ""
    user_idx = len(lines)
    for i, line in enumerate(lines):
        try:
            step = json.loads(line)
            if step.get("type") == "USER_INPUT":
                last_user_input = step.get("content", "")
                user_idx = i
        except Exception:
            pass

    # Collect tool calls since the last user input
    recent_tools = []
    for line in lines[user_idx:]:
        try:
            step = json.loads(line)
            for tc in step.get("tool_calls", []):
                recent_tools.append((tc.get("name"), tc.get("args", {})))
        except Exception:
            pass

    # If recent tool calls occurred, check the most recent tool targets first
    if recent_tools:
        for _, args in reversed(recent_tools):
            target = (
                (args.get("TargetFile") or args.get("AbsolutePath") or "")
                + " "
                + (args.get("CommandLine") or "")
                + " "
                + (args.get("Cwd") or "")
            ).replace("\\", "/").lower()

            is_be = "backend" in target or any(
                k in target for k in ["pytest", "uvicorn", "fastapi", "ruff", "mypy", "pyproject.toml"]
            )
            is_fe = "frontend" in target or any(
                k in target for k in ["npm", "vite", "oxlint", "prettier", "tsx", "jsx", "package.json"]
            )

            if is_be and not is_fe:
                return "backend"
            if is_fe and not is_be:
                return "frontend"

    # If no tool calls had a domain target yet, analyze user prompt text
    prompt = last_user_input.lower()
    has_backend = any(
        k in prompt
        for k in [
            "backend",
            "fastapi",
            "pytest",
            "uvicorn",
            "router",
            "service",
            "repository",
            "pydantic",
            "ruff",
            "mypy",
        ]
    )
    has_frontend = any(
        k in prompt
        for k in [
            "frontend",
            "react",
            "vite",
            "component",
            "tailwind",
            "shadcn",
            "oxlint",
            "prettier",
        ]
    )

    if has_backend and not has_frontend:
        return "backend"
    if has_frontend and not has_backend:
        return "frontend"

    # Cross-cutting or general review: do not inject domain-specific architecture reminder
    return None


def main() -> None:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    transcript_path = payload.get("transcriptPath", "")
    context = detect_active_context(transcript_path)

    if context != "backend":
        print(json.dumps({"injectSteps": []}))
        return

    reminder = (
        "[Backend Architecture Rule] QuizCraft backend mandates strict layer isolation: "
        "Routers (HTTP/status codes) -> Services (business logic & scoring) -> Repositories (JSON persistence). "
        "All data writes to backend/data/*.json must be atomic, and GET /api/tests/{id}/take must strictly omit answer keys."
    )

    print(json.dumps({
        "injectSteps": [
            {
                "ephemeralMessage": reminder
            }
        ]
    }))


if __name__ == "__main__":
    main()
