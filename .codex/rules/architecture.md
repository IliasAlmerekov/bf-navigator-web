---
description: Page-Based Frontend Architecture — read this before every task
alwaysApply: true
---

# Page-Based Frontend Architecture

> A strict, opinionated architecture where every business concern is owned by a page.
> If you can't answer "which page owns this?", the code doesn't belong in `src/pages`.

---

## Core Philosophy

1. **Pages are the unit of ownership.** Each page folder is a self-contained vertical slice of the application. It owns its components, hooks, types, and styles.
2. **Co-location over abstraction.** Keep things close to where they are used. Extract to shared only when genuinely reused by 2+ pages — never speculatively.
3. **No cross-page imports.** Pages never import from each other. Shared needs go through `src/shared/` or `src/features/`.
4. **Flat is better than deep.** Avoid nesting pages inside pages. Each route segment gets exactly one folder.
5. **The page component is a coordinator, not a god object.** It composes, it does not compute. Heavy logic lives in hooks.

---

## Directory Structure

```
src/
├── pages/                        # One folder per route
│   ├── HomePage/
│   │   ├── index.ts              # Public barrel — exports only the page component
│   │   ├── HomePage.tsx          # Page component (coordinator)
│   │   ├── HomePage.test.tsx     # Integration test for the page
│   │   ├── components/           # Components used ONLY by this page
│   │   │   ├── HeroSection/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HeroSection.module.css
│   │   │   │   └── HeroSection.test.tsx
│   │   │   └── FeaturedList/
│   │   │       ├── FeaturedList.tsx
│   │   │       ├── FeaturedList.module.css
│   │   │       └── useFeaturedList.ts    # Hook bound to this component
│   │   ├── hooks/                # Hooks used across multiple components of this page
│   │   │   └── useHomePageData.ts
│   │   ├── utils/                # Pure functions scoped to this page
│   │   │   └── formatHomeStats.ts
│   │   └── types.ts              # TypeScript types local to this page
│
├── shared/                       # Truly reusable, UI-only, domain-agnostic code
│   ├── components/               # Generic UI primitives (Button, Modal, Input, etc.)
│   ├── hooks/                    # Generic hooks (useDebounce, useMediaQuery, etc.)
│   ├── utils/                    # Pure utility functions (formatDate, cn, etc.)
│   ├── types/                    # App-wide TypeScript interfaces and enums
│   └── constants/                # App-wide constants (routes, config keys, etc.)
│
├── features/                     # Cross-cutting business domains (optional layer)
│   └── auth/                     # Used by multiple pages but not a page itself
│
├── api/                          # API layer — all server communication lives here
│   ├── client.ts                 # Base fetch/axios instance with interceptors
│   └── types.ts                  # Raw API response shapes (DTOs)
│
├── store/                        # Global client state (Zustand, Jotai, Redux, etc.)
├── router/                       # Route definitions — imports from pages/*/index.ts
├── styles/                       # Global CSS, design tokens, resets
└── main.tsx
```

---

## Rules

### Rule 1 — Page Folder Naming

- Named in **PascalCase** matching the component name: `HomePage`, `UserProfilePage`.
- Always suffixed with `Page`.
- The folder name equals the component name equals the route label.

```
✅ src/pages/UserProfilePage/
❌ src/pages/user-profile/
❌ src/pages/Profile/          ← missing Page suffix
```

### Rule 2 — The Page Component Contract

The page component must do exactly three things:

1. **Fetch / resolve data** via its own hooks.
2. **Compose** page-level components.
3. **Pass props** down to those components.

No inline `fetch()`, no `useEffect` with data transforms, no business logic.

### Rule 3 — Barrel Export (index.ts)

Every page folder exposes **exactly one export**: the page component. Nothing else.

```ts
// ✅ src/pages/HomePage/index.ts
export { HomePage } from './HomePage';

// ❌ Never export hooks, components, or types from the barrel
```

### Rule 4 — No Cross-Page Imports

Pages are siblings. They never depend on each other. If logic is needed by two pages, move it to:

- Pure UI → `src/shared/components/`
- Business hook → `src/features/<domain>/`
- API call → `src/api/<domain>.ts`

### Rule 5 — Component Scope Levels

