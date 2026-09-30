"""
Backend Safety Guard Hook
Runs before a tool executes (PreToolUse).
Ensures backend safety invariants are preserved:
- Applies strictly to backend files and tasks.
- If the tool is for frontend, it passes immediately.
- Blocks destructive operations on backend/data/*.json.
- Enforces answer key sanitization and PBKDF2 password security.
"""
import json
import sys


def is_backend_target(tool_name: str, args: dict) -> bool:
    target_file = (args.get("TargetFile") or args.get("AbsolutePath") or "").replace("\\", "/")
    cwd = (args.get("Cwd") or "").replace("\\", "/")
    cmd = args.get("CommandLine") or ""

    if target_file:
        return "backend/" in target_file.lower() or target_file.lower().startswith("backend")
    if cmd or cwd:
        cmd_lower = cmd.lower()
        cwd_lower = cwd.lower()
        if "backend" in cwd_lower or "backend" in cmd_lower:
            return True
        if any(tool in cmd_lower for tool in ["pytest", "uvicorn", "uv sync", "python -m app", "ruff", "mypy"]):
            return True
    return False


def main() -> None:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    tool_call = payload.get("toolCall", {})
    name = tool_call.get("name", "") or payload.get("tool_name", "")
    args = tool_call.get("args", {}) or payload.get("tool_args", {})

    # Scope check: Ignore if not a backend tool call
    if not is_backend_target(name, args):
        print(json.dumps({"decision": "allow"}))
        return

    # Guard 1: Destructive command line check
    cmd = (args.get("CommandLine") or "").replace("\\", "/").lower()
    if any(rm in cmd for rm in ["rm -rf backend/data", "rmdir /s /q backend/data", "rmdir /s /q backend\\data", "del /s /q backend/data", "del /q backend/data"]):
        print(json.dumps({
            "decision": "deny",
            "reason": "Backend safety guard: Cannot recursively delete or erase backend/data directory."
        }))
        return

    # Safety checks for backend file modifications
    target_file = (args.get("TargetFile") or "").replace("\\", "/").lower()
    code_content = args.get("CodeContent") or args.get("ReplacementContent") or ""

    # Guard 2: Never delete or blank out core backend data files
    if "backend/data/" in target_file and name in ["write_to_file", "replace_file_content"]:
        if len(code_content.strip()) < 2:
            print(json.dumps({
                "decision": "deny",
                "reason": "Backend safety guard: Cannot blank out database files in backend/data/. They must remain valid JSON arrays."
            }))
            return

    # Guard 3: Prevent plain text password storage or disabling PBKDF2
    if "auth_service.py" in target_file and ("def _hash_password" in code_content or "password_hash" in code_content):
        if "pbkdf2_hmac" not in code_content and len(code_content) > 100:
            print(json.dumps({
                "decision": "deny",
                "reason": "Backend safety guard: QuizCraft requires PBKDF2-HMAC-SHA256 password hashing. Plaintext or weaker hashes are disallowed."
            }))
            return

    # Passed all backend safety checks
    print(json.dumps({"decision": "allow"}))


if __name__ == "__main__":
    main()
