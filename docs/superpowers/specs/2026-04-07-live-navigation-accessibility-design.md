# Live Navigation — Departure Accessibility Routing Design

**Date:** 2026-04-07  
**Scope:** Departure-station-only accessible routing in `LiveNavigation`

---

## Problem

BF Navigator is built primarily for users with disabilities. The current `LiveNavigation` page still depends on a partially mocked route model:

1. It can render elevator-based guidance, but it does not use a precise backend-provided entrance-to-platform route.
2. It treats facility coordinates as a fallback stop position, which is not reliable enough for departure guidance.
3. It does not distinguish between an accessible route and informational infrastructure markers.
4. It does not present a clear blocked-path state when no active accessible route is available.

The goal for this MVP is narrower than full indoor routing:

- build a single accessible route for the departure station only
- route from station entrance to the departure point using active elevators only
- show escalators as informational markers only
- if no accessible route exists, show a clear warning and a UI-only `Hilfe rufen` button

---

## Confirmed Current Backend State

The neighboring `bf-navigator-service` already provides:

- `touchpoints[]` with `kind`, `stationName`, `arrivalTime`, `departureTime`, `station`, `facilities`, and `accessibility`
- live facility status for elevators and escalators
- full Google Routes payload retrieval via `*`, not a reduced field mask

The backend does **not** yet provide:

- `walkingApproach`
- `departureStop` / `arrivalStop` coordinates
- precise stop `latitude` / `longitude`

This means the backend work for this ticket is incremental: keep existing touchpoint and facility enrichment, and only add the missing coordinates required by `LiveNavigation`.

---

## Chosen Approach

### Recommended and approved

Implement **departure-only accessible routing**:

`walkingApproach -> ACTIVE elevators -> departureStop`

Important constraints:

- only the first `ORIGIN` touchpoint is used for route building
- transfers are out of scope
- escalators never become part of the accessible route
- if no accessible route exists, the page shows a blocked-path UI state instead of inventing an unsafe fallback

This keeps the MVP aligned with BF Navigator's accessibility-first requirement and avoids presenting escalators as substitutes for elevators.

---

## Backend Design

### Existing behavior to preserve

- keep `touchpoints`, `facilities`, and `accessibility` generation unchanged
- keep `/routes/trains` as the single frontend contract
- keep compatibility for consumers that do not yet use the new navigation fields

### Required additions

#### 1. Extend `TrainRouteStopDTO`

Add optional coordinate fields:

```java
private Double latitude;
private Double longitude;
```

Populate them from Google Routes `stopDetails.departureStop.location.latLng` and `stopDetails.arrivalStop.location.latLng`.

#### 2. Add `WalkingApproachDTO`

```java
public class WalkingApproachDTO {
    private Double latitude;
    private Double longitude;
    private String instruction;
}
```

This represents the last meaningful WALK approach point before the departure transit step.

#### 3. Extend `TrainRouteTouchpointDTO`

Add optional fields:

```java
private TrainRouteStopDTO departureStop;
private TrainRouteStopDTO arrivalStop;
private WalkingApproachDTO walkingApproach;
```

For this ticket, `LiveNavigation` will use only the `ORIGIN` touchpoint, but the contract can remain generic.

#### 4. Update `TrainRouteService`

- `mapDepartureStop()` parses stop coordinates and returns them on the DTO
- `mapArrivalStop()` parses stop coordinates and returns them on the DTO
- `buildTouchpoints()` keeps current merge behavior, but when building the `ORIGIN` touchpoint it also attaches:
  - the mapped `departureStop`
  - the mapped `arrivalStop` when available
  - the last WALK step's `endLocation` and navigation instruction as `walkingApproach`

The logic should be explicit and local. No speculative routing graph or generic indoor-routing abstraction is needed.

---

## Frontend Design

### Data model

`src/pages/TrainSearchResults/types.ts` already contains the target shape on the frontend side:

- `walkingApproach`
- `departureStop`
- `arrivalStop`