| Scope                                   | Location                                         |
| --------------------------------------- | ------------------------------------------------ |
| Used by one component in one page       | Sibling file or subfolder next to that component |
| Used by multiple components in one page | `PageName/components/`                           |
| Used by 2+ different pages              | `src/shared/components/` (domain-agnostic only)  |
| Has business logic, used by 2+ pages    | `src/features/<domain>/`                         |

Do not extract to shared until a second page genuinely needs it.

### Rule 6 — Hook Placement

```
Page-local:         src/pages/PageName/hooks/
Component-bound:    src/pages/PageName/components/Component/useHook.ts
Cross-page business:src/features/<domain>/
Generic mechanics:  src/shared/hooks/
```

Never put data-fetching hooks in `src/shared/hooks/`.

### Rule 7 — API Layer Separation

All network calls live in `src/api/`. No `fetch()` or axios calls inside components or pages.

```ts
// ✅ src/api/dashboard.ts
export async function fetchDashboardStats(): Promise<DashboardStats[]> { ... }

// ✅ Use in a page hook
import { fetchDashboardStats } from '@/api/dashboard';
```

### Rule 8 — Type Ownership

| Type kind                              | Location                         |
| -------------------------------------- | -------------------------------- |
| Local to one page                      | `src/pages/PageName/types.ts`    |
| Shared between pages (business domain) | `src/features/<domain>/types.ts` |
| Raw API response shapes (DTOs)         | `src/api/types.ts`               |
| Global UI / app-wide primitives        | `src/shared/types/`              |

### Rule 9 — Global State Budget

Before adding a store slice:

1. Needed by more than one page simultaneously? No → keep in page hook.
2. Yes — is it server state? Yes → React Query/SWR, not a store.
3. Persists across sessions? Yes → store + localStorage. No → single atom.

Page-level UI state (open modal, selected tab, form draft) **never** goes into the global store.

### Rule 10 — Styles

- CSS Modules (`.module.css`) only — never mix approaches.
- Style files live **next to the component they style**.
- `src/styles/` contains only: global reset, design tokens, typography baseline.

### Rule 11 — Testing Strategy

| Layer                        | Test type                            | Location                               |
| ---------------------------- | ------------------------------------ | -------------------------------------- |
| Page component               | Integration test (render + mock API) | `PageName.test.tsx` next to page       |
| Page hook                    | Unit test                            | `hooks/useHook.test.ts` next to hook   |
| Page component (non-trivial) | Unit test                            | `Component.test.tsx` next to component |
| `src/shared/`                | Unit tests for all exports           | Next to each file                      |
| `src/api/`                   | Mock/contract tests                  | `api/*.test.ts`                        |

### Rule 12 — Import Aliases

```ts
// Always use alias imports
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/useAuth';

// Never use relative imports that escape the current page folder
// ❌ import { Button } from '../../../shared/components/Button';
```

---

## Checklist — Before Adding a File

- [ ] **Is it a page?** → `src/pages/PageName/`
- [ ] **Is it a component/hook used only by this page?** → Inside the page folder
- [ ] **Is it used by 2+ pages AND has business meaning?** → `src/features/<domain>/`
- [ ] **Is it a pure UI primitive with no business meaning?** → `src/shared/components/`
- [ ] **Is it a generic mechanics hook?** → `src/shared/hooks/`
- [ ] **Is it a network call?** → `src/api/<domain>.ts`
- [ ] **Is it truly global client state?** → `src/store/`

If none of the above fit, the abstraction is probably premature. Keep it in the page.

---

## Anti-Patterns to Avoid

| Anti-pattern                                    | Fix                                       |
| ----------------------------------------------- | ----------------------------------------- |
| `src/components/` flat dump                     | Move to `shared/` or into the owning page |
| `useEffect` with `fetch` in a page component    | Extract to a hook + `src/api/`            |
| Page importing from another page                | Move to `features/` or `shared/`          |
| Global store for per-page UI state              | Use local `useState` or `useReducer`      |
| `shared/` components with domain-specific props | Move to `features/`                       |
| One giant `utils.ts` at src root                | Scope utils to their layer                |
| Exporting hooks/types from page barrels         | Barrel exports only the page component    |

---

## Quick Reference

```
Page-owned:    src/pages/PageName/{components,hooks,utils,types.ts}
Cross-domain:  src/features/<domain>/
Pure UI:       src/shared/components/
Generic hooks: src/shared/hooks/
Network:       src/api/
Global state:  src/store/
Routing:       src/router/
Tokens/reset:  src/styles/
```
