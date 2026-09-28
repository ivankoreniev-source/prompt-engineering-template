#!/usr/bin/env python3
"""
PostToolUse hook script for Antigravity.
Audits tool execution outcomes and emits empty JSON per specification.
"""
import json
import sys

def main():
    try:
        _ = sys.stdin.read()
    except Exception:
        pass

    # PostToolUse contract expects an empty JSON object {}
    print(json.dumps({}))

if __name__ == "__main__":
    main()
