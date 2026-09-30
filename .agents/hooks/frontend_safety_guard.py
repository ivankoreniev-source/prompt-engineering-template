"""
Frontend Safety Guard Hook
Runs before a tool executes (PreToolUse).
Ensures frontend safety invariants:
- Applies strictly to frontend files and tasks.
- If the tool is for backend, it passes immediately.
- Disallows hardcoding backend API URLs inside components (must use config.ts).
- Disallows storing sensitive passwords in localStorage.
- Enforces that test-taking components do not leak answer keys.
"""
import json
import sys


def is_frontend_target(tool_name: str, args: dict) -> bool:
    target_file = (args.get("TargetFile") or args.get("AbsolutePath") or "").replace("\\", "/")
    cwd = (args.get("Cwd") or "").replace("\\", "/")
    cmd = args.get("CommandLine") or ""

    if target_file:
        return "frontend/" in target_file.lower() or target_file.lower().startswith("frontend")
    if cmd or cwd:
        cmd_lower = cmd.lower()
        cwd_lower = cwd.lower()
        if "frontend" in cwd_lower or "frontend" in cmd_lower:
            return True
        if any(tool in cmd_lower for tool in ["npm", "vite", "oxlint", "tsc", "prettier"]):
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

    # Scope check: Ignore if not a frontend tool call
    if not is_frontend_target(name, args):
        print(json.dumps({"decision": "allow"}))
        return

    # Guard 0: Destructive command line check
    cmd = (args.get("CommandLine") or "").replace("\\", "/").lower()
    if any(rm in cmd for rm in ["rm -rf frontend/src", "rmdir /s /q frontend/src", "rmdir /s /q frontend\\src", "rm -rf frontend", "rmdir /s /q frontend"]):
        print(json.dumps({
            "decision": "deny",
            "reason": "Frontend safety guard: Destructive deletion of frontend source directories is blocked."
        }))
        return

    target_file = (args.get("TargetFile") or "").replace("\\", "/").lower()
    code_content = args.get("CodeContent") or args.get("ReplacementContent") or ""

    # Guard 1: Prevent hardcoding backend URLs in component files (except in lib/config.ts)
    if "frontend/src/" in target_file and not target_file.endswith("config.ts"):
        if "http://localhost:8001" in code_content or "http://127.0.0.1:8001" in code_content:
            print(json.dumps({
                "decision": "deny",
                "reason": "Frontend safety guard: Do not hardcode API URLs in components. Import API_BASE_URL from '@/lib/config' instead."
            }))
            return

    # Guard 2: Prevent storing plain passwords in localStorage
    if "localstorage.setitem" in code_content.lower() and "password" in code_content.lower():
        print(json.dumps({
            "decision": "deny",
            "reason": "Frontend safety guard: Plaintext passwords must never be stored in localStorage."
        }))
        return

    # Guard 3: Prevent exposing correct answers in TakeTestPage
    if "taketestpage" in target_file and "correct_answers" in code_content:
        print(json.dumps({
            "decision": "deny",
            "reason": "Frontend safety guard: TakeTestPage must not reference correct_answers; questions must remain sanitized during test taking."
        }))
        return

    print(json.dumps({"decision": "allow"}))


if __name__ == "__main__":
    main()
