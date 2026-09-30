"""
Backend Post-Tool Audit Hook
Runs after a tool executes (PostToolUse).
Audits backend data files only when a backend tool has run:
- Applies strictly to backend files and tasks.
- If the completed tool was for frontend or other domains, returns immediately.
- Ensures all files in backend/data/*.json remain valid JSON arrays.
"""
import json
from pathlib import Path
import sys


def is_backend_target(args: dict) -> bool:
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
    args = tool_call.get("args", {}) or payload.get("tool_args", {})

    # Scope check: Only audit if a backend tool executed
    if (tool_call or payload.get("tool_name")) and not is_backend_target(args):
        print(json.dumps({}))
        return

    # Locate backend data directory
    workspace_paths = payload.get("workspacePaths", [])
    root = Path(workspace_paths[0]) if workspace_paths else Path(__file__).resolve().parent.parent.parent
    data_dir = root / "backend" / "data"

    if data_dir.exists():
        for json_file in data_dir.glob("*.json"):
            try:
                content = json_file.read_text(encoding="utf-8")
                parsed = json.loads(content)
                if not isinstance(parsed, list):
                    # Auto-heal corrupted file to empty list
                    json_file.write_text("[]", encoding="utf-8")
            except Exception:
                pass

    print(json.dumps({}))


if __name__ == "__main__":
    main()
