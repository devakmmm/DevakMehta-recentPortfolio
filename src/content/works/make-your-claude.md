---
title: make-your-claude
year: 2026
role: hooks, tests
tags: [Claude Code, discipline, MIT]
link: https://github.com/devakmmm/make-your-claude
---

Six small hooks for Claude Code that enforce working discipline the model cannot be trusted to keep
on its own. Standard library only, 24 tests, used daily before it was published.

- A stop hook that blocks the end of a turn until the agent states whether it made verifiable claims and cites its evidence
- A push hook that holds the first push per commit with a diff-walk checklist, then lets the retry through
- A comment hook that warns when an edit silently removed comments
- A landed-check that re-reads the file after every edit
- A read-only database guard that denies any raw `psql`
- A vagueness gate for heavy multi-agent asks with no concrete anchor

Each exists because of a real failure a prompt did not prevent. The first real push of this site
found three gaps in the push hook; they are the next patch.
