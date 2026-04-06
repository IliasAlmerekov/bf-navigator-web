import { describe, expect, it } from 'vitest';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
} from './liveNavigationData';
import {
  buildInstructionState,
  calculateRemainingDistanceMeters,
  findNearestRoutePointIndex,
  getRoutePointsFromManualStart,
} from './liveNavigationUtils';

describe('liveNavigationUtils', () => {
  it('finds the nearest route point for a live browser position', () => {
    expect(
      findNearestRoutePointIndex([50.10712, 8.66376], LIVE_NAVIGATION_ROUTE_POINTS)
    ).toBe(0);
  });

  it('calculates a non-zero remaining distance from the active route point to the destination', () => {
    const remainingDistance = calculateRemainingDistanceMeters(1, LIVE_NAVIGATION_ROUTE_POINTS);

    expect(remainingDistance).toBeGreaterThan(0);
    expect(remainingDistance).toBeLessThan(250);
  });

  it('builds text-first instruction state for the current live position', () => {
    expect(
      buildInstructionState({
        destination: LIVE_NAVIGATION_DESTINATION,
        position: [50.10736, 8.66312],
        routePoints: LIVE_NAVIGATION_ROUTE_POINTS,
      })
    ).toMatchObject({
      currentLabel: 'Aufzug E4',
      destinationLabel: 'Gleis 1',
      nextLabel: 'Info Point',
    });
  });

  it('returns a safe empty instruction state when no route points are available', () => {
    expect(
      buildInstructionState({
        destination: LIVE_NAVIGATION_DESTINATION,
        position: [50.10736, 8.66312],
        routePoints: [],
      })
    ).toEqual({
      currentLabel: '',
      currentStepDescription: '',
      destinationLabel: 'Gleis 1',
      nextLabel: 'Gleis 1',
      remainingDistanceMeters: 0,
      routePoints: [],
    });
  });

  it('derives a fallback route segment from the selected manual start point', () => {
    expect(
      getRoutePointsFromManualStart(
        'info-point',
        LIVE_NAVIGATION_MANUAL_STARTS,
        LIVE_NAVIGATION_ROUTE_POINTS
      )
    ).toEqual(LIVE_NAVIGATION_ROUTE_POINTS.slice(2));
  });
});
