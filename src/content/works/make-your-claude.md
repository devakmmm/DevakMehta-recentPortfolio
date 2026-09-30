---
title: make-your-claude
year: 2026
role: hooks, tests
tags: [Claude Code, discipline, MIT]
link: https://github.com/devakmmm/make-your-claude
---

Six small hooks for Claude Code that make the agent work like a careful engineer: it proves what it
claims, shows its diff before it pushes, and keeps what it did not write. Standard library only,
24 tests, used daily before it was published.

- A stop hook that holds the end of a turn until the agent says whether it made verifiable claims and cites its evidence
- A push hook that holds the first push per commit with a diff-walk checklist, then lets the retry through
- A comment hook that flags an edit that silently removed comments
- A landed-check that re-reads the file after every edit
- A read-only database guard that denies any raw `psql`
- A vagueness gate for heavy multi-agent asks with no concrete anchor

Each hook exists because a prompt alone did not hold the line; a hook holds it every time.
