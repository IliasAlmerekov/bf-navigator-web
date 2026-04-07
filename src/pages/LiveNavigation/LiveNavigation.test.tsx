import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from '../TrainSearchResults/types';
import LiveNavigation from './LiveNavigation';
import * as liveNavigationUtils from './liveNavigationUtils';

const liveNavigationMapMock = vi.fn();
const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();
const getSelectedTrainRouteMock = vi.fn();

type WatchSuccess = Parameters<typeof navigator.geolocation.watchPosition>[0];
type WatchError = Parameters<typeof navigator.geolocation.watchPosition>[1];

let watchSuccessCallback: WatchSuccess | undefined;
let watchErrorCallback: WatchError | undefined;

function makeFacility(
  equipmentnumber: number,
  geocoordX: number,
  geocoordY: number
): NonNullable<TrainRouteResponse['touchpoints']>[number]['facilities'][number] {
  return {
    description: `Facility ${equipmentnumber}`,
    equipmentnumber,
    geocoordX,
    geocoordY,
    operationalResumeDate: null,
    operatorname: 'DB InfraGO',
    state: 'ACTIVE',
    stateExplanation: 'available',
    stationnumber: 8000001,
    type: 'ELEVATOR',
  };
}

function makeTransit(trainName: string): TrainRouteResponse['transits'][number] {
  const transitStop = {
    facilities: [makeFacility(2001, 8.66312, 50.10736)],
    station: {
      category: 1,
      city: 'Düsseldorf',
      evaNumber: 8000085,
      hasMobilityService: 'yes',
      hasSteplessAccess: 'yes',
      hasWiFi: true,
      name: 'Düsseldorf Hbf',
      number: 8000085,
    },
    stationName: 'Düsseldorf Hbf',
  };

  return {
    agencyName: 'DB',
    arrival: transitStop,
    departure: transitStop,
    trainName,
    vehicleType: 'TRAIN',
  };
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode;
    className?: string;
    to: string;
    'aria-label'?: string;
  }) => (
    <a className={className} href={to} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

vi.mock('../../utils/selectedTrainRouteStorage', () => ({
  getSelectedTrainRoute: () => getSelectedTrainRouteMock(),
}));

vi.mock('./components/LiveNavigationMap', () => ({
  LiveNavigationMap: (props: unknown) => {
    liveNavigationMapMock(props);
    return (
      <div data-testid="live-navigation-map">
        <button aria-label="Karte vergrößern" type="button">
          +
        </button>
        <button aria-label="Karte verkleinern" type="button">
          -
        </button>
      </div>
    );
  },
}));

// Type sentinel — verifies new fields exist on TrainRouteTouchpoint

type _AssertWalkingApproach =
  NonNullable<NonNullable<TrainRouteResponse['touchpoints']>[number]['walkingApproach']> extends {
    latitude: number;
    longitude: number;
    instruction: string;
  }
    ? true
    : never;
type _AssertDepartureStop =
  NonNullable<NonNullable<TrainRouteResponse['touchpoints']>[number]['departureStop']> extends {
    latitude: number;
    longitude: number;
  }
    ? true
    : never;

// Reference sentinels in a no-op to satisfy unused-type checks without runtime cost
const _useTouchpointTypeSentinels = () => {
  // Use type-only assertions to reference the sentinel types
  void (null as unknown as _AssertWalkingApproach);
  void (null as unknown as _AssertDepartureStop);
};

_useTouchpointTypeSentinels();

function makeSelectedRoute(overrides?: Partial<TrainRouteResponse>): TrainRouteResponse {
  return {
    accessibilitySummary: {
      activeElevators: 1,
      activeEscalators: 1,
      inactiveElevators: 0,
      inactiveEscalators: 0,
      mobilityServiceStations: 2,
      status: 'ACCESSIBLE',
      stepFreeStations: 2,
      summary: '2/2 stations step-free',
      totalStations: 2,
    },
    arrivalTime: '2026-04-02T11:45:00Z',
    departureTime: '2026-04-02T09:10:00Z',
    destination: 'Köln Hbf',
    localizedDistanceText: '190 km',
    localizedDurationText: '2 Stunden, 35 Minuten',
    origin: 'Düsseldorf Hbf',
    touchpoints: [
      {
        accessibility: {
          activeElevators: 1,
          activeEscalators: 1,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary: 'Step-free access available',
        },
        arrivalTime: null,
        departureTime: '2026-04-02T09:10:00Z',
        facilities: [makeFacility(1001, 8.66312, 50.10736)],
        kind: 'ORIGIN',
        station: null,
        stationName: 'Düsseldorf Hbf',
      },
      {
        accessibility: {
          activeElevators: 1,
          activeEscalators: 1,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary: 'Step-free access available',
        },
        arrivalTime: '2026-04-02T10:33:00Z',
        departureTime: '2026-04-02T10:36:00Z',
        facilities: [makeFacility(1002, 8.66301, 50.10754)],
        kind: 'TRANSFER',
        station: null,
        stationName: 'Essen Hbf',
      },
      {
        accessibility: {
          activeElevators: 1,
          activeEscalators: 1,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary: 'Step-free access available',
        },
        arrivalTime: '2026-04-02T11:45:00Z',
        departureTime: null,
        facilities: [makeFacility(1003, 8.66292, 50.10772)],
        kind: 'DESTINATION',
        station: null,
        stationName: 'Köln Hbf',
      },
    ],
    transits: [],
    ...overrides,
  };
}

describe('LiveNavigation', () => {
  afterEach(() => {
    cleanup();
    liveNavigationMapMock.mockReset();
    watchPositionMock.mockReset();
    clearWatchMock.mockReset();
    getSelectedTrainRouteMock.mockReset();
    watchSuccessCallback = undefined;
    watchErrorCallback = undefined;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    getSelectedTrainRouteMock.mockReturnValue(null);

    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        clearWatch: clearWatchMock,
        getCurrentPosition: vi.fn(),
        watchPosition: watchPositionMock.mockImplementation(
          (success: WatchSuccess, error: WatchError) => {
            watchSuccessCallback = success;
            watchErrorCallback = error;

            return 17;
          }
        ),
      },
    });
  });

  it('requests browser geolocation on mount and announces the pending status politely', () => {
    render(<LiveNavigation />);

    expect(watchPositionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(/standort wird ermittelt/i);
  });

  it('renders text-first live guidance after the browser reports a position', () => {
    render(<LiveNavigation />);

    watchSuccessCallback?.({
      coords: {
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 50.10736,
        longitude: 8.66312,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);

    expect(
      screen.getByRole('button', {
        name: /hilfe und barrierefreiheitsinformationen öffnen/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /aufzug e4/i })).toBeInTheDocument();
    expect(screen.getByText(/gleis 1 · ca\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alternativweg: südrampe/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /frankfurt → berlin/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hilfe anfordern/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /navigation beenden/i })).toBeInTheDocument();
    expect(liveNavigationMapMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destinationLabel: 'Gleis 1',
      })
    );
  });

  it('uses selected API route heading, map destination label, and train names when touchpoints are available', () => {
    getSelectedTrainRouteMock.mockReturnValue(
      makeSelectedRoute({
        transits: [makeTransit('ICE 105'), makeTransit('RE 1')],
      })
    );
    render(<LiveNavigation />);

    watchSuccessCallback?.({
      coords: {
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 50.10736,
        longitude: 8.66312,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);

    const selectedRouteHeading = screen.getByRole('heading', { level: 2, name: /köln hbf/i });
    expect(selectedRouteHeading).toHaveTextContent(/düsseldorf hbf/i);
    expect(liveNavigationMapMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destinationLabel: 'Köln Hbf',
        routePath: [
          [50.10736, 8.66312], // ORIGIN: elevator waypoint
          [50.10736, 8.66312], // ORIGIN: station orientation point
          [50.10754, 8.66301], // TRANSFER: elevator waypoint
          [50.10754, 8.66301], // TRANSFER: station orientation point
          [50.10772, 8.66292], // DESTINATION: elevator waypoint
          [50.10772, 8.66292], // DESTINATION: station orientation point
        ],
      })
    );
    expect(screen.getByText(/düsseldorf hbf · weg zu köln hbf/i)).toBeInTheDocument();
    expect(screen.getByText('Düsseldorf Hbf')).toBeInTheDocument();
    expect(screen.getByText('Essen Hbf')).toBeInTheDocument();
    expect(screen.getByText('Köln Hbf')).toBeInTheDocument();
    expect(screen.queryByText('Frankfurt (Main) Hbf')).not.toBeInTheDocument();
    expect(screen.queryByText('Kassel-Wilhelmshöhe')).not.toBeInTheDocument();
    expect(screen.queryByText('Berlin Hbf')).not.toBeInTheDocument();
    expect(screen.getAllByText(/ice 105.*re 1/i)).toHaveLength(2);
    expect(
      screen.queryByRole('heading', { level: 2, name: /frankfurt → berlin/i })
    ).not.toBeInTheDocument();
  });

  it('shows both manual start options for selected routes when location permission is denied', () => {
    getSelectedTrainRouteMock.mockReturnValue(
      makeSelectedRoute({
        touchpoints: [
          {
            accessibility: {
              activeElevators: 1,
              activeEscalators: 1,
              hasFacilityData: true,
              inactiveElevators: 0,
              inactiveEscalators: 0,
              mobilityServiceAvailable: true,
              status: 'ACCESSIBLE',
              stepFreeAvailable: true,
              summary: 'Step-free access available',
            },
            arrivalTime: null,
            departureTime: '2026-04-02T09:10:00Z',
            facilities: [makeFacility(1001, 8.66312, 50.10736)],
            kind: 'ORIGIN',
            station: null,
            stationName: 'Düsseldorf Hbf',
          },
          {
            accessibility: {
              activeElevators: 1,
              activeEscalators: 1,
              hasFacilityData: true,
              inactiveElevators: 0,
              inactiveEscalators: 0,
              mobilityServiceAvailable: true,
              status: 'ACCESSIBLE',
              stepFreeAvailable: true,
              summary: 'Step-free access available',
            },
            arrivalTime: '2026-04-02T11:45:00Z',
            departureTime: null,
            facilities: [makeFacility(2001, 8.66301, 50.10754)],
            kind: 'DESTINATION',
            station: null,
            stationName: 'Köln Hbf',
          },
        ],
      })
    );
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(
      screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /haupteingang/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /info-station/i })).toBeInTheDocument();
  });

  it('shows manual fallback controls when geolocation permission is denied', async () => {
    const user = userEvent.setup();
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(screen.getByRole('status')).toHaveTextContent(/standortfreigabe wurde abgelehnt/i);
    expect(
      screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alternativweg: südrampe/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /frankfurt → berlin/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /info point/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/manueller startpunkt aktiv/i);
    expect(screen.getByRole('radio', { name: /info point/i })).toBeChecked();
    expect(
      screen.getByRole('heading', { level: 1, name: /biegen sie links ab/i })
    ).toBeInTheDocument();
  });

  it.each([2, 3])(
    'falls back to manual guidance after tracking error code %s and ignores stale live position',
    async (errorCode) => {
      const user = userEvent.setup();
      render(<LiveNavigation />);

      watchSuccessCallback?.({
        coords: {
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 50.10736,
          longitude: 8.66312,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);

      watchErrorCallback?.({
        code: errorCode,
        message: 'Live tracking failed',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);

      expect(screen.getByRole('status')).toHaveTextContent(
        /live-standort konnte nicht aktualisiert werden/i
      );
      expect(
        screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: /gehen sie geradeaus/i })
      ).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /info point/i }));

      expect(screen.getByRole('status')).toHaveTextContent(/manueller startpunkt aktiv/i);
      expect(screen.getByText(/startpunkt: info point/i)).toBeInTheDocument();
      expect(screen.getByText(/biegen sie links ab/i)).toBeInTheDocument();
    }
  );

  it('shows a plain-language fallback when no route data can be derived', () => {
    vi.spyOn(liveNavigationUtils, 'getRoutePointsFromManualStart').mockReturnValue([]);
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(
      screen.getByRole('heading', { level: 1, name: /keine navigationsschritte verfügbar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/die karte kann ohne verfügbare routendaten nicht angezeigt werden/i)
    ).toBeInTheDocument();
  });

  it('keeps keyboard tab order from back link to manual fallback radios and map zoom controls', async () => {
    const user = userEvent.setup();
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    await user.tab();
    expect(screen.getByRole('link', { name: /zurück zur routenübersicht/i })).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole('button', {
        name: /hilfe und barrierefreiheitsinformationen öffnen/i,
      })
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /karte vergrößern/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /karte verkleinern/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /alternativweg: südrampe/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('radio', { name: /haupteingang/i })).toHaveFocus();
  });

  it('supports keyboard-only manual start selection and updates route copy', async () => {
    const user = userEvent.setup();
    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('radio', { name: /aufzug e4/i })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent(/manueller startpunkt aktiv/i);
    expect(screen.getByText(/startpunkt: aufzug e4/i)).toBeInTheDocument();
  });

  it('falls back immediately when browser geolocation is unavailable', () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    render(<LiveNavigation />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /geolokalisierung ist in diesem browser nicht verfügbar/i
    );
    expect(
      screen.getByRole('radiogroup', { name: /manuellen startpunkt wählen/i })
    ).toBeInTheDocument();
  });

  it('clears the geolocation watcher on unmount', () => {
    const view = render(<LiveNavigation />);

    view.unmount();

    expect(clearWatchMock).toHaveBeenCalledWith(17);
  });

  it('uses departureStop coordinates for map position when available', () => {
    getSelectedTrainRouteMock.mockReturnValue({
      origin: 'Hamburg Hbf',
      destination: 'Braunschweig Hbf',
      departureTime: '2026-04-02T08:29:00Z',
      arrivalTime: '2026-04-02T10:45:00Z',
      localizedDistanceText: '240 km',
      localizedDurationText: '2 Stunden',
      accessibilitySummary: {
        activeElevators: 1,
        activeEscalators: 0,
        inactiveElevators: 0,
        inactiveEscalators: 0,
        mobilityServiceStations: 1,
        status: 'ACCESSIBLE',
        stepFreeStations: 1,
        summary: '1/2 stations step-free',
        totalStations: 2,
      },
      transits: [makeTransit('ICE 579')],
      touchpoints: [
        {
          accessibility: {
            activeElevators: 1,
            activeEscalators: 0,
            hasFacilityData: true,
            inactiveElevators: 0,
            inactiveEscalators: 0,
            mobilityServiceAvailable: true,
            status: 'ACCESSIBLE',
            stepFreeAvailable: true,
            summary: 'Step-free access available',
          },
          arrivalTime: null,
          departureTime: '2026-04-02T08:29:00Z',
          facilities: [
            {
              description: 'Facility 1001',
              equipmentnumber: 1001,
              geocoordX: 10.0065,
              geocoordY: 53.5532,
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
          stationName: 'Hamburg Hbf',
          departureStop: { latitude: 53.553637, longitude: 10.006677 },
          arrivalStop: null,
          walkingApproach: {
            latitude: 53.5534,
            longitude: 10.0063,
            instruction: 'Hier einsteigen: E',
          },
        },
        {
          accessibility: {
            activeElevators: 0,
            activeEscalators: 0,
            hasFacilityData: false,
            inactiveElevators: 0,
            inactiveEscalators: 0,
            mobilityServiceAvailable: false,
            status: 'UNKNOWN',
            stepFreeAvailable: false,
            summary: 'Station accessibility data unavailable',
          },
          arrivalTime: '2026-04-02T10:45:00Z',
          departureTime: null,
          facilities: null,
          kind: 'DESTINATION',
          station: null,
          stationName: 'Braunschweig Hbf',
          departureStop: null,
          arrivalStop: { latitude: 52.2524, longitude: 10.5316 },
          walkingApproach: null,
        },
      ],
    } satisfies TrainRouteResponse);

    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    const routePath = (
      liveNavigationMapMock.mock.calls.at(-1)?.[0] as { routePath: [number, number][] } | undefined
    )?.routePath;

    // Route must include departureStop coordinates [53.553637, 10.006677], not facility [53.553200, 10.006500]
    const hasDepStopCoord = routePath?.some(
      ([lat, lng]) => Math.abs(lat - 53.553637) < 0.0001 && Math.abs(lng - 10.006677) < 0.0001
    );
    expect(hasDepStopCoord).toBe(true);

    const hasFacilityCoord = routePath?.some(
      ([lat, lng]) => Math.abs(lat - 53.5532) < 0.0001 && Math.abs(lng - 10.0065) < 0.0001
    );
    // Facility coordinate should NOT be the primary stop position
    expect(hasFacilityCoord).toBe(false);
  });

  it('shows inactive elevator warning when origin touchpoint has inactive elevators', () => {
    getSelectedTrainRouteMock.mockReturnValue({
      origin: 'Hamburg Hbf',
      destination: 'Braunschweig Hbf',
      departureTime: '2026-04-02T08:29:00Z',
      arrivalTime: '2026-04-02T10:45:00Z',
      localizedDistanceText: '240 km',
      localizedDurationText: '2 Stunden',
      accessibilitySummary: {
        activeElevators: 0,
        activeEscalators: 0,
        inactiveElevators: 1,
        inactiveEscalators: 0,
        mobilityServiceStations: 0,
        status: 'LIMITED',
        stepFreeStations: 0,
        summary: '0/2 stations step-free',
        totalStations: 2,
      },
      transits: [makeTransit('ICE 579')],
      touchpoints: [
        {
          accessibility: {
            activeElevators: 0,
            activeEscalators: 0,
            hasFacilityData: true,
            inactiveElevators: 1,
            inactiveEscalators: 0,
            mobilityServiceAvailable: false,
            status: 'LIMITED',
            stepFreeAvailable: false,
            summary: 'Elevators 0 active / 1 inactive',
          },
          arrivalTime: null,
          departureTime: '2026-04-02T08:29:00Z',
          facilities: [
            {
              description: 'Lift to platform 7',
              equipmentnumber: 1001,
              geocoordX: 10.0065,
              geocoordY: 53.5532,
              operationalResumeDate: '2026-04-15',
              operatorname: 'DB InfraGO',
              state: 'INACTIVE',
              stateExplanation: 'Maintenance',
              stationnumber: 12345,
              type: 'ELEVATOR',
            },
          ],
          kind: 'ORIGIN',
          station: null,
          stationName: 'Hamburg Hbf',
          departureStop: { latitude: 53.553637, longitude: 10.006677 },
          arrivalStop: null,
          walkingApproach: null,
        },
        {
          accessibility: {
            activeElevators: 0,
            activeEscalators: 0,
            hasFacilityData: false,
            inactiveElevators: 0,
            inactiveEscalators: 0,
            mobilityServiceAvailable: false,
            status: 'UNKNOWN',
            stepFreeAvailable: false,
            summary: 'Station accessibility data unavailable',
          },
          arrivalTime: '2026-04-02T10:45:00Z',
          departureTime: null,
          facilities: null,
          kind: 'DESTINATION',
          station: null,
          stationName: 'Braunschweig Hbf',
          departureStop: null,
          arrivalStop: { latitude: 52.2524, longitude: 10.5316 },
          walkingApproach: null,
        },
      ],
    } satisfies TrainRouteResponse);

    render(<LiveNavigation />);

    watchErrorCallback?.({
      code: 1,
      message: 'Permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/aufzug.*nicht verfügbar/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/2026-04-15/);
  });
});
