# Live Navigation Departure Accessibility Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend-provided departure-station navigation data and use it in `LiveNavigation` to build one accessible entrance-to-platform route through active elevators, while keeping escalators as informational markers and showing a blocked-route warning when no accessible path exists.

**Architecture:** Keep the current `/routes/trains` contract and existing station/facility enrichment intact. On the backend, extend stop and touchpoint DTOs with optional coordinates and `walkingApproach`, then populate those fields while mapping Google transit steps. On the frontend, keep the text-first `LiveNavigation` page but move the departure-only route derivation into pure utilities, pass richer marker data into the map, and render an explicit accessible warning state instead of pretending escalators are route alternatives.

**Tech Stack:** Java 21 · Spring Boot · Jackson · Lombok · React 19 · TypeScript 5.9 · Vitest · React Testing Library · Leaflet

---

## File Structure

**Backend** (`/home/iliasalmerekov/Projects/LF8/bf-navigator-service`)

- Create: `src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`
  Small DTO for the last walk-step approach to the departure transit step.
- Modify: `src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`
  Add optional `latitude` and `longitude`.
- Modify: `src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`
  Add optional `departureStop`, `arrivalStop`, and `walkingApproach`.
- Modify: `src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`
  Parse stop coordinates, retain walk-step context, and attach navigation fields to the `ORIGIN` touchpoint without disturbing existing facility/accessibility enrichment.
- Modify: `src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`
  Add regression coverage for stop coordinates and walk-approach extraction.

**Frontend** (`/home/iliasalmerekov/Projects/LF8/bf-navigator-web`)

- Modify: `src/pages/LiveNavigation/liveNavigationUtils.ts`
  Add pure departure-only route-model helpers and marker metadata builders.
- Modify: `src/pages/LiveNavigation/liveNavigationUtils.test.ts`
  Cover route-building, escalator-marker, and blocked-route logic.
- Modify: `src/pages/LiveNavigation/LiveNavigation.tsx`
  Consume the new route model, use only the `ORIGIN` touchpoint, and render the blocked-route UI.
- Modify: `src/pages/LiveNavigation/LiveNavigation.test.tsx`
  Verify warning state, `Hilfe rufen`, and map props for escalators/inactive elevators.
- Modify: `src/pages/LiveNavigation/components/LiveNavigationMap.tsx`
  Accept explicit markers for active elevators, inactive elevators, escalators, entrance, and departure point.
- Modify: `src/pages/LiveNavigation/LiveNavigation.module.css`
  Add styling for the warning card, marker summary, and non-functional help button.

---

### Task 1: Backend Tests For Coordinates And Walking Approach

**Files:**

- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`

- [ ] **Step 1: Add a failing test for stop coordinates**

Insert this test near the existing touchpoint tests:

```java
@Test
void searchTrainRoutesAddsDepartureAndArrivalStopCoordinatesToTouchpoints() throws Exception {
    TrainRouteRequestDTO request = TrainRouteRequestDTO.builder()
            .origin("Hamburg Hbf")
            .destination("Braunschweig Hbf")
            .departureTime(OffsetDateTime.parse("2026-04-02T08:00:00Z"))
            .build();

    ArrayNode routes = (ArrayNode) objectMapper.readTree("""
            [
              {
                "localizedValues": {
                  "distance": { "text": "240 km" },
                  "duration": { "text": "2 Stunden, 20 Minuten" }
                },
                "legs": [
                  {
                    "steps": [
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": {
                              "name": "Hamburg Hauptbahnhof",
                              "location": {
                                "latLng": { "latitude": 53.552776, "longitude": 10.006603 }
                              }
                            },
                            "arrivalStop": {
                              "name": "Braunschweig Hauptbahnhof",
                              "location": {
                                "latLng": { "latitude": 52.253164, "longitude": 10.54058 }
                              }
                            },
                            "departureTime": "2026-04-02T08:29:00Z",
                            "arrivalTime": "2026-04-02T10:45:00Z"
                          },
                          "transitLine": {
                            "nameShort": "ICE 579",
                            "vehicle": { "name": { "text": "Hochgeschwindigkeitszug" } },
                            "agencies": [{ "name": "DB Fernverkehr AG" }]
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            """);

    when(googleTrainRouteClient.computeTrainRoutes(request, true)).thenReturn(routes);
    when(stationService.searchStations("Hamburg Hauptbahnhof,Hamburg Hbf")).thenReturn(List.of());
    when(stationService.searchStations("Braunschweig Hauptbahnhof,Braunschweig Hbf")).thenReturn(List.of());

    TrainRouteSearchResponseDTO response = trainRouteService.searchTrainRoutes(request, true);

    assertEquals(53.552776,
            response.getTrips().getFirst().getTouchpoints().get(0).getDepartureStop().getLatitude(),
            0.000001);
    assertEquals(10.006603,
            response.getTrips().getFirst().getTouchpoints().get(0).getDepartureStop().getLongitude(),
            0.000001);
    assertEquals(52.253164,
            response.getTrips().getFirst().getTouchpoints().get(1).getArrivalStop().getLatitude(),
            0.000001);
    assertEquals(10.54058,
            response.getTrips().getFirst().getTouchpoints().get(1).getArrivalStop().getLongitude(),
            0.000001);
}
```

- [ ] **Step 2: Add a failing test for `walkingApproach`**

Insert this second test below the previous one:

```java
@Test
void searchTrainRoutesBuildsWalkingApproachFromLastWalkStepBeforeOriginTransit() throws Exception {
    TrainRouteRequestDTO request = TrainRouteRequestDTO.builder()
            .origin("Hamburg Hbf")
            .destination("Braunschweig Hbf")
            .departureTime(OffsetDateTime.parse("2026-04-02T08:00:00Z"))
            .build();

    ArrayNode routes = (ArrayNode) objectMapper.readTree("""
            [
              {
                "localizedValues": {
                  "distance": { "text": "240 km" },
                  "duration": { "text": "2 Stunden, 20 Minuten" }
                },
                "legs": [
                  {
                    "steps": [
                      {
                        "travelMode": "WALK",
                        "endLocation": {
                          "latLng": { "latitude": 53.552321, "longitude": 10.00611 }
                        }
                      },
                      {
                        "travelMode": "WALK",
                        "endLocation": {
                          "latLng": { "latitude": 53.552776, "longitude": 10.006603 }
                        },
                        "navigationInstruction": { "instructions": "Hier einsteigen: E" }
                      },
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": {
                              "name": "Hamburg Hauptbahnhof",
                              "location": {
                                "latLng": { "latitude": 53.552776, "longitude": 10.006603 }
                              }
                            },
                            "arrivalStop": {
                              "name": "Braunschweig Hauptbahnhof",
                              "location": {
                                "latLng": { "latitude": 52.253164, "longitude": 10.54058 }
                              }
                            },
                            "departureTime": "2026-04-02T08:29:00Z",
                            "arrivalTime": "2026-04-02T10:45:00Z"
                          },
                          "transitLine": {
                            "nameShort": "ICE 579",
                            "vehicle": { "name": { "text": "Hochgeschwindigkeitszug" } },
                            "agencies": [{ "name": "DB Fernverkehr AG" }]
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            """);

    when(googleTrainRouteClient.computeTrainRoutes(request, true)).thenReturn(routes);
    when(stationService.searchStations("Hamburg Hauptbahnhof,Hamburg Hbf")).thenReturn(List.of());
    when(stationService.searchStations("Braunschweig Hauptbahnhof,Braunschweig Hbf")).thenReturn(List.of());

    TrainRouteSearchResponseDTO response = trainRouteService.searchTrainRoutes(request, true);

    assertNotNull(response.getTrips().getFirst().getTouchpoints().get(0).getWalkingApproach());
    assertEquals("Hier einsteigen: E",
            response.getTrips().getFirst().getTouchpoints().get(0).getWalkingApproach().getInstruction());
    assertEquals(53.552776,
            response.getTrips().getFirst().getTouchpoints().get(0).getWalkingApproach().getLatitude(),
            0.000001);
    assertEquals(10.006603,
            response.getTrips().getFirst().getTouchpoints().get(0).getWalkingApproach().getLongitude(),
            0.000001);
}
```

- [ ] **Step 3: Run the backend tests and confirm they fail**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-service`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest#searchTrainRoutesAddsDepartureAndArrivalStopCoordinatesToTouchpoints+searchTrainRoutesBuildsWalkingApproachFromLastWalkStepBeforeOriginTransit test
```

Expected: compilation failure because `TrainRouteTouchpointDTO` does not yet expose `getDepartureStop()`, `getArrivalStop()`, or `getWalkingApproach()`.

- [ ] **Step 4: Commit the failing test scaffold**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-service`:

