# Code Quality — Anti-Salad Rules

> A decision guide, not a checklist to apply blindly.
> Every principle has a cost. Weigh it against the actual complexity of the code being written.
> **Simple code that works beats elegant code that over-engineers.**

---

## Scale Decision Framework

Before applying any principle, determine the scale of what you are writing:

| Scale      | Criteria                                 | Apply                        |
| ---------- | ---------------------------------------- | ---------------------------- |
| **Tiny**   | < 50 lines, single concern               | KISS + DRY only. Stop there. |
| **Medium** | 1–3 files, one feature                   | KISS + DRY + selective SRP   |
| **Large**  | Cross-cutting, multiple pages or domains | Full principle evaluation    |

Applying SOLID to a 30-line utility is over-engineering.
Not applying SRP to a 400-line God component is negligence.

---

## Priority Order

When principles conflict, resolve in this order:

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

## KISS — Keep It Simple

Write the simplest code that solves the actual problem. Complexity must be justified by a real requirement, not an anticipated future need.

- A function does one thing and its name says exactly what that thing is.
- If you need a comment to explain _what_ code does (not _why_), rewrite the code.
- Prefer `if/else` over clever ternary chains.
- Prefer explicit over implicit.
- If the implementation feels clever, treat that as a warning sign. Rewrite it to be obvious.

```ts
// ❌ Requires mental parsing
const getLabel = (t: string) => (t === 'a' ? 'Active' : t === 'c' ? 'Cancelled' : 'Unknown');

// ✅ Simple and extensible
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
};
const getLabel = (status: string): string => STATUS_LABELS[status] ?? 'Unknown';
```

---

## YAGNI — Don't Build for Tomorrow

Do not implement features, abstractions, or generalisations until they are actually required.

- No `isV2?: boolean` flags for features that don't exist yet.
- No `BaseComponent` base patterns until there are 2+ real consumers.
- No configuration objects for options that have one value today.
- No generic repository patterns unless there are multiple data sources.

> Build what is needed today. Refactor when the second use case arrives — that's the moment the right abstraction becomes visible.

---

## DRY — Rule of Three

Every piece of knowledge should have a single, unambiguous representation. Apply only when the **same logic** (not just similar-looking code) appears in 2+ places and is likely to change together.

- 1 use: write inline.
- 2 uses: tolerate duplication, wait for the pattern to stabilise.
- 3 uses: extract.

**The trap — coincidental duplication.** Two functions can look identical but represent different concepts. Merging them creates false coupling.

> Ask: "if this logic changes, should both call sites change together?" If yes — DRY. If maybe — wait. If no — leave them separate.

---

## SRP — Single Responsibility

**One module, one reason to change.**

Apply when:

- A component exceeds ~150 lines
- A hook does fetching + transforms + UI state simultaneously
- You catch yourself writing "and" in a function name
- A change to feature A requires touching a file for feature B

Split pattern for this stack:

```
// src/api/routes.ts          → network call
// src/pages/SearchPage/hooks/useRouteSearch.ts  → state + coordination
// src/pages/SearchPage/utils/formatRoute.ts     → pure formatting
// src/pages/SearchPage/components/RouteCard/    → render only
```

---

## SoC — Separation of Concerns

The three concerns in this frontend:

| Concern                  | What it does                               | Lives in   |
| ------------------------ | ------------------------------------------ | ---------- |
| **Presentation**         | Render UI, handle user events              | Components |
| **State & coordination** | Data fetching, derived state, side effects | Hooks      |
| **Data access**          | Network calls, serialisation               | `src/api/` |

Never put `fetch()` calls inside components or page modules directly. They belong in `src/api/`.

---

## OCP — Open for Extension, Closed for Modification

When a `switch`/`if-else` grows every time a new variant is added, convert it to a lookup map.

