# Research: Home Search

## Ticket Summary

Replace static date/time text inputs on the home search form with native `type="date"` and `type="time"` inputs. Add validation that requires both origin and destination to be confirmed via autocomplete selection before the search can proceed. Surface inline validation messages with correct ARIA linkage. Preserve all existing keyboard support.

---

## Current Behavior

### Date / Time Fields

Both mobile and desktop layouts render date and time using a shared `SearchFieldControl` component (`HomeSearch.tsx:121–136`) that produces a `<label>` wrapping an `<input type="text">` with a static `defaultValue`. The inputs are **uncontrolled** — no React state backs them.

- Mobile static config (`MOBILE_STATIC_SEARCH_FIELDS`, line 61–64):
  - date: `defaultValue="Tomorrow, 14 Oct"`, name `date-mobile`
  - time: `defaultValue="09:30 AM"`, name `time-mobile`
- Desktop static config (`DESKTOP_STATIC_SEARCH_FIELDS`, line 66–69):
  - date: `defaultValue="Tomorrow"`, name `date-desktop`
  - time: `defaultValue="09:30"`, name `time-desktop`

The mobile and desktop configs are separate arrays rendered into separate grid containers. Both containers exist in the DOM simultaneously; CSS hides one or the other based on viewport width (`@media (width >= 1024px)`).

### Station Autocomplete

`StationAutocompleteField` (`src/pages/HomeSearch/components/StationAutocompleteField.tsx`) is a fully keyboard-navigable combobox. ARIA attributes present: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`, `aria-describedby` (status live region).

`routeState` in `HomeSearch.tsx` tracks `{ input: string; selectedStation: StationSuggestion | null }` for each field key (`origin` | `destination`). `selectedStation` is set to the `StationSuggestion` object on selection and reset to `null` whenever the user types again.

### Validation

There is currently **no validation**. Both submit paths navigate unconditionally:

- Desktop icon button (`search-submit`, line 342–350): `type="button"` + `onClick={() => navigate({ to: '/train-search-results' })}`
- Mobile/shared CTA (`primary-action`, line 373–381): same pattern

The `form` element's `onSubmit` only calls `event.preventDefault()` with no validation logic.

---

## Affected Routes, Pages, and Modules

| Layer      | Path                                                                  | Notes                                                                                                           |
| ---------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Route      | `src/routes/index.tsx`                                                | Thin; renders `HomeSearch`. No change expected.                                                                 |
| Page       | `src/pages/HomeSearch/HomeSearch.tsx`                                 | Primary change target. State, handlers, form rendering.                                                         |
| Component  | `src/pages/HomeSearch/components/StationAutocompleteField.tsx`        | Needs `aria-invalid` + `aria-describedby` prop support for validation errors.                                   |
| CSS module | `src/pages/HomeSearch/HomeSearch.module.css`                          | Styles for date/time fields; may need error state variants and `type="date"/"time"` resets.                     |
| CSS module | `src/pages/HomeSearch/components/StationAutocompleteField.module.css` | May need error-state border / focus style.                                                                      |
| Types      | `src/pages/HomeSearch/types.ts`                                       | `FieldKey` is sufficient. No new shared types anticipated, but date/time state shape lives in `HomeSearch.tsx`. |
| Constants  | `src/pages/HomeSearch/constants.ts`                                   | No change expected.                                                                                             |
| Hook       | `src/pages/HomeSearch/hooks/useStationSuggestions.ts`                 | No change expected.                                                                                             |
| Tests      | `src/pages/HomeSearch/HomeSearch.test.tsx`                            | Needs new test cases for date/time inputs and validation.                                                       |

---

## Data Flow

```
User types in date input (type="date")
  → React controlled onChange → dateValue state (single source of truth)
  → Both mobile and desktop date inputs read from same state

User types in time input (type="time")
  → React controlled onChange → timeValue state (single source of truth)
  → Both mobile and desktop time inputs read from same state

User types in station field
  → handleFieldInputChange → routeState[fieldKey].input, selectedStation = null

User clicks a suggestion
  → handleStationSelect → routeState[fieldKey].selectedStation = StationSuggestion

User submits (either button)
  → validate: origin.selectedStation !== null AND destination.selectedStation !== null
  → if invalid: set error state, do NOT navigate
  → if valid: navigate({ to: '/train-search-results' })
