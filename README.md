# BF Navigator Web

Browser prototype for accessible route planning flows.

## Current Stack

- React 19
- React DOM 19
- Vite 8
- TypeScript 5.9
- TanStack Router with file-based routes in `src/routes/`
- Vitest + React Testing Library
- ESLint + Prettier + Stylelint
- Husky + lint-staged + commitlint

## Available Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run lint
npm run lint:css
npm run test
npm run test:ci
npm run format
npm run format:check
npm run preview
```

## Project Layout

```text
.
├── .claude/                  # Claude-specific agent workflow and commands
├── .codex/                   # Codex-specific agent workflow and role configs
├── docs/
│   ├── agents/               # research/plan artifacts per ticket
│   ├── screens/              # screen-flow product documentation
│   └── superpowers/specs/    # design/spec documents
├── public/
├── src/
│   ├── assets/
│   ├── pages/                # feature/page UI modules
│   ├── routes/               # TanStack Router route files
│   ├── types/                # shared domain/api types
│   ├── App.tsx               # router bootstrap
│   ├── main.tsx              # React entrypoint
│   └── routeTree.gen.ts      # generated, do not edit
├── CONVENTION.md
└── package.json
```

Optional layers such as `components/`, `hooks/`, `services/`, `store/`, `constants/`, and `utils/` should be added only when a feature genuinely needs them.

## Agent Workflow

- Runtime agent configs live in `.codex/` and `.claude/`.
- Ticket artifacts live in `docs/agents/<ticket-slug>/`.
- Each ticket folder should contain:
  - `research.md`
  - `plan.md`

See `.codex/AGENTS.md`, `.claude/CLAUDE.md`, and [docs/agents/README.md](/home/iliasalmerekov/Projects/LF8/bf-navigator-web/docs/agents/README.md) for the full agent workflow.
