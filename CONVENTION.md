# Project Convention

## 1. Goal

This convention is optimized for:

- fast team onboarding
- predictable web feature delivery
- readable, low-ceremony code
- stable agent handoff between research, plan, and implementation

It is not optimized for heavy abstraction or speculative enterprise architecture.

## 2. Fixed Stack

- React 19
- React DOM 19
- Vite 8
- TypeScript 5.9
- TanStack Router with file-based routing
- Vitest + React Testing Library
- ESLint + Prettier + Stylelint

Do not document or build around Zustand, TanStack Query, Axios, or other extra layers unless they are actually added to `package.json`.

## 3. Core Principles

### 3.1 Simplicity over Abstraction

- Prefer direct code for the current use case.
- Add a new layer only when duplication or complexity is real.

### 3.2 Thin Routes, Focused Pages

- `src/routes/` contains route definitions and routing metadata only.
- `src/pages/` contains page-level UI and interaction logic.
- Shared code moves out only when at least two pages need the same abstraction.

### 3.3 Reality over Planned Architecture

- Follow the repository as it exists today.
- Optional folders are introduced on demand, not predeclared as mandatory.

## 4. Current Project Structure

```text
src/
  assets/
  pages/
  routes/
  types/
  App.tsx
  App.test.tsx
  App.css
  index.css
  main.tsx
  routeTree.gen.ts
```

### Optional Directories

These directories are allowed when a feature needs them:

- `src/components/`
- `src/hooks/`
- `src/services/`
- `src/store/`
- `src/constants/`
- `src/utils/`

If you introduce one of them, keep the boundary explicit and document the reason in the ticket plan.

## 5. Agent Artifact Structure

Agent-generated ticket artifacts live here:

```text
docs/
  agents/
    <ticket-slug>/
      research.md
      plan.md
```

Use lowercase kebab-case for `ticket-slug`. Preserve external ticket IDs when present.

## 6. Route and Page Rules

Each feature route is split into a thin route file and a page module.

```text
src/pages/FeaturePage/
  FeaturePage.tsx
  FeaturePage.module.css
  index.ts
  FeaturePage.test.tsx   # optional

src/routes/feature-page.tsx
```

Rules:

- Route files stay small and import the page module.
- Page folders use PascalCase.
- Route filenames use kebab-case to match URL paths.

## 7. Naming Rules

### Files

- PascalCase for page and component folders/files
- kebab-case for route files
- camelCase for helpers, hooks, services, and stores when introduced

## 8. Styling

- Prefer CSS Modules for page-scoped styling.
- Keep global styling in `src/index.css` and shared app-level styling in `src/App.css`.
- Avoid inline styles except for truly dynamic one-off values.

## 9. Accessibility

Accessibility is mandatory.

- Use semantic HTML first.
- Provide accessible names for interactive controls.
- Do not communicate meaning through color alone.
- Keep touch/click targets large enough for mobile web.
- Preserve keyboard and focus behavior.

## 10. Testing

- Cover critical routes and user flows first.
- Use Vitest + React Testing Library for UI behavior.
- If no automated coverage is added, document the manual verification matrix in the ticket artifact or PR notes.

## 11. Error Handling

- Do not surface raw technical errors to end users.
- Show clear fallback states for loading, error, and empty scenarios when relevant.
- Treat routing regressions, broken links, and inaccessible states as real bugs.

## 12. Imports Order

1. React
2. libraries
3. internal modules
4. types
5. styles

## 13. Code Quality

- No `any`
- No dead code
- Small, readable functions
- Prefer explicit names over clever shortcuts
- Do not edit `src/routeTree.gen.ts` manually

## 14. Definition of Done

- route works end to end
- types stay valid
- lint/test expectations for the change are satisfied
- accessibility semantics are preserved
- docs and agent artifacts reflect the real implementation
