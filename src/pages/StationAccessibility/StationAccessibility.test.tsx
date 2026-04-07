import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from '../TrainSearchResults/types';
import StationAccessibility from './StationAccessibility';

const getSelectedTrainRouteMock = vi.fn();

vi.mock('../../utils/selectedTrainRouteStorage', () => ({
  getSelectedTrainRoute: () => getSelectedTrainRouteMock(),
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
    arrivalTime: '2026-04-02T10:45:00Z',
    departureTime: '2026-04-02T08:29:00Z',
    destination: 'Braunschweig Hbf',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden, 20 Minuten',
    origin: 'Hamburg Hbf',
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
          summary: 'One elevator unavailable',
        },
        arrivalTime: '2026-04-02T09:48:00Z',
        departureTime: '2026-04-02T10:02:00Z',
        facilities: [],
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
        stationName: 'Braunschweig Hauptbahnhof',
      },
    ],
    transits: [
      {
        agencyName: 'DB Fernverkehr AG',
        arrival: {
          arrivalTime: '2026-04-02T10:45:00Z',
          facilities: [],
          station: {
            category: 1,
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
    ],
    ...overrides,
  };
}

describe('StationAccessibility', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getSelectedTrainRouteMock.mockReset();
    getSelectedTrainRouteMock.mockReturnValue(makeSelectedRoute());
  });

  it('shows a loading announcement before selected trip accessibility is resolved', () => {
    render(<StationAccessibility />);

    expect(screen.getByRole('status')).toHaveTextContent(/barrierefreiheitsdaten werden geladen/i);
  });

  it('renders station accessibility breakdown for the selected trip touchpoints', async () => {
    render(<StationAccessibility />);

    expect(
      await screen.findByRole('heading', { level: 1, name: /station accessibility/i })
    ).toBeInTheDocument();

    const touchpointList = screen.getByRole('list', { name: /bahnhofsübersicht/i });
    expect(touchpointList.children).toHaveLength(3);

    const originCard = screen.getByRole('article', { name: /hamburg hauptbahnhof/i });
    expect(within(originCard).getByText('Start')).toBeInTheDocument();
    expect(within(originCard).getByText(/stufenfrei verfügbar/i)).toBeInTheDocument();
    expect(within(originCard).getByText(/mobilitätsservice verfügbar/i)).toBeInTheDocument();
    expect(within(originCard).getByText(/aufzüge: 1 aktiv/i)).toBeInTheDocument();
  });

  it('renders a main landmark with a labeled station overview and named station articles', async () => {
    render(<StationAccessibility />);

    const main = await screen.findByRole('main');
    const touchpointList = await within(main).findByRole('list', { name: /bahnhofsübersicht/i });
    const touchpointCards = within(touchpointList).getAllByRole('article');

    expect(touchpointCards).toHaveLength(3);
    expect(
      within(touchpointCards[0]).getByRole('heading', {
        level: 2,
        name: /hamburg hauptbahnhof/i,
      })
    ).toBeInTheDocument();
    expect(
      within(touchpointCards[1]).getByRole('heading', {
        level: 2,
        name: /hannover hauptbahnhof/i,
      })
    ).toBeInTheDocument();
    expect(
      within(touchpointCards[2]).getByRole('heading', {
        level: 2,
        name: /braunschweig hauptbahnhof/i,
      })
    ).toBeInTheDocument();
  });

  it('shows an empty state when no selected trip is available', async () => {
    getSelectedTrainRouteMock.mockReturnValueOnce(null);

    render(<StationAccessibility />);

    const emptyState = screen.getByRole('status');
    await waitFor(() => {
      expect(emptyState).toHaveTextContent(/keine ausgewählte reise verfügbar/i);
    });
  });

  it('shows an empty state when the selected trip does not include touchpoints', async () => {
    getSelectedTrainRouteMock.mockReturnValueOnce(
      makeSelectedRoute({
        touchpoints: [],
      })
    );

    render(<StationAccessibility />);

    const emptyState = screen.getByRole('status');
    await waitFor(() => {
      expect(emptyState).toHaveTextContent(/keine bahnhofsdetails für diese verbindung verfügbar/i);
    });
  });

  it('keeps loading and empty announcements polite while reserving alerts for hard failures', async () => {
    const { unmount } = render(<StationAccessibility />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    unmount();
    getSelectedTrainRouteMock.mockReturnValueOnce(null);
    const emptyRender = render(<StationAccessibility />);

    const emptyState = await screen.findByRole('status');
    expect(emptyState).toHaveAttribute('aria-live', 'polite');

    emptyRender.unmount();
    getSelectedTrainRouteMock.mockImplementationOnce(() => {
      throw new Error('Storage is unavailable');
    });
    render(<StationAccessibility />);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).not.toHaveAttribute('aria-live');
  });

  it('renders partial-data messaging when a station has incomplete accessibility data', async () => {
    render(<StationAccessibility />);

    const destinationCard = await screen.findByRole('article', {
      name: /braunschweig hauptbahnhof/i,
    });

    expect(within(destinationCard).getByText('Ziel')).toBeInTheDocument();
    expect(within(destinationCard).getByText(/teildaten verfügbar/i)).toBeInTheDocument();
    expect(
      within(destinationCard).getByText(/aufzüge: live-anlagenstatus nicht verfügbar/i)
    ).toBeInTheDocument();
    expect(
      within(destinationCard).getByText(/rolltreppen: live-anlagenstatus nicht verfügbar/i)
    ).toBeInTheDocument();
    expect(
      within(destinationCard).getByText(/station accessibility data unavailable/i)
    ).toBeInTheDocument();
  });

  it('shows an error state when selected trip accessibility cannot be loaded', async () => {
    getSelectedTrainRouteMock.mockImplementationOnce(() => {
      throw new Error('Storage is unavailable');
    });

    render(<StationAccessibility />);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/barrierefreiheitsdaten konnten nicht geladen werden/i);
  });
});
