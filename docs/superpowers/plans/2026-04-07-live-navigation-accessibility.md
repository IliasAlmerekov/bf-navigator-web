# Live Navigation Accessibility Routing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the `/routes/trains` backend response with precise GPS stop coordinates and walking-approach points, then use that data in LiveNavigation to route users from the station entrance through active elevators to the departure platform.

**Architecture:** Extend the existing backend pipeline — add stop `location.latLng` and WALK-step `endLocation` to the Google Routes fieldMask, parse them into new DTO fields, and carry them through to `TrainRouteTouchpointDTO`. On the frontend, rewrite `getTouchpointPosition` to use real stop coordinates, extend `getRoutePointsFromTouchpoints` to include elevator waypoints, and derive the Haupteingang position from `walkingApproach` instead of hardcode.

**Tech Stack:** Java 21 · Spring Boot 4 · Lombok · Jackson · Vitest · React Testing Library · TypeScript strict

---

## File Map

**Backend** (`/home/iliasalmerekov/Projects/LF8/bf-navigator-service`):

| Action | File                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| Modify | `src/main/java/com/bf/navigator/service/route/client/GoogleTrainRouteClient.java` |
| Create | `src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`        |
| Modify | `src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`         |
| Modify | `src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`   |
| Modify | `src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`     |
| Modify | `src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java` |

**Frontend** (`/home/iliasalmerekov/Projects/LF8/bf-navigator-web`):

| Action | File                                               |
| ------ | -------------------------------------------------- |
| Modify | `src/pages/TrainSearchResults/types.ts`            |
| Modify | `src/pages/LiveNavigation/LiveNavigation.tsx`      |
| Modify | `src/pages/LiveNavigation/LiveNavigation.test.tsx` |

---

## Task 1: Backend — Write failing tests for location + walking approach

**Files:**

- Test: `src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`

- [ ] **Step 1: Add the two new test methods to TrainRouteServiceTest.java**

Add these two methods to the existing `TrainRouteServiceTest` class (after the last existing `@Test`):

```java
@Test
void searchTrainRoutesParsesStopLocationFromTransitDetails() throws Exception {
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
                              "location": { "latLng": { "latitude": 53.553637, "longitude": 10.006677 } }
                            },
                            "arrivalStop": {
                              "name": "Braunschweig Hauptbahnhof",
                              "location": { "latLng": { "latitude": 52.2524, "longitude": 10.5316 } }
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

    TrainRouteTouchpointDTO origin = response.getTrips().getFirst().getTouchpoints().get(0);
    assertEquals(53.553637, origin.getDepartureStop().getLatitude(), 0.000001);
    assertEquals(10.006677, origin.getDepartureStop().getLongitude(), 0.000001);

    TrainRouteTouchpointDTO destination = response.getTrips().getFirst().getTouchpoints().get(1);
    assertEquals(52.2524, destination.getArrivalStop().getLatitude(), 0.000001);
    assertEquals(10.5316, destination.getArrivalStop().getLongitude(), 0.000001);
}

@Test
void searchTrainRoutesBuildsWalkingApproachFromLastWalkStepBeforeTransit() throws Exception {
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
                        "endLocation": { "latLng": { "latitude": 53.5530, "longitude": 10.0060 } }
                      },
                      {
                        "travelMode": "WALK",
                        "endLocation": { "latLng": { "latitude": 53.553637, "longitude": 10.006677 } },
                        "navigationInstruction": { "instructions": "Hier einsteigen: E" }
                      },
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": {
                              "name": "Hamburg Hauptbahnhof",
                              "location": { "latLng": { "latitude": 53.553637, "longitude": 10.006677 } }
                            },
                            "arrivalStop": {
                              "name": "Braunschweig Hauptbahnhof",
                              "location": { "latLng": { "latitude": 52.2524, "longitude": 10.5316 } }
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

    TrainRouteTouchpointDTO origin = response.getTrips().getFirst().getTouchpoints().get(0);
    assertNotNull(origin.getWalkingApproach());
    assertEquals(53.553637, origin.getWalkingApproach().getLatitude(), 0.000001);
    assertEquals(10.006677, origin.getWalkingApproach().getLongitude(), 0.000001);
    assertEquals("Hier einsteigen: E", origin.getWalkingApproach().getInstruction());
}
```

- [ ] **Step 2: Run the new tests — verify they fail**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-service
./mvnw test -pl . -Dtest=TrainRouteServiceTest#searchTrainRoutesParsesStopLocationFromTransitDetails+searchTrainRoutesBuildsWalkingApproachFromLastWalkStepBeforeTransit -q 2>&1 | tail -20
```

Expected: `FAILED` — compilation error because `getDepartureStop()`, `getArrivalStop()`, `getWalkingApproach()` do not exist yet.

---

## Task 2: Backend — Create DTOs

**Files:**

- Create: `src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`
- Modify: `src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`
- Modify: `src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`

- [ ] **Step 1: Create WalkingApproachDTO.java**

Create `src/main/java/com/bf/navigator/service/route/dto/WalkingApproachDTO.java`:

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

- [ ] **Step 2: Extend TrainRouteStopDTO**

Replace the full content of `src/main/java/com/bf/navigator/service/route/dto/TrainRouteStopDTO.java`:

```java
package com.bf.navigator.service.route.dto;