The frontend implementation should continue treating these fields as optional.

### Route source

`LiveNavigation` should stop deriving its primary route from hardcoded route points when a selected train route is available.

For MVP, it should:

- read the selected route from storage
- resolve the first `ORIGIN` touchpoint
- build one accessible route for that touchpoint only

### Accessible route construction

The route is built in this order:

1. `walkingApproach` if present
2. all `ACTIVE` facilities with `type === 'ELEVATOR'` and valid coordinates
3. `departureStop` if present

Escalators are excluded from the route path even when active.

### Map representation

The map should render:

- entrance marker for `walkingApproach`
- active elevator markers
- inactive elevator markers
- escalator markers for orientation only
- departure point marker
- a polyline only for the accessible route

Marker labels must expose status in text, not by color alone.

### Text-first guidance

The textual instruction panel remains primary. The map is supplementary.

When an accessible route exists, the text guidance should clearly say:

- where the user starts
- which elevator they should use
- where the departure point is

When no accessible route exists, the page must say so plainly and avoid implying that escalators are acceptable alternatives.

---

## UI States

### 1. Accessible route available

Conditions:

- `walkingApproach` exists
- at least one active elevator with valid coordinates exists
- `departureStop` exists

UI:

- route polyline visible
- text guidance visible
- active elevators highlighted as route waypoints

### 2. No active elevator route

Conditions:

- no active elevators for the origin touchpoint

UI:

- warning card shown
- no accessible route polyline
- inactive elevator markers may still be shown
- `Hilfe rufen` button shown as MVP UI-only control with no action

### 3. Partial data only

Conditions:

- facilities exist, but `walkingApproach` or `departureStop` is missing

UI:

- informational map markers may still render
- no precise accessible route is claimed
- text fallback explains that detailed entrance navigation is unavailable

### 4. Legacy payload compatibility

Conditions:

- backend returns the old payload without the new fields

UI:

- page remains functional
- no crash
- current fallback behavior remains available

---

## Accessibility Requirements

This change is blocked on accessibility regressions.

Required behaviors:

- keyboard-only access to all controls and map-adjacent actions
- warning state announced through a live/status region
- visible focus styles preserved
- marker semantics expose name, type, and state
- reduced-motion users do not get route-emphasis animation
- warning and route status do not rely on color only

The `Hilfe rufen` control must be presented honestly as a normal button with an accessible name, even though it is non-functional in MVP.

---

## Error Handling And Degradation

| Scenario                                                             | Expected behavior                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `walkingApproach`, active elevators, and `departureStop` all present | Build and render accessible route                             |
| No active elevators                                                  | Warning card + `Hilfe rufen` button, no accessible route line |
| Escalators present                                                   | Render as informational markers only                          |
| `walkingApproach` missing                                            | Do not claim entrance-to-platform navigation                  |
| `departureStop` missing                                              | Do not claim final precise platform guidance                  |
| Old backend payload                                                  | Keep current fallback behavior, no crash                      |

---

## Testing

### Backend

Add tests that verify:

- stop coordinates are parsed into `TrainRouteStopDTO`
- `walkingApproach` is extracted from the last WALK step before the origin TRANSIT step
- touchpoint building preserves existing `facilities` and `accessibility` behavior
- old responses without location data still map safely

### Frontend

Add or update `LiveNavigation` tests for:

- route built from `walkingApproach -> active elevator(s) -> departureStop`
- no active elevators shows warning state and `Hilfe rufen`
- escalators render as informational markers but are excluded from the route
- old payload without navigation fields does not crash
- accessibility labels and live-region behavior for blocked route state

Manual verification must include:

- keyboard navigation
- screen reader announcement of warning state
- reduced motion behavior
- map and text consistency

---

## Out Of Scope

- transfer-station accessible routing
- alternative route graph search across multiple elevators
- escalators as fallback accessible route
- live help-call integration
- real-time polling for facility status beyond the existing response
- indoor floor plans or turn-by-turn indoor geometry
