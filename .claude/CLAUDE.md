# BF Navigator Claude Workflow

This project uses a lead-agent orchestration model for feature work.

## Stack Context

- React 19
- React DOM 19
- Vite 8
- TypeScript strict mode
- TanStack Router with file-based routes
- Vitest + React Testing Library
- ESLint + Prettier + Stylelint
- Accessibility is mandatory

Always read and follow `CONVENTION.md` before planning or implementation.

## Agent Architecture

```text
.claude/
├── CLAUDE.md
├── agents/
│   ├── architect.md
│   ├── coder.md
│   ├── explorer.md
│   ├── researcher.md
│   ├── reviewer.md
│   ├── security.md
│   └── tester.md
└── commands/
    ├── research_codebase.md
    ├── plan.md
    └── implement_feature.md

docs/
└── agents/
    └── <ticket-slug>/
        ├── research.md
        └── plan.md
```

## Project Structure

```text
src/
├── routes/          # TanStack Router route definitions
├── pages/           # page-level UI modules
├── types/           # shared TypeScript types
├── assets/
├── App.tsx          # router bootstrap
├── main.tsx         # React entrypoint
└── routeTree.gen.ts # auto-generated, do not edit
```

Additional directories such as `components/`, `hooks/`, `services/`, `store/`, `constants/`, and `utils/` are optional and should be introduced only when real feature pressure exists.

## Accessibility — First Priority

**BF Navigator is built primarily for users with disabilities. Accessibility is not a checklist item — it is the primary design and implementation constraint.**

Every agent must treat a11y as the first concern, not the last:

- **researcher / explorer**: Document existing a11y state (landmarks, ARIA, keyboard support, gaps) before investigating other aspects.
- **architect**: Define the a11y architecture (focus flow, landmarks, live regions, keyboard model) before decomposing into files.
- **coder**: Write semantic HTML and ARIA first; functional behavior second. A component is not done until it passes the CONVENTION.md section 9 a11y checklist.
- **reviewer**: A11y failures block merge. Check accessibility before correctness.
- **tester**: Run the a11y test matrix (keyboard nav, screen reader, axe scan, contrast, reduced motion) before any other verification. A11y failures are P0.
- **security**: Flag a11y regressions — inaccessible UI is a functional denial of service for users with disabilities.

The full a11y requirement is defined in `CONVENTION.md` section 9. All agents must read that section before starting work.

## Global Rules

- All shell commands must go through `rtk`.
- The lead agent orchestrates; it does not write production code during implementation.
- `coder` is the only agent allowed to make source-code changes unless the user explicitly asks otherwise.
- Prefer local code evidence first. If framework or API behavior is uncertain, query Context7 MCP.
- Assume web-specific failure modes: routing regressions, stale generated routes, broken links, loading/error states, responsive layout issues, form-state bugs, and accessibility regressions.
- Keep changes aligned with the current structure: `routes`, `pages`, `types`, and only the optional layers that actually exist.

## Ticket Artifact Contract

For every feature ticket, create a folder:

- `docs/agents/<ticket-slug>/research.md`
- `docs/agents/<ticket-slug>/plan.md`

`ticket-slug` should be lowercase kebab-case. If the ticket has an ID, preserve it, for example `bf-123-route-history`.

## Phase Flow

### 1. `research_codebase`

- Input: raw ticket text
- Lead agent spawns read-only subagents such as `researcher`, `explorer`, and `architect`
- Goal: understand the current implementation, entry points, affected files, constraints, risks, and unknowns
- Forbidden: proposing fixes, writing implementation steps, or editing product code
- Output: `docs/agents/<ticket-slug>/research.md`

### 2. `plan`

- Input: ticket text or ticket slug with completed research
- Lead agent reads `research.md`, optionally asks `architect` for decomposition
- Goal: produce a concrete implementation plan with touched files, route/page/type changes, failure scenarios, test scope, and rollout order
- Forbidden: coding
- Output: `docs/agents/<ticket-slug>/plan.md`

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
