import { describe, expect, it } from 'vitest';
import type { TrainRouteTouchpoint } from '../TrainSearchResults/types';
import {
  LIVE_NAVIGATION_DESTINATION,
  LIVE_NAVIGATION_MANUAL_STARTS,
  LIVE_NAVIGATION_ROUTE_POINTS,
} from './liveNavigationData';
import {
  buildOriginRouteModel,
  buildInstructionState,
  calculateRemainingDistanceMeters,
  findNearestRoutePointIndex,
  getRoutePointsFromManualStart,
} from './liveNavigationUtils';

function makeOriginTouchpoint(): TrainRouteTouchpoint {
  return {
    accessibility: {
      activeElevators: 1,
      activeEscalators: 1,
      hasFacilityData: true,
      inactiveElevators: 1,
      inactiveEscalators: 0,
      mobilityServiceAvailable: true,
      status: 'LIMITED',
      stepFreeAvailable: true,
      summary: 'Step-free access available',
    },
    arrivalStop: null,
    arrivalTime: null,
    departureStop: { latitude: 50.10772, longitude: 8.66292 },
    departureTime: '2026-04-02T09:10:00Z',
    facilities: [
      {
        description: 'Aufzug A',
        equipmentnumber: 1001,
        geocoordX: 8.66312,
        geocoordY: 50.10736,
        operationalResumeDate: null,
        operatorname: 'DB InfraGO',
        state: 'ACTIVE',
        stateExplanation: 'available',
        stationnumber: 8000001,
        type: 'ELEVATOR',
      },
      {
        description: 'Aufzug B',
        equipmentnumber: 1002,
        geocoordX: 8.6634,
        geocoordY: 50.10744,
        operationalResumeDate: '2026-04-09',
        operatorname: 'DB InfraGO',
        state: 'INACTIVE',
        stateExplanation: 'out of service',
        stationnumber: 8000001,
        type: 'ELEVATOR',
      },
      {
        description: 'Rolltreppe C',
        equipmentnumber: 1003,
        geocoordX: 8.66355,
        geocoordY: 50.1075,
        operationalResumeDate: null,
        operatorname: 'DB InfraGO',
        state: 'ACTIVE',
        stateExplanation: 'available',
        stationnumber: 8000001,
        type: 'ESCALATOR',
      },
    ],
    kind: 'ORIGIN',
    station: null,
    stationName: 'Frankfurt (Main) Hbf',
    walkingApproach: {
      instruction: 'Nutzen Sie den Haupteingang.',
      latitude: 50.1071,
      longitude: 8.6638,
    },
  };
}

describe('liveNavigationUtils', () => {
  it('finds the nearest route point for a live browser position', () => {
    expect(findNearestRoutePointIndex([50.10712, 8.66376], LIVE_NAVIGATION_ROUTE_POINTS)).toBe(0);
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

  it('builds a departure-only route from entrance through active elevators to departure stop', () => {
    const routeModel = buildOriginRouteModel([makeOriginTouchpoint()]);

    expect(routeModel.hasAccessibleRoute).toBe(true);
    expect(routeModel.routePoints.map((point) => point.label)).toEqual([
      'Haupteingang',
      'Aufzug A',
      'Abfahrtspunkt',
    ]);
  });

  it('keeps inactive elevators and escalators as markers only', () => {
    const routeModel = buildOriginRouteModel([makeOriginTouchpoint()]);

    expect(routeModel.markers.map((marker) => marker.kind)).toEqual([
      'entrance',
      'active-elevator',
      'inactive-elevator',
      'escalator',
      'departure',
    ]);
    expect(routeModel.routePoints.map((point) => point.label)).not.toContain('Rolltreppe C');
    expect(routeModel.warningMessage).toBeNull();
  });
});