```bash
rtk git add src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java
rtk git commit -m "test: cover live navigation route metadata"
```

---

### Task 2: Backend Implementation For Departure Navigation Metadata

**Files:**

- Create: `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`

- [ ] **Step 1: Create `WalkingApproachDTO`**

Create `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`:

```java
package com.bf.navigator.service.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkingApproachDTO {
    private Double latitude;
    private Double longitude;
    private String instruction;
}
```

- [ ] **Step 2: Extend the route DTOs with optional navigation fields**

Update `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainRouteStopDTO {
    private String stationName;
    private String arrivalTime;
    private String departureTime;
    private Double latitude;
    private Double longitude;

    private StationDTO station;
    private List<FacilityDTO> facilities;
}
```

Update `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainRouteTouchpointDTO {
    private String kind;
    private String stationName;
    private String arrivalTime;
    private String departureTime;
    private StationDTO station;
    private List<FacilityDTO> facilities;
    private TrainRouteStationAccessibilityDTO accessibility;
    private TrainRouteStopDTO departureStop;
    private TrainRouteStopDTO arrivalStop;
    private WalkingApproachDTO walkingApproach;
}
```

- [ ] **Step 3: Refactor `TrainRouteService` to preserve walk-step context**

Inside `/home/iliasalmerekov/Projects/LF8/bf-navigator-service/src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`, introduce a private record and change the route collection flow:

```java
private record MappedTransitStep(TrainRouteTransitDTO transit, WalkingApproachDTO walkingApproach) {
}

// inside searchTrainRoutes(...)
List<MappedTransitStep> mappedTransitSteps = new java.util.ArrayList<>();
collectRouteDetails(steps, mappedTransitSteps);

List<TrainRouteTransitDTO> transits = mappedTransitSteps.stream()
        .map(MappedTransitStep::transit)
        .toList();
List<TrainRouteTouchpointDTO> touchpoints = buildTouchpoints(mappedTransitSteps);
```

Replace the existing `collectRouteDetails(...)` body with transit-aware walk tracking:

```java
private void collectRouteDetails(JsonNode steps, List<MappedTransitStep> collectedSteps) {
    if (!steps.isArray()) {
        return;
    }

    WalkingApproachDTO lastWalkingApproach = null;

    for (JsonNode step : steps) {
        String travelMode = step.path("travelMode").asText();

        if ("WALK".equals(travelMode)) {
            lastWalkingApproach = mapWalkingApproach(step);
            continue;
        }

        if (!"TRANSIT".equals(travelMode)) {
            continue;
        }

        JsonNode transitDetails = step.path("transitDetails");
        if (transitDetails.isMissingNode()) {
            continue;
        }

        JsonNode stopDetails = transitDetails.path("stopDetails");
        JsonNode transitLine = transitDetails.path("transitLine");
        TrainRouteTransitDTO transit = mapTransit(stopDetails, transitLine);

        if (isValidTransit(transit)) {
            collectedSteps.add(new MappedTransitStep(transit, lastWalkingApproach));
        }

        lastWalkingApproach = null;
    }
}
```

Add these helpers below the existing mapping helpers:

```java
private WalkingApproachDTO mapWalkingApproach(JsonNode step) {
    JsonNode latLng = step.path("endLocation").path("latLng");

    if (latLng.isMissingNode() || latLng.isNull()) {
        return null;
    }

    Double latitude = doubleOrNull(latLng, "latitude");
    Double longitude = doubleOrNull(latLng, "longitude");

    if (latitude == null || longitude == null) {
        return null;
    }

    return WalkingApproachDTO.builder()
            .latitude(latitude)
            .longitude(longitude)
            .instruction(textOrNull(step.path("navigationInstruction"), "instructions"))
            .build();
}

private Double doubleOrNull(JsonNode node, String fieldName) {
    JsonNode value = node.path(fieldName);
    return value.isMissingNode() || value.isNull() ? null : value.asDouble();
}

private boolean isValidTransit(TrainRouteTransitDTO candidate) {
    return candidate.getDeparture() != null
            && candidate.getDeparture().getStationName() != null
            && !candidate.getDeparture().getStationName().isBlank()
            && candidate.getArrival() != null
            && candidate.getArrival().getStationName() != null
            && !candidate.getArrival().getStationName().isBlank();
}
```

