---
name: code-quality
description: Use this skill when writing, reviewing, or planning React + TypeScript code to prevent code salad. Covers KISS, YAGNI, DRY, SRP, SoC, OCP, DIP, naming conventions, component and function design, and a red-flags checklist for the React 19 + Vite + TypeScript stack.
---

# Code Quality — Anti-Salad Rules

## Scale Decision Framework

Before applying any principle, determine the scale:

| Scale      | Criteria                   | Apply                      |
| ---------- | -------------------------- | -------------------------- |
| **Tiny**   | < 50 lines, single concern | KISS + DRY only            |
| **Medium** | 1–3 files, one feature     | KISS + DRY + selective SRP |
| **Large**  | Cross-cutting, domain-wide | Full principle evaluation  |

## Priority Order

```
1. Correctness        — working code beats everything
2. KISS               — simplest solution that works
3. YAGNI              — no speculative generality
4. Readable naming    — code reads like prose
5. SRP                — one reason to change
6. DRY (Rule of 3)    — extract only proven duplication
7. SoC                — right code in the right layer
8. OCP/ISP/DIP/LSP    — only when scale justifies it
```

---

## KISS

Write the simplest code that solves the actual problem. If it feels clever, rewrite it to be obvious.

## YAGNI

No flags for non-existent features. No `Base*` patterns until 2+ real consumers exist. Build for today; refactor when the second use case arrives.

## DRY — Rule of Three

- 1 use: inline. 2 uses: tolerate. 3 uses: extract.
- Ask: "if this changes, should both call sites change together?" If yes — DRY. If no — leave them separate.

## SRP — Single Responsibility

One module, one reason to change. Split when:

- Component exceeds ~150 lines
- Hook does fetching + transforms + UI state
- Function name contains "and"

Split pattern:

```
src/api/routes.ts                              → network call
src/pages/SearchPage/hooks/useRouteSearch.ts   → state + coordination
src/pages/SearchPage/utils/formatRoute.ts      → pure formatting
src/pages/SearchPage/components/RouteCard/     → render only
```

## SoC — Separation of Concerns

| Concern              | Lives in   |
| -------------------- | ---------- |
| Presentation         | Components |
| State & coordination | Hooks      |
| Data access          | `src/api/` |

No `fetch()` in components or pages — ever.

## OCP — Config Maps over If/Else Chains

When a switch/if-else grows with every new variant, convert to a lookup map. Skip for ≤ 2 variants.

```ts
// ❌ grows with every new status
if (status === 'active') return { color: 'green', label: 'Active' };

// ✅ new status = add a record
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Active' },
  delayed: { color: 'yellow', label: 'Delayed' },
  cancelled: { color: 'red', label: 'Cancelled' },
};
```

## DIP — Layer Boundaries

Apply at component → hook → api boundary. Within a layer, direct calls are fine.

```ts
// injectable for tests
export function useRouteSearch(params: RouteSearchParams, api = routesApi) { ... }
```

## Naming Conventions

```ts
// Functions — verb phrase
getUserById()     ✅    userData()      ❌
handleSubmit()    ✅    submitHandler() ❌

// Booleans — is/has/can/should
isLoading         ✅    loading         ❌
hasSeatsAvailable ✅    seatsAvailable  ❌

// Components — PascalCase noun
TrainSearchCard   ✅    renderTrainCard() ❌

// Hooks — useNoun or useVerbNoun
useRouteSearch    ✅    useGetRoutes()  ❌
useTrainDetails   ✅    useTrainData()  ❌  ("data" is noise)

// Constants
const MAX_RESULTS = 50;                 ✅  // UPPER_SNAKE
const apiEndpoints = { search: '...' }; ✅  // camelCase for config
```

## Function Design

- One level of abstraction per function.
- Max 3 params — use an options object beyond that.
- Pure functions when possible.
- Early return over nested conditionals.

```ts
// ✅ early returns
function processBooking(booking: Booking) {
  if (booking.status !== 'confirmed') return;
  if (booking.seats <= 0) return;
  // logic at top level
}
```

## Component Design

```tsx
// Explicit props — never `any`, use Pick/Omit
interface TrainCardProps {
  train: Pick<Train, 'id' | 'number' | 'departureTime'>;
  onSelect?: (id: string) => void;
}

// Flat render — early returns, not nested ternaries
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;
return <TrainList data={data} />;
```

---

## Code Salad — Red Flags

| Symptom                                | Fix                                     |
| -------------------------------------- | --------------------------------------- |
| Component > 150 lines                  | Extract hooks + sub-components          |
| Hook: fetch + transform + UI state     | Split into api fn + util + focused hook |
| `fetch()` in a component               | Move to `src/api/`                      |
| Function name contains "and"           | Split into two functions                |
| `props.a.b.c.d` chain                  | Pass the leaf directly                  |
| Same logic in 3+ places                | Extract (DRY)                           |
| `isOldX?: boolean` flags               | Config map (OCP)                        |
| 10+ props on a component               | Composition or split                    |
| Nested ternaries in JSX                | Early return pattern                    |
| `any` type                             | Define an interface                     |
| Commented-out code                     | Delete — git history exists             |
| `Base*` / `Generic*` with one consumer | Remove (YAGNI)                          |

---

## Quick Decision Cheatsheet

```
Utility function < 30 lines?       → KISS + pure. Done.
New component?                     → SRP + KISS + check shared/
Adding a variant?                  → ≤ 2: props. 3+: config map.
New hook?                          → SoC + SRP + inject api
Repeated code?                     → Rule of Three (3+ → extract)
If/else growing?                   → Early return + config map
"Future-proof" abstraction?        → Stop. YAGNI. Wait for use case 2.
```
