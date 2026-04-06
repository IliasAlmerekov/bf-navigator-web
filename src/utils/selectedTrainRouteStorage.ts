import type { TrainRouteResponse } from '../pages/TrainSearchResults/types';

export const SELECTED_TRAIN_ROUTE_STORAGE_KEY = 'bf-navigator-selected-train-route';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function isTrainRouteResponse(value: unknown): value is TrainRouteResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.origin === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.departureTime === 'string' &&
    typeof candidate.arrivalTime === 'string' &&
    typeof candidate.localizedDistanceText === 'string' &&
    typeof candidate.localizedDurationText === 'string' &&
    Array.isArray(candidate.transits)
  );
}

export function saveSelectedTrainRoute(route: TrainRouteResponse) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(SELECTED_TRAIN_ROUTE_STORAGE_KEY, JSON.stringify(route));
  } catch {
    // Ignore storage write issues and keep the route selection usable.
  }
}

export function getSelectedTrainRoute() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(SELECTED_TRAIN_ROUTE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  const parsedValue = JSON.parse(rawValue);

  if (!isTrainRouteResponse(parsedValue)) {
    return null;
  }

  return parsedValue;
}

export function clearSelectedTrainRoute() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SELECTED_TRAIN_ROUTE_STORAGE_KEY);
  } catch {
    // Ignore storage write issues and keep the interface usable.
  }
}