- [ ] **Step 4: Attach the new fields to stops and touchpoints**

Replace `mapDepartureStop(...)`, `mapArrivalStop(...)`, and `buildTouchpoints(...)`/`appendOrMergeTouchpoint(...)` with versions that preserve coordinates and `walkingApproach`:

```java
private TrainRouteStopDTO mapDepartureStop(JsonNode stopDetails) {
    JsonNode latLng = stopDetails.path("departureStop").path("location").path("latLng");

    return TrainRouteStopDTO.builder()
            .stationName(stopDetails.path("departureStop").path("name").asText(null))
            .departureTime(textOrNull(stopDetails, "departureTime"))
            .latitude(doubleOrNull(latLng, "latitude"))
            .longitude(doubleOrNull(latLng, "longitude"))
            .build();
}

private TrainRouteStopDTO mapArrivalStop(JsonNode stopDetails) {
    JsonNode latLng = stopDetails.path("arrivalStop").path("location").path("latLng");

    return TrainRouteStopDTO.builder()
            .stationName(stopDetails.path("arrivalStop").path("name").asText(null))
            .arrivalTime(textOrNull(stopDetails, "arrivalTime"))
            .latitude(doubleOrNull(latLng, "latitude"))
            .longitude(doubleOrNull(latLng, "longitude"))
            .build();
}

private List<TrainRouteTouchpointDTO> buildTouchpoints(List<MappedTransitStep> mappedTransitSteps) {
    List<TrainRouteTouchpointDTO> touchpoints = new java.util.ArrayList<>();
    if (mappedTransitSteps.isEmpty()) {
        return touchpoints;
    }

    MappedTransitStep firstTransit = mappedTransitSteps.getFirst();
    appendOrMergeTouchpoint(touchpoints, firstTransit.transit().getDeparture(), firstTransit.walkingApproach(), true);

    for (int index = 0; index < mappedTransitSteps.size(); index++) {
        TrainRouteTransitDTO transit = mappedTransitSteps.get(index).transit();
        appendOrMergeTouchpoint(touchpoints, transit.getArrival(), null, false);
        if (index < mappedTransitSteps.size() - 1) {
            appendOrMergeTouchpoint(touchpoints, mappedTransitSteps.get(index + 1).transit().getDeparture(),
                    mappedTransitSteps.get(index + 1).walkingApproach(), true);
        }
    }

    for (int index = 0; index < touchpoints.size(); index++) {
        TrainRouteTouchpointDTO touchpoint = touchpoints.get(index);
        touchpoint.setKind(resolveTouchpointKind(index, touchpoints.size()));
        touchpoint.setAccessibility(buildTouchpointAccessibility(touchpoint.getStation(), touchpoint.getFacilities()));
    }

    return touchpoints;
}

private void appendOrMergeTouchpoint(List<TrainRouteTouchpointDTO> touchpoints,
        TrainRouteStopDTO stop,
        WalkingApproachDTO walkingApproach,
        boolean isDeparture) {
    if (stop == null || stop.getStationName() == null || stop.getStationName().isBlank()) {
        return;
    }

    TrainRouteTouchpointDTO candidate = TrainRouteTouchpointDTO.builder()
            .stationName(stop.getStationName())
            .arrivalTime(stop.getArrivalTime())
            .departureTime(stop.getDepartureTime())
            .station(stop.getStation())
            .facilities(stop.getFacilities())
            .departureStop(isDeparture ? stop : null)
            .arrivalStop(isDeparture ? null : stop)
            .walkingApproach(isDeparture ? walkingApproach : null)
            .build();

    if (touchpoints.isEmpty()) {
        touchpoints.add(candidate);
        return;
    }

    TrainRouteTouchpointDTO previous = touchpoints.getLast();
    if (!sameStation(previous, candidate)) {
        touchpoints.add(candidate);
        return;
    }

    if (candidate.getArrivalTime() != null) {
        previous.setArrivalTime(candidate.getArrivalTime());
    }
    if (candidate.getDepartureTime() != null) {
        previous.setDepartureTime(candidate.getDepartureTime());
    }
    if (previous.getStation() == null && candidate.getStation() != null) {
        previous.setStation(candidate.getStation());
    }
    if (candidate.getFacilities() != null) {
        previous.setFacilities(candidate.getFacilities());
    }
    if (previous.getDepartureStop() == null && candidate.getDepartureStop() != null) {
        previous.setDepartureStop(candidate.getDepartureStop());
    }
    if (previous.getArrivalStop() == null && candidate.getArrivalStop() != null) {
        previous.setArrivalStop(candidate.getArrivalStop());
    }
    if (previous.getWalkingApproach() == null && candidate.getWalkingApproach() != null) {
        previous.setWalkingApproach(candidate.getWalkingApproach());
    }
}
```

