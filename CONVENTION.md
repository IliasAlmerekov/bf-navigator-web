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

## 9. Accessibility — First Priority

**BF Navigator is built first for users with disabilities. Accessibility is the primary design and implementation constraint, not a checklist item. Every agent and developer must evaluate accessibility before everything else.**

### WCAG 2.1 AA — Mandatory

- Semantic HTML first: use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<button>`, `<a>` for their semantic purpose.
- Every interactive element must have an accessible name via visible label, `aria-label`, or `aria-labelledby`.
- All images need meaningful `alt` text; decorative images use `alt=""`.
- Color must never be the sole means of conveying information.
- Contrast ratio: minimum 4.5:1 for body text, 3:1 for large text and UI components.
- All interactive elements must be keyboard-reachable and operable with Tab / Shift+Tab / Enter / Space / arrow keys.
- Focus order must match visual reading order and be clearly visible at all times.
- Do not trap focus except in modal dialogs; modals must trap focus inside and restore it on close.
- Use `aria-live` regions for dynamic content changes: errors, loading states, notifications.
- Forms: every input must have a `<label>` or `aria-label`. Error messages must be linked via `aria-describedby`. Invalid state must set `aria-invalid="true"`.
- Never suppress native focus outlines without providing an equally visible custom focus style.
- Touch and click targets: minimum 44×44 px.
- Provide `prefers-reduced-motion` support for all transitions and animations.

### ARIA Rules

- Use native HTML semantics before reaching for ARIA.
- Never use a role that conflicts with the native element's role.
- `role="button"` on a `<div>` or `<span>` is forbidden — use `<button>`.
- Landmark roles (`main`, `nav`, `aside`, `banner`, `contentinfo`) must be unique on the page or differentiated with `aria-label`.

### A11y Verification Checklist

Every UI change must be verified against all applicable items:

1. Keyboard-only navigation: Tab, Shift+Tab, Enter, Space, Escape, arrow keys
2. Screen reader output: labels, roles, states, and live regions announced correctly
3. Automated scan: axe or equivalent — zero critical/serious violations
4. Color contrast: check all new or modified color values
5. `prefers-reduced-motion`: all transitions/animations suppressed when set

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
