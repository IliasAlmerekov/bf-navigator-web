# Plan: Home Search

## Feature Goal

Replace the static, uncontrolled date and time text inputs on the home search form with accessible native `<input type="date">` and `<input type="time">` elements backed by React state. Gate navigation on both origin and destination being confirmed from the autocomplete list. Surface per-field inline validation messages with `aria-invalid` and `aria-describedby` ARIA linkage. Preserve all existing keyboard support.

---

## Resolved Design Decisions

| Open question                             | Decision                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Default date                              | Today's date (`new Date()` formatted as `YYYY-MM-DD`) — simplest, unambiguous, correct for a live travel app      |
| Default time                              | `09:00` — matches the previous static "09:30" spirit without implying false precision                             |
| Validation scope                          | Station selection is required (origin + destination). Date and time are required (empty values block submission). |
| Error message placement                   | Inline, immediately after the associated field, one `<p>` per field                                               |
| `SearchFieldControl` / static arrays      | Remove both — they are dead code once date/time fields are replaced                                               |
| `StationAutocompleteField` `aria-invalid` | Add an `invalid` boolean prop; the component sets `aria-invalid={invalid}` on the combobox input                  |
| Submit buttons                            | Change both to `type="submit"` and move all navigation + validation into the form's `onSubmit` handler            |

---

## Touched Files

| File                                                                  | Reason                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/HomeSearch/HomeSearch.tsx`                                 | Add date/time state; remove `SearchFieldControl` and static arrays; add `formErrors` state; replace static fields with controlled date/time inputs; wire validation in `onSubmit`; change button types; pass `invalid` prop to `StationAutocompleteField` |
| `src/pages/HomeSearch/components/StationAutocompleteField.tsx`        | Add `invalid?: boolean` prop to both union branches; pass `aria-invalid={props.invalid ?? false}` to the combobox input; add `aria-describedby` support for an external validation error ID                                                               |
| `src/pages/HomeSearch/HomeSearch.module.css`                          | Add `.date-time-field` layout class (mirrors `.search-field` but suitable for native inputs); add `.field-error` paragraph style; fix `.search-input:focus` to use `box-shadow` focus ring instead of `outline: none`                                     |
| `src/pages/HomeSearch/components/StationAutocompleteField.module.css` | Add error-state ring on `.control` when `aria-invalid="true"` (attribute selector)                                                                                                                                                                        |
| `src/pages/HomeSearch/HomeSearch.test.tsx`                            | Add tests: date input renders and updates; time input renders and updates; submit blocked when stations not selected (error messages appear); submit proceeds when both stations selected                                                                 |

### Files NOT changing

- `src/routes/index.tsx` — no change
- `src/pages/HomeSearch/types.ts` — `FieldKey` is sufficient; new state is local to `HomeSearch.tsx`
- `src/pages/HomeSearch/constants.ts` — no change
- `src/pages/HomeSearch/hooks/useStationSuggestions.ts` — no change

---

## Implementation Sequence

### Step 1 — `StationAutocompleteField.tsx`: add `invalid` prop

Add `invalid?: boolean` to both union branches of `StationAutocompleteFieldProps`. Pass it to the combobox input as `aria-invalid={props.invalid ?? false}`. The external error paragraph (rendered in `HomeSearch.tsx`) will be linked via `aria-describedby` on the input using a new `errorId` prop.

Add `errorId?: string` to both union branches. When `errorId` is provided, merge it into `aria-describedby` alongside the existing `statusId`. Existing `statusId` logic is unchanged.

### Step 2 — `StationAutocompleteField.module.css`: error ring

Add an attribute selector for the parent `.field` when the combobox inside is invalid:

```css
/* when the combobox input is marked invalid, show a red ring on the control */
.control:has([aria-invalid='true']) {
  box-shadow: inset 0 0 0 2px rgb(180, 30, 40, 0.4);
}
```

This works because `.control` is the `<label>` wrapping the input.

### Step 3 — `HomeSearch.tsx`: state additions

Add the following state at the top of `HomeSearch`:

```ts
// controlled date/time
const [dateValue, setDateValue] = useState<string>(() => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
});
const [timeValue, setTimeValue] = useState('09:00');