```ts
// ❌ Modified every time a new status is added
function getStatusConfig(status: string) {
  if (status === 'active') return { color: 'green', label: 'Active' };
  if (status === 'delayed') return { color: 'yellow', label: 'Delayed' };
  if (status === 'cancelled') return { color: 'red', label: 'Cancelled' };
}

// ✅ New status = add a record. Core function never changes.
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Active' },
  delayed: { color: 'yellow', label: 'Delayed' },
  cancelled: { color: 'red', label: 'Cancelled' },
};
const getStatusConfig = (status: string) => STATUS_CONFIG[status] ?? STATUS_CONFIG['active'];
```

Skip OCP for ≤ 2 variants with no growth expected.

---

## LSP — Extending Without Breaking the Contract

When extending a component's props interface, never make a previously required prop optional, nullable, or narrower. If you need different behaviour, use composition instead of extension.

```tsx
// ❌ Violates LSP — removes a required prop
interface ButtonProps {
  onClick: () => void;
  label: string;
}
interface IconButtonProps extends ButtonProps {
  label?: never;
}

// ✅ Extends without removing
interface ButtonProps {
  onClick: () => void;
  label: string;
}
interface IconButtonProps extends ButtonProps {
  icon: ReactNode;
}
```

---

## ISP — Don't Force Unused Dependencies

If a shared interface has 6+ methods and consumers only use 2–3 of them, split it by consumer need. Interfaces with 2–4 props: don't split.

---

## DIP — Depend on Abstractions at Layer Boundaries

Apply at the component → hook → api boundary. Within a single layer, direct calls are fine.

```ts
// src/api/routes.ts
export const routesApi = {
  search: (params: RouteSearchParams): Promise<Route[]> => client.post('/routes/search', params),
};

// src/pages/SearchPage/hooks/useRouteSearch.ts
import { routesApi } from '@/api/routes';
export function useRouteSearch(params: RouteSearchParams, api = routesApi) {
  // api is injectable for tests
}
```

---

## Law of Demeter — Don't Reach Through Objects

```ts
// ❌ Reaches through trip → route → departure → station
function formatDeparture(trip: Trip) {
  return `${trip.route.departure.station.name}, pl. ${trip.route.departure.platform}`;
}

// ✅ Pass what the function actually needs
function formatDeparture(departure: Departure) {
  return `${departure.station.name}, pl. ${departure.platform}`;
}
// Caller: formatDeparture(trip.route.departure)
```

If you see `a.b.c.d` in a function body, it's a signal to restructure what's passed in.

---

## Composition over Inheritance

In React 19, always compose — never build inheritance hierarchies.

```tsx
// ✅ Compose primitives
function Modal({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className={styles.modal}>
      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel, message }: ConfirmModalProps) {
  return (
    <Modal
      footer={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
```

---

## Fail Fast — Surface Errors at the Boundary

Validate at the entry point: API responses, URL params, form inputs. Inside the feature, trust the types.

```ts
// ✅ Parse and fail immediately at the API boundary
const route = RouteSchema.parse(rawData); // throws with a clear message
// rest of the function works with a guaranteed-valid Route
```

---

## Naming Conventions

```ts
// Functions — verb phrase describing what they do
getUserById()          ✅    userData()           ❌  (noun only)
handleSubmit()         ✅    submitHandler()      ❌  (inverted)
formatDepartureTime()  ✅    departureTimeFormat() ❌

// Booleans — is/has/can/should prefix
isLoading              ✅    loading              ❌
hasSeatsAvailable      ✅    seatsAvailable       ❌
canBook                ✅    bookable             ❌

// React components — PascalCase noun
TrainSearchCard        ✅    renderTrainCard()    ❌
RouteResultList        ✅    TrainCards           ❌  (vague plural)

// Hooks — useNoun or useVerbNoun
useRouteSearch         ✅    useGetRoutes()       ❌  (verb-verb)
useTrainDetails        ✅    useTrainData()       ❌  ("data" is noise)
useDepartureTimer      ✅

// Constants
const MAX_SEARCH_RESULTS = 50;                  ✅  // true constant → UPPER_SNAKE
const apiEndpoints = { search: '/routes' };     ✅  // config object → camelCase

// Avoid noise words without specificity
getRouteInfo()         ❌    getRouteDepartures()  ✅
trainManager           ❌    trainSearchService    ✅
```

