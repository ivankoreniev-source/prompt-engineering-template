#!/usr/bin/env python3
"""
PreInvocation hook script for Antigravity.
Injects ephemeral reminders regarding QuizCraft's architectural conventions.
"""
import json
import sys

def main():
    try:
        # Consume any stdin
        _ = sys.stdin.read()
    except Exception:
        pass

    output = {
        "injectSteps": [
            {
                "ephemeralMessage": "QuizCraft System Reminder: Maintain layered FastAPI architecture (routers -> services -> repositories -> data/*.json), use RTK Query for frontend API state, and keep docs consolidated under docs/<feature>/."
            }
        ]
    }
    print(json.dumps(output))

if __name__ == "__main__":
    main()