// per-field validation errors
type FormErrors = {
  origin: string | null;
  destination: string | null;
  date: string | null;
  time: string | null;
};
const [formErrors, setFormErrors] = useState<FormErrors>({
  origin: null,
  destination: null,
  date: null,
  time: null,
});
```

### Step 4 — `HomeSearch.tsx`: remove dead code

Remove:

- `SearchFieldControl` function (lines 121–136)
- `MOBILE_STATIC_SEARCH_FIELDS` constant (lines 61–64)
- `DESKTOP_STATIC_SEARCH_FIELDS` constant (lines 66–69)
- `SearchField` type (lines 28–43)
- `renderFieldIcon` function (lines 111–119)
- Import of `CalendarDays`, `Clock3` from `lucide-react` if no longer used

### Step 5 — `HomeSearch.tsx`: `onSubmit` handler

Replace the current `onSubmit` stub with:

```ts
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const errors: FormErrors = {
    origin:
      routeState.origin.selectedStation === null
        ? 'Please select an origin station from the suggestions.'
        : null,
    destination:
      routeState.destination.selectedStation === null
        ? 'Please select a destination station from the suggestions.'
        : null,
    date: dateValue === '' ? 'Please select a departure date.' : null,
    time: timeValue === '' ? 'Please select a departure time.' : null,
  };

  setFormErrors(errors);

  const hasError = Object.values(errors).some((e) => e !== null);
  if (hasError) return;

  void navigate({ to: '/train-search-results' });
}
```

### Step 6 — `HomeSearch.tsx`: replace date/time fields in both grids

Replace the `{MOBILE_STATIC_SEARCH_FIELDS.map(...)}` block with two explicit controlled `<label>` + `<input>` pairs for date and time. Mirror the existing `.search-field` layout structure used by `StationAutocompleteField`'s `.control` (icon / label / value grid areas) but use a new `.date-time-field` wrapper class to allow for native input resets.

For mobile:

```tsx
<div className={styles['date-time-wrapper']}>
  <label className={styles['date-time-field']} htmlFor="date-mobile">
    <CalendarDays aria-hidden="true" className={styles['field-icon']} />
    <span className={styles['field-label']}>Date</span>
    <input
      aria-describedby={formErrors.date ? 'date-error' : undefined}
      aria-invalid={formErrors.date !== null}
      className={styles['date-input']}
      id="date-mobile"
      name="date-mobile"
      onChange={(e) => { setDateValue(e.target.value); }}
      type="date"
      value={dateValue}
    />
  </label>
  {formErrors.date ? (
    <p className={styles['field-error']} id="date-error" role="alert">
      {formErrors.date}
    </p>
  ) : null}
</div>

<div className={styles['date-time-wrapper']}>
  <label className={styles['date-time-field']} htmlFor="time-mobile">
    <Clock3 aria-hidden="true" className={styles['field-icon']} />
    <span className={styles['field-label']}>Time</span>
    <input
      aria-describedby={formErrors.time ? 'time-error' : undefined}
      aria-invalid={formErrors.time !== null}
      className={styles['date-input']}
      id="time-mobile"
      name="time-mobile"
      onChange={(e) => { setTimeValue(e.target.value); }}
      type="time"
      value={timeValue}
    />
  </label>
  {formErrors.time ? (
    <p className={styles['field-error']} id="time-error" role="alert">
      {formErrors.time}
    </p>
  ) : null}