import com.bf.navigator.service.station.dto.FacilityDTO;
import com.bf.navigator.service.station.dto.StationDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainRouteStopDTO {
    private String stationName;
    private String arrivalTime;
    private String departureTime;

    // GPS coordinates from Google Routes API location.latLng
    private Double latitude;
    private Double longitude;

    // Boarding point from last WALK step before this transit stop
    private WalkingApproachDTO walkingApproach;

    // Station info from DB API
    private StationDTO station;
    private List<FacilityDTO> facilities;
}
```

- [ ] **Step 3: Extend TrainRouteTouchpointDTO**

Replace the full content of `src/main/java/com/bf/navigator/service/route/dto/TrainRouteTouchpointDTO.java`:

```java
package com.bf.navigator.service.route.dto;

import java.util.List;

import com.bf.navigator.service.station.dto.FacilityDTO;
import com.bf.navigator.service.station.dto.StationDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    // Coordinates of the actual transit stop (platform) from Google Routes API
    private StopLocationDTO departureStop;
    private StopLocationDTO arrivalStop;

    // Boarding point derived from the last WALK step preceding this stop
    private WalkingApproachDTO walkingApproach;
}
```

- [ ] **Step 4: Create StopLocationDTO.java**

Create `src/main/java/com/bf/navigator/service/route/dto/StopLocationDTO.java`:

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
public class StopLocationDTO {
    private Double latitude;
    private Double longitude;
}
```

- [ ] **Step 5: Compile to confirm no errors**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-service
./mvnw compile -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS` — DTOs compile, tests still fail on missing service logic.

---

## Task 3: Backend — Extend FIELD_MASK and update service logic

**Files:**

- Modify: `src/main/java/com/bf/navigator/service/route/client/GoogleTrainRouteClient.java`
- Modify: `src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`

- [ ] **Step 1: Extend FIELD_MASK in GoogleTrainRouteClient.java**

Replace the `FIELD_MASK` constant (lines 24–34):

```java
private static final String FIELD_MASK = String.join(",",
        "routes.localizedValues.distance.text",
        "routes.localizedValues.duration.text",
        "routes.legs.steps.travelMode",
        "routes.legs.steps.endLocation",
        "routes.legs.steps.navigationInstruction",
        "routes.legs.steps.transitDetails.stopDetails.departureStop",
        "routes.legs.steps.transitDetails.stopDetails.arrivalStop",
        "routes.legs.steps.transitDetails.stopDetails.departureTime",
        "routes.legs.steps.transitDetails.stopDetails.arrivalTime",
        "routes.legs.steps.transitDetails.transitLine.name",
        "routes.legs.steps.transitDetails.transitLine.nameShort",
        "routes.legs.steps.transitDetails.transitLine.vehicle.name.text",
        "routes.legs.steps.transitDetails.transitLine.agencies.name");
```

- [ ] **Step 2: Update DEBUG response to include WALK step + location data**

In `GoogleTrainRouteClient.java`, update `DEBUG_GOOGLE_MAPS_RESPONSE` to add `travelMode`, `endLocation`, and `location.latLng` to the first route. Replace the current string literal with:

```java
private static final String DEBUG_GOOGLE_MAPS_RESPONSE = """
            {
              "routes": [
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
                          "endLocation": { "latLng": { "latitude": 53.553637, "longitude": 10.006677 } },
                          "navigationInstruction": { "instructions": "Hier einsteigen: E" }
                        },
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": {
                                "name": "Hamburg Hauptbahnhof",
                                "location": { "latLng": { "latitude": 53.553637, "longitude": 10.006677 } }
                              },
                              "arrivalStop": {
                                "name": "Braunschweig Hauptbahnhof",
                                "location": { "latLng": { "latitude": 52.2524, "longitude": 10.5316 } }
                              },
                              "departureTime": "2026-04-02T08:29:00Z",
                              "arrivalTime": "2026-04-02T10:45:00Z"
                            },
                            "transitLine": {
                              "nameShort": "ICE 73",
                              "vehicle": { "name": { "text": "Hochgeschwindigkeitszug" } },
                              "agencies": [{ "name": "DB Fernverkehr AG" }]
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "localizedValues": {
                    "distance": { "text": "248 km" },
                    "duration": { "text": "2 Stunden, 35 Minuten" }
                  },
                  "legs": [
                    {
                      "steps": [
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": { "name": "Hamburg Hauptbahnhof" },
                              "arrivalStop": { "name": "Hannover Hauptbahnhof" },
                              "departureTime": "2026-04-02T08:41:00Z",
                              "arrivalTime": "2026-04-02T09:58:00Z"
                            },
                            "transitLine": {
                              "nameShort": "ICE 585",
                              "vehicle": { "name": { "text": "Hochgeschwindigkeitszug" } },
                              "agencies": [{ "name": "DB Fernverkehr AG" }]
                            }
                          }
                        },
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": { "name": "Hannover Hauptbahnhof" },
                              "arrivalStop": { "name": "Braunschweig Hauptbahnhof" },
                              "departureTime": "2026-04-02T10:10:00Z",
                              "arrivalTime": "2026-04-02T10:58:00Z"
                            },
                            "transitLine": {
                              "nameShort": "IC 2038",
                              "vehicle": { "name": { "text": "Intercity" } },
                              "agencies": [{ "name": "DB Fernverkehr AG" }]
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "localizedValues": {
                    "distance": { "text": "266 km" },
                    "duration": { "text": "3 Stunden, 7 Minuten" }
                  },
                  "legs": [
                    {
                      "steps": [
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": { "name": "Hamburg Hauptbahnhof" },
                              "arrivalStop": { "name": "Uelzen Bahnhof" },
                              "departureTime": "2026-04-02T08:17:00Z",
                              "arrivalTime": "2026-04-02T09:11:00Z"
                            },
                            "transitLine": {
                              "nameShort": "RE 3",
                              "vehicle": { "name": { "text": "Regionalzug" } },
                              "agencies": [{ "name": "metronom" }]
                            }
                          }
                        },
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": { "name": "Uelzen Bahnhof" },
                              "arrivalStop": { "name": "Hannover Hauptbahnhof" },
                              "departureTime": "2026-04-02T09:22:00Z",
                              "arrivalTime": "2026-04-02T10:17:00Z"
                            },
                            "transitLine": {
                              "nameShort": "IC 2083",
                              "vehicle": { "name": { "text": "Intercity" } },
                              "agencies": [{ "name": "DB Fernverkehr AG" }]
                            }
                          }
                        },
                        {
                          "travelMode": "TRANSIT",
                          "transitDetails": {
                            "stopDetails": {
                              "departureStop": { "name": "Hannover Hauptbahnhof" },
                              "arrivalStop": { "name": "Braunschweig Hauptbahnhof" },
                              "departureTime": "2026-04-02T10:31:00Z",
                              "arrivalTime": "2026-04-02T11:24:00Z"
                            },
                            "transitLine": {
                              "nameShort": "RE 60",
                              "vehicle": { "name": { "text": "Regionalzug" } },
                              "agencies": [{ "name": "DB Regio" }]
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
        """;
