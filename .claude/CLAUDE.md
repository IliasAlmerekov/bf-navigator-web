# BF Navigator Claude Workflow

This project uses a lead-agent orchestration model for feature work.

## Stack Context

- React + Vite
- TypeScript strict mode
- React Router
- Zustand for client state
- TanStack Query for server state
- Axios-based services
- Accessibility is mandatory

Always read and follow `CONVENTION.md` before planning or implementation.

## Project Structure

```
src/
├── pages/           # Dashboard, RouteOverview, Profile, Alerts
├── components/      # all UI components
│   ├── ui/          # Button, Card, Badge, Input
│   └── layout/      # MobileLayout, DesktopLayout
├── store/           # Zustand — one file per domain
├── services/        # API calls — one file per domain
├── hooks/           # useRoute, useElevator, useProfile
├── types/           # all TypeScript types
├── constants/       # colors, typography, spacing
└── utils/           # riskCalculator, formatters
```

## Global Rules

- All shell commands must go through `rtk`.
- The lead agent orchestrates; it does not write production code during implementation.
- `coder` is the only agent allowed to make source-code changes unless the user explicitly asks otherwise.
- Prefer local code evidence first. If framework or API behavior is uncertain, query Context7 MCP.
- Assume web-specific failure modes: routing regressions, stale query state, API failures, loading/error states, responsive layout issues, and accessibility regressions.
- Keep changes aligned with the current structure: `pages`, `components`, `hooks`, `services`, `store`, `types`, `constants`, `utils`.

## Ticket Artifact Contract

For every feature ticket, create a folder:

- `docs/<ticket-slug>/research.md`
- `docs/<ticket-slug>/plan.md`

`ticket-slug` should be lowercase kebab-case. If the ticket has an ID, preserve it, for example `bf-123-route-history`.

## Phase Flow

### 1. `research_codebase`

- Input: raw ticket text
- Lead agent spawns read-only subagents such as `researcher`, `explorer`, and `architect`
- Goal: understand the current implementation, entry points, affected files, constraints, risks, and unknowns
- Forbidden: proposing fixes, writing implementation steps, or editing product code
- Output: `docs/<ticket-slug>/research.md`

### 2. `plan`

- Input: ticket text or ticket slug with completed research
- Lead agent reads `research.md`, optionally asks `architect` for decomposition
- Goal: produce a concrete implementation plan with touched files, state/data flow changes, failure scenarios, test scope, and rollout order
- Forbidden: coding
- Output: `docs/<ticket-slug>/plan.md`

### 3. `implement_feature`

- Input: ticket slug with completed research and plan
- Lead agent delegates implementation to `coder`
- Lead agent does not write production code; it coordinates and evaluates
- First loop: `coder` -> `reviewer`
- If `reviewer` finds issues, findings go back to `coder` and the loop repeats
- After reviewer passes, run final verification with `reviewer`, `tester`, `explorer`, and `security`
- If any verification agent fails, consolidate findings and send them back to `coder`
- Close the ticket only when every verification agent returns `PASSED`

## Model Routing Guidance

If your Claude setup supports model routing:

- `researcher`, `explorer`: use a lower-cost research model for broad repository scans
- `architect`, `reviewer`, `security`: use a stronger reasoning model
- `coder`: use the best available coding model

If Context7 is configured, use it only for documentation that is unstable or external to the repo.