</div>
```

Same pattern for desktop (ids: `date-desktop`, `time-desktop`; the same `dateValue`/`timeValue` state and the same `formErrors` object). The error paragraph `id`s must be unique per page — because the date error is the same message regardless of which grid is visible, use a single id pair (`date-error`, `time-error`) and rely on CSS to hide the paragraph that is inside the hidden grid. The `aria-describedby` must still point to a rendered element: use `date-error` for both and ensure the mobile error paragraph is always rendered in the DOM (even when mobile grid is `display: none`) so the reference is valid. **Alternative (safer)**: give each error paragraph a distinct id (`date-error-mobile`, `date-error-desktop`) and point each input's `aria-describedby` at its own error id. This avoids any id uniqueness concern.

**Decision**: use distinct ids per layout variant (`date-error-mobile`, `date-error-desktop`, `time-error-mobile`, `time-error-desktop`). Each input's `aria-describedby` points to its co-located error paragraph.

### Step 7 — `HomeSearch.tsx`: wire `invalid` and `errorId` props to `StationAutocompleteField`

Pass `invalid` and `errorId` to all four `StationAutocompleteField` instances:

- `origin-mobile`: `invalid={formErrors.origin !== null}`, `errorId="origin-error-mobile"`
- `destination-mobile`: `invalid={formErrors.destination !== null}`, `errorId="destination-error-mobile"`
- `origin-desktop`: `invalid={formErrors.origin !== null}`, `errorId="origin-error-desktop"`
- `destination-desktop`: `invalid={formErrors.destination !== null}`, `errorId="destination-error-desktop"`

Render error paragraphs after each `StationAutocompleteField` in `HomeSearch.tsx` (not inside the component):

```tsx
{
  formErrors.origin ? (
    <p className={styles['field-error']} id="origin-error-mobile" role="alert">
      {formErrors.origin}
    </p>
  ) : null;
}
```

### Step 8 — `HomeSearch.tsx`: change submit button types

- Desktop `search-submit`: change `type="button"` + `onClick` to `type="submit"` with no `onClick`.
- Mobile `primary-action`: same.
- Remove both `onClick={() => navigate({ to: '/train-search-results' })}` handlers; navigation moves into `handleSubmit`.

### Step 9 — `HomeSearch.module.css`: style updates

**Date/time field layout** (`.date-time-wrapper`, `.date-time-field`, `.date-input`):

```css
.date-time-wrapper {
  display: grid;
  gap: 4px;
}

.date-time-field {
  /* same layout as .search-field */
  min-height: 64px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'icon label'
    'icon value';
  gap: 2px 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #eceef0 0%, #e2e4e7 100%);
  box-shadow: inset 0 1px 0 rgb(255, 255, 255, 0.52);
  cursor: default;
}

.date-input {
  grid-area: value;
  width: 100%;
  border: 0;
  padding: 0;
  font: 600 0.9rem/1.25 var(--font-body);
  color: #202432;
  background: transparent;
  /* preserve native date/time picker trigger */
  appearance: auto;
}

.date-input:focus {
  outline: none;
  /* visible focus ring on the parent label via :focus-within */
}

.date-time-field:focus-within {
  box-shadow:
    inset 0 0 0 2px rgb(0, 51, 153, 0.22),
    0 10px 20px rgb(0, 32, 104, 0.08);
}
```

**Error paragraph** (`.field-error`):

```css
.field-error {
  margin: 0;
  padding: 0 4px;
  font-size: 0.72rem;
  line-height: 1.4;
  color: #9a2830;
}
```

**Fix the existing focus gap on `.search-input`**: The `.search-input:focus { outline: none; }` rule has no visible replacement. Add a `:focus-within` rule on `.search-field` (the parent label):

```css
.search-field:focus-within {
  box-shadow:
    inset 0 0 0 2px rgb(0, 51, 153, 0.22),
    0 10px 20px rgb(0, 32, 104, 0.08);
}
```

**Desktop overrides** (`@media (width >= 1024px)`):

```css
.date-time-field {
  min-height: 78px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #f4f5f7 100%);
  box-shadow:
    0 10px 22px rgb(25, 28, 29, 0.04),
    inset 0 0 0 1px rgb(25, 28, 29, 0.04);
}

.date-input {
  font-size: 0.82rem;
}
```

**Remove** the now-dead `.field-value` and `.search-input` rules only if nothing else references them after `SearchFieldControl` is gone. Verify by grepping the file before deleting.

---

## State and Data-Flow Summary

```
HomeSearch component state
├── routeState: Record<FieldKey, { input: string; selectedStation: StationSuggestion | null }>
├── dateValue: string  ("YYYY-MM-DD", today by default)
├── timeValue: string  ("HH:MM", "09:00" by default)
├── formErrors: { origin, destination, date, time }  (null = no error)
├── activeField: FieldKey | null
└── activeAutocompleteId: string | null

onSubmit (form element)
  → compute FormErrors from current state
  → setFormErrors(errors)
  → if any error: return (focus management: browser scrolls to first invalid field via aria-invalid)
  → navigate({ to: '/train-search-results' })

handleFieldInputChange(fieldKey, value)
  → sets routeState[fieldKey].input, selectedStation = null
  → clears formErrors[fieldKey]  ← clear error on re-type so user gets live feedback