```

- [ ] **Step 3: Update collectRouteDetails to track WALK steps**

In `TrainRouteService.java`, replace `collectRouteDetails` (lines 385–401):

```java
private void collectRouteDetails(JsonNode steps, List<TrainRouteTransitDTO> collectedTransits) {
    if (!steps.isArray()) {
        return;
    }

    JsonNode lastWalkEndLocation = null;
    String lastWalkInstruction = null;

    for (JsonNode step : steps) {
        JsonNode transitDetails = step.path("transitDetails");
        if (transitDetails.isMissingNode()) {
            // WALK step — capture its endLocation as boarding point candidate
            JsonNode endLatLng = step.path("endLocation").path("latLng");
            if (!endLatLng.isMissingNode()) {
                lastWalkEndLocation = endLatLng;
                lastWalkInstruction = step.path("navigationInstruction").path("instructions").asText(null);
            }
            continue;
        }

        JsonNode stopDetails = transitDetails.path("stopDetails");
        JsonNode transitLine = transitDetails.path("transitLine");
        WalkingApproachDTO walkingApproach = buildWalkingApproach(lastWalkEndLocation, lastWalkInstruction);
        TrainRouteTransitDTO transit = mapTransit(stopDetails, transitLine, walkingApproach);
        addTransitIfValid(collectedTransits, transit);

        // Reset — each TRANSIT step consumes the preceding WALK approach
        lastWalkEndLocation = null;
        lastWalkInstruction = null;
    }
}
```

- [ ] **Step 4: Add buildWalkingApproach helper to TrainRouteService**

Add this private method to `TrainRouteService` (place it near the end, before `textOrNull`):

```java
@Nullable
private WalkingApproachDTO buildWalkingApproach(@Nullable JsonNode endLatLng, @Nullable String instruction) {
    if (endLatLng == null || endLatLng.isMissingNode()) {
        return null;
    }
    return WalkingApproachDTO.builder()
            .latitude(endLatLng.path("latitude").asDouble())
            .longitude(endLatLng.path("longitude").asDouble())
            .instruction(instruction)
            .build();
}
```

- [ ] **Step 5: Update mapTransit to accept and pass walkingApproach**

Replace `mapTransit` (lines 404–415) in `TrainRouteService.java`:

```java
private TrainRouteTransitDTO mapTransit(JsonNode stopDetails, JsonNode transitLine,
        @Nullable WalkingApproachDTO walkingApproach) {
    TrainRouteStopDTO departureStop = mapDepartureStop(stopDetails, walkingApproach);
    TrainRouteStopDTO arrivalStop = mapArrivalStop(stopDetails);

    return TrainRouteTransitDTO.builder()
            .departure(departureStop)
            .arrival(arrivalStop)
            .trainName(resolveTrainName(transitLine))
            .vehicleType(textOrNull(transitLine.path("vehicle").path("name"), "text"))
            .agencyName(firstAgencyName(transitLine.path("agencies")))
            .build();
}
```

- [ ] **Step 6: Update mapDepartureStop to parse location + walkingApproach**

Replace `mapDepartureStop` (lines 418–423) in `TrainRouteService.java`:

```java
private TrainRouteStopDTO mapDepartureStop(JsonNode stopDetails, @Nullable WalkingApproachDTO walkingApproach) {
    JsonNode latLng = stopDetails.path("departureStop").path("location").path("latLng");
    return TrainRouteStopDTO.builder()
            .stationName(stopDetails.path("departureStop").path("name").asText(null))
            .departureTime(textOrNull(stopDetails, "departureTime"))
            .latitude(latLng.isMissingNode() ? null : latLng.path("latitude").asDouble())
            .longitude(latLng.isMissingNode() ? null : latLng.path("longitude").asDouble())
            .walkingApproach(walkingApproach)
            .build();
}
```

- [ ] **Step 7: Update mapArrivalStop to parse location**

Replace `mapArrivalStop` (lines 426–431) in `TrainRouteService.java`:

```java
private TrainRouteStopDTO mapArrivalStop(JsonNode stopDetails) {
    JsonNode latLng = stopDetails.path("arrivalStop").path("location").path("latLng");
    return TrainRouteStopDTO.builder()
            .stationName(stopDetails.path("arrivalStop").path("name").asText(null))
            .arrivalTime(textOrNull(stopDetails, "arrivalTime"))
            .latitude(latLng.isMissingNode() ? null : latLng.path("latitude").asDouble())
            .longitude(latLng.isMissingNode() ? null : latLng.path("longitude").asDouble())
            .build();
}
```

- [ ] **Step 8: Update appendOrMergeTouchpoint to carry walkingApproach and stop locations to touchpoint**

In `buildTouchpoints`, the touchpoint builder must carry the new fields. Replace `appendOrMergeTouchpoint` (lines 151–187):

```java
private void appendOrMergeTouchpoint(List<TrainRouteTouchpointDTO> touchpoints, TrainRouteStopDTO stop) {
    if (stop == null || stop.getStationName() == null || stop.getStationName().isBlank()) {
        return;
    }

    StopLocationDTO stopLocation = (stop.getLatitude() != null && stop.getLongitude() != null)
            ? StopLocationDTO.builder().latitude(stop.getLatitude()).longitude(stop.getLongitude()).build()
            : null;

    TrainRouteTouchpointDTO candidate = TrainRouteTouchpointDTO.builder()
            .stationName(stop.getStationName())
            .arrivalTime(stop.getArrivalTime())
            .departureTime(stop.getDepartureTime())
            .station(stop.getStation())
            .facilities(stop.getFacilities())
            .departureStop(stopLocation)
            .walkingApproach(stop.getWalkingApproach())
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
    if (previous.getWalkingApproach() == null && candidate.getWalkingApproach() != null) {
        previous.setWalkingApproach(candidate.getWalkingApproach());
    }
}
```

For arrival stops, we need to set `arrivalStop` on the touchpoint. The arrival stop's coordinates come from `mapArrivalStop`. Currently `appendOrMergeTouchpoint` receives either a departure stop or an arrival stop. We need to distinguish these.

Replace the `appendOrMergeTouchpoint` call site in `buildTouchpoints` to pass the stop type. Update `buildTouchpoints` (lines 126–149):

```java
private List<TrainRouteTouchpointDTO> buildTouchpoints(List<TrainRouteTransitDTO> transits) {
    List<TrainRouteTouchpointDTO> touchpoints = new java.util.ArrayList<>();
    if (transits.isEmpty()) {
        return touchpoints;
    }

    appendDepartureTouchpoint(touchpoints, transits.getFirst().getDeparture());

    for (int index = 0; index < transits.size(); index++) {
        TrainRouteTransitDTO transit = transits.get(index);
        appendArrivalTouchpoint(touchpoints, transit.getArrival());
        if (index < transits.size() - 1) {
            appendDepartureTouchpoint(touchpoints, transits.get(index + 1).getDeparture());
        }
    }

    for (int index = 0; index < touchpoints.size(); index++) {
        TrainRouteTouchpointDTO touchpoint = touchpoints.get(index);
        touchpoint.setKind(resolveTouchpointKind(index, touchpoints.size()));
        touchpoint.setAccessibility(buildTouchpointAccessibility(touchpoint.getStation(), touchpoint.getFacilities()));
    }

    return touchpoints;
}

