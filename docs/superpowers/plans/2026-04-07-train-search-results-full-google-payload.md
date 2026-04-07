# Train Search Results Full Google Payload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `bf-navigator-service` use the full live Google Routes payload for `POST /routes/trains` while preserving the existing `{"trips":[...]}` contract so mixed train routes like `ICE -> RE` appear in Train Search Results.

**Architecture:** Keep `POST /routes/trains` and frontend behavior unchanged. Change only the backend data-fetch path so the service maps from the full Google Routes response, then keep `TrainRouteService` responsible for extracting transit segments and building the existing DTO. `/routes/trains/original` remains a diagnostic raw endpoint.

**Tech Stack:** Spring Boot, Jackson `JsonNode`, JUnit 5, Mockito, Google Routes API

---

## File Map

- Modify: `bf-navigator-service/src/main/java/com/bf/navigator/service/route/client/GoogleTrainRouteClient.java`
- Modify: `bf-navigator-service/src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`
- Modify: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`
- Optional modify: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/client/GoogleTrainRouteClientTest.java`
- Optional modify: `bf-navigator-service/README.md`

## Phase 1: Lock The Regression In Tests

### Task 1: Add mixed-route service coverage

**Files:**

- Modify: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`
- Test: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`

- [ ] **Step 1: Write a failing test for a mixed `ICE + RE` route**

Add a test alongside the existing service tests:

```java
@Test
void searchTrainRoutesKeepsRegionalTransitSegmentsFromFullGooglePayload() throws Exception {
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
                        "travelMode": "WALK"
                      },
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": { "name": "Hamburg Hauptbahnhof" },
                            "arrivalStop": { "name": "Hannover Hauptbahnhof" },
                            "departureTime": "2026-04-02T08:29:00Z",
                            "arrivalTime": "2026-04-02T09:48:00Z"
                          },
                          "transitLine": {
                            "nameShort": "ICE 579",
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
                            "departureTime": "2026-04-02T09:55:00Z",
                            "arrivalTime": "2026-04-02T10:45:00Z"
                          },
                          "transitLine": {
                            "name": "RE70",
                            "vehicle": { "name": { "text": "Zug oder S-Bahn" } },
                            "agencies": [{ "name": "Westfalenbahn" }]
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            """);

    when(googleTrainRouteClient.computeTrainRoutes(request, false)).thenReturn(routes);
    when(stationService.searchStations("Hamburg Hauptbahnhof,Hamburg Hbf")).thenReturn(List.of(
            new StationDTO("Hamburg Hbf", 12345L, 8002549L, "Hamburg", 1, "yes", "yes", true)));
    when(stationService.searchStations("Hannover Hauptbahnhof,Hannover Hbf")).thenReturn(List.of(
            new StationDTO("Hannover Hbf", 23456L, 8000152L, "Hannover", 1, "yes", "yes", true)));
    when(stationService.searchStations("Braunschweig Hauptbahnhof,Braunschweig Hbf")).thenReturn(List.of(
            new StationDTO("Braunschweig Hbf", 34567L, 8000049L, "Braunschweig", 2, "yes", "yes", true)));

    TrainRouteSearchResponseDTO response = trainRouteService.searchTrainRoutes(request, false);

    assertEquals(1, response.getTrips().size());
    assertEquals(2, response.getTrips().getFirst().getTransits().size());
    assertEquals("ICE 579", response.getTrips().getFirst().getTransits().get(0).getTrainName());
    assertEquals("RE70", response.getTrips().getFirst().getTransits().get(1).getTrainName());
    assertEquals("Westfalenbahn", response.getTrips().getFirst().getTransits().get(1).getAgencyName());
}
```