```

### Mobile / Desktop Dual-Render Pattern

Both layout variants are rendered in the DOM at all times. Station fields already handle this by using distinct `inputId` / `inputName` per variant (`origin-mobile`, `origin-desktop`) but share the same `routeState`. The same approach applies to date/time: single state, two controlled inputs with distinct `id` and `name` values (e.g. `date-mobile`, `date-desktop`).

---

## CONVENTION.md Constraints

- **A11y is the primary constraint** (CONVENTION.md §9):
  - `type="date"` and `type="time"` are native inputs — prefer them over custom widgets.
  - Every input must have a `<label>` or `aria-label`.
  - Error messages must be linked via `aria-describedby`. Invalid state must set `aria-invalid="true"`.
  - `aria-live` region required for dynamic validation announcements.
  - Focus outlines must not be suppressed without an equivalent visible replacement.
- **CSS Modules** for all scoped styles (§8).
- **No `any`**, strict TypeScript (§13).
- **Small, readable functions** — no premature abstraction (§3.1).
- **Do not edit `src/routeTree.gen.ts` manually** (§13).
- Shared code moves out only when two or more pages need it (§3.2).

---

## Known A11y Gaps in Current Code

1. **`outline: none` on `.search-input:focus`** (`HomeSearch.module.css:163–165`) removes the native focus ring on the static date/time fields. There is no visible custom focus replacement for these fields. The `StationAutocompleteField` partially mitigates this via `.control:focus-within` which applies a `box-shadow` border — but the static `SearchFieldControl` has no equivalent.
2. **Date/time inputs are uncontrolled with `defaultValue`** — they cannot be reset or validated programmatically.
3. **No `aria-invalid` / `aria-describedby`** on any form field. Neither the station combobox inputs nor the date/time inputs surface invalid state to screen readers.
4. **Submit buttons bypass form submission** (`type="button"`) — validation on `onSubmit` is possible but currently does nothing.

---

## Edge Cases and Failure Scenarios

| Scenario                                                   | Current Behavior                                | Expected After Ticket                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| User types in station field but never selects a suggestion | `selectedStation` is `null`; navigates anyway   | Blocked; inline error shown                                                                                        |
| User selects a station, then types more text               | `selectedStation` reset to `null`               | Blocked on submit; inline error                                                                                    |
| User clears the date input                                 | Static text stays (uncontrolled)                | Empty string; validation may require non-empty                                                                     |
| User clears the time input                                 | Same                                            | Same                                                                                                               |
| `type="date"` browser UI varies per OS/browser             | N/A                                             | Cannot be styled uniformly; native picker expected                                                                 |
| Date/time input value format                               | N/A                                             | `type="date"` → `YYYY-MM-DD`; `type="time"` → `HH:MM`                                                              |
| Mobile and desktop inputs out of sync                      | N/A                                             | Both read from shared state; onChange on either must update shared state                                           |
| Screen reader announces validation error                   | N/A                                             | Must use `aria-live` or `aria-describedby`                                                                         |
| Reduced motion                                             | Preferences chips have no animation; no concern | Date/time native inputs: no animation; validation messages must not animate without `prefers-reduced-motion` guard |

---

## Open Questions

1. **Default date value**: The current static text shows "Tomorrow". Should the date input default to `today + 1 day` computed at render time? Or today? This affects the initial `useState` value.
2. **Validation scope for date/time**: Should empty date or time block submission? Or only station selection is required? The ticket only mentions station validation explicitly.
3. **Error message placement and content**: Where do validation messages appear relative to each field? One message per field, or a summary? The ticket says "inline validation messages" but doesn't specify copy.
4. **`SearchFieldControl` removal**: Once date/time fields are replaced, `SearchFieldControl` and the `MOBILE_STATIC_SEARCH_FIELDS` / `DESKTOP_STATIC_SEARCH_FIELDS` constants become dead code. Confirm they can be removed.
5. **`StationAutocompleteField` `aria-invalid` prop**: The component currently has no `aria-invalid` or error-border prop. Does the plan add a prop, or is the external validation message (linked via `aria-describedby`) sufficient without marking the input itself as `aria-invalid="true"`? WCAG requires `aria-invalid="true"` on the input.
6. **Submit button type**: The desktop submit and mobile primary CTA use `type="button"`. Changing to `type="submit"` and using the form's `onSubmit` is more semantically correct and would allow Enter key to trigger form submission naturally.
