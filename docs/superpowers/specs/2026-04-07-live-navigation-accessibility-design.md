# Live Navigation — Accessibility Routing Design

**Date:** 2026-04-07  
**Scope:** Backend enrichment + LiveNavigation map routing through elevators for mobility-impaired users

---

## Problem

BF Navigator serves primarily users with mobility impairments. The current LiveNavigation page:

1. Uses elevator/escalator facility coordinates as a proxy for stop position on the map — inaccurate.
2. Does not route users through active elevators from the station entrance to the departure platform.
3. Does not warn users when elevators are inactive or offer alternatives.
4. Hardcodes Haupteingang coordinates instead of deriving them from real route data.

The goal: guide a user from the station entrance (Haupteingang or Info-Station) to the departure platform via active elevators, minimize stress for disabled passengers, and surface actionable alternatives when elevators are out of service.

---

## Approach: Backend-First Enrichment

Extend the existing `/routes/trains` pipeline to include:
- Precise GPS coordinates for each transit stop (from Google Routes API `location.latLng`)
- Walking approach coordinates per touchpoint (from WALK steps preceding each TRANSIT step)

All data arrives in a single typed response. The frontend does not parse raw Google JSON.

---

## Backend Changes

### 1. Extend `FIELD_MASK` in `GoogleTrainRouteClient.java`

Add the following fields to the existing `FIELD_MASK` constant:

```
routes.legs.steps.transitDetails.stopDetails.departureStop.location,
routes.legs.steps.transitDetails.stopDetails.arrivalStop.location,
routes.legs.steps.startLocation,
routes.legs.steps.endLocation,
routes.legs.steps.navigationInstruction
```

`startLocation`/`endLocation`/`navigationInstruction` are needed for WALK steps to extract the boarding point ("Hier einsteigen").

### 2. New DTO: `WalkingApproachDTO`

```java
public class WalkingApproachDTO {
    private Double latitude;    // endLocation of last WALK step before TRANSIT
    private Double longitude;
    private String instruction; // e.g. "Hier einsteigen: E"
}
```

### 3. Extend `TrainRouteStopDTO`

Add `latitude` and `longitude` fields, populated by parsing `stopDetails.*.location.latLng`.

### 4. Extend `TrainRouteTouchpointDTO`

Add optional `walkingApproach: WalkingApproachDTO` field. Populated in `buildTouchpoints()` by finding the last WALK step immediately preceding each TRANSIT step in the leg.

### 5. Changes in `TrainRouteService`

- `mapDepartureStop` / `mapArrivalStop` — parse `location.latLng` and set on DTO
- `buildTouchpoints` — for each ORIGIN/TRANSFER touchpoint, scan the leg's steps for the last WALK step before the corresponding TRANSIT step and construct `WalkingApproachDTO`

---

## Frontend Changes

### 1. Types (`src/pages/TrainSearchResults/types.ts`)

```ts
interface WalkingApproach {
  latitude: number;
  longitude: number;
  instruction: string;
}

interface TrainRouteStop {
  name: string;
  latitude: number;
  longitude: number;
}

// Added to TrainRouteTouchpoint:
departureStop: TrainRouteStop | null;
arrivalStop: TrainRouteStop | null;
walkingApproach: WalkingApproach | null;
```

### 2. Stop position on map (`getTouchpointPosition`)

Rewrite to use `touchpoint.departureStop.latitude/longitude` as the primary source. Fall back to first active facility coordinate only when `departureStop` is null.

### 3. Accessibility route per touchpoint

For each ORIGIN/TRANSFER touchpoint, build a navigation route:

```
walkingApproach (entrance/Haupteingang)
  → active ELEVATOR facilities as intermediate waypoints (state === 'ACTIVE')
  → departureStop (platform)
```

If an elevator is `INACTIVE`: exclude from route, show a warning card with `operationalResumeDate` if available.

If all elevators are `INACTIVE` or no elevators exist: show fallback card "Bitte wenden Sie sich an das Personal" and display Info-Station coordinates if available.

### 4. Map layers for current station

- Marker: `walkingApproach` — entrance point (start of route)
- Markers: active elevators (`type=ELEVATOR`, `state=ACTIVE`) — green
- Markers: inactive elevators — red with warning icon
- Marker: `departureStop` — departure platform
- Polyline: entrance → active elevators → platform

### 5. Dynamic Haupteingang coordinates

`LIVE_NAVIGATION_MANUAL_STARTS` populated from `touchpoints[0].walkingApproach` instead of hardcoded values. If `walkingApproach` is null, the manual start option is not offered for that touchpoint.

---

## Error Handling / Degradation

| Scenario | Behaviour |
|---|---|
| `departureStop === null` | Fall back to first active facility coordinate; if none, show text-only info |
| All elevators `INACTIVE` | Warning card + `operationalResumeDate` + "Contact staff" CTA |
| No elevators at all | Route goes directly entrance → platform without elevator waypoints |
| `walkingApproach === null` | Route starts from `departureStop`; Haupteingang option not shown |
| Backend missing new fields (old API) | All new fields are optional; page degrades to current facility-coordinate behaviour, no crashes |

---

## Testing

### Backend

- `TrainRouteServiceTest` — `buildTouchpoints` with WALK steps before TRANSIT: assert `walkingApproach` is populated with correct coordinates and instruction
- Static assertion: `FIELD_MASK` contains all newly required field paths
- `mapDepartureStop` / `mapArrivalStop`: assert `latitude`/`longitude` parsed from `location.latLng`

### Frontend

New scenarios in `LiveNavigation.test.tsx`:

- Touchpoint with `departureStop` + active elevators → route built through elevators, markers rendered
- Touchpoint with all elevators `INACTIVE` → warning card shown, no route polyline, "Contact staff" CTA present
- `walkingApproach === null` → route starts from `departureStop`, Haupteingang option absent
- `departureStop === null` → falls back to facility coordinates (regression guard)
- Accessibility: warning card and elevator markers have correct ARIA labels; inactive elevator marker has role="alert" or equivalent

---

## Out of Scope

- Real-time elevator status polling (would require websocket or polling interval — separate ticket)
- Indoor routing / floor plans
- Changes to `/routes/trains/debug` or `/routes/trains/original` endpoints
