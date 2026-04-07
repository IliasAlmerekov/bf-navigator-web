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
  isValidLatLngTuple,
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
        description: 'Aufzug D',
        equipmentnumber: 1004,
        geocoordX: 8.6637,
        geocoordY: 50.1072,
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
      'Haupteingang (Straßenseite)',
      'Aufzug D',
      'Abfahrtspunkt',
    ]);
  });

  it('chooses only the nearest active elevator relative to entrance', () => {
    const routeModel = buildOriginRouteModel([makeOriginTouchpoint()]);

    expect(routeModel.routePoints.map((point) => point.label)).toEqual([
      'Haupteingang (Straßenseite)',
      'Aufzug D',
      'Abfahrtspunkt',
    ]);
    expect(routeModel.markers[0]?.accessibleLabel).toBe('Haupteingang (Straßenseite)');
    expect(routeModel.markers).toHaveLength(3);
    expect(routeModel.warningMessage).toBeNull();
  });

  it('uses a direct fallback route when origin metadata is missing', () => {
    const routeModel = buildOriginRouteModel([
      {
        ...makeOriginTouchpoint(),
        departureStop: null,
        facilities: null,
        walkingApproach: null,
      },
    ]);

    expect(routeModel.hasAccessibleRoute).toBe(true);
    expect(routeModel.routePoints.map((point) => point.position)).toEqual([
      LIVE_NAVIGATION_ROUTE_POINTS[0].position,
      LIVE_NAVIGATION_ROUTE_POINTS[LIVE_NAVIGATION_ROUTE_POINTS.length - 1].position,
    ]);
    expect(routeModel.warningMessage).toBeNull();
  });

  it('filters invalid coordinates from walking approach, departure, and facilities', () => {
    const routeModel = buildOriginRouteModel([
      {
        ...makeOriginTouchpoint(),
        departureStop: { latitude: Infinity, longitude: 8.66292 },
        facilities: [
          {
            ...makeOriginTouchpoint().facilities![0],
            geocoordX: 181,
            geocoordY: 50.10736,
            state: 'ACTIVE',
            type: 'ELEVATOR',
          },
          {
            ...makeOriginTouchpoint().facilities![0],
            geocoordX: 8.66312,
            geocoordY: Number.NaN,
            state: 'ACTIVE',
            type: 'ELEVATOR',
          },
          {
            ...makeOriginTouchpoint().facilities![1],
            geocoordX: Number.NEGATIVE_INFINITY,
            geocoordY: 50.10744,
            type: 'ESCALATOR',
          },
        ],
        walkingApproach: {
          ...makeOriginTouchpoint().walkingApproach!,
          latitude: 120,
          longitude: 8.6638,
        },
      },
    ]);

    expect(routeModel.hasAccessibleRoute).toBe(true);
    expect(routeModel.warningMessage).toBeNull();
    expect(routeModel.routePoints).toHaveLength(2);
    expect(routeModel.markers).toHaveLength(2);

    expect(routeModel.routePoints.every((point) => isValidLatLngTuple(point.position))).toBe(true);
    expect(routeModel.markers.every((marker) => isValidLatLngTuple(marker.position))).toBe(true);
  });

  it('uses a route-specific entrance label when walking approach instruction names the entrance', () => {
    const routeModel = buildOriginRouteModel([
      {
        ...makeOriginTouchpoint(),
        walkingApproach: {
          instruction: 'Hier einsteigen: Ella-Trebe-Straße',
          latitude: 52.525589,
          longitude: 13.369548,
        },
      },
    ]);

    expect(routeModel.routePoints[0]?.label).toBe('Ella-Trebe-Straße');
    expect(routeModel.markers[0]?.accessibleLabel).toBe('Ella-Trebe-Straße');
  });
});
