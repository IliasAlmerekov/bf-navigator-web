import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteResult } from './types';
import TrainSearchResults from './TrainSearchResults';

const mockNavigate = vi.fn();
const mockSearch = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch(),
}));

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function getRequestedUrl(input: Request | string | URL) {
  return input instanceof Request ? input.url : String(input);
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

function makeRoute(overrides?: Partial<RouteResult>): RouteResult {
  return {
    distanceMeters: 240215,
    duration: '8411s',
    staticDuration: '8411s',
    localizedValues: {
      distance: { text: '240 km' },
      duration: { text: '2 Stunden, 20 Minuten' },
      staticDuration: { text: '2 Stunden, 20 Minuten' },
    },
    legs: [
      {
        distanceMeters: 240215,
        duration: '8411s',
        staticDuration: '8411s',
        localizedValues: {
          distance: { text: '240 km' },
          duration: { text: '2 Stunden, 20 Minuten' },
          staticDuration: { text: '2 Stunden, 20 Minuten' },
        },
        steps: [
          {
            distanceMeters: 178315,
            staticDuration: '4740s',
            travelMode: 'TRANSIT',
            localizedValues: {
              distance: { text: '178 km' },
              staticDuration: { text: '1 Stunde, 19 Minuten' },
            },
            transitDetails: {
              stopDetails: {
                arrivalStop: { name: 'Hannover Hauptbahnhof' },
                departureStop: { name: 'Hamburg Hauptbahnhof' },
                arrivalTime: '2026-04-02T09:48:00Z',
                departureTime: '2026-04-02T08:29:00Z',
              },
              localizedValues: {
                arrivalTime: { time: { text: '11:48' }, timeZone: 'Europe/Berlin' },
                departureTime: { time: { text: '10:29' }, timeZone: 'Europe/Berlin' },
              },
              headsign: 'Stuttgart Hbf',
              transitLine: {
                agencies: [{ name: 'DB Fernverkehr AG', uri: 'https://www.bahn.de/' }],
                color: '#f01414',
                nameShort: 'ICE 579',
                textColor: '#ffffff',
                vehicle: { name: { text: 'Hochgeschwindigkeitszug' }, type: 'HIGH_SPEED_TRAIN' },
              },
              stopCount: 3,
            },
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('TrainSearchResults', () => {
  const fetchMock = vi.mocked(fetch);

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createJsonResponse([]));
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

  it('requests the selected origin timetable using formatted date and time from route search params', async () => {
    render(<TrainSearchResults />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [request] = fetchMock.mock.calls[0];

    expect(getRequestedUrl(request)).toContain('/stations/8000207/timetable?date=260402&time=1345');
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

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const summary = screen.getByRole('region', { name: /suchanfrage zusammenfassung/i });
    expect(summary).not.toHaveTextContent(/reisende/i);
  });

  it('shows a loading announcement while route data is being fetched', () => {
    const deferredResponse = createDeferred<Response>();
    fetchMock.mockReturnValueOnce(deferredResponse.promise);

    render(<TrainSearchResults />);

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveTextContent(/verbindungen werden geladen/i);
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
  });

  it('shows an error state when the route request fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<TrainSearchResults />);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/verbindungen konnten nicht geladen werden/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an empty state when the request succeeds without routes', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse([]));

    render(<TrainSearchResults />);

    const emptyState = await screen.findByRole('status');
    expect(emptyState).toHaveTextContent(/keine verbindungen/i);
    expect(screen.queryAllByRole('button', { name: /route auswählen/i })).toHaveLength(0);
  });

  it('renders route cards returned by the endpoint', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse([makeRoute(), makeRoute()]));

    render(<TrainSearchResults />);

    const buttons = await screen.findAllByRole('button', { name: /verbindung auswählen/i });
    expect(buttons).toHaveLength(2);
  });

  it('supports new { routes: [] } response shape', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ routes: [makeRoute()] }));

    render(<TrainSearchResults />);

    expect(
      await screen.findByRole('button', { name: /verbindung auswählen/i })
    ).toBeInTheDocument();
  });

  it('keeps loaded results accessible for screen readers and keyboard users', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse([makeRoute()]));

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

  it('shows pagination when there are more results than one page', async () => {
    const routes = Array.from({ length: 6 }, () => makeRoute());
    fetchMock.mockResolvedValueOnce(createJsonResponse(routes));

    render(<TrainSearchResults />);

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /seiten navigation/i })).toBeInTheDocument();
    });
  });
});
