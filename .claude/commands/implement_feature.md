---
name: implement_feature
description: Lead-agent orchestration workflow for implementing a ticket from research and plan artifacts.
allowed_tools: ['Task', 'Bash', 'Read', 'Write', 'Grep', 'Glob']
---

# /implement_feature

Use this command to execute a feature ticket from a completed research and plan package.

## Input

Pass the ticket slug as `$ARGUMENTS`.

## Required Behavior

1. Read `CONVENTION.md`, `docs/agents/<ticket-slug>/research.md`, and `docs/agents/<ticket-slug>/plan.md`.
2. Lead agent delegates code changes only to `coder`.
3. Lead agent must not write production code itself. It orchestrates, evaluates, and loops.
4. Run the first implementation loop:
   - `coder` implements
   - `reviewer` checks the result
5. If `reviewer` does not return `PASSED`, send findings back to `coder` and repeat step 4.
6. After the reviewer gate passes, run final verification in parallel:
   - `reviewer`
   - `tester`
   - `explorer`
   - `security`
7. If any final verification agent fails, consolidate findings and send them back to `coder`.
8. Repeat until every final verification agent returns `PASSED`.
9. Close the ticket only after all gates pass.

## Verification Expectations

- Commands must run through `rtk`.
- Verification must consider happy path, loading, error, empty, navigation, responsive layout, form behavior, accessibility, and regression scenarios relevant to the ticket.
- If automated tests do not exist, document the gap and require a manual verification matrix.

## Hard Constraints

- No direct source edits by the lead agent during implementation.
- No silent scope expansion.
- No ticket closure while any agent still reports findings.