private void appendDepartureTouchpoint(List<TrainRouteTouchpointDTO> touchpoints, TrainRouteStopDTO stop) {
    if (stop == null || stop.getStationName() == null || stop.getStationName().isBlank()) {
        return;
    }

    StopLocationDTO stopLocation = buildStopLocation(stop.getLatitude(), stop.getLongitude());

    TrainRouteTouchpointDTO candidate = TrainRouteTouchpointDTO.builder()
            .stationName(stop.getStationName())
            .departureTime(stop.getDepartureTime())
            .station(stop.getStation())
            .facilities(stop.getFacilities())
            .departureStop(stopLocation)
            .walkingApproach(stop.getWalkingApproach())
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
    if (previous.getWalkingApproach() == null && candidate.getWalkingApproach() != null) {
        previous.setWalkingApproach(candidate.getWalkingApproach());
    }
}

private void appendArrivalTouchpoint(List<TrainRouteTouchpointDTO> touchpoints, TrainRouteStopDTO stop) {
    if (stop == null || stop.getStationName() == null || stop.getStationName().isBlank()) {
        return;
    }

    StopLocationDTO stopLocation = buildStopLocation(stop.getLatitude(), stop.getLongitude());

    TrainRouteTouchpointDTO candidate = TrainRouteTouchpointDTO.builder()
            .stationName(stop.getStationName())
            .arrivalTime(stop.getArrivalTime())
            .station(stop.getStation())
            .facilities(stop.getFacilities())
            .arrivalStop(stopLocation)
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
    if (previous.getStation() == null && candidate.getStation() != null) {
        previous.setStation(candidate.getStation());
    }
    if (candidate.getFacilities() != null) {
        previous.setFacilities(candidate.getFacilities());
    }
    if (previous.getArrivalStop() == null && candidate.getArrivalStop() != null) {
        previous.setArrivalStop(candidate.getArrivalStop());
    }
}

@Nullable
private StopLocationDTO buildStopLocation(@Nullable Double latitude, @Nullable Double longitude) {
    if (latitude == null || longitude == null) {
        return null;
    }
    return StopLocationDTO.builder().latitude(latitude).longitude(longitude).build();
}
```

Also delete the old `appendOrMergeTouchpoint` method — it is replaced by the two new methods above.

Also add the import for `WalkingApproachDTO` and `StopLocationDTO` at the top of `TrainRouteService.java`:

```java
import com.bf.navigator.service.route.dto.WalkingApproachDTO;
import com.bf.navigator.service.route.dto.StopLocationDTO;
```

- [ ] **Step 9: Run all backend tests — verify they pass**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-service
./mvnw test -q 2>&1 | tail -20
```

Expected: `BUILD SUCCESS` — all tests including the two new ones pass.

