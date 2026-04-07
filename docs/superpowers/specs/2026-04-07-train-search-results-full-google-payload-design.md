# Train Search Results Full Google Payload Design

**Date:** 2026-04-07
**Scope:** Backend-only change for `bf-navigator-service` train search results

## Summary

`TrainSearchResults` must continue using `POST /routes/trains` and the existing stable `{"trips":[...]}` frontend contract.

The backend should stop relying on the reduced Google Routes field mask for this endpoint and instead use the same full live payload currently exposed by `/routes/trains/original`. The backend will then map that full payload back into the existing DTO shape.

This keeps frontend changes at zero while allowing mixed transit routes such as `ICE -> RE`, `ICE -> IC -> RE`, and similar combinations to appear in `transits[]`.

## Problem

The current live endpoint behavior can miss regional or mixed train segments in the mapped `trips[]` response even though those segments are present in the full Google Routes payload returned by `/routes/trains/original`.

As a result, the frontend can show only high-speed or limited subsets of trains even when live Google data already contains the real route composition.

## Goals

- Preserve the existing `POST /routes/trains` response contract
- Preserve the existing frontend behavior and route selection flow
- Map all real transit steps from the full live Google response into `transits[]`
- Keep `/routes/trains/original` as a diagnostic raw endpoint

## Non-Goals

- No frontend contract change
- No switch to a new rail data provider
- No Live Navigation implementation changes in this spec
- No raw Google payload returned directly to the frontend

## Design

### 1. Data Source

For `POST /routes/trains`, the backend will fetch the full live Google Routes payload instead of the reduced field-mask version.

This is the same source quality currently visible via `/routes/trains/original`, but still mapped internally to the stable DTO consumed by the frontend.

### 2. Mapping Rules

For each route:

- Iterate all `legs[].steps[]`
- Include steps where `travelMode == TRANSIT` and `transitDetails` exists
- Ignore `WALK` steps for `transits[]`
- Map `trainName` from `transitLine.nameShort`, fallback to `transitLine.name`
- Map `agencyName`, `vehicleType`, departure and arrival stop names, and times as today
- Preserve segment order exactly as it appears in the Google route

### 3. Stability Rules

- Failure to enrich a stop with station metadata must not remove the transit segment
- Missing `nameShort` must not remove the transit segment
- The backend keeps returning `{"trips":[...]}` so the frontend remains unchanged

### 4. Diagnostics

`/routes/trains/original` remains available for comparing:

- raw Google live payload
- mapped stable `/routes/trains` DTO

This endpoint remains diagnostic only and is not used by the frontend.

## Verification

Backend verification must cover:

- a mixed route with `ICE + RE`
- a mixed route with `ICE + IC + RE`
- fallback from `nameShort` to `name`
- station enrichment failure without transit loss

Frontend verification expectation:

- no code changes required if `transits[]` contains the expected segments
- existing `TrainResultCard` should render all returned train names automatically

## Risks

- Full Google payload increases response size and backend parsing cost
- Raw Google schema changes would affect backend mapping logic
- Using the full payload should remain an internal implementation detail, not a frontend dependency

## Decision

Adopt the minimal-change approach:

- `POST /routes/trains` uses full live Google payload internally
- backend maps to the existing stable DTO
- frontend stays unchanged
