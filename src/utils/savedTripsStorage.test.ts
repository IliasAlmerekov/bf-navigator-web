import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedTrip } from '../types/savedTrip';
import {
  SAVED_TRIPS_STORAGE_KEY,
  getStoredSavedTrips,
  hasSavedTrip,
  removeSavedTrip,
  storeSavedTrips,
  upsertSavedTrip,
} from './savedTripsStorage';

const TEST_TRIP_A: SavedTrip = {
  id: 'trip-a',
  origin: 'Frankfurt (Main) Hbf',
  destination: 'Berlin Hauptbahnhof',
  checkedAtLabel: 'Checked just now',
  reliabilityPercent: 98,
  reliabilityLabel: 'Accessibility',
  reliabilityTone: 'excellent',
  sortTimestamp: 100,
};

const TEST_TRIP_B: SavedTrip = {
  id: 'trip-b',
  origin: 'Munchen Hbf',
  destination: 'Hamburg-Altona',
  checkedAtLabel: 'Checked 10m ago',
  reliabilityPercent: 82,
  reliabilityLabel: 'Accessibility',
  reliabilityTone: 'warning',
  sortTimestamp: 90,
};

describe('savedTripsStorage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('stores and returns saved trips', () => {
    storeSavedTrips([TEST_TRIP_A]);

    expect(window.localStorage.getItem(SAVED_TRIPS_STORAGE_KEY)).toContain('trip-a');
    expect(getStoredSavedTrips()).toEqual([TEST_TRIP_A]);
  });

  it('upserts by id and keeps most recent item first', () => {
    storeSavedTrips([TEST_TRIP_B]);

    const nextTrips = upsertSavedTrip(TEST_TRIP_A);
    expect(nextTrips[0]?.id).toBe('trip-a');

    const updatedTrips = upsertSavedTrip({ ...TEST_TRIP_A, checkedAtLabel: 'Checked 1m ago' });
    expect(updatedTrips).toHaveLength(2);
    expect(updatedTrips[0]?.checkedAtLabel).toBe('Checked 1m ago');
  });

  it('removes saved trips by id', () => {
    storeSavedTrips([TEST_TRIP_A, TEST_TRIP_B]);

    const nextTrips = removeSavedTrip('trip-a');

    expect(nextTrips).toEqual([TEST_TRIP_B]);
    expect(hasSavedTrip('trip-a')).toBe(false);
    expect(hasSavedTrip('trip-b')).toBe(true);
  });

  it('returns empty array for malformed storage content', () => {
    window.localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, '{bad-json');

    expect(getStoredSavedTrips()).toEqual([]);
  });

  it('returns false for hasSavedTrip when no data exists', () => {
    expect(hasSavedTrip('unknown-trip')).toBe(false);
  });
});
