import type { ReactNode } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from '../TrainSearchResults/types';
import type { RouteMapData } from './types';
import RouteOverview from './RouteOverview';

const getSelectedTrainRouteMock = vi.fn();
const routeMapCanvasMock = vi.fn<(props: { mapData: RouteMapData; zoom: number }) => void>();
const routeOverviewSearchMock = vi.fn();

vi.mock('../../utils/selectedTrainRouteStorage', () => ({
  getSelectedTrainRoute: () => getSelectedTrainRouteMock(),
}));

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
  useNavigate: () => vi.fn(),
  useSearch: () => routeOverviewSearchMock(),
}));

vi.mock('./components/RouteMapCanvas', () => ({
  RouteMapCanvas: (props: { mapData: RouteMapData; zoom: number }) => {
    routeMapCanvasMock(props);
    return <div data-testid="route-map" />;
  },
}));

function makeSelectedRoute(overrides?: Partial<TrainRouteResponse>): TrainRouteResponse {
  return {
    accessibilitySummary: {
      activeElevators: 0,
      activeEscalators: 1,
      inactiveElevators: 1,
      inactiveEscalators: 0,
      mobilityServiceStations: 3,
      status: 'LIMITED',
      stepFreeStations: 2,
      summary: '2/3 stations step-free',
      totalStations: 3,
    },
    arrivalTime: '2026-04-02T10:45:00Z',
    departureTime: '2026-04-02T08:29:00Z',
    destination: 'Braunschweig Hauptbahnhof',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden, 16 Minuten',
    origin: 'Hamburg Hauptbahnhof',
    touchpoints: [
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: true,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'ACCESSIBLE',
          stepFreeAvailable: true,
          summary:
            'Step-free access available · Mobility service available · No listed elevators or escalators',
        },
        arrivalTime: null,
        departureTime: '2026-04-02T08:29:00Z',
        facilities: [],
        kind: 'ORIGIN',
        station: {
          category: 1,
          city: 'Hamburg',
          evaNumber: 8002549,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Hamburg Hbf',
          number: 12345,
        },
        stationName: 'Hamburg Hauptbahnhof',
      },
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 1,
          hasFacilityData: true,
          inactiveElevators: 1,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'LIMITED',
          stepFreeAvailable: false,
          summary:
            'No confirmed step-free access · Mobility service available · Elevators 0 active / 1 inactive · Escalators 1 active / 0 inactive',
        },
        arrivalTime: '2026-04-02T09:48:00Z',
        departureTime: '2026-04-02T10:05:00Z',
        facilities: [
          {
            description: 'Lift to platform 12',
            equipmentnumber: 2002,
            geocoordX: 9.741,
            geocoordY: 52.377,
            operationalResumeDate: null,
            operatorname: 'DB InfraGO',
            state: 'INACTIVE',
            stateExplanation: 'maintenance',
            stationnumber: 23456,
            type: 'ELEVATOR',
          },
          {
            description: 'Escalator to the concourse',
            equipmentnumber: 2003,
            geocoordX: 9.742,
            geocoordY: 52.378,
            operationalResumeDate: null,
            operatorname: 'DB InfraGO',
            state: 'ACTIVE',
            stateExplanation: 'available',
            stationnumber: 23456,
            type: 'ESCALATOR',
          },
        ],
        kind: 'TRANSFER',
        station: {
          category: 1,
          city: 'Hannover',
          evaNumber: 8000152,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'no',
          hasWiFi: true,
          name: 'Hannover Hbf',
          number: 23456,
        },
        stationName: 'Hannover Hauptbahnhof',
      },
      {
        accessibility: {
          activeElevators: 0,
          activeEscalators: 0,
          hasFacilityData: false,
          inactiveElevators: 0,
          inactiveEscalators: 0,
          mobilityServiceAvailable: true,
          status: 'LIMITED',
          stepFreeAvailable: true,
          summary:
            'Step-free access available · Mobility service available · No live facility data',
        },
        arrivalTime: '2026-04-02T10:45:00Z',
        departureTime: null,
        facilities: null,
        kind: 'DESTINATION',
        station: {
          category: 2,
          city: 'Braunschweig',
          evaNumber: 8000049,
          hasMobilityService: 'yes',
          hasSteplessAccess: 'yes',
          hasWiFi: true,
          name: 'Braunschweig Hbf',
          number: 34567,
        },
        stationName: 'Braunschweig Hauptbahnhof',
      },
    ],
    transits: [
      {
        agencyName: 'DB Fernverkehr AG',
        arrival: {
          arrivalTime: '2026-04-02T09:48:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hannover',
            evaNumber: 8000152,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'no',
            hasWiFi: true,
            name: 'Hannover Hbf',
            number: 23456,
          },
          stationName: 'Hannover Hauptbahnhof',
        },
        departure: {
          departureTime: '2026-04-02T08:29:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hamburg',
            evaNumber: 8002549,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
            hasWiFi: true,
            name: 'Hamburg Hbf',
            number: 12345,
          },
          stationName: 'Hamburg Hauptbahnhof',
        },
        trainName: 'ICE 579',
        vehicleType: 'Hochgeschwindigkeitszug',
      },
      {
        agencyName: 'DB Fernverkehr AG',
        arrival: {
          arrivalTime: '2026-04-02T10:45:00Z',
          facilities: [],
          station: {
            category: 2,
            city: 'Braunschweig',
            evaNumber: 8000049,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
            hasWiFi: true,
            name: 'Braunschweig Hbf',
            number: 34567,
          },
          stationName: 'Braunschweig Hauptbahnhof',
        },
        departure: {
          departureTime: '2026-04-02T10:05:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hannover',
            evaNumber: 8000152,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'no',
            hasWiFi: true,
            name: 'Hannover Hbf',
            number: 23456,
          },
          stationName: 'Hannover Hauptbahnhof',
        },
        trainName: 'IC 2038',
        vehicleType: 'Intercity',
      },
    ],
    ...overrides,
  };
}

