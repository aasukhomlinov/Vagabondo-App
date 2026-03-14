---
name: simplify
description: Review changed code for reuse opportunities, quality issues, and efficiency improvements, then fix any issues found. Use after completing a feature or refactor to ensure code quality.
user_invocable: true
---

# Simplify — Code Quality Review

Review recently changed code and simplify it. Look for:

## What to Check

1. **Dead code** — unused imports, variables, functions, unreachable branches
2. **Duplication** — repeated logic that should be extracted into a shared helper
3. **Over-engineering** — unnecessary abstractions, premature generalization, excessive configuration
4. **Naming** — unclear variable/function names, inconsistent conventions
5. **Performance** — unnecessary re-renders, missing memoization, expensive operations in loops
6. **Simplification** — complex conditionals that can be flattened, deeply nested code

## Process

1. Identify all files changed in the current session or recent commits
2. Read each changed file
3. For each issue found, fix it directly (don't just report)
4. Run tests/build after fixes to verify nothing broke
5. Summarize what was simplified

## Rules

- Only touch code that was recently changed — don't refactor the entire codebase
- Prefer deleting code over adding abstractions
- Keep fixes minimal and focused
- If unsure whether a simplification is safe, leave it and note it
