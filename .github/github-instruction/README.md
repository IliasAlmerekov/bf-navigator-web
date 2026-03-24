# BF Navigator GitHub Agent Workflow

This directory defines the project-local multi-agent workflow for GitHub-based agents.

## Stack Context

- Expo / React Native
- TypeScript strict mode
- React Navigation
- Zustand for client state
- TanStack Query for server state
- Axios-based services
- Accessibility is mandatory

Always read and follow `CONVENTION.md` before planning or implementation.

## Global Rules

- All shell commands must go through `rtk`.
- Prefer `rtk read`, `rtk find`, `rtk grep`, `rtk lint`, `rtk test`, and `rtk proxy` when applicable.
- The lead agent orchestrates; it does not write production code during implementation.
- `coder` is the only agent allowed to make source-code changes unless the user explicitly asks otherwise.
- Prefer local code evidence first. If framework or API behavior is uncertain, query Context7 MCP.
- Assume mobile-specific failure modes: navigation regressions, stale query state, offline/API failures, loading and error states, notification flow issues, retry storms, empty states, and accessibility regressions.
- Keep changes aligned with the current structure: `screens`, `components`, `hooks`, `services`, `stores`, `types`, `constants`, `utils`.
- Every spawned subagent must also read and follow `CONVENTION.md`.

## Lead Agent Contract

The lead agent orchestrates phases and subagents. It does not write production code during implementation.

The lead agent must:

1. Read `CONVENTION.md` before starting feature work.
2. Create ticket artifacts in `docs/<ticket-slug>/`.
3. Spawn the appropriate subagents for the current phase when needed.
4. Consolidate findings, plans, and verification results.
5. Loop implementation until all verification agents return `PASSED`.

## Ticket Artifact Contract

For every feature ticket, create a folder:

- `docs/<ticket-slug>/research.md`
- `docs/<ticket-slug>/plan.md`

`ticket-slug` should be lowercase kebab-case. If the ticket has an ID, preserve it, for example `bf-123-route-history`.

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
- `coder`: primary implementation agent and only write-enabled role by default
- `reviewer`: correctness and regression gate
- `tester`: automated and manual verification coverage
- `security`: privacy, resilience, and abuse-case review

Agent prompts live in `agents/`.

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

## Model Routing Guidance

If the active GitHub agent environment supports model routing or agent selection:

- `researcher`, `explorer`: use a lower-cost research model for broad repository scans
- `architect`, `reviewer`, `security`: use a stronger reasoning model
- `coder`: use the best available coding model

If Context7 is configured, use it only for documentation that is unstable or external to the repo.
