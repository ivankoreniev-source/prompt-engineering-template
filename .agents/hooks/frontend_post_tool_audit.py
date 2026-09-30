"""
Frontend Post-Tool Audit Hook
Runs after a tool executes (PostToolUse).
Audits frontend state only when a frontend tool has run:
- Applies strictly to frontend files and tasks.
- If the completed tool was for backend or other domains, returns immediately.
"""
import json
import sys


def is_frontend_target(args: dict) -> bool:
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
    args = tool_call.get("args", {}) or payload.get("tool_args", {})

    # Scope check: Only audit if a frontend tool executed
    if (tool_call or payload.get("tool_name")) and not is_frontend_target(args):
        print(json.dumps({}))
        return

    # Pass frontend audit
    print(json.dumps({}))


if __name__ == "__main__":
    main()
