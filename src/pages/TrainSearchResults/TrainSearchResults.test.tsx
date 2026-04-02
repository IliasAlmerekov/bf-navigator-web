import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse } from './types';
import TrainSearchResults from './TrainSearchResults';

function createExpectedLocalIsoDateTime(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const value = new Date(year, month - 1, day, hours, minutes);
  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
  const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, '0');

  return `${date}T${time}:00${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

const mockNavigate = vi.fn();
const mockSearch = vi.fn();
const searchTrainRouteMock = vi.fn();
const searchTrainRouteMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch(),
}));

vi.mock('../../services/trainRoutesApi', () => ({
  searchTrainRoute: (...args: unknown[]) => searchTrainRouteMock(...args),
}));
vi.mock('../../services/trainRoutesApi', () => ({
  searchTrainRoute: (...args: unknown[]) => searchTrainRouteMock(...args),
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

function makeRoute(overrides?: Partial<TrainRouteResponse>): TrainRouteResponse {
  return {
    arrivalTime: '2026-04-02T10:45:00Z',
    departureTime: '2026-04-02T08:29:00Z',
    destination: 'Dresden Hbf',
    localizedDistanceText: '240 km',
    localizedDurationText: '2 Stunden, 20 Minuten',
    origin: 'Köln Hbf',
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
            hasSteplessAccess: 'yes',
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
    ],
    ...overrides,
  };
}

function makeRouteWithTransfer(): TrainRouteResponse {
  return makeRoute({
    arrivalTime: '2026-04-02T12:10:00Z',
    localizedDurationText: '3 Stunden, 41 Minuten',
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
            hasSteplessAccess: 'yes',
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
          arrivalTime: '2026-04-02T12:10:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Dresden',
            evaNumber: 8010096,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
            hasWiFi: true,
            name: 'Dresden Hbf',
            number: 34567,
          },
          stationName: 'Dresden Hauptbahnhof',
        },
        departure: {
          departureTime: '2026-04-02T10:22:00Z',
          facilities: [],
          station: {
            category: 1,
            city: 'Hannover',
            evaNumber: 8000152,
            hasMobilityService: 'yes',
            hasSteplessAccess: 'yes',
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
  });
}

describe('TrainSearchResults', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    searchTrainRouteMock.mockReset();
    searchTrainRouteMock.mockResolvedValue(makeRoute());
    searchTrainRouteMock.mockReset();
    searchTrainRouteMock.mockResolvedValue(makeRoute());
    mockNavigate.mockReset();
    mockSearch.mockReset();
    mockSearch.mockReturnValue({
      date: '2026-04-02',
      destinationEva: '8010096',
      destinationName: 'Dresden Hbf',
      originEva: '8000207',
      originName: 'Köln Hbf',
      time: '13:45',
    });
  });

  it('requests a train route search with station names and an ISO departure datetime', async () => {
  it('requests a train route search with station names and an ISO departure datetime', async () => {
    render(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    });

    const [request, signal] = searchTrainRouteMock.mock.calls[0];
    const [request, signal] = searchTrainRouteMock.mock.calls[0];

    expect(request).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-02', '13:45'),
      destination: 'Dresden Hbf',
      origin: 'Köln Hbf',
    });
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(request).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-02', '13:45'),
      destination: 'Dresden Hbf',
      origin: 'Köln Hbf',
    });
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(screen.getByRole('region', { name: /suchanfrage zusammenfassung/i })).toHaveTextContent(
      'Köln Hbf'
    );
    expect(screen.getByRole('region', { name: /suchanfrage zusammenfassung/i })).toHaveTextContent(
      'Dresden Hbf'
    );
    expect(screen.getByRole('region', { name: /suchanfrage zusammenfassung/i })).toHaveTextContent(
      '2026-04-02'
    );
    expect(screen.getByRole('region', { name: /suchanfrage zusammenfassung/i })).toHaveTextContent(
      '13:45'
    );
  });

  it('does not show passenger count in the summary bar', async () => {
    render(<TrainSearchResults />);

    await waitFor(() => expect(searchTrainRouteMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(searchTrainRouteMock).toHaveBeenCalledTimes(1));

    const summary = screen.getByRole('region', { name: /suchanfrage zusammenfassung/i });
    expect(summary).not.toHaveTextContent(/reisende/i);
  });

  it('shows a loading announcement while route data is being fetched', () => {
    const deferredResponse = createDeferred<TrainRouteResponse>();
    searchTrainRouteMock.mockReturnValueOnce(deferredResponse.promise);
    const deferredResponse = createDeferred<TrainRouteResponse>();
    searchTrainRouteMock.mockReturnValueOnce(deferredResponse.promise);

    render(<TrainSearchResults />);

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveTextContent(/verbindungen werden geladen/i);
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
  });

  it('shows an error state when the route request fails', async () => {
    searchTrainRouteMock.mockRejectedValueOnce(new Error('Network error'));
    searchTrainRouteMock.mockRejectedValueOnce(new Error('Network error'));

    render(<TrainSearchResults />);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/verbindungen konnten nicht geladen werden/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an empty state when the service returns no transit segments', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute({ transits: [] }));
  it('shows an empty state when the service returns no transit segments', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute({ transits: [] }));

    render(<TrainSearchResults />);

    const emptyState = await screen.findByRole('status');
    expect(emptyState).toHaveTextContent(/keine verbindungen/i);
    expect(screen.queryAllByRole('button', { name: /route auswählen/i })).toHaveLength(0);
  });

  it('renders the route card returned by the service', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute());

    render(<TrainSearchResults />);

    expect(
      screen.getByText(
        formatExpectedTransitTime(route.transits[route.transits.length - 1].arrival.arrivalTime)
      )
    ).toBeInTheDocument();
    expect(screen.getByText('3 Stunden, 41 Minuten')).toBeInTheDocument();
    expect(screen.getByText('1 Umstieg')).toBeInTheDocument();
    expect(screen.getByLabelText(/ICE 579 Hochgeschwindigkeitszug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IC 2038 Intercity/i)).toBeInTheDocument();
  });

  it('keeps loaded results accessible for screen readers and keyboard users', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute());
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute());

    render(<TrainSearchResults />);

    expect(
      await screen.findByRole('heading', {
        name: /suchergebnisse: zugverbindungen von köln hbf nach dresden hbf/i,
      })
    ).toBeInTheDocument();

    const resultsRegion = screen.getByRole('region', {
      name: /suchergebnisse: zugverbindungen von köln hbf nach dresden hbf/i,
    });

    expect(
      await within(resultsRegion).findByRole('button', { name: /verbindung auswählen/i })
    ).toBeEnabled();
    expect(within(resultsRegion).getByRole('list')).toBeInTheDocument();
  });

  it('hides pagination when the backend returns a single route', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute());

    render(<TrainSearchResults />);

    await screen.findByRole('button', { name: /verbindung auswählen/i });

    expect(screen.queryByRole('navigation', { name: /seiten navigation/i })).not.toBeInTheDocument();
  });

  it('hides filter tabs while the backend exposes only a single route result', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeRoute());

    render(<TrainSearchResults />);

    await screen.findByRole('button', { name: /verbindung auswählen/i });

    expect(
      screen.queryByRole('navigation', { name: /verbindungsfilter/i })
    ).not.toBeInTheDocument();
  });

  it('restarts the search when the destination changes and aborts the previous request', async () => {
    const firstRequest = createDeferred<TrainRouteResponse>();
    const secondRequest = createDeferred<TrainRouteResponse>();

    searchTrainRouteMock.mockReturnValueOnce(firstRequest.promise);
    searchTrainRouteMock.mockReturnValueOnce(secondRequest.promise);

    const { rerender } = render(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    });

    const firstSignal = searchTrainRouteMock.mock.calls[0]?.[1] as AbortSignal;

    mockSearch.mockReturnValue({
      date: '2026-04-02',
      destinationName: 'Leipzig Hbf',
      originName: 'Köln Hbf',
      time: '13:45',
    });

    rerender(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(2);
    });

    expect(firstSignal.aborted).toBe(true);
    expect(searchTrainRouteMock.mock.calls[1]?.[0]).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-02', '13:45'),
      destination: 'Leipzig Hbf',
      origin: 'Köln Hbf',
    });

    firstRequest.reject(new DOMException('Aborted', 'AbortError'));
    secondRequest.resolve(makeRoute({ destination: 'Leipzig Hbf' }));

    expect(
      await screen.findByRole('heading', {
        name: /suchergebnisse: zugverbindungen von köln hbf nach leipzig hbf/i,
      })
    ).toBeInTheDocument();
  });

  it('does not fall back to mock routes when eva numbers are missing', async () => {
    mockSearch.mockReturnValue({
      date: '2026-04-02',
      destinationName: 'Dresden Hbf',
      originName: 'Köln Hbf',
      time: '13:45',
    });

    render(<TrainSearchResults />);

    await screen.findByRole('button', { name: /verbindung auswählen/i });

    expect(
      screen.queryByRole('navigation', { name: /verbindungsfilter/i })
    ).not.toBeInTheDocument();
  });

  it('recreates the request when the date or time changes and aborts previous requests', async () => {
    const firstRequest = createDeferred<TrainRouteResponse>();
    const secondRequest = createDeferred<TrainRouteResponse>();
    const thirdRequest = createDeferred<TrainRouteResponse>();

    searchTrainRouteMock.mockReturnValueOnce(firstRequest.promise);
    searchTrainRouteMock.mockReturnValueOnce(secondRequest.promise);
    searchTrainRouteMock.mockReturnValueOnce(thirdRequest.promise);

    const { rerender } = render(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    });

    const firstSignal = searchTrainRouteMock.mock.calls[0]?.[1] as AbortSignal;

    mockSearch.mockReturnValue({
      date: '2026-04-03',
      destinationName: 'Dresden Hbf',
      originName: 'Köln Hbf',
      time: '13:45',
    });

    rerender(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(2);
    });

    const secondSignal = searchTrainRouteMock.mock.calls[1]?.[1] as AbortSignal;

    expect(firstSignal.aborted).toBe(true);
    expect(searchTrainRouteMock.mock.calls[1]?.[0]).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-03', '13:45'),
      destination: 'Dresden Hbf',
      origin: 'Köln Hbf',
    });

    mockSearch.mockReturnValue({
      date: '2026-04-03',
      destinationName: 'Dresden Hbf',
      originName: 'Köln Hbf',
      time: '14:10',
    });

    rerender(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    });

    expect(searchTrainRouteMock.mock.calls[0]?.[0]).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-02', '13:45'),
      destination: 'Dresden Hbf',
      origin: 'Köln Hbf',
    });
  });
});
