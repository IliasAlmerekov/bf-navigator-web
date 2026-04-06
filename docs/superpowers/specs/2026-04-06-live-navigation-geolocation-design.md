# Live Navigation Geolocation Design

## Goal

Turn `/live-navigation` into a working mock of accessible live wayfinding that:

- requests browser geolocation permission on page load
- tracks the user's position with live updates
- shows text-first guidance to a hardcoded destination (`Gleis 1`)
- falls back to manual start-point selection when geolocation is denied, unsupported, or fails

This is a mock-first design. Route geometry, target platform, and copy remain hardcoded for now, but the page must be structured so the data source can later be replaced with a real API without rewriting the UI.

## Non-Goals

- no real backend integration in this phase
- no turn-by-turn routing engine
- no station-wide dynamic graph search
- no background tracking outside the open page
- no map-only interaction model

## User Experience

### Primary Flow

1. User opens `Live Navigation`.
2. The page immediately requests browser geolocation permission.
3. While permission is pending, the page announces that location is being determined.
4. When permission is granted, the page starts `watchPosition`.
5. The page derives the nearest mock route point from the current location.
6. The main content presents text-first instructions to `Gleis 1`.
7. A secondary map visualizes the same current position, path, and destination.
8. As the browser reports updated coordinates, the page refreshes guidance.

### Fallback Flow

If geolocation is denied, unavailable, or errors during tracking:

1. The page explains that live location could not be used.
2. The page offers a manual start selector.
3. The user picks a predefined mock start point such as `Haupteingang`, `Aufzug E4`, or `Info Point`.
4. The page shows the same text-first guidance and secondary map using the selected fallback start point.

## Accessibility Requirements

Accessibility is a blocking requirement for this feature.

### Core Rules

- Text instructions are the primary navigation surface.
- The map is supplementary and must never be the only source of route information.
- All status changes related to location permission, tracking, fallback mode, and errors must be announced through `aria-live`.
- Manual start selection must be fully keyboard-operable.
- All controls must expose clear accessible names.
- Focus order must match reading order: status, instructions, fallback controls, map, actions.
- Motion must respect `prefers-reduced-motion`.

### Required Verifications

- Keyboard-only usage for page controls and fallback selection
- Screen reader announcements for loading, denied state, tracking state, and fallback state
- Zero critical or serious automated a11y violations
- Sufficient contrast for any new badges, banners, and control states
- No information conveyed only by map color or marker shape

## Page States

The page should explicitly model these states:

- `requesting-location`
- `live-tracking`
- `location-denied`
- `location-unavailable`
- `tracking-error`
- `manual-start-selected`

### State Behavior

- `requesting-location`: show live status and non-blocking explanation
- `live-tracking`: show current live guidance derived from browser position
- `location-denied`: explain issue and render manual start selector
- `location-unavailable`: explain missing browser support and render manual start selector
- `tracking-error`: explain tracking failure and render manual start selector
- `manual-start-selected`: show guidance derived from the selected mock start point

## Information Architecture

The page should keep this order:

1. sticky page header
2. live status region
3. primary instruction card
4. current journey details and distance summary
5. manual start selector when needed
6. secondary map block
7. optional secondary actions

This preserves a text-first experience for users who do not rely on the map.

## Component and Module Boundaries

### Route and Page

- `src/routes/live-navigation.tsx`
  Thin route file only.
- `src/pages/LiveNavigation/LiveNavigation.tsx`
  Page orchestration, browser geolocation integration, state transitions, and top-level composition.

### Mock Data

- `src/pages/LiveNavigation/liveNavigationData.ts`
  Hardcoded destination, route points, fallback start points, labels, and copy.

This file becomes the future adapter seam for real API data.

### Pure Logic

- `src/pages/LiveNavigation/liveNavigationUtils.ts`
  Pure functions for:
  - selecting the nearest route point
  - estimating remaining distance
  - resolving the next instruction block
  - deriving UI-safe text from route state

These utilities should be test-first and independent from React.

### Components

- `src/pages/LiveNavigation/components/NavigationInstructions.tsx`
  Primary text guidance and state copy.
- `src/pages/LiveNavigation/components/ManualStartSelector.tsx`
  Fallback selection UI for predefined start points.
- `src/pages/LiveNavigation/components/LiveNavigationMap.tsx`
  Secondary visualization fed entirely by props.

`LiveNavigationMap` must stop owning hardcoded route state internally. It should render supplied route data, current position, and destination only.

## Geolocation Behavior

### Permission Strategy

- Request geolocation immediately on page load.
- If available, start `watchPosition` rather than reading location once.
- Clear the watcher on unmount.

### Failure Handling

- If `navigator.geolocation` is missing, treat it as `location-unavailable`.
- If permission is denied, treat it as `location-denied`.
- If tracking starts and then errors, treat it as `tracking-error`.
- In all failure cases, keep the page useful via manual start selection.

### Tracking Strategy

For the mock phase, tracking does not need route recalculation from arbitrary coordinates. It only needs deterministic progression against the existing mocked route:

- compare current coordinates to the mocked route points
- choose the nearest or next relevant route segment
- derive the active text instruction from that segment

This keeps the implementation simple while preserving a realistic user-facing model.

## Data Model Direction

The mock route data should represent the same conceptual shape expected from a future API:

- destination
- ordered route points
- landmarks
- fallback start points
- text instructions per segment

When the real API arrives, the migration should ideally replace only:

- the data source
- the route-to-view-model adapter

The page components and most state handling should remain stable.

## Error and Edge Cases

The implementation must account for:

- permission prompt still pending
- permission denied immediately
- browser without geolocation support
- watcher error after tracking begins
- fallback start point selected
- no matching route step for a selected position
- empty or malformed mock route data

If route data cannot produce guidance, the page should show a plain-language fallback message instead of a technical error.

## Testing Strategy

Implementation must follow TDD.

### Unit Tests

Add tests for pure route utilities:

- nearest route point resolution
- remaining distance estimation
- active instruction selection
- fallback start point route derivation

### Page Tests

Add tests for the main page states:

- requesting location on mount
- successful live tracking flow
- denied geolocation fallback
- unsupported geolocation fallback
- tracking error fallback
- manual start selection updates instructions

### Accessibility Checks

Verify at minimum:

- live region announcements are present
- fallback controls are keyboard reachable
- text instructions remain available without using the map

## Implementation Notes

- keep the solution small and local to `LiveNavigation`
- avoid speculative abstractions beyond the future API seam
- keep browser API usage in the page layer, not in presentational components
- prefer semantic controls over custom interaction widgets
- do not depend on the map for business logic

## Definition of Done

This design is complete when:

- `/live-navigation` is no longer a placeholder
- the page requests geolocation on load
- the page updates guidance as position changes
- fallback start selection works when live location is unavailable
- text instructions are the primary navigation surface
- map content reflects the same route as the text guidance
- tests cover route utilities and main page states
- the data source can later be swapped for a real API with minimal UI changes