describe('RouteOverview', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getSelectedTrainRouteMock.mockReset();
    getSelectedTrainRouteMock.mockReturnValue(makeSelectedRoute());
    routeMapCanvasMock.mockReset();
    routeOverviewSearchMock.mockReset();
    routeOverviewSearchMock.mockReturnValue({
      accessibilityPreference: 'step-free',
      date: '2026-04-02',
      destinationEva: '8000049',
      destinationName: 'Braunschweig Hauptbahnhof',
      originEva: '8002549',
      originName: 'Hamburg Hauptbahnhof',
      time: '08:29',
    });
    window.localStorage.clear();
  });

  it('renders the selected trip details instead of the static route overview mocks', () => {
    render(<RouteOverview />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /hamburg hauptbahnhof nach braunschweig hauptbahnhof/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /detaillierter reiseverlauf/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/pünktlich/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zurück zu den suchergebnissen/i })).toHaveAttribute(
      'href',
      '/train-search-results'
    );
    expect(screen.getByRole('link', { name: /alternativen anzeigen/i })).toHaveAttribute(
      'href',
      '/train-search-results'
    );

    const timeline = screen.getByRole('list', { name: /reiseverlauf/i });

    expect(within(timeline).getByText('Hamburg Hauptbahnhof')).toBeInTheDocument();
    expect(within(timeline).getByText('Hannover Hauptbahnhof')).toBeInTheDocument();
    expect(within(timeline).getByText('Braunschweig Hauptbahnhof')).toBeInTheDocument();
    expect(within(timeline).queryByText('Frankfurt (Main) Hbf')).not.toBeInTheDocument();
    expect(within(timeline).queryByText('Berlin Hbf')).not.toBeInTheDocument();
  });

  it('builds the station services panel from the selected trip accessibility payload', () => {
    render(<RouteOverview />);

    const servicesSection = screen.getByRole('region', { name: /bahnhofsservice/i });
    const stationAccessibilityCard = within(servicesSection)
      .getByRole('heading', { level: 3, name: /bahnhofsbarrierefreiheit/i })
      .closest('article');

    expect(stationAccessibilityCard).not.toBeNull();

    if (!stationAccessibilityCard) {
      throw new Error('Station accessibility card was not rendered.');
    }

    expect(within(servicesSection).getByText('Hannover Hauptbahnhof')).toBeInTheDocument();
    expect(
      within(servicesSection).getByText(
        /kein bestätigter stufenfreier zugang .* mobilitätsservice verfügbar/i
      )
    ).toBeInTheDocument();
    expect(within(stationAccessibilityCard).getByText(/2 anlagen/i)).toBeInTheDocument();
    expect(
      within(stationAccessibilityCard).getByText(/1 in betrieb/i, { selector: 'dd' })
    ).toBeInTheDocument();
    expect(
      within(stationAccessibilityCard).getByText(/1 außer betrieb/i, { selector: 'dd' })
    ).toBeInTheDocument();
    expect(within(servicesSection).getByText('Aufzüge')).toBeInTheDocument();
    expect(within(servicesSection).getByText('Rolltreppen')).toBeInTheDocument();
    expect(within(servicesSection).queryByText('Tactile Guidance')).not.toBeInTheDocument();
    expect(within(servicesSection).queryByText('Accessible Toilets')).not.toBeInTheDocument();
  });

  it('renders the route map card entirely in german', () => {
    render(<RouteOverview />);

    const facilitiesList = screen.getByRole('list', { name: /vorgemerkte anlagen/i });

    expect(screen.getByRole('heading', { level: 2, name: /live-karte/i })).toBeInTheDocument();
    expect(screen.queryByText(/backend-koordinaten/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ohne die ui-schicht zu ändern/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /mit maus oder einem finger ziehen\. zum zoomen mausrad oder pinch-geste nutzen\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /routenvorschau vergrößern/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /routenvorschau verkleinern/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /live-navigation/i })).toBeInTheDocument();
    expect(within(facilitiesList).getByText('Lift to platform 12')).toBeInTheDocument();
    expect(within(facilitiesList).queryByText('Escalator to the concourse')).not.toBeInTheDocument();
    expect(within(facilitiesList).getByText(/außer betrieb/i)).toBeInTheDocument();
    expect(within(facilitiesList).queryByText(/in betrieb/i)).not.toBeInTheDocument();
  });

  it('passes backend facility geocoordinates into the route map data', () => {
    render(<RouteOverview />);

    expect(routeMapCanvasMock).toHaveBeenCalled();

    const [{ mapData }] = routeMapCanvasMock.mock.calls.at(-1) ?? [];

    expect(mapData.routePath).toEqual([
      [52.377, 9.741],
      [52.378, 9.742],
    ]);
    expect(mapData.center).toEqual([52.3775, 9.7415]);
    expect(mapData.markers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'facility-2002',
          position: [52.377, 9.741],
        }),
        expect.objectContaining({
          id: 'facility-2003',
          position: [52.378, 9.742],
        }),
      ])
    );
  });

  it('saves the currently selected trip instead of the static Frankfurt to Berlin mock', async () => {
    render(<RouteOverview />);

    await userEvent.click(screen.getByRole('button', { name: /route speichern/i }));

    const savedTrips = JSON.parse(window.localStorage.getItem('bf-navigator-saved-trips') ?? '[]');

    expect(savedTrips[0]).toMatchObject({
      destination: 'Braunschweig Hauptbahnhof',
      origin: 'Hamburg Hauptbahnhof',
    });
    expect(savedTrips[0]).not.toMatchObject({
      destination: 'Berlin',
      origin: 'Frankfurt (Main) Hbf',
    });
  });

  it('falls back to the static route overview when no selected trip is available', () => {
    getSelectedTrainRouteMock.mockReturnValueOnce(null);

    render(<RouteOverview />);

    const timeline = screen.getByRole('list', { name: /reiseverlauf/i });

    expect(within(timeline).getByText('Frankfurt (Main) Hbf')).toBeInTheDocument();
    expect(within(timeline).getByText('Berlin Hbf')).toBeInTheDocument();
  });
});