- [ ] **Step 10: Commit**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-service
git add src/
git commit -m "feat: add stop location and walking approach to train route response"
```

---

## Task 4: Frontend — Extend TypeScript types

**Files:**

- Modify: `src/pages/TrainSearchResults/types.ts`

- [ ] **Step 1: Write the failing type-check test**

In `src/pages/LiveNavigation/LiveNavigation.test.tsx`, add a compile-time sentinel at the top of the file (after imports) that will fail if the new fields are missing. Add the following right after the last `vi.mock(...)` block:

```ts
// Type sentinel — verifies new fields exist on TrainRouteTouchpoint
type _AssertWalkingApproach =
  NonNullable<NonNullable<TrainRouteResponse['touchpoints']>[number]['walkingApproach']> extends {
    latitude: number;
    longitude: number;
    instruction: string;
  }
    ? true
    : never;
type _AssertDepartureStop =
  NonNullable<NonNullable<TrainRouteResponse['touchpoints']>[number]['departureStop']> extends {
    latitude: number;
    longitude: number;
  }
    ? true
    : never;
```

- [ ] **Step 2: Run the type check — verify it fails**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx tsc --noEmit 2>&1 | grep -i "walkingApproach\|departureStop\|_Assert" | head -10
```

Expected: type errors because fields do not exist yet.

- [ ] **Step 3: Add new interfaces and extend TrainRouteTouchpoint in types.ts**

In `src/pages/TrainSearchResults/types.ts`, add the following two interfaces before `TrainRouteTouchpoint`:

```ts
export interface WalkingApproach {
  instruction: string;
  latitude: number;
  longitude: number;
}

export interface StopLocation {
  latitude: number;
  longitude: number;
}
```

Then extend `TrainRouteTouchpoint` by adding three new optional fields:

```ts
export interface TrainRouteTouchpoint {
  accessibility: TrainRouteStationAccessibility;
  arrivalTime: string | null;
  departureTime: string | null;
  facilities: TrainRouteFacility[] | null;
  kind: 'ORIGIN' | 'TRANSFER' | 'DESTINATION';
  station: TrainRouteStation | null;
  stationName: string;
  // New fields from backend enrichment
  departureStop: StopLocation | null;
  arrivalStop: StopLocation | null;
  walkingApproach: WalkingApproach | null;
}
```

- [ ] **Step 4: Run the type check — verify it passes**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -10
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
git add src/pages/TrainSearchResults/types.ts src/pages/LiveNavigation/LiveNavigation.test.tsx
git commit -m "feat: add WalkingApproach and StopLocation types to TrainRouteTouchpoint"
```

---

## Task 5: Frontend — Fix getTouchpointPosition + extend route points with elevator waypoints

**Files:**

- Modify: `src/pages/LiveNavigation/LiveNavigation.tsx`
- Modify: `src/pages/LiveNavigation/LiveNavigation.test.tsx`

- [ ] **Step 1: Write failing test for departureStop coordinate usage**

In `LiveNavigation.test.tsx`, update the `makeTouchpoint` helper (the tests currently use the inline structure from `makeSelectedRoute`). Add a new test near the bottom of the describe block, before the closing `});`:

```ts
it('uses departureStop coordinates for map position when available', async () => {
  const user = userEvent.setup();

  getSelectedTrainRouteMock.mockReturnValue({
    origin: 'Hamburg Hbf',
    destination: 'Braunschweig Hbf',
    departureTime: '2026-04-02T08:29:00Z',
    arrivalTime: '2026-04-02T10:45:00Z',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden',
    accessibilitySummary: {
      activeElevators: 1,
      activeEscalators: 0,
      inactiveElevators: 0,
      inactiveEscalators: 0,
      mobilityServiceStations: 1,
      status: 'ACCESSIBLE',
      stepFreeStations: 1,
      summary: '1/2 stations step-free',
      totalStations: 2,
    },
    transits: [makeTransit('ICE 579')],
    touchpoints: [
      {
        accessibility: {
          activeElevators: 1,
          activeEscalators: 0,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary: 'Step-free access available',
        },
        arrivalTime: null,
        departureTime: '2026-04-02T08:29:00Z',
        facilities: [makeFacility(1001, 10.006500, 53.553200)],
        kind: 'ORIGIN',
        station: null,
        stationName: 'Hamburg Hbf',
        departureStop: { latitude: 53.553637, longitude: 10.006677 },
        arrivalStop: null,
        walkingApproach: { latitude: 53.553400, longitude: 10.006300, instruction: 'Hier einsteigen: E' },
      },
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: false,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: false,
          status: 'UNKNOWN',
          stepFreeAvailable: false,
          summary: 'Station accessibility data unavailable',
        },
        arrivalTime: '2026-04-02T10:45:00Z',
        departureTime: null,
        facilities: null,
        kind: 'DESTINATION',
        station: null,
        stationName: 'Braunschweig Hbf',
        departureStop: null,
        arrivalStop: { latitude: 52.2524, longitude: 10.5316 },
        walkingApproach: null,
      },
    ],
  } satisfies TrainRouteResponse);

  render(<LiveNavigation />);

  watchErrorCallback?.({
    code: 1,
    message: 'Permission denied',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError);

  const routePath = (
    liveNavigationMapMock.mock.calls.at(-1)?.[0] as
      | { routePath: [number, number][] }
      | undefined
  )?.routePath;

  // Route must include departureStop coordinates [53.553637, 10.006677], not facility [53.553200, 10.006500]
  const hasDepStopCoord = routePath?.some(
    ([lat, lng]) => Math.abs(lat - 53.553637) < 0.0001 && Math.abs(lng - 10.006677) < 0.0001
  );
  expect(hasDepStopCoord).toBe(true);

  const hasFacilityCoord = routePath?.some(
    ([lat, lng]) => Math.abs(lat - 53.553200) < 0.0001 && Math.abs(lng - 10.006500) < 0.0001
  );
  // Facility coordinate should NOT be the primary stop position
  expect(hasFacilityCoord).toBe(false);
});
```

- [ ] **Step 2: Write failing test for inactive elevator warning**

Add another test after the one above:

```ts
it('shows inactive elevator warning when origin touchpoint has inactive elevators', async () => {
  getSelectedTrainRouteMock.mockReturnValue({
    origin: 'Hamburg Hbf',
    destination: 'Braunschweig Hbf',
    departureTime: '2026-04-02T08:29:00Z',
    arrivalTime: '2026-04-02T10:45:00Z',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden',
    accessibilitySummary: {
      activeElevators: 0,
      activeEscalators: 0,
      inactiveElevators: 1,
      inactiveEscalators: 0,
      mobilityServiceStations: 0,
      status: 'LIMITED',
      stepFreeStations: 0,
      summary: '0/2 stations step-free',
      totalStations: 2,
    },
    transits: [makeTransit('ICE 579')],
    touchpoints: [
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: true,
          inactiveElevators: 1,
          inactiveEscalators: 0,
          mobilityServiceAvailable: false,
          status: 'LIMITED',
          stepFreeAvailable: false,
          summary: 'Elevators 0 active / 1 inactive',
        },
        arrivalTime: null,
        departureTime: '2026-04-02T08:29:00Z',
        facilities: [
          {
            description: 'Lift to platform 7',
            equipmentnumber: 1001,
            geocoordX: 10.006500,
            geocoordY: 53.553200,
            operationalResumeDate: '2026-04-15',
            operatorname: 'DB InfraGO',
            state: 'INACTIVE',
            stateExplanation: 'Maintenance',
            stationnumber: 12345,
            type: 'ELEVATOR',
          },
        ],
        kind: 'ORIGIN',
        station: null,
        stationName: 'Hamburg Hbf',
        departureStop: { latitude: 53.553637, longitude: 10.006677 },
        arrivalStop: null,
        walkingApproach: null,
      },
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: false,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: false,
          status: 'UNKNOWN',
          stepFreeAvailable: false,
          summary: 'Station accessibility data unavailable',
        },
        arrivalTime: '2026-04-02T10:45:00Z',
        departureTime: null,
        facilities: null,
        kind: 'DESTINATION',
        station: null,
        stationName: 'Braunschweig Hbf',
        departureStop: null,
        arrivalStop: { latitude: 52.2524, longitude: 10.5316 },
        walkingApproach: null,
      },
    ],
  } satisfies TrainRouteResponse);

  render(<LiveNavigation />);

  watchErrorCallback?.({
    code: 1,
    message: 'Permission denied',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError);

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(/aufzug.*nicht verfügbar/i);
  expect(screen.getByRole('alert')).toHaveTextContent(/2026-04-15/);
});
```

- [ ] **Step 3: Run failing tests to confirm they fail**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✓|×|uses departureStop|shows inactive" | head -20
```

