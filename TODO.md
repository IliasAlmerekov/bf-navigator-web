# BF Navigator – Train Search Frontend TODO

## Backend contract for train search

### Debug endpoint for frontend integration

`POST http://localhost:8081/routes/trains/debug`

Use `/debug` during frontend development and testing, because the backend returns a fixed response there and does not spend paid Google Routes quota.

### Request body

```json
{
  "origin": "Hamburg Hbf",
  "destination": "Braunschweig Hbf",
  "departureTime": "2026-04-02T08:00:00Z"
}
```

### Response shape returned by backend

```json
{
  "origin": "Hamburg Hbf",
  "destination": "Braunschweig Hbf",
  "departureTime": "2026-04-02T08:29:00Z",
  "arrivalTime": "2026-04-02T10:45:00Z",
  "localizedDistanceText": "240 km",
  "localizedDurationText": "2 Stunden, 20 Minuten",
  "transits": [
    {
      "departure": {
        "stationName": "Hamburg Hauptbahnhof",
        "departureTime": "2026-04-02T08:29:00Z",
        "station": {
          "name": "Hamburg Hbf",
          "number": 12345,
          "evaNumber": 8002549,
          "city": "Hamburg",
          "category": 1,
          "hasSteplessAccess": "yes",
          "hasMobilityService": "yes",
          "hasWiFi": true
        },
        "facilities": []
      },
      "arrival": {
        "stationName": "Hannover Hauptbahnhof",
        "arrivalTime": "2026-04-02T09:48:00Z",
        "station": {
          "name": "Hannover Hbf",
          "number": 23456,
          "evaNumber": 8000152,
          "city": "Hannover",
          "category": 1,
          "hasSteplessAccess": "yes",
          "hasMobilityService": "yes",
          "hasWiFi": true
        },
        "facilities": []
      },
      "trainName": "ICE 579",
      "vehicleType": "Hochgeschwindigkeitszug",
      "agencyName": "DB Fernverkehr AG"
    }
  ]
}
```

Notes:

- Backend currently returns a single `TrainRouteResponseDTO`, not `{ routes: [...] }` and not a Google raw response.
- `transits` contain the actual train segments that should drive the results card UI.
- `departure.station` and `arrival.station` may contain accessibility metadata that can later be used for filters.
- I could not verify the live endpoint from this session because `localhost:8081` was not running here, so the contract above is derived from backend code plus the embedded debug payload.

## Current frontend mismatch

Today `src/pages/TrainSearchResults` still uses mocked Google-like route data and calls the wrong backend endpoint:

- it fetches `/api/stations/:originEva/timetable`
- it sends only `originEva`, `date`, `time`
- it does not send `destination`
- it expects an array or `{ routes: [] }`
- it uses `MOCK_ROUTES` as fallback

The backend train search API does something else:

- it expects `origin` and `destination` as station names
- it expects one ISO datetime field: `departureTime`
- it returns one mapped route object with `transits`

## Frontend tickets

### FE-TR-01 Create a dedicated train routes API client

- [x] Add `src/services/trainRoutesApi.ts`
- [x] Reuse a shared `BASE_URL` pattern like `authApi.ts`
- [x] Implement `searchTrainRoute(request, signal?)`
- [x] Use `POST ${BASE_URL}/routes/trains/debug` for now
- [x] Send `Content-Type: application/json` and `Accept: application/json`
- [x] Map non-2xx responses into frontend errors

### FE-TR-02 Build the request payload from current search params

- [ ] Read `originName`, `destinationName`, `date`, `time` from `/train-search-results` search params
- [x] Build request body as:
      `{ origin, destination, departureTime }`
- [x] `origin` must come from `search.originName`
- [x] `destination` must come from `search.destinationName`
- [x] Combine `date + time` into a valid ISO-8601 datetime with timezone/offset
- [x] Do not append `Z` blindly unless the conversion is intentionally UTC
- [x] Add a helper for datetime conversion and unit-test it

### FE-TR-03 Replace obsolete TrainSearchResults types with backend DTO types

- [x] Update `src/pages/TrainSearchResults/types.ts`
- [x] Remove the old Google raw route types that the page no longer consumes
- [x] Add frontend types for:
      `TrainRouteResponse`
      `TrainRouteTransit`
      `TrainRouteStop`
      `TrainRouteStation`
      `TrainRouteFacility`
- [x] Keep types aligned with backend DTO field names to avoid unnecessary mapping noise

