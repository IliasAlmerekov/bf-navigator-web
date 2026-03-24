---
name: research_codebase
description: Read-only feature research workflow that produces a ticket research artifact in docs.
allowed_tools: ["Task", "Bash", "Read", "Write", "Grep", "Glob"]
---

# /research_codebase

Use this command to research a feature ticket without proposing or implementing fixes.

## Input

Pass the raw ticket text as `$ARGUMENTS`.

## Required Behavior

1. Read `CONVENTION.md` and identify the project stack and architectural boundaries.
2. Derive a `ticket-slug` from the ticket title or ID in lowercase kebab-case.
3. Create `docs/<ticket-slug>/` if it does not exist.
4. Spawn read-only subagents:
   - `researcher` for repository and feature context
   - `explorer` for execution path tracing
   - `architect` for constraints and decomposition boundaries only
5. Consolidate the evidence into `docs/<ticket-slug>/research.md`.

## Research Output Template

The file must include:

- ticket summary
- current behavior
- affected pages, components, hooks, services, store, and types
- likely touched files
- data flow and routing flow
- constraints from `CONVENTION.md`
- edge cases and failure scenarios
- open questions and unknowns

## Hard Constraints

- Do not propose fixes.
- Do not write implementation steps.
- Do not edit source code.
- Use Context7 MCP only when local code is insufficient to verify framework behavior.
