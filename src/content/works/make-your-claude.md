---
title: make-your-claude
year: 2026
role: hooks, tests
tags: [Claude Code, hooks, MIT]
link: https://github.com/devakmmm/make-your-claude
---

Six small hooks for Claude Code. They make the agent stop and say whether it verified its claims,
show a checklist before its first push, and warn when an edit deletes comments. They use only
Python's standard library, have 24 tests, and were in daily use before they were published.

- A stop hook that asks the agent, once per turn, whether it made claims it can verify and where its evidence is
- A push hook that holds the first plain `git push` per commit with a diff checklist, then lets the retry through. It does not yet catch `git -C <dir> push`
- A comment hook that warns when an edit removed comments
- A landed-check that re-reads a file after every edit
- A read-only database guard that denies any raw `psql`
- A vagueness gate for large multi-agent requests that name no file, ticket or error

Each hook exists because a prompt alone did not hold the line. A hook adds a check at the moment
that matters. It is a nudge, not a lock.
