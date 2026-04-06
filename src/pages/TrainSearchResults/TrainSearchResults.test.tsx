import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrainRouteResponse, TrainRouteSearchResponse } from './types';
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

function formatExpectedTransitTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const mockNavigate = vi.fn();
const mockSearch = vi.fn();
const searchTrainRouteMock = vi.fn();
const saveSelectedTrainRouteMock = vi.fn();
const scrollToMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch(),
}));

vi.mock('../../services/trainRoutesApi', () => ({
  searchTrainRoute: (...args: unknown[]) => searchTrainRouteMock(...args),
}));

vi.mock('../../utils/selectedTrainRouteStorage', () => ({
  saveSelectedTrainRoute: (...args: unknown[]) => saveSelectedTrainRouteMock(...args),
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
    accessibilitySummary: {
      activeElevators: 1,
      activeEscalators: 0,
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

function makeSearchResponse(routes: TrainRouteResponse[]): TrainRouteSearchResponse {
  return {
    trips: routes,
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

function makePagedRoutes(count: number): TrainRouteResponse[] {
  return Array.from({ length: count }, (_, index) => {
    const departureHour = 8 + index;
    const arrivalHour = departureHour + 2;
    const formattedDepartureHour = String(departureHour).padStart(2, '0');
    const formattedArrivalHour = String(arrivalHour).padStart(2, '0');

    return makeRoute({
      arrivalTime: `2026-04-02T${formattedArrivalHour}:45:00Z`,
      departureTime: `2026-04-02T${formattedDepartureHour}:29:00Z`,
      destination: `Dresden Hbf ${index + 1}`,
      localizedDurationText: `2 Stunden, ${20 + index} Minuten`,
      origin: `Köln Hbf ${index + 1}`,
      transits: [
        {
          ...makeRoute().transits[0],
          arrival: {
            ...makeRoute().transits[0].arrival,
            arrivalTime: `2026-04-02T${formattedArrivalHour}:45:00Z`,
          },
          departure: {
            ...makeRoute().transits[0].departure,
            departureTime: `2026-04-02T${formattedDepartureHour}:29:00Z`,
          },
          trainName: `ICE ${579 + index}`,
        },
      ],
    });
  });
}

describe('TrainSearchResults', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    scrollToMock.mockReset();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
      writable: true,
    });
    searchTrainRouteMock.mockReset();
    saveSelectedTrainRouteMock.mockReset();
    searchTrainRouteMock.mockResolvedValue(makeSearchResponse([makeRoute()]));
    mockNavigate.mockReset();
    mockSearch.mockReset();
    mockSearch.mockReturnValue({
      accessibilityPreference: '',
      date: '2026-04-02',
      destinationEva: '8010096',
      destinationName: 'Dresden Hbf',
      originEva: '8000207',
      originName: 'Köln Hbf',
      time: '13:45',
    });
  });

  it('requests a train route search with station names and an ISO departure datetime', async () => {
    render(<TrainSearchResults />);

    await waitFor(() => {
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    });

    const [request, signal] = searchTrainRouteMock.mock.calls[0];

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

  it('loads search results through trainRoutesApi without calling fetch directly from the page', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<TrainSearchResults />);

    expect(
      await screen.findByRole('button', { name: /verbindung auswählen/i })
    ).toBeInTheDocument();
    expect(searchTrainRouteMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not show passenger count in the summary bar', async () => {
    render(<TrainSearchResults />);

    await waitFor(() => expect(searchTrainRouteMock).toHaveBeenCalledTimes(1));

    const summary = screen.getByRole('region', { name: /suchanfrage zusammenfassung/i });
    expect(summary).not.toHaveTextContent(/reisende/i);
  });

  it('keeps the summary bar bound to the user query params instead of backend route labels', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(
      makeSearchResponse([
        makeRoute({
          destination: 'Leipzig Hbf',
          origin: 'Hamburg Hbf',
        }),
      ])
    );

    render(<TrainSearchResults />);

    const summary = await screen.findByRole('region', { name: /suchanfrage zusammenfassung/i });

    expect(summary).toHaveTextContent('Köln Hbf');
    expect(summary).toHaveTextContent('Dresden Hbf');
    expect(summary).not.toHaveTextContent('Hamburg Hbf');
    expect(summary).not.toHaveTextContent('Leipzig Hbf');
  });

  it('shows a loading announcement while route data is being fetched', () => {
    const deferredResponse = createDeferred<TrainRouteSearchResponse>();
    searchTrainRouteMock.mockReturnValueOnce(deferredResponse.promise);

    render(<TrainSearchResults />);

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveTextContent(/verbindungen werden geladen/i);
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
  });

  it('shows an error state when the route request fails', async () => {
    searchTrainRouteMock.mockRejectedValueOnce(new Error('Network error'));

    render(<TrainSearchResults />);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/verbindungen konnten nicht geladen werden/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an empty state when the service returns no trips', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse([]));

    render(<TrainSearchResults />);

    const emptyState = await screen.findByRole('status');
    expect(emptyState).toHaveTextContent(/keine verbindungen/i);
    expect(screen.queryAllByRole('button', { name: /route auswählen/i })).toHaveLength(0);
  });

  it('renders backend DTO route details from the service response', async () => {
    const route = makeRouteWithTransfer();
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse([route]));

    render(<TrainSearchResults />);

    const summary = screen.getByRole('region', { name: /suchanfrage zusammenfassung/i });
    expect(summary).toHaveTextContent('Köln Hbf');
    expect(summary).toHaveTextContent('Dresden Hbf');

    const routeAction = await screen.findByRole('button', { name: /verbindung auswählen/i });
    expect(routeAction).toBeInTheDocument();
    expect(
      screen.getByText(formatExpectedTransitTime(route.transits[0].departure.departureTime))
    ).toBeInTheDocument();
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

  it('stores the selected trip before navigating to the route overview', async () => {
    const route = makeRouteWithTransfer();
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse([route]));

    render(<TrainSearchResults />);

    await userEvent.click(await screen.findByRole('button', { name: /verbindung auswählen/i }));

    expect(saveSelectedTrainRouteMock).toHaveBeenCalledWith(route);
    expect(mockNavigate).toHaveBeenCalledWith({
      search: {
        accessibilityPreference: '',
        date: '2026-04-02',
        destinationEva: '8010096',
        destinationName: 'Dresden Hbf',
        originEva: '8000207',
        originName: 'Köln Hbf',
        time: '13:45',
      },
      to: '/route-overview',
    });
  });

  it('keeps loaded results accessible for screen readers and keyboard users', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse([makeRoute()]));

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
    const [resultsList] = within(resultsRegion).getAllByRole('list');
    expect(resultsList).toBeInTheDocument();
  });

  it('hides pagination when the backend returns a single route', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse([makeRoute()]));

    render(<TrainSearchResults />);

    await screen.findByRole('button', { name: /verbindung auswählen/i });

    expect(
      screen.queryByRole('navigation', { name: /seiten navigation/i })
    ).not.toBeInTheDocument();
  });

  it('renders paginated multi-result lists from the trips response', async () => {
    const routes = makePagedRoutes(6);
    routes[5] = {
      ...routes[5],
      transits: [],
    };
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse(routes));

    render(<TrainSearchResults />);

    const summary = await screen.findByRole('region', { name: /suchanfrage zusammenfassung/i });
    const resultsRegion = screen.getByRole('region', {
      name: /suchergebnisse: zugverbindungen von köln hbf nach dresden hbf/i,
    });
    const [resultsList] = within(resultsRegion).getAllByRole('list');

    expect(summary).toHaveTextContent('6 Verbindungen gefunden');
    expect(resultsList.children).toHaveLength(5);
    expect(screen.getByRole('navigation', { name: /seiten navigation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /seite 2/i }));

    await waitFor(() => {
      const [updatedResultsList] = within(resultsRegion).getAllByRole('list');
      expect(updatedResultsList.children).toHaveLength(1);
    });
  });

  it('announces the loaded multi-result count through a polite live region', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse(makePagedRoutes(6)));

    render(<TrainSearchResults />);

    const count = await screen.findByText('6 Verbindungen gefunden');

    expect(count).toHaveAttribute('aria-live', 'polite');
  });

  it('supports keyboard pagination and exposes the current page state', async () => {
    const user = userEvent.setup();
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse(makePagedRoutes(6)));

    render(<TrainSearchResults />);

    await screen.findByRole('navigation', { name: /seiten navigation/i });

    await user.tab();
    expect(screen.getByRole('button', { name: /suche ändern/i })).toHaveFocus();

    await user.tab();
    expect(screen.getAllByRole('button', { name: /verbindung auswählen/i })[0]).toHaveFocus();

    for (let index = 0; index < 6; index += 1) {
      await user.tab();
    }

    const pageTwoButton = screen.getByRole('button', { name: /seite 2/i });
    expect(pageTwoButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(pageTwoButton).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /seite 1/i })).not.toHaveAttribute('aria-current');
  });

  it('uses auto scrolling for pagination when reduced motion is requested', async () => {
    const user = userEvent.setup();
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMediaMock,
    });
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse(makePagedRoutes(6)));

    render(<TrainSearchResults />);

    const pageTwoButton = await screen.findByRole('button', { name: /seite 2/i });
    await user.click(pageTwoButton);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('does not render temporary filter tabs while the backend lacks real filter metadata', async () => {
    searchTrainRouteMock.mockResolvedValueOnce(makeSearchResponse(makePagedRoutes(6)));

    render(<TrainSearchResults />);

    await screen.findByRole('navigation', { name: /seiten navigation/i });

    expect(
      screen.queryByRole('navigation', { name: /verbindungsfilter/i })
    ).not.toBeInTheDocument();
  });

  it('recreates the request when the date or time changes and aborts previous requests', async () => {
    const firstRequest = createDeferred<TrainRouteSearchResponse>();
    const secondRequest = createDeferred<TrainRouteSearchResponse>();
    const thirdRequest = createDeferred<TrainRouteSearchResponse>();

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
      expect(searchTrainRouteMock).toHaveBeenCalledTimes(3);
    });

    expect(secondSignal.aborted).toBe(true);
    expect(searchTrainRouteMock.mock.calls[2]?.[0]).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-03', '14:10'),
      destination: 'Dresden Hbf',
      origin: 'Köln Hbf',
    });

    firstRequest.reject(new DOMException('Aborted', 'AbortError'));
    secondRequest.reject(new DOMException('Aborted', 'AbortError'));
    thirdRequest.resolve(
      makeSearchResponse([makeRoute({ departureTime: '2026-04-03T14:10:00Z' })])
    );

    expect(
      await screen.findByRole('heading', {
        name: /suchergebnisse: zugverbindungen von köln hbf nach dresden hbf/i,
      })
    ).toBeInTheDocument();
  });
});
