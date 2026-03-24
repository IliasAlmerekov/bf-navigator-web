# BF Navigator Codex Workflow

This file defines the project-local multi-agent workflow for Codex.

## Stack

- Expo / React Native
- TypeScript strict mode
- React Navigation
- Zustand
- TanStack Query
- Axios

Always align changes with `CONVENTION.md`.

## Execution Rules

- All shell commands must go through `rtk`.
- Prefer `rtk read`, `rtk find`, `rtk grep`, `rtk lint`, `rtk test`, and `rtk proxy` as needed.
- Use local code evidence first. If external behavior is unclear, query Context7 MCP.
- Respect the existing app shape: screens, components, hooks, services, stores, types, constants, utils.
- Treat mobile failure modes as first-class: navigation regressions, stale data, retry storms, notification side effects, offline paths, and accessibility regressions.

## Lead Agent Contract

The lead agent orchestrates phases and subagents. It does not write production code during implementation.

The lead agent must:

1. Read `CONVENTION.md` before starting feature work.
2. Create ticket artifacts in `docs/<ticket-slug>/`.
3. Spawn the appropriate subagents for the current phase.
4. Consolidate findings, plans, and verification results.
5. Loop implementation until all verification agents return `PASSED`.

## Ticket Artifact Contract

For each ticket, maintain:

- `docs/<ticket-slug>/research.md`
- `docs/<ticket-slug>/plan.md`

Use lowercase kebab-case for `ticket-slug`. Preserve ticket IDs when present.

## Phase Workflow

### Phase 1: Research

Goal: understand the current system and likely impact without suggesting fixes.

Lead agent actions:

1. Spawn `researcher` for repository evidence.
2. Spawn `explorer` for execution-path tracing.
3. Spawn `architect` only for constraint mapping and decomposition boundaries.
4. Consolidate results into `docs/<ticket-slug>/research.md`.

Research output must cover:

- current behavior
- entry points and affected files
- data flow and navigation flow
- state, service, and notification touch points
- edge cases, failure scenarios, and unknowns

Hard rule: no implementation proposals in the research phase.

### Phase 2: Plan

Goal: produce a concrete implementation plan from research.

Lead agent actions:

1. Read `docs/<ticket-slug>/research.md`.
2. Spawn `architect` if needed.
3. Write `docs/<ticket-slug>/plan.md`.

Plan output must cover:

- touched files
- order of work
- state/data/API changes
- failure scenarios
- verification scope
- out-of-scope decisions

Hard rule: no production code in the planning phase.

### Phase 3: Implement

Goal: implement the feature through a controlled verification loop.

Lead agent actions:

1. Read research and plan artifacts.
2. Spawn `coder` for all source edits.
3. Run an inner loop: `coder` -> `reviewer`.
4. When `reviewer` returns `PASSED`, run final verification with `reviewer`, `tester`, `explorer`, and `security`.
5. If any agent reports findings, send the consolidated findings back to `coder`.
6. Repeat until every verification agent returns `PASSED`.
7. Close the ticket only after full pass.

## Role Summary

- `researcher`: read-only repository research, no fixes
- `explorer`: read-only tracing of execution paths and affected modules
- `architect`: read-only decomposition and boundary planning
- `coder`: best available coding model, only write-enabled role
- `reviewer`: correctness and regression gate
- `tester`: automated and manual verification coverage
- `security`: privacy, resilience, and abuse-case review

## Verification Standard

Every feature must be checked for the scenarios that apply:

- happy path
- loading
- error
- empty state
- offline / retry
- navigation regressions
- accessibility
- data persistence / notifications

If the repo lacks automated tests for the changed area, the tester must state the gap explicitly and provide a manual verification matrix instead of pretending coverage exists.