### FE-TR-04 Replace the current fetch logic in TrainSearchResults

- [x] Update `src/pages/TrainSearchResults/TrainSearchResults.tsx`
- [x] Remove the `/api/stations/${search.originEva}/timetable` request
- [x] Remove `formatTimetableDate()` and `formatTimetableTime()` for this page
- [x] Remove `MOCK_ROUTES` fallback
- [x] Call the new `searchTrainRoute()` service inside `useEffect`
- [x] Abort in-flight requests on unmount/search change
- [x] Reset pagination/state correctly when a new search starts

### FE-TR-05 Adapt the page state to the real backend response

- [x] Decide on the page model: backend returns one route object, not a list
- [x] Short-term pragmatic option: wrap the single response in an array with one item to keep the list layout
- [x] If this option is chosen, hide or disable pagination when only one backend route exists
- [x] Revisit filter tabs, because most current filters assume multiple results

### FE-TR-06 Refactor TrainResultCard to render backend transits

- [x] Update `src/pages/TrainSearchResults/components/TrainResultCard.tsx`
- [x] Stop reading `legs[].steps[].transitDetails`
- [x] Render from `route.transits`
- [x] Use `trainName` for line badges
- [x] Use `agencyName` / `vehicleType` where useful in UI
- [x] Derive:
      departure time from first transit departure
      arrival time from last transit arrival
      transfers from `transits.length - 1`
      direct trip if `transits.length === 1`
- [x] Format ISO timestamps into user-facing local times

### FE-TR-07 Clean up dead mock code

- [x] Remove `src/pages/TrainSearchResults/mockData.ts` if it is no longer needed
- [x] Remove comments that mention "Replace with Google Routes API endpoint"
- [x] Remove comments that mention "Remove mock data before production"
- [x] Remove unused legacy route/timetable helper types

### FE-TR-08 Fix local API configuration for development

- [x] Frontend currently proxies `/api` to `http://localhost:8080` in `vite.config.ts`
- [x] Backend train search is documented for `http://localhost:8081`
- [x] Align dev config before testing:
      add dedicated `VITE_TRAIN_ROUTES_API_URL` / `/train-api` handling for train search instead of changing shared `/api`
- [x] Make sure auth/station endpoints still point to the correct backend port after the change

### FE-TR-09 Keep the summary bar sourced from user search

- [ ] Preserve current summary values from query params:
      `originName`
      `destinationName`
      `date`
      `time`
- [ ] Ensure the summary never falls back to unrelated mock station names once API integration is complete

### FE-TR-10 Add tests for the new integration

- [ ] Update `src/pages/TrainSearchResults/TrainSearchResults.test.tsx`
- [ ] Replace expectations for `/stations/:originEva/timetable`
- [ ] Assert `POST /routes/trains/debug`
- [ ] Assert JSON body contains `origin`, `destination`, `departureTime`
- [ ] Assert loading, error, and empty states still work
- [ ] Assert a successful backend DTO renders at least:
      summary origin/destination
      overall departure/arrival time
      duration
      transfer count
      train line badges
- [ ] Add a test that verifies request recreation when `date` or `time` changes

### FE-TR-11 Optional follow-up: accessibility-driven filtering

- [ ] Re-check whether tabs `accessible` and `step-free` should become functional
- [ ] If yes, derive filter rules from:
      `station.hasSteplessAccess`
      `station.hasMobilityService`
      facility state/type data in `facilities`
- [ ] If no, hide these tabs until backend supports a stable filtering contract

## Recommended implementation order

- [ ] 1. `FE-TR-08` align API base URL / proxy
- [ ] 2. `FE-TR-01` add service client
- [ ] 3. `FE-TR-02` build request payload correctly
- [ ] 4. `FE-TR-03` replace types
- [ ] 5. `FE-TR-04` wire `TrainSearchResults.tsx`
- [ ] 6. `FE-TR-06` refactor `TrainResultCard.tsx`
- [ ] 7. `FE-TR-07` remove mocks
- [ ] 8. `FE-TR-10` update tests
- [ ] 9. `FE-TR-11` decide accessibility filters

## Main blockers / decisions

- [ ] Backend returns only one route today. Confirm whether frontend should display exactly one result for now or whether backend will later return multiple alternatives.
- [ ] Confirm which timezone the frontend should send for `departureTime` when the user selects a local German date/time.
- [ ] Confirm whether `/debug` should be used only in local development or also in preview/staging builds.