- [ ] **Step 2: Run the focused service test to verify the current behavior**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest#searchTrainRoutesKeepsRegionalTransitSegmentsFromFullGooglePayload test
```

Expected: FAIL if the current live-path parsing still loses mixed regional segments.

- [ ] **Step 3: Add a failing test for `nameShort` fallback to `name`**

Add another test:

```java
@Test
void resolveTrainNameFallsBackToTransitLineNameWhenNameShortIsMissing() throws Exception {
    TrainRouteRequestDTO request = TrainRouteRequestDTO.builder()
            .origin("Hannover Hbf")
            .destination("Braunschweig Hbf")
            .departureTime(OffsetDateTime.parse("2026-04-02T09:00:00Z"))
            .build();

    ArrayNode routes = (ArrayNode) objectMapper.readTree("""
            [
              {
                "legs": [
                  {
                    "steps": [
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": { "name": "Hannover Hauptbahnhof" },
                            "arrivalStop": { "name": "Braunschweig Hauptbahnhof" },
                            "departureTime": "2026-04-02T09:55:00Z",
                            "arrivalTime": "2026-04-02T10:45:00Z"
                          },
                          "transitLine": {
                            "name": "RE70",
                            "vehicle": { "name": { "text": "Zug oder S-Bahn" } },
                            "agencies": [{ "name": "Westfalenbahn" }]
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            """);

    when(googleTrainRouteClient.computeTrainRoutes(request, false)).thenReturn(routes);
    when(stationService.searchStations("Hannover Hauptbahnhof,Hannover Hbf")).thenReturn(List.of(
            new StationDTO("Hannover Hbf", 23456L, 8000152L, "Hannover", 1, "yes", "yes", true)));
    when(stationService.searchStations("Braunschweig Hauptbahnhof,Braunschweig Hbf")).thenReturn(List.of(
            new StationDTO("Braunschweig Hbf", 34567L, 8000049L, "Braunschweig", 2, "yes", "yes", true)));

    TrainRouteSearchResponseDTO response = trainRouteService.searchTrainRoutes(request, false);

    assertEquals("RE70", response.getTrips().getFirst().getTransits().getFirst().getTrainName());
}
```

- [ ] **Step 4: Run the fallback test**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest#resolveTrainNameFallsBackToTransitLineNameWhenNameShortIsMissing test
```

Expected: PASS if fallback already works, otherwise FAIL and document the exact mismatch before changing code.

- [ ] **Step 5: Commit the test lock-in**

```bash
git add src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java
git commit -m "test: cover mixed train segments in route mapping"
```

## Phase 2: Switch `/routes/trains` To Full Google Payload

### Task 2: Make the live endpoint parse full raw route data

**Files:**

- Modify: `bf-navigator-service/src/main/java/com/bf/navigator/service/route/client/GoogleTrainRouteClient.java`
- Modify: `bf-navigator-service/src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`
- Test: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`

- [ ] **Step 1: Replace the reduced live fetch path with the full-payload path**

Update `GoogleTrainRouteClient` so `computeTrainRoutes()` always reads from the full live payload in non-debug mode:

```java
public ArrayNode computeTrainRoutes(TrainRouteRequestDTO request, boolean debug) {
    try {
        String rawResponse = debug
                ? computeTrainRoutesRaw(request, FIELD_MASK, true)
                : computeTrainRoutesAllData(request);

        JsonNode rootNode = objectMapper.readTree(rawResponse);
        JsonNode routesNode = rootNode.path("routes");
        return routesNode.isArray() ? (ArrayNode) routesNode : objectMapper.createArrayNode();
    } catch (Exception e) {
        throw new RuntimeException("Failed to parse Google Routes response", e);
    }
}
```

- [ ] **Step 2: Keep `/routes/trains/original` unchanged**

Do not remove this method:

```java
public String getTrainRouteRaw(TrainRouteRequestDTO request) {
    validateRequest(request);
    return googleTrainRouteClient.computeTrainRoutesAllData(request);
}
```

The production change is internal to `/routes/trains`, not a contract change.

- [ ] **Step 3: Verify transit extraction still accepts all real transit steps**

Keep the transit extraction rule in `TrainRouteService` aligned with the raw payload shape:

```java
private void collectRouteDetails(JsonNode steps, List<TrainRouteTransitDTO> collectedTransits) {
    if (!steps.isArray()) {
        return;
    }

    for (JsonNode step : steps) {
        if (!"TRANSIT".equals(step.path("travelMode").asText())) {
            continue;
        }

        JsonNode transitDetails = step.path("transitDetails");
        if (transitDetails.isMissingNode()) {
            continue;
        }

        JsonNode stopDetails = transitDetails.path("stopDetails");
        JsonNode transitLine = transitDetails.path("transitLine");
        TrainRouteTransitDTO transit = mapTransit(stopDetails, transitLine);
        addTransitIfValid(collectedTransits, transit);
    }
}
```

If the current implementation already behaves this way with full payloads, keep the logic and only add the `travelMode` guard if needed.

- [ ] **Step 4: Run the focused mixed-route tests**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest#searchTrainRoutesKeepsRegionalTransitSegmentsFromFullGooglePayload,TrainRouteServiceTest#resolveTrainNameFallsBackToTransitLineNameWhenNameShortIsMissing test
```

Expected: PASS

- [ ] **Step 5: Commit the live fetch change**

```bash
git add src/main/java/com/bf/navigator/service/route/client/GoogleTrainRouteClient.java src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java
git commit -m "fix: map train trips from full google routes payload"
```

## Phase 3: Guard Against Enrichment-Related Transit Loss

### Task 3: Ensure missing station enrichment does not drop transit segments

**Files:**

- Modify: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`
- Optional modify: `bf-navigator-service/src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java`
- Test: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java`

- [ ] **Step 1: Add a failing test for missing station enrichment**

