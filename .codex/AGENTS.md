# BF Navigator Codex Workflow

This file defines the project-local multi-agent workflow for Codex.

## Stack

- React 19
- React DOM 19
- Vite 8
- TypeScript 5.9
- TanStack Router with file-based routes
- Vitest + React Testing Library
- ESLint + Prettier + Stylelint

Always align changes with `CONVENTION.md`.

## Agent Architecture

Runtime configuration:

```text
.codex/
  AGENTS.md
  agents/*.toml
```

Ticket artifacts:

```text
docs/agents/<ticket-slug>/
  research.md
  plan.md
```

Application structure agents should reason about first:

```text
src/
  routes/
  pages/
  types/
  assets/
  App.tsx
  main.tsx
  routeTree.gen.ts
```

Additional layers such as `components/`, `hooks/`, `services/`, `store/`, `constants/`, and `utils/` are optional, not assumed.

## Execution Rules

- All shell commands must go through `rtk`.
- Prefer local code evidence first.
- Use `rtk cat`, `rtk rg`, `rtk find`, `rtk git`, and project scripts through `rtk`.
- If external behavior is unclear, query Context7 MCP only after local inspection.
- Treat web failure modes as first-class: routing regressions, broken links, form-state issues, stale generated route artifacts, loading/error/empty states, responsive layout issues, and accessibility regressions.

## Lead Agent Contract

The lead agent orchestrates phases and subagents. It does not write production code during implementation.

The lead agent must:

1. Read `CONVENTION.md` before starting feature work.
2. Create ticket artifacts in `docs/agents/<ticket-slug>/`.
3. Spawn the appropriate subagents for the current phase.
4. Consolidate findings, plans, and verification results.
5. Loop implementation until all verification agents return `PASSED`.

## Ticket Artifact Contract

For each ticket, maintain:

- `docs/agents/<ticket-slug>/research.md`
- `docs/agents/<ticket-slug>/plan.md`

Use lowercase kebab-case for `ticket-slug`. Preserve ticket IDs when present.

## Phase Workflow

### Phase 1: Research

Goal: understand the current system and likely impact without suggesting fixes.

Lead agent actions:

1. Spawn `researcher` for repository evidence.
2. Spawn `explorer` for execution-path tracing.
3. Spawn `architect` only for constraint mapping and decomposition boundaries.
4. Consolidate results into `docs/agents/<ticket-slug>/research.md`.

Research output must cover:

- current behavior
- entry points and affected files
- route flow and page boundaries
- shared types and styling touch points
- optional hooks/services/store usage if they exist
- edge cases, failure scenarios, and unknowns

Hard rule: no implementation proposals in the research phase.

### Phase 2: Plan

Goal: produce a concrete implementation plan from research.

Lead agent actions:

1. Read `docs/agents/<ticket-slug>/research.md`.
2. Spawn `architect` if needed.
3. Write `docs/agents/<ticket-slug>/plan.md`.

Plan output must cover:

- touched files
- order of work
- route/page/type/style changes
- state/data/API changes when applicable
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
- route generation and navigation regressions
- responsive layout
- accessibility
- data submission and persistence behavior

If the repo lacks automated tests for the changed area, the tester must state the gap explicitly and provide a manual verification matrix instead of pretending coverage exists.
