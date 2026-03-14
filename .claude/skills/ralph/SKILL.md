---
name: ralph
description: Autonomous iterative development loop. Use when the user asks to run Ralph, iterate autonomously, or complete a multi-step task in a loop until done. Implements the Ralph Wiggum technique for persistent self-improving iteration.
user_invocable: true
---

# Ralph — Autonomous Iteration Loop

Run an autonomous development loop that iterates on a task until completion.

## How It Works

1. Read the task description from the user prompt or a referenced file (e.g. PRD, TODO list)
2. Execute one iteration of work toward the goal
3. Review your own output — check for errors, test failures, incomplete items
4. If the task is NOT complete, continue to the next iteration
5. Repeat until ALL items are done or max iterations reached

## Rules

- **One focused change per iteration** — small, testable increments
- **Self-review after each step** — run tests, lint, verify output before moving on
- **Track progress** — use TodoWrite to mark completed items and remaining work
- **Commit frequently** — atomic commits after each meaningful change
- **Exit when done** — when all acceptance criteria are met, stop and summarize what was accomplished
- **Safety cap** — if no max-iterations is specified, default to 10 iterations maximum

## Usage

```
/ralph "Implement all items from PRD.md" --max-iterations 15
/ralph "Fix all failing tests" --completion-promise "All tests pass"
/ralph "Refactor components to use new design system"
```

## Iteration Template

For each iteration:
1. Assess current state (what's done, what's left)
2. Pick the highest-priority remaining item
3. Implement it
4. Verify it works (run tests/build if applicable)
5. Commit the change
6. Update progress tracking
7. Decide: continue or exit