Expected: 2 new tests FAIL.

- [ ] **Step 4: Rewrite getTouchpointPosition in LiveNavigation.tsx**

Replace the existing `getTouchpointPosition` function (lines 102–110):

```ts
function getTouchpointPosition(touchpoint: TrainRouteTouchpoint): LiveNavigationLatLng | null {
  if (touchpoint.departureStop?.latitude != null && touchpoint.departureStop?.longitude != null) {
    return [touchpoint.departureStop.latitude, touchpoint.departureStop.longitude];
  }

  const facilityWithCoordinates = (touchpoint.facilities ?? []).find(hasValidCoordinates);
  if (!facilityWithCoordinates) {
    return null;
  }

  return [facilityWithCoordinates.geocoordY, facilityWithCoordinates.geocoordX];
}
```

- [ ] **Step 5: Extend getRoutePointsFromTouchpoints to include elevator waypoints**

Replace `getRoutePointsFromTouchpoints` (lines 112–142):

```ts
function getActiveElevatorPoints(
  touchpoint: TrainRouteTouchpoint,
  index: number
): LiveNavigationRoutePoint[] {
  return (touchpoint.facilities ?? [])
    .filter(
      (f): f is TrainRouteFacility & { geocoordX: number; geocoordY: number } =>
        f.type === 'ELEVATOR' && f.state === 'ACTIVE' && hasValidCoordinates(f)
    )
    .map((f, elevatorIndex) => ({
      description: f.description,
      id: `elevator-${index}-${elevatorIndex}`,
      instruction: `Nehmen Sie ${f.description} zur Plattform.`,
      label: f.description,
      position: [f.geocoordY, f.geocoordX] as LiveNavigationLatLng,
    }));
}

function getRoutePointsFromTouchpoints(
  touchpoints: TrainRouteTouchpoint[] | undefined
): LiveNavigationRoutePoint[] {
  if (!touchpoints?.length) {
    return [];
  }

  const points: LiveNavigationRoutePoint[] = [];

  for (const [index, touchpoint] of touchpoints.entries()) {
    if (touchpoint.kind !== 'DESTINATION' && touchpoint.walkingApproach != null) {
      points.push({
        description: `Eingang ${touchpoint.stationName}.`,
        id: `entrance-${index}`,
        instruction:
          touchpoint.walkingApproach.instruction ??
          `Betreten Sie ${touchpoint.stationName} am Eingang.`,
        label: 'Eingang',
        position: [touchpoint.walkingApproach.latitude, touchpoint.walkingApproach.longitude],
      });
    }

    points.push(...getActiveElevatorPoints(touchpoint, index));

    const position = getTouchpointPosition(touchpoint);
    if (position == null) {
      continue;
    }

    points.push({
      description: `Orientierungspunkt: ${touchpoint.stationName}.`,
      id: `${touchpoint.kind.toLowerCase()}-${index}`,
      instruction:
        touchpoint.kind === 'DESTINATION'
          ? `Sie haben ${touchpoint.stationName} erreicht.`
          : `Folgen Sie dem Leitweg in Richtung ${touchpoint.stationName}.`,
      label: touchpoint.stationName,
      position,
    });
  }

  return points;
}
```

