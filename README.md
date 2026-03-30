# Barrier-Free Navigator

> The only rail travel assistant that doesn't just show you **when** your train departs —
> but whether you can **actually reach it barrier-free**. And if not, finds you another way. Instantly.

---

## What is this?

Barrier-Free Navigator is a navigation tool built specifically for people with reduced mobility.
It doesn't just display train connections — it **actively warns you about barriers** and suggests
alternative routes in real time, before you arrive at the station and discover the elevator is broken.

---

## Why not just use DB Navigator?

DB Navigator is a general-purpose travel app built for everyone.
Accessibility is an afterthought — a hidden filter, occasional elevator info, no risk awareness.

Barrier-Free Navigator is built **only** for mobility-impaired users, from the ground up.

| Feature                                  | DB Navigator           | Barrier-Free Navigator            |
| ---------------------------------------- | ---------------------- | --------------------------------- |
| Elevator status per station              | Partial, manual search | ✅ Automatic for every route      |
| Risk score per connection                | ❌                     | ✅ 0–100 with visual indicator    |
| Push notification on elevator failure    | ❌                     | ✅ Real-time via FASTA API        |
| Automatic barrier-free alternative route | ❌                     | ✅ Step-free guaranteed           |
| Persistent mobility profile              | ❌                     | ✅ Set once, always active        |
| Target audience                          | All users              | Wheelchair, stroller, walking aid |
| UI complexity                            | High, many features    | Minimal, focused, calm            |

---

## 3 Core Advantages

### 1. Proactive, not reactive

DB Navigator tells you about a disruption when you're already on your way — or not at all.
Barrier-Free Navigator alerts you **within 10 seconds** of a report via push notification,
before you even leave the house.

### 2. Risk is visible

No other app shows you at a glance how safe a connection is for your specific needs.
The risk score combines elevator status, transfer times, and step-free access into
**one single number** — color-coded and always on screen.

### 3. Your profile thinks for you

Set it once: _"Wheelchair, elevator required, max. 200m walking distance"_ —
and every search filters automatically based on your profile.
With DB Navigator, you have to re-enter your accessibility needs every single time.

---

## Who is this for?

- **Wheelchair users** and people with walking aids
- **Parents with strollers** navigating stairs and narrow passages
- **Older adults** who need to avoid steps and long walking distances
- **Temporarily mobility-impaired people** — recovering from surgery, broken leg, etc.

Germany alone has approximately **7.8 million people with severe disabilities** —
a massively underserved segment in public rail transport.

---

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
