---
name: plan
description: Convert a completed ticket research artifact into an implementation plan.
allowed_tools: ['Task', 'Bash', 'Read', 'Write', 'Grep', 'Glob']
---

# /plan

Use this command after `research_codebase` has produced a ticket research artifact.

## Input

Pass either the ticket slug or the original ticket text as `$ARGUMENTS`.

## Required Behavior

1. Resolve the `ticket-slug`.
2. Read `docs/<ticket-slug>/research.md`.
3. Read `CONVENTION.md`.
4. Spawn `architect` if deeper decomposition or boundary checks are needed.
5. Create or overwrite `docs/<ticket-slug>/plan.md`.

## Plan Output Template

The plan must include:

- feature goal
- touched files and why each one changes
- implementation sequence
- state and data-flow updates
- API / storage considerations
- loading, error, empty, and accessibility scenarios
- verification strategy
- out-of-scope items

## Hard Constraints

- Do not write production code.
- Do not skip the research artifact.
- Keep the plan concrete enough for `coder` to execute without inventing architecture.
