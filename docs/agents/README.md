# Agent Architecture

This repository keeps agent runtime configuration separate from agent-generated work artifacts.

## Runtime Configuration

```text
.codex/
  AGENTS.md
  agents/
    architect.toml
    coder.toml
    explorer.toml
    researcher.toml
    reviewer.toml
    security.toml
    tester.toml

.claude/
  CLAUDE.md
  agents/
    architect.md
    coder.md
    explorer.md
    researcher.md
    reviewer.md
    security.md
    tester.md
  commands/
    research_codebase.md
    plan.md
    implement_feature.md
```

- `.codex/` contains Codex-specific lead-agent and subagent instructions.
- `.claude/` contains Claude-specific lead-agent instructions, roles, and slash-command workflows.

## Ticket Artifacts

```text
docs/agents/
  <ticket-slug>/
    research.md
    plan.md
```

Use `docs/agents/<ticket-slug>/` for all ticket-local artifacts produced by the agent workflow.

- `research.md` captures current behavior, affected files, risks, and unknowns.
- `plan.md` captures the approved implementation sequence and verification scope.

## Application Boundaries

The current app architecture that agents should reason about is:

```text
src/
  assets/
  pages/
  routes/
  types/
  App.tsx
  main.tsx
  routeTree.gen.ts
```

Current rules:

- `src/routes/` is the routing layer.
- `src/pages/` is the page-level UI layer.
- `src/types/` holds shared type definitions.
- Additional layers such as `components/`, `hooks/`, `services/`, and `store/` are optional and should be introduced only when the feature warrants them.

## Workflow Summary

1. Research current behavior into `docs/agents/<ticket-slug>/research.md`.
2. Turn research into `docs/agents/<ticket-slug>/plan.md`.
3. Implement through the lead-agent review loop using the role files in `.codex/agents/` or `.claude/agents/`.
