# BF Navigator — Copilot Instructions

BF Navigator is a web application built **primarily for users with disabilities**.
Accessibility is the primary design and implementation constraint, not a checklist item.

Always read and follow `CONVENTION.md` before planning or writing code.

---

## Accessibility — First Priority

**Write accessible code first, then handle other requirements.**

### Before writing any UI component

1. Define the semantic HTML structure — landmark regions, heading hierarchy, form elements with labels.
2. Map the keyboard interaction model — Tab order, focus management, Escape behavior for overlays.
3. Identify `aria-live` regions needed for dynamic content (errors, loading, notifications).
4. Verify ARIA usage — prefer native HTML elements over ARIA roles.
5. Confirm every interactive element has an accessible name.

### WCAG 2.1 AA requirements

- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<button>`, `<a>` for their semantic purpose.
- Accessible names on all interactive elements via label, `aria-label`, or `aria-labelledby`.
- Meaningful `alt` text on images; `alt=""` for decorative images.
- Color must never be the sole means of conveying information.
- Contrast ratio: 4.5:1 for body text, 3:1 for large text and UI components.
- All interactive elements keyboard-reachable: Tab, Shift+Tab, Enter, Space, arrow keys.
- Visible focus indicator at all times — do not suppress without an equivalent custom style.
- No focus traps outside intentional modal dialogs; modals must manage focus correctly.
- `aria-live` regions for dynamic content: errors, loading changes, notifications.
- Forms: `<label>` per input, errors via `aria-describedby`, invalid state via `aria-invalid="true"`.
- Touch/click targets: minimum 44×44 px.
- `prefers-reduced-motion` respected for all transitions and animations.

### ARIA rules

- Use native HTML before ARIA.
- Never use `role="button"` on a `<div>` or `<span>` — use `<button>`.
- Landmark roles must be unique per page or labeled with `aria-label`.

### Verification checklist (every UI change)

1. Keyboard-only navigation works end to end
2. Screen reader announces labels, roles, states, and live regions correctly
3. axe scan returns zero critical/serious violations
4. Color contrast checked for new or modified values
5. `prefers-reduced-motion` suppresses all transitions/animations

---

## Stack

- React 19 + Vite 8
- TypeScript strict mode
- TanStack Router (file-based routing)
- Vitest + React Testing Library
- ESLint + Prettier + Stylelint

## Project Structure

```text
src/
  routes/      # TanStack Router route definitions
  pages/       # page-level UI modules
  types/       # shared TypeScript types
  assets/
  App.tsx
  main.tsx
  routeTree.gen.ts   # auto-generated — do not edit
```

Optional directories (`components/`, `hooks/`, `services/`, `store/`, `constants/`, `utils/`) are added only when a feature needs them.

## Code Rules

- No `any`
- No dead code
- Semantic HTML first, ARIA second
- CSS Modules for page-scoped styles
- Route files stay thin — import the page module
- Page folders: PascalCase; route files: kebab-case
- Do not edit `src/routeTree.gen.ts` manually
- All shell commands go through `rtk`
