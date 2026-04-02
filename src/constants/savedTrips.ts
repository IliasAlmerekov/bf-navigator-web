import type { SavedTrip } from '../types/savedTrip';

export const ROUTE_OVERVIEW_TRIP_ID = 'frankfurt-main-berlin-hbf';

export const DEFAULT_SAVED_TRIPS: SavedTrip[] = [
  {
    id: ROUTE_OVERVIEW_TRIP_ID,
    origin: 'Frankfurt (Main) Hbf',
    destination: 'Berlin',
    checkedAtLabel: 'Vor 2 Min. gepruft',
    reliabilityPercent: 98,
    reliabilityLabel: 'Zuverlassigkeit',
    reliabilityTone: 'excellent',
    sortTimestamp: Date.UTC(2026, 2, 28, 8, 47),
  },
  {
    id: 'paris-london',
    origin: 'Paris',
    destination: 'London',
    checkedAtLabel: 'Vor 15 Min. gepruft',
    reliabilityPercent: 94,
    reliabilityLabel: 'Zuverlassigkeit',
    reliabilityTone: 'warning',
    sortTimestamp: Date.UTC(2026, 2, 28, 8, 32),
  },
  {
    id: 'zuerich-milan',
    origin: 'Zurich',
    destination: 'Milan',
    checkedAtLabel: 'Vor 1 Std. gepruft',
    reliabilityPercent: 0,
    reliabilityLabel: 'Aufzugwartung',
    reliabilityTone: 'warning',
    sortTimestamp: Date.UTC(2026, 2, 28, 7, 48),
  },
];

export function buildRouteOverviewSavedTrip(now = Date.now()): SavedTrip {
  return {
    id: ROUTE_OVERVIEW_TRIP_ID,
    origin: 'Frankfurt (Main) Hbf',
    destination: 'Berlin',
    checkedAtLabel: 'Gerade eben gepruft',
    reliabilityPercent: 98,
    reliabilityLabel: 'Zuverlassigkeit',
    reliabilityTone: 'excellent',
    sortTimestamp: now,
  };
}