- [ ] **Step 6: Add inactive elevator warning computation and UI**

After the `getRoutePointsFromTouchpoints` function in `LiveNavigation.tsx`, add:

```ts
type InactiveElevatorWarning = {
  description: string;
  operationalResumeDate: string | null;
  stationName: string;
};

function getInactiveElevatorWarnings(
  touchpoints: TrainRouteTouchpoint[] | undefined
): InactiveElevatorWarning[] {
  if (!touchpoints?.length) {
    return [];
  }

  const warnings: InactiveElevatorWarning[] = [];

  for (const touchpoint of touchpoints) {
    for (const facility of touchpoint.facilities ?? []) {
      if (facility.type === 'ELEVATOR' && facility.state === 'INACTIVE') {
        warnings.push({
          description: facility.description,
          operationalResumeDate: facility.operationalResumeDate,
          stationName: touchpoint.stationName,
        });
      }
    }
  }

  return warnings;
}
```

In the `LiveNavigation` component function, after `const routeStops = ...`, add:

```ts
const inactiveElevatorWarnings = getInactiveElevatorWarnings(selectedTouchpoints);
```

In the JSX, add the warning section after the `<div className={styles['alt-section']}>` block (after the closing `</div>` of alt-section, before `{shouldShowManualFallback ...}`):

```tsx
{
  inactiveElevatorWarnings.length > 0 ? (
    <section
      aria-label="Aufzug nicht verfügbar"
      className={styles['elevator-warning']}
      role="alert"
    >
      {inactiveElevatorWarnings.map((warning) => (
        <div key={warning.description} className={styles['elevator-warning-item']}>
          <TriangleAlert aria-hidden="true" className={styles['elevator-warning-icon']} />
          <div>
            <p className={styles['elevator-warning-title']}>
              Aufzug nicht verfügbar: {warning.description}
            </p>
            {warning.operationalResumeDate != null ? (
              <p className={styles['elevator-warning-date']}>
                Voraussichtliche Wiederinbetriebnahme: {warning.operationalResumeDate}
              </p>
            ) : null}
            <p className={styles['elevator-warning-advice']}>
              Bitte wenden Sie sich an das Bahnhofspersonal.
            </p>
          </div>
        </div>
      ))}
    </section>
  ) : null;
}
```

Add the CSS classes to `LiveNavigation.module.css` (append at the end of the file):

```css
.elevator-warning {
  border: 2px solid var(--color-warning, #f59e0b);
  border-radius: 8px;
  padding: 12px 16px;
  background: var(--color-warning-bg, #fffbeb);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.elevator-warning-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.elevator-warning-icon {
  width: 20px;
  height: 20px;
  color: var(--color-warning, #f59e0b);
  flex-shrink: 0;
  margin-top: 2px;
}

.elevator-warning-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.elevator-warning-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 2px;
}

.elevator-warning-advice {
  font-size: 0.85rem;
  margin-top: 4px;
}
```

- [ ] **Step 7: Run the tests — verify all pass**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx --reporter=verbose 2>&1 | tail -30
```

Expected: all tests PASS including the 2 new ones.

- [ ] **Step 8: Run the full test suite to check for regressions**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run --reporter=verbose 2>&1 | tail -20
```

Expected: `Test Files: all passed`.