---

## Function Design

1. **One level of abstraction per function** — don't mix high-level coordination with low-level detail.
2. **Max 3 parameters** — beyond 3, use an options object.
3. **Pure functions when possible** — same input, same output, no side effects.
4. **Early return over nested conditionals.**

```ts
// ❌ Guards nested 3 levels deep
function processBooking(booking: Booking) {
  if (booking.status === 'confirmed') {
    if (booking.seats > 0) {
      if (booking.paymentMethod !== 'unknown') {
        // actual logic buried here
      }
    }
  }
}

// ✅ Early returns — logic at top level
function processBooking(booking: Booking) {
  if (booking.status !== 'confirmed') return;
  if (booking.seats <= 0) return;
  if (booking.paymentMethod === 'unknown') return;
  // actual logic here
}
```

---

## Component Design

```tsx
// 1. Explicit props interface — never `any`, use Pick/Omit over whole entities
interface TrainCardProps {
  train: Pick<Train, 'id' | 'number' | 'departureTime' | 'status'>;
  onSelect?: (id: string) => void;
}

// 2. Defaults via destructuring, not defaultProps
function TrainCard({ train, onSelect = () => {} }: TrainCardProps) { ... }

// 3. Flat render logic — early returns, not nested ternaries in JSX
// ❌
return (
  <div>
    {isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : !data?.length ? <EmptyState /> : <TrainList data={data} />}
  </div>
);

// ✅
if (isLoading) return <Spinner />;
if (error)     return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;
return <TrainList data={data} />;

// 4. Avoid prop drilling beyond 2 levels — compose at the point of use
```

---

## Code Salad — Red Flags

These patterns require restructuring before merging:

| Symptom                                            | Root cause             | Fix                                           |
| -------------------------------------------------- | ---------------------- | --------------------------------------------- |
| Component > 150 lines                              | Missing SRP            | Extract hooks + sub-components                |
| Hook does fetching + transforms + UI state         | Missing SoC            | Split: api fn → transform util → focused hook |
| `fetch()` / `axios` in a component or page         | SoC violation          | Move to `src/api/`                            |
| Function name contains "and"                       | Missing SRP            | Split into two functions                      |
| `props.trip.route.departure.station.name`          | LoD violation          | Pass `station` or `departure` directly        |
| Same validation logic in 3+ places                 | DRY violation          | Extract to `src/shared/utils/`                |
| `isOldDesign?: boolean`, `isNewFlow?: boolean`     | Unmanaged variants     | OCP — use config map or composition           |
| 10+ props on a component                           | ISP / poor composition | Split or use composition pattern              |
| Nested ternaries in JSX                            | KISS violation         | Early return pattern                          |
| `any` type in TypeScript                           | No contract            | Define an interface                           |
| Commented-out code blocks                          | YAGNI debt             | Delete. Git history exists.                   |
| `src/components/` flat dump                        | Scope violation        | Move to page folder or `src/shared/`          |
| `useEffect` with `fetch()` inside a component      | SoC violation          | Move to hook → `src/api/`                     |
| Speculative `Base*`, `Generic*`, `Abstract*` names | YAGNI                  | Build when the second use case arrives        |

---

## Quick Decision Cheatsheet

```
New utility function (< 30 lines)?
→ KISS + pure function. Done.

New React component?
→ SRP (one concern) + KISS (no clever JSX) + check if similar exists in shared/

Adding a variant to an existing component?
→ ≤ 2 variants: props. 3+ variants with growth expected: OCP config map or composition.

New custom hook?
→ SoC (no fetch in component) + SRP (one domain) + DIP (inject api at boundary for tests)

New api module?
→ SRP first. Thin — one domain per file.

Seeing repeated code?
→ Rule of Three: 1–2 uses: tolerate. 3+ uses: DRY refactor.

Nested if/else growing with new variants?
→ Early return + OCP config map.

About to add a "future-proof" abstraction?
→ Stop. Apply YAGNI. Build it when the second real use case arrives.

Interface has 6+ methods, consumers use only 2–3?
→ ISP: split by consumer need.
```