- [ ] **Step 5: Run backend tests and confirm they pass**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-service`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest test
```

Expected: PASS, including the new stop-coordinate and `walkingApproach` assertions plus the older touchpoint/facility regressions.

- [ ] **Step 6: Commit the backend slice**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-service`:

```bash
rtk git add src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java
rtk git commit -m "feat: enrich touchpoints for departure navigation"
```

---

### Task 3: Frontend Tests For Departure-Only Route Modeling

**Files:**

- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/liveNavigationUtils.test.ts`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.test.tsx`

- [ ] **Step 1: Add utility tests for the route model**

Extend `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/liveNavigationUtils.test.ts` with these tests:

```ts
import type { TrainRouteTouchpoint } from '../TrainSearchResults/types';
import { buildOriginRouteModel } from './liveNavigationUtils';

function makeOriginTouchpoint(): TrainRouteTouchpoint {
  return {
    accessibility: {
      activeElevators: 1,
      activeEscalators: 1,
      hasFacilityData: true,
      inactiveElevators: 1,
      inactiveEscalators: 0,
      mobilityServiceAvailable: true,
      status: 'LIMITED',
      stepFreeAvailable: true,
      summary: 'Step-free access available',
    },
    arrivalStop: null,
    arrivalTime: null,
    departureStop: { latitude: 50.10772, longitude: 8.66292 },
    departureTime: '2026-04-02T09:10:00Z',
    facilities: [
      {
        description: 'Aufzug A',
        equipmentnumber: 1001,
        geocoordX: 8.66312,
        geocoordY: 50.10736,
        operationalResumeDate: null,
        operatorname: 'DB InfraGO',
        state: 'ACTIVE',
        stateExplanation: 'available',
        stationnumber: 8000001,
        type: 'ELEVATOR',
      },
      {
        description: 'Aufzug B',
        equipmentnumber: 1002,
        geocoordX: 8.6634,
        geocoordY: 50.10744,
        operationalResumeDate: '2026-04-09',
        operatorname: 'DB InfraGO',
        state: 'INACTIVE',
        stateExplanation: 'out of service',
        stationnumber: 8000001,
        type: 'ELEVATOR',
      },
      {
        description: 'Rolltreppe C',
        equipmentnumber: 1003,
        geocoordX: 8.66355,
        geocoordY: 50.1075,
        operationalResumeDate: null,
        operatorname: 'DB InfraGO',
        state: 'ACTIVE',
        stateExplanation: 'available',
        stationnumber: 8000001,
        type: 'ESCALATOR',
      },
    ],
    kind: 'ORIGIN',
    station: null,
    stationName: 'Frankfurt (Main) Hbf',
    walkingApproach: {
      instruction: 'Nutzen Sie den Haupteingang.',
      latitude: 50.1071,
      longitude: 8.6638,
    },
  };
}

it('builds a departure-only route from entrance through active elevators to departure stop', () => {
  const routeModel = buildOriginRouteModel([makeOriginTouchpoint()]);

  expect(routeModel.hasAccessibleRoute).toBe(true);
  expect(routeModel.routePoints.map((point) => point.label)).toEqual([
    'Haupteingang',
    'Aufzug A',
    'Abfahrtspunkt',
  ]);
});

