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

  it('uses selected API route heading and map destination label when touchpoints are available', () => {
    getSelectedTrainRouteMock.mockReturnValue(makeSelectedRoute());
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
      screen.getByRole('heading', { level: 2, name: /düsseldorf hbf → köln hbf/i })
    ).toBeInTheDocument();
    expect(liveNavigationMapMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destinationLabel: 'Köln Hbf',
        routePath: [
          [50.10736, 8.66312],
          [50.10754, 8.66301],
          [50.10772, 8.66292],
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
    expect(
      screen.queryByRole('heading', { level: 2, name: /frankfurt → berlin/i })
    ).not.toBeInTheDocument();
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
});