```java
@Test
void searchTrainRoutesKeepsTransitWhenStationEnrichmentFails() throws Exception {
    TrainRouteRequestDTO request = TrainRouteRequestDTO.builder()
            .origin("Hannover Hbf")
            .destination("Braunschweig Hbf")
            .departureTime(OffsetDateTime.parse("2026-04-02T09:00:00Z"))
            .build();

    ArrayNode routes = (ArrayNode) objectMapper.readTree("""
            [
              {
                "legs": [
                  {
                    "steps": [
                      {
                        "travelMode": "TRANSIT",
                        "transitDetails": {
                          "stopDetails": {
                            "departureStop": { "name": "Hannover Hauptbahnhof" },
                            "arrivalStop": { "name": "Braunschweig Hauptbahnhof" },
                            "departureTime": "2026-04-02T09:55:00Z",
                            "arrivalTime": "2026-04-02T10:45:00Z"
                          },
                          "transitLine": {
                            "name": "RE70",
                            "vehicle": { "name": { "text": "Zug oder S-Bahn" } },
                            "agencies": [{ "name": "Westfalenbahn" }]
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            """);

    when(googleTrainRouteClient.computeTrainRoutes(request, false)).thenReturn(routes);
    when(stationService.searchStations("Hannover Hauptbahnhof,Hannover Hbf"))
            .thenThrow(new RuntimeException("station lookup failed"));
    when(stationService.searchStations("Braunschweig Hauptbahnhof,Braunschweig Hbf"))
            .thenThrow(new RuntimeException("station lookup failed"));

    TrainRouteSearchResponseDTO response = trainRouteService.searchTrainRoutes(request, false);

    assertEquals(1, response.getTrips().size());
    assertEquals(1, response.getTrips().getFirst().getTransits().size());
    assertEquals("RE70", response.getTrips().getFirst().getTransits().getFirst().getTrainName());
}
```

- [ ] **Step 2: Run the enrichment resilience test**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest#searchTrainRoutesKeepsTransitWhenStationEnrichmentFails test
```

Expected: PASS. If it fails, adjust only the enrichment path, not the transit extraction path.

- [ ] **Step 3: If needed, keep enrichment best-effort only**

The intended behavior is:

```java
private void enrichTransitsWithStationInfo(List<TrainRouteTransitDTO> transits) {
    // best effort enrichment only
    // never remove an already mapped transit because station lookup fails
}
```

Do not add any filtering based on station lookup success.

- [ ] **Step 4: Run the full service test class**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest test
```

Expected: PASS

- [ ] **Step 5: Commit the resilience guard**

```bash
git add src/test/java/com/bf/navigator/service/route/service/TrainRouteServiceTest.java src/main/java/com/bf/navigator/service/route/service/TrainRouteService.java
git commit -m "test: keep mapped transits when station enrichment fails"
```

## Phase 4: Verify Client Behavior And Document The Contract

### Task 4: Verify the route client and update docs

**Files:**

- Optional modify: `bf-navigator-service/src/test/java/com/bf/navigator/service/route/client/GoogleTrainRouteClientTest.java`
- Optional modify: `bf-navigator-service/README.md`

- [ ] **Step 1: Add or update a client test to reflect the full-payload live path**

If there is already a client test around field masks or route parsing, align it with the new behavior. The expectation should be that non-debug route loading still yields `routes[]` from the raw live payload shape.

- [ ] **Step 2: Update the train search documentation**

Add a short note in `README.md`:

```md
- `POST /routes/trains` maps from the full live Google Routes response into the stable `{"trips":[...]}` contract.
- `POST /routes/trains/original` remains a diagnostic raw Google Routes endpoint and is not consumed by the frontend.
```

- [ ] **Step 3: Run focused backend verification**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q -Dtest=TrainRouteServiceTest,GoogleTrainRouteClientTest test
```

Expected: PASS

- [ ] **Step 4: Run the full backend test suite**

Run from `bf-navigator-service/`:

```bash
rtk ./mvnw -q test
```

Expected: PASS

- [ ] **Step 5: Commit documentation and test cleanup**

```bash
git add README.md src/test/java/com/bf/navigator/service/route/client/GoogleTrainRouteClientTest.java
git commit -m "docs: clarify full google payload train route mapping"
```

## Self-Review

- Spec coverage: the plan covers the full-payload fetch change, stable DTO preservation, mixed-segment transit mapping, fallback naming, enrichment resilience, and diagnostic endpoint preservation.
- Placeholder scan: no `TODO`, `TBD`, or content-free testing steps remain.
- Type consistency: the plan uses the existing `TrainRouteRequestDTO`, `TrainRouteSearchResponseDTO`, `TrainRouteTransitDTO`, `computeTrainRoutes`, and `computeTrainRoutesAllData` names already present in the codebase.