it('keeps inactive elevators and escalators as markers only', () => {
  const routeModel = buildOriginRouteModel([makeOriginTouchpoint()]);

  expect(routeModel.markers.map((marker) => marker.kind)).toEqual([
    'entrance',
    'active-elevator',
    'inactive-elevator',
    'escalator',
    'departure',
  ]);
  expect(routeModel.routePoints.map((point) => point.label)).not.toContain('Rolltreppe C');
  expect(routeModel.warningMessage).toBeNull();
});
```

- [ ] **Step 2: Add a page test for the blocked-route UI**

Extend `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.test.tsx` with this scenario:

```ts
it('shows a blocked-route warning and a Hilfe rufen button when no active elevators exist', () => {
  getSelectedTrainRouteMock.mockReturnValue(
    makeSelectedRoute({
      touchpoints: [
        {
          ...makeSelectedRoute().touchpoints![0],
          departureStop: { latitude: 50.10772, longitude: 8.66292 },
          facilities: [
            {
              ...makeFacility(1001, 8.66312, 50.10736),
              description: 'Aufzug A',
              operationalResumeDate: '2026-04-09',
              state: 'INACTIVE',
            },
            {
              ...makeFacility(1002, 8.66355, 50.1075),
              description: 'Rolltreppe C',
              type: 'ESCALATOR',
            },
          ],
          walkingApproach: {
            instruction: 'Nutzen Sie den Haupteingang.',
            latitude: 50.1071,
            longitude: 8.6638,
          },
        },
      ],
    })
  );

  render(<LiveNavigation />);

  expect(screen.getByRole('alert')).toHaveTextContent(/barrierefreier weg derzeit nicht verfügbar/i);
  expect(screen.getByRole('button', { name: /hilfe rufen/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the frontend tests and confirm they fail**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-web`:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: FAIL because `buildOriginRouteModel()` and the blocked-route UI do not exist yet.

- [ ] **Step 4: Commit the failing frontend tests**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-web`:

```bash
rtk git add src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
rtk git commit -m "test: cover live navigation accessibility states"
```

---

### Task 4: Frontend Implementation For Departure-Only Accessible Routing

**Files:**

- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/liveNavigationUtils.ts`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.tsx`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/components/LiveNavigationMap.tsx`
- Modify: `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.module.css`

- [ ] **Step 1: Add a pure origin-route model helper**

Append these types and helpers to `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/liveNavigationUtils.ts`:

```ts
import type { TrainRouteFacility, TrainRouteTouchpoint } from '../TrainSearchResults/types';

export type LiveNavigationMapMarker = {
  accessibleLabel: string;
  id: string;
  kind: 'entrance' | 'active-elevator' | 'inactive-elevator' | 'escalator' | 'departure';
  label: string;
  position: LiveNavigationLatLng;
};

export type LiveNavigationOriginRouteModel = {
  hasAccessibleRoute: boolean;
  markers: LiveNavigationMapMarker[];
  routePoints: LiveNavigationRoutePoint[];
  warningMessage: string | null;
};

function hasValidFacilityCoordinates(
  facility: TrainRouteFacility
): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } {
  return facility.geocoordX != null && facility.geocoordY != null;
}

export function buildOriginRouteModel(
  touchpoints: TrainRouteTouchpoint[] | undefined
): LiveNavigationOriginRouteModel {
  const originTouchpoint = touchpoints?.find((touchpoint) => touchpoint.kind === 'ORIGIN');
  if (!originTouchpoint) {
    return { hasAccessibleRoute: false, markers: [], routePoints: [], warningMessage: null };
  }

  const markers: LiveNavigationMapMarker[] = [];
  const routePoints: LiveNavigationRoutePoint[] = [];

  if (originTouchpoint.walkingApproach) {
    const entrancePosition: LiveNavigationLatLng = [
      originTouchpoint.walkingApproach.latitude,
      originTouchpoint.walkingApproach.longitude,
    ];
    markers.push({
      accessibleLabel: 'Haupteingang',
      id: 'origin-entrance',
      kind: 'entrance',
      label: 'Haupteingang',
      position: entrancePosition,
    });
    routePoints.push({
      description: 'Sie stehen am Haupteingang.',
      id: 'origin-entrance',
      instruction: originTouchpoint.walkingApproach.instruction,
      label: 'Haupteingang',
      position: entrancePosition,
    });
  }

  const facilities = originTouchpoint.facilities ?? [];
  const activeElevators = facilities.filter(
    (facility): facility is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
      facility.type === 'ELEVATOR' &&
      facility.state === 'ACTIVE' &&
      hasValidFacilityCoordinates(facility)
  );

  activeElevators.forEach((facility, index) => {
    const position: LiveNavigationLatLng = [facility.geocoordY, facility.geocoordX];
    markers.push({
      accessibleLabel: `${facility.description}, Aufzug aktiv`,
      id: `active-elevator-${index}`,
      kind: 'active-elevator',
      label: facility.description,
      position,
    });
    routePoints.push({
      description: facility.description,
      id: `active-elevator-${index}`,
      instruction: `Nehmen Sie ${facility.description}.`,
      label: facility.description,
      position,
    });
  });

  facilities.forEach((facility, index) => {
    if (!hasValidFacilityCoordinates(facility)) return;
    const position: LiveNavigationLatLng = [facility.geocoordY, facility.geocoordX];

    if (facility.type === 'ELEVATOR' && facility.state === 'INACTIVE') {
      markers.push({
        accessibleLabel: `${facility.description}, Aufzug außer Betrieb`,
        id: `inactive-elevator-${index}`,
        kind: 'inactive-elevator',
        label: facility.description,
        position,
      });
    }

    if (facility.type === 'ESCALATOR') {
      markers.push({
        accessibleLabel: `${facility.description}, Rolltreppe nur zur Orientierung`,
        id: `escalator-${index}`,
        kind: 'escalator',
        label: facility.description,
        position,
      });
    }
  });

  if (originTouchpoint.departureStop) {
    const departurePosition: LiveNavigationLatLng = [
      originTouchpoint.departureStop.latitude,
      originTouchpoint.departureStop.longitude,
    ];
    markers.push({
      accessibleLabel: 'Abfahrtspunkt',
      id: 'departure-stop',
      kind: 'departure',
      label: 'Abfahrtspunkt',
      position: departurePosition,
    });
    routePoints.push({
      description: 'Sie haben den Abfahrtspunkt erreicht.',
      id: 'departure-stop',
      instruction: 'Sie sind am Abfahrtspunkt angekommen.',
      label: 'Abfahrtspunkt',
      position: departurePosition,
    });
  }

  const hasAccessibleRoute =
    originTouchpoint.walkingApproach != null &&
    activeElevators.length > 0 &&
    originTouchpoint.departureStop != null;

  return {
    hasAccessibleRoute,
    markers,
    routePoints: hasAccessibleRoute ? routePoints : [],
    warningMessage: hasAccessibleRoute
      ? null
      : 'Der barrierefreie Weg zum Abfahrtspunkt ist derzeit nicht verfügbar.',
  };
}
```

- [ ] **Step 2: Update `LiveNavigationMap` to render explicit infrastructure markers**

Change the map props in `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/components/LiveNavigationMap.tsx`:

```ts
import type { LiveNavigationLatLng } from '../liveNavigationData';
import type { LiveNavigationMapMarker } from '../liveNavigationUtils';

type LiveNavigationMapProps = {
  currentPosition: LiveNavigationLatLng;
  destinationLabel: string;
  destinationPosition: LiveNavigationLatLng;
  markers?: LiveNavigationMapMarker[];
  nextLabel: string;
  routePath: LiveNavigationLatLng[];
};
```

In `LiveNavigationMapLayers`, render markers when they are provided:

```ts
const MARKER_CLASS_BY_KIND: Record<LiveNavigationMapMarker['kind'], string> = {
  'active-elevator': 'live-nav-dest-marker',
  departure: 'live-nav-platform-marker',
  entrance: 'live-nav-platform-marker',
  escalator: 'live-nav-dest-marker',
  'inactive-elevator': 'live-nav-platform-marker',
};

if (markers?.length) {
  markers.forEach((marker) => {
    const leafletMarker = L.marker(marker.position, {
      icon: createMarkerIcon(
        MARKER_CLASS_BY_KIND[marker.kind],
        getMarkerShortLabel(marker.label),
        marker.kind === 'departure' ? 32 : 40,
        marker.kind === 'departure' ? 16 : 20
      ),
    }).addTo(map);
    leafletMarker.bindTooltip?.(marker.accessibleLabel, { direction: 'top', offset: [0, -24] });
    layers.push(leafletMarker);
  });
} else {
  // keep the current fallback next/destination markers for mock-mode compatibility
}
```

- [ ] **Step 3: Use the origin-route model in `LiveNavigation.tsx`**

Replace the selected-route derivation in `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.tsx` with an origin-only model:

```ts
import {
  buildInstructionState,
  buildOriginRouteModel,
  getRoutePointsFromManualStart,
  type LiveNavigationMapMarker,
} from './liveNavigationUtils';

const originRouteModel = buildOriginRouteModel(selectedTouchpoints);
const hasSelectedAccessibleRoute = originRouteModel.hasAccessibleRoute;
const routePoints = hasSelectedAccessibleRoute
  ? originRouteModel.routePoints
  : LIVE_NAVIGATION_ROUTE_POINTS;
const mapMarkers: LiveNavigationMapMarker[] | undefined =
  hasSelectedRouteTouchpoints && originRouteModel.markers.length > 0
    ? originRouteModel.markers
    : undefined;
```

Render the blocked state above the map:

```tsx
{
  hasSelectedRouteTouchpoints && originRouteModel.warningMessage ? (
    <section className={styles['warning-card']} role="alert" aria-live="assertive">
      <div className={styles['warning-copy']}>
        <TriangleAlert aria-hidden="true" />
        <div>
          <h2>Barrierefreier Weg nicht verfügbar</h2>
          <p>{originRouteModel.warningMessage}</p>
        </div>
      </div>
      <button className={styles['help-button']} type="button">
        Hilfe rufen
      </button>
    </section>
  ) : null;
}

{
  mapMarkers?.length ? (
    <section aria-labelledby="karte-orientierung-heading" className={styles['marker-summary']}>
      <h2 id="karte-orientierung-heading">Orientierungspunkte</h2>
      <ul>
        {mapMarkers.map((marker) => (
          <li key={marker.id}>{marker.accessibleLabel}</li>
        ))}
      </ul>
    </section>
  ) : null;
}
```

Pass the markers into the map:

```tsx
<LiveNavigationMap
  currentPosition={activePosition}
  destinationLabel={destination.label}
  destinationPosition={destination.position}
  markers={mapMarkers}
  nextLabel={instructionState.nextLabel}
  routePath={instructionState.routePoints.map((point) => point.position)}
/>
```

Keep the current mock fallback path when the backend still returns the old payload. Do not remove `LIVE_NAVIGATION_ROUTE_POINTS` or `LIVE_NAVIGATION_MANUAL_STARTS`.

- [ ] **Step 4: Add styles for the warning and marker summary**

Append these rules to `/home/iliasalmerekov/Projects/LF8/bf-navigator-web/src/pages/LiveNavigation/LiveNavigation.module.css`:

```css
.warning-card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #b42318;
  border-radius: 1rem;
  background: #fff4f2;
}

.warning-copy {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.help-button {
  min-width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: #7a271a;
  color: #fff;
  font: inherit;
}

.marker-summary ul {
  margin: 0;
  padding-left: 1.25rem;
}
```

- [ ] **Step 5: Run frontend tests and confirm they pass**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-web`:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: PASS, including the new route-model tests and the blocked-route warning test.

- [ ] **Step 6: Run the broader `LiveNavigation` regression slice**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-web`:

```bash
rtk vitest run src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
```

Expected: PASS, with no regressions in geolocation fallback or selected-route rendering.

- [ ] **Step 7: Commit the frontend slice**

Run from `/home/iliasalmerekov/Projects/LF8/bf-navigator-web`:

```bash
rtk git add src/pages/LiveNavigation/liveNavigationUtils.ts src/pages/LiveNavigation/liveNavigationUtils.test.ts src/pages/LiveNavigation/LiveNavigation.tsx src/pages/LiveNavigation/LiveNavigation.test.tsx src/pages/LiveNavigation/components/LiveNavigationMap.tsx src/pages/LiveNavigation/LiveNavigation.module.css
rtk git commit -m "feat: add departure accessibility route guidance"
```

---

## Self-Review

### Spec coverage

- Backend coordinate enrichment: covered by Task 1 and Task 2.
- `walkingApproach` extraction: covered by Task 1 and Task 2.
- Departure-only route through active elevators: covered by Task 3 and Task 4.
- Escalators as informational markers only: covered by Task 3 and Task 4.
- Blocked-route warning and UI-only `Hilfe rufen`: covered by Task 3 and Task 4.
- Legacy payload fallback: preserved explicitly in Task 4 Step 3.
- Accessibility checks for warning state and marker semantics: covered by Task 3 and Task 4.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation placeholders remain.
- All code steps include concrete code snippets.
- All test and verification steps include concrete commands and expected results.

### Type consistency

- Backend uses `TrainRouteStopDTO` on touchpoints to avoid creating a second stop-location DTO.
- Frontend consumes only `latitude`/`longitude` from `departureStop` and `arrivalStop`, which stays compatible with the existing TypeScript shape.
- Map marker props are introduced once in `liveNavigationUtils.ts` and reused by `LiveNavigation.tsx` and `LiveNavigationMap.tsx`.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-07-live-navigation-accessibility.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
