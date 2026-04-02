import type { SavedTrip } from '../types/savedTrip';

export const SAVED_TRIPS_STORAGE_KEY = 'bf-navigator-saved-trips';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function isSavedTrip(value: unknown): value is SavedTrip {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.origin === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.checkedAtLabel === 'string' &&
    typeof candidate.reliabilityPercent === 'number' &&
    typeof candidate.reliabilityLabel === 'string' &&
    (candidate.reliabilityTone === 'excellent' || candidate.reliabilityTone === 'warning') &&
    typeof candidate.sortTimestamp === 'number'
  );
}

export function getStoredSavedTrips() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(SAVED_TRIPS_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isSavedTrip);
  } catch {
    return [];
  }
}

export function storeSavedTrips(trips: SavedTrip[]) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // Ignore storage access issues and keep the interface usable.
  }
}

export function hasSavedTrip(tripId: string) {
  const savedTrips = getStoredSavedTrips();
  return savedTrips.some((trip) => trip.id === tripId);
}

export function upsertSavedTrip(nextTrip: SavedTrip) {
  const currentTrips = getStoredSavedTrips();
  const nextTrips = currentTrips.filter((trip) => trip.id !== nextTrip.id);

  nextTrips.unshift(nextTrip);
  storeSavedTrips(nextTrips);

  return nextTrips;
}

export function removeSavedTrip(tripId: string) {
  const nextTrips = getStoredSavedTrips().filter((trip) => trip.id !== tripId);
  storeSavedTrips(nextTrips);

  return nextTrips;
}
