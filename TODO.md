# BF Navigator Search Roadmap

## Frontend

### Home Search

- [x] Replace the static date display on the home page with an accessible native calendar input (`type="date"`).
- [x] Replace the static time display on the home page with an accessible native time input (`type="time"`).
- [x] Keep the station autocomplete flow for both origin and destination fields.
- [x] Validate that both origin and destination are selected from autocomplete suggestions before search can proceed.
- [x] Add inline validation messages with proper `aria-describedby` and `aria-invalid` support.
- [x] Preserve keyboard support for station autocomplete, date input, time input, and the search button.

### Search Interaction

- [x] Add a real search submission flow from the home page to the train results page.
- [x] Pass search parameters through route search params:
      `originEva`, `originName`, `destinationEva`, `destinationName`, `date`, `time`.
- [x] Show a loading state immediately after the user presses `Search`.
- [x] Disable the search button while the search is in progress.
- [x] Announce loading updates through an `aria-live="polite"` region.
- [x] Prevent duplicate submissions while loading.

### Train Search Results

- [ ] Replace mock data on the train results page with real data from the backend timetable endpoint.
- [ ] Fetch timetable data from `/stations/{originEva}/timetable?date=ddMMyy&time=HHmm`.
- [ ] In the current iteration, display all trains returned for the selected origin station.
- [ ] Read and render the selected origin, destination, date, and time from route search params.
- [ ] Show a loading state while timetable data is being fetched.
- [ ] Show an error state when the request fails.
- [ ] Show an empty state when the request succeeds but returns no trains.
- [ ] Keep the results page usable with keyboard-only navigation and screen readers.

### Data Mapping

- [ ] Add shared frontend API types for station search and timetable responses.
- [ ] Add a mapper from timetable DTOs to the train result card model.
- [ ] Handle missing backend fields safely, especially arrival time, route, and platform values.
- [ ] Format backend date/time data into readable UI labels without losing the original request values.

### Testing

- [ ] Add tests for home page validation when origin or destination is missing.
- [ ] Add tests for loading state after pressing `Search`.
- [ ] Add tests for successful navigation with valid search params.
- [ ] Add tests for train results loading, error, empty, and success states.
- [ ] Add accessibility-focused tests for labels, live regions, and keyboard interaction.

## Backend

### Route Search API

- [ ] Add a dedicated route search endpoint for origin-to-destination journey search.
- [ ] Accept structured query parameters:
      `originEva`, `destinationEva`, `date`, `time`, and optional accessibility filters.
- [ ] Return journey-based results instead of raw single-station timetable entries.
- [ ] Include direct routes and transfer routes in the same response model.

### Route Search Response Model

- [ ] Define a backend response model for journeys with:
      journey id, legs, transfer stations, departure time, arrival time, total duration, platform data, and route summary.
- [ ] Include accessibility metadata per leg and per full journey.
- [ ] Include a machine-readable status for `direct`, `transfer`, or `unavailable`.
- [ ] Include reason codes for empty results, for example `NO_DIRECT_ROUTE`, `NO_TRANSFER_ROUTE`, or `DOWNSTREAM_UNAVAILABLE`.

### Matching and Normalization

- [ ] Match routes by EVA number whenever possible instead of station display name only.
- [ ] Add station-name normalization for fallback matching:
      trim spaces, normalize case, and support equivalent station names.
- [ ] Avoid duplicate journeys when the same train combination is found through multiple matching paths.

### Transfer Search Logic

- [ ] Search direct routes from station A first.
- [ ] If station B is not found in the direct route list, generate transfer candidates from intermediate stations in routes departing from station A.
- [ ] Rank transfer candidates by:
      earliest feasible connection, shortest total duration, fewest transfers, and best accessibility.
- [ ] Fetch timetable data for each transfer candidate station around the expected arrival window.
- [ ] Search for a second-leg train from each transfer station to station B.
- [ ] Validate transfer feasibility using a minimum transfer buffer between arrival and next departure.
- [ ] Build combined journeys such as `A -> X -> B`.
- [ ] Support an initial implementation with one transfer only.
- [ ] Add clear depth and time limits so route search stays responsive and does not explode into too many downstream requests.

### Backend Testing

- [ ] Add tests for direct-route search success.
- [ ] Add tests for one-transfer route search success.
- [ ] Add tests for no-route-found responses.
- [ ] Add tests for invalid input parameters.
- [ ] Add tests for downstream API failure and timeout handling.
- [ ] Add tests for duplicate suppression and result sorting.

## Transfer Search Logic Reference

### Direct Search First

1. Load departures from station A for the selected date and time.
2. Check whether any returned train route already contains station B.
3. If yes, return those journeys as direct candidates.

### Fallback to Transfer Search

1. If no direct route contains station B, inspect every intermediate station in the returned routes from station A.
2. Treat each intermediate station as a possible transfer station.
3. Rank transfer stations using practical rules:
   accessibility first, then shorter wait time, fewer transfers, and shorter total travel time.
4. For each selected transfer station X, request timetable data around the time when the first leg is expected to arrive at X.
5. Search for trains from X to B.
6. Keep only feasible connections where the second train departs after the first train arrives plus a minimum transfer buffer.
7. Build combined journeys and sort them by:
   fewest transfers, best accessibility, shortest duration, earliest arrival.
8. If nothing is found, return an empty result with a machine-readable reason.

### Why This Belongs in Backend

- The frontend should not orchestrate many timetable requests across multiple stations.
- Transfer search requires batching, ranking, deduplication, and timeout control.
- Backend ownership keeps route logic deterministic, testable, and reusable for future clients.
