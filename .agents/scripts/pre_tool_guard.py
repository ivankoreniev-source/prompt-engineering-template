#!/usr/bin/env python3
"""
PreToolUse hook script for Antigravity.
Inspects run_command tool calls to prevent accidental destructive operations
on critical project files (e.g., deleting brd.txt or backend/data).
"""
import json
import sys

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"decision": "allow"}))
            return

        payload = json.loads(raw_input)
        tool_call = payload.get("toolCall", {})
        args = tool_call.get("args", {})
        cmd = args.get("CommandLine", "").strip()

        # Critical files/directories that should never be deleted by commands
        protected = ["brd.txt", ".git", "backend/data", "backend\\data"]
        lower_cmd = cmd.lower()

        # Check for dangerous removal commands targeting protected assets
        is_rm = any(token in lower_cmd for token in ["rm -rf", "remove-item", "del /f", "rd /s", "rmdir /s"])
        if is_rm and any(target in lower_cmd for target in protected):
            print(json.dumps({
                "decision": "deny",
                "reason": f"Safety hook blocked potentially destructive command targeting protected project assets: '{cmd}'"
            }))
            return

        print(json.dumps({"decision": "allow"}))
    except Exception:
        # Fallback to allow on unexpected parse error to avoid breaking workflow
        print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()