handleStationSelect(fieldKey, station)
  → sets routeState[fieldKey].selectedStation
  → clears formErrors[fieldKey]
```

**Clearing errors on change**: When the user types into a station field or selects a station, clear the corresponding `formErrors` entry. When the user changes the date or time value, clear the corresponding `formErrors` entry. This gives immediate feedback that the error is resolved without waiting for another submit.

---

## Accessibility Scenarios

| Scenario                             | Implementation                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen reader reads validation error | `role="alert"` on error `<p>`; announced immediately on render                                                                                                                                                                                                                                                                              |
| Combobox marked invalid              | `aria-invalid="true"` on `<input role="combobox">` when station not selected after submit                                                                                                                                                                                                                                                   |
| Error paragraph linked to input      | `aria-describedby="<errorId>"` on combobox input and date/time inputs                                                                                                                                                                                                                                                                       |
| Native date/time picker keyboard     | Provided by browser; no custom keyboard handling needed                                                                                                                                                                                                                                                                                     |
| Focus visible on date/time field     | `:focus-within` box-shadow on `label.date-time-field`                                                                                                                                                                                                                                                                                       |
| Focus visible on station field       | Existing `.control:focus-within` rule in `StationAutocompleteField.module.css`                                                                                                                                                                                                                                                              |
| Error ring on invalid station field  | `.control:has([aria-invalid='true'])` in `StationAutocompleteField.module.css`                                                                                                                                                                                                                                                              |
| Reduced motion                       | Error paragraphs fade-in: if any `transition` is added, guard with `@media (prefers-reduced-motion: reduce)`                                                                                                                                                                                                                                |
| Tab order                            | Natural DOM order; both grids present but only one visible — screen readers may encounter both. Use `aria-hidden="true"` on the hidden grid container (the one the CSS hides) OR ensure `display: none` is applied via CSS (which already removes elements from the a11y tree). CSS `display: none` is already used — no extra ARIA needed. |

---

## Verification Strategy

### Automated (Vitest + RTL)

Add to `HomeSearch.test.tsx`:

1. **Date input renders with today's date** — query by `role="textbox"` or by label "Date", assert `value` is today's ISO date string.
2. **Time input renders with default** — assert `value` is `"09:00"`.
3. **Submit blocked when origin not selected** — render; fire submit without selecting a station; assert error message "Please select an origin station from the suggestions." is in the document.
4. **Submit blocked when destination not selected** — same for destination.
5. **Submit proceeds when both selected** — mock `navigate`; select both stations; fire submit; assert `navigate` was called with `{ to: '/train-search-results' }`.
6. **Error clears on station select** — trigger error, then select a station, assert error is gone.
7. **Date/time change updates shared state** — fire change on mobile date input, assert desktop date input has same value (or assert via state-driven `value` attribute on both inputs).

### Manual Verification Matrix

| Check                                                            | How                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------- |
| Keyboard: Tab to date field, open native picker with Space/Enter | Manual, Chrome + Firefox                            |
| Keyboard: Tab to time field, adjust with arrow keys              | Manual                                              |
| Keyboard: submit form with Enter key while focused on any field  | Manual — should trigger `onSubmit`                  |
| Screen reader: VoiceOver / NVDA reads date field label + value   | Manual                                              |
| Screen reader: error announced after failed submit               | Manual — `role="alert"` should read immediately     |
| Screen reader: `aria-invalid` on combobox input                  | Manual — NVDA reads "invalid data" or equivalent    |
| axe DevTools: zero critical/serious violations                   | Automated browser extension                         |
| Contrast: error text `#9a2830` on `#fff` background              | Check with Colour Contrast Analyser (ratio ≥ 4.5:1) |
| Mobile layout: date/time fields render correctly at 375px        | Chrome DevTools device simulation                   |
| Desktop layout: date/time fields render correctly at 1280px      | Browser resize                                      |

---

## Out of Scope

- Custom styling of the native date/time picker chrome (OS-controlled)
- Internationalization / locale-aware date formatting
- Persisting selected date/time across navigation
- Passing date/time/station data to the train-search-results page (state sharing / URL params)
- Fixing any other a11y issues beyond those directly caused by or adjacent to this ticket's changes (e.g. footer button semantics)
- Preference chip toggle state management
- Any changes to `src/routes/train-search-results.tsx` or the results page
