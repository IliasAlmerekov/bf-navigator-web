# BF Navigator Agent Rules

BF Navigator is a web application built **primarily for users with disabilities**.
Accessibility is not a checklist item — it is the primary design and implementation constraint.

Always read and follow `CONVENTION.md` before any planning or implementation.

---

## Accessibility — First Priority

Every agent must evaluate accessibility before everything else.

### What this means per role

| Agent          | A11y responsibility                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **researcher** | Document current a11y state (landmarks, ARIA, keyboard support, gaps) first                                       |
| **explorer**   | Trace the accessibility tree alongside the execution path                                                         |
| **architect**  | Define a11y architecture (focus flow, landmarks, live regions, keyboard model) before file decomposition          |
| **coder**      | Write semantic HTML and ARIA first; a component is not done until it passes the CONVENTION.md section 9 checklist |
| **reviewer**   | A11y failures block merge — check accessibility before correctness                                                |
| **tester**     | Run the full a11y test matrix first; a11y failures are P0                                                         |
| **security**   | Flag a11y regressions as functional access denials for users with disabilities                                    |

### A11y Verification Checklist (applies to every UI change)

1. Keyboard-only navigation: Tab, Shift+Tab, Enter, Space, Escape, arrow keys
2. Screen reader output: labels, roles, states, and live regions announced correctly
3. Automated scan: axe or equivalent — zero critical/serious violations
4. Color contrast: 4.5:1 for body text, 3:1 for large text and UI components
5. `prefers-reduced-motion`: all transitions/animations suppressed when set

Full requirements are in `CONVENTION.md` section 9.

---

## Agent Roles

- **researcher** — read-only repository research, no fixes
- **explorer** — read-only tracing of execution paths and affected modules
- **architect** — read-only decomposition and boundary planning
- **coder** — primary implementation agent and only write-enabled role by default
- **reviewer** — correctness and regression gate; a11y failures block merge
- **tester** — automated and manual verification coverage; a11y is P0
- **security** — privacy, resilience, abuse-case, and a11y regression review

Agent prompts: `.claude/agents/` (Claude Code) and `.github/github-instruction/agents/` (GitHub agents).

---

## Global Rules

- All shell commands must go through `rtk`.
- The lead agent orchestrates; it does not write production code during implementation.
- `coder` is the only agent allowed to make source-code changes unless the user explicitly asks otherwise.
- Prefer local code evidence first. If framework or API behavior is uncertain, query Context7 MCP.
- Every spawned subagent must read and follow `CONVENTION.md`.

---

## Verification Standard

Every feature must be verified for the scenarios that apply:

- happy path
- loading
- error
- empty state
- navigation regressions
- **accessibility** (always — not conditional)
- responsive layout

If the repo lacks automated tests for the changed area, the tester must state the gap and provide a manual verification matrix.