- [ ] **Step 9: Run type check**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx tsc --noEmit 2>&1 | grep "error TS" | head -10
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
git add src/pages/LiveNavigation/LiveNavigation.tsx src/pages/LiveNavigation/LiveNavigation.module.css src/pages/LiveNavigation/LiveNavigation.test.tsx
git commit -m "feat: route through active elevators and warn on inactive ones in LiveNavigation"
```

---

## Task 6: Frontend — Dynamic Haupteingang from walkingApproach

**Files:**

- Modify: `src/pages/LiveNavigation/LiveNavigation.tsx`
- Modify: `src/pages/LiveNavigation/LiveNavigation.test.tsx`

- [ ] **Step 1: Write failing test for dynamic Haupteingang**

Add this test to `LiveNavigation.test.tsx`:

```ts
it('uses walkingApproach coordinates as Haupteingang starting position', async () => {
  getSelectedTrainRouteMock.mockReturnValue({
    origin: 'Hamburg Hbf',
    destination: 'Braunschweig Hbf',
    departureTime: '2026-04-02T08:29:00Z',
    arrivalTime: '2026-04-02T10:45:00Z',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden',
    accessibilitySummary: {
      activeElevators: 1,
      activeEscalators: 0,
      inactiveElevators: 0,
      inactiveEscalators: 0,
      mobilityServiceStations: 1,
      status: 'ACCESSIBLE',
      stepFreeStations: 1,
      summary: '1/2 stations step-free',
      totalStations: 2,
    },
    transits: [makeTransit('ICE 579')],
    touchpoints: [
      {
        accessibility: {
          activeElevators: 1,
          activeEscalators: 0,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary: 'Step-free access available',
        },
        arrivalTime: null,
        departureTime: '2026-04-02T08:29:00Z',
        facilities: [makeFacility(1001, 10.006677, 53.553637)],
        kind: 'ORIGIN',
        station: null,
        stationName: 'Hamburg Hbf',
        departureStop: { latitude: 53.553637, longitude: 10.006677 },
        arrivalStop: null,
        walkingApproach: { latitude: 53.5515, longitude: 10.0054, instruction: 'Hier einsteigen: E' },
      },
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: false,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: false,
          status: 'UNKNOWN',
          stepFreeAvailable: false,
          summary: 'Station accessibility data unavailable',
        },
        arrivalTime: '2026-04-02T10:45:00Z',
        departureTime: null,
        facilities: null,
        kind: 'DESTINATION',
        station: null,
        stationName: 'Braunschweig Hbf',
        departureStop: null,
        arrivalStop: { latitude: 52.2524, longitude: 10.5316 },
        walkingApproach: null,
      },
    ],
  } satisfies TrainRouteResponse);

  render(<LiveNavigation />);

  watchErrorCallback?.({
    code: 1,
    message: 'Permission denied',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError);

  // Select Haupteingang — route should start at walkingApproach coords [53.5515, 10.0054]
  const mainEntranceRadio = screen.getByRole('radio', { name: /haupteingang/i });
  expect(mainEntranceRadio).toBeInTheDocument();

  const routePathAtHaupteingang = (
    liveNavigationMapMock.mock.calls.at(-1)?.[0] as
      | { routePath: [number, number][] }
      | undefined
  )?.routePath;

  // First point of the route must be walkingApproach coordinates
  expect(routePathAtHaupteingang?.[0]).toEqual([53.5515, 10.0054]);
});
```

- [ ] **Step 2: Run failing test**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx -t "uses walkingApproach" --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL.

- [ ] **Step 3: Update getRequiredManualStarts to accept touchpoints and derive Haupteingang**

Replace `getRequiredManualStarts` in `LiveNavigation.tsx` (lines 144–159):

```ts
function getRequiredManualStarts(
  touchpoints: TrainRouteTouchpoint[] | undefined
): LiveNavigationManualStart[] {
  const originTouchpoint = touchpoints?.find((t) => t.kind === 'ORIGIN');

  return [
    {
      description:
        originTouchpoint?.walkingApproach != null
          ? 'Starten Sie am Eingang und folgen Sie dem Leitweg zum Abfahrtsgleis.'
          : 'Starten Sie am Haupteingang und folgen Sie dem Leitweg zum Abfahrtsgleis.',
      id: 'main-entrance',
      label: 'Haupteingang',
      routePointId: originTouchpoint?.walkingApproach != null ? 'entrance-0' : 'main-entrance',
    },
    {
      description: 'Starten Sie an der Info-Station und folgen Sie dem Leitweg zum Abfahrtsgleis.',
      id: 'info-point',
      label: 'Info-Station',
      routePointId: 'info-point',
    },
  ];
}
```

- [ ] **Step 4: Update the call site in the component**

In the `LiveNavigation` component function, change:

```ts
const requiredManualStarts = getRequiredManualStarts();
```

to:

```ts
const requiredManualStarts = getRequiredManualStarts(selectedTouchpoints);
```

- [ ] **Step 5: Run the tests — verify all pass**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run src/pages/LiveNavigation/LiveNavigation.test.tsx --reporter=verbose 2>&1 | tail -30
```

Expected: all tests PASS.

- [ ] **Step 6: Full suite + type check**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
npx vitest run --reporter=verbose 2>&1 | tail -10 && npx tsc --noEmit 2>&1 | grep "error TS" | head -5
```

Expected: all tests pass, no type errors.

- [ ] **Step 7: Commit**

```bash
cd /home/iliasalmerekov/Projects/LF8/bf-navigator-web
git add src/pages/LiveNavigation/LiveNavigation.tsx src/pages/LiveNavigation/LiveNavigation.test.tsx
git commit -m "feat: derive Haupteingang coordinates from walkingApproach data"
```

---

## Self-Review Checklist

**Spec coverage:**

| Spec requirement                                          | Covered by                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| Use `departureStop.location.latLng` for stop position     | Task 3 (backend parse) + Task 5 (frontend getTouchpointPosition) |
| WALK step `endLocation` → `walkingApproach` on touchpoint | Task 3 (collectRouteDetails + buildWalkingApproach)              |
| Active elevators as route waypoints                       | Task 5 (getActiveElevatorPoints + getRoutePointsFromTouchpoints) |
| Inactive elevator warning with `operationalResumeDate`    | Task 5 (getInactiveElevatorWarnings + warning JSX)               |
| Dynamic Haupteingang from `walkingApproach`               | Task 6 (getRequiredManualStarts)                                 |
| Fallback to facility coords when `departureStop` null     | Task 5 (getTouchpointPosition fallback)                          |
| No crash when new fields absent (old backend)             | All new fields are nullable; existing fallback logic preserved   |
| Backend fieldMask extensions                              | Task 3, Step 1                                                   |
| Backend tests                                             | Task 1                                                           |
| Frontend tests                                            | Tasks 5, 6                                                       |

**Placeholder scan:** No TBDs or TODOs.

**Type consistency:** `StopLocationDTO` (Java), `StopLocation` (TypeScript) — both have `latitude`/`longitude`. `WalkingApproachDTO` (Java), `WalkingApproach` (TypeScript) — both have `latitude`, `longitude`, `instruction`. All references use the same field names throughout.
