import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainSearchResults from './TrainSearchResults';

const mockNavigate = vi.fn();
const mockSearch = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch(),
}));

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getRequestedUrl(input: Request | string | URL) {
  return input instanceof Request ? input.url : String(input);
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
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

  it('shows a loading announcement while timetable data is being fetched', () => {
    const deferredResponse = createDeferred<Response>();
    fetchMock.mockReturnValueOnce(deferredResponse.promise);

    render(<TrainSearchResults />);

    const loadingStatus = screen.getByText(/loading train results/i);

    expect(loadingStatus).toHaveTextContent(/loading train results/i);
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByText('ECE 1174')).not.toBeInTheDocument();
  });

  it('shows an error state when the timetable request fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<TrainSearchResults />);

    const errorAlert = await screen.findByRole('alert');

    expect(errorAlert).toHaveTextContent(/unable to load train results/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an empty state when the timetable request succeeds without trains', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse([]));

    render(<TrainSearchResults />);

    const emptyState = await screen.findByText(/no trains found for this station and time/i);

    expect(emptyState).toHaveTextContent(/no trains found for this station and time/i);
    expect(screen.queryAllByRole('button', { name: /route auswählen/i })).toHaveLength(0);
  });

  it('renders all trains returned by the timetable endpoint instead of the local mock results', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          arrivalPlatform: null,
          arrivalTime: null,
          departurePlatform: '5',
          departureTime: '12:51',
          line: null,
          route: [
            'Schleswig',
            'Padborg st',
            'Kolding st',
            'Odense st',
            'Ringsted st',
            'Koebenhavn H',
          ],
          trainNumber: '1174',
          trainType: 'ECE',
        },
        {
          arrivalPlatform: '11',
          arrivalTime: '12:48',
          departurePlatform: '11',
          departureTime: '12:52',
          line: null,
          route: ['Lüneburg', 'Uelzen', 'Stendal Hbf', 'Berlin-Spandau', 'Berlin Hbf'],
          trainNumber: '1907',
          trainType: 'ICE',
        },
      ])
    );

    render(<TrainSearchResults />);

    expect(await screen.findByText('ECE 1174')).toBeInTheDocument();
    expect(screen.getByText('ICE 1907')).toBeInTheDocument();
    expect(screen.getByText(/Koebenhavn H/)).toBeInTheDocument();
    expect(screen.getByText('Gleis 5')).toBeInTheDocument();
    expect(screen.queryByText('ICE 789')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /route auswählen/i })).toHaveLength(2);
  });

  it('keeps loaded results accessible for screen readers and keyboard users', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          arrivalPlatform: null,
          arrivalTime: null,
          departurePlatform: '5',
          departureTime: '12:51',
          line: null,
          route: [
            'Schleswig',
            'Padborg st',
            'Kolding st',
            'Odense st',
            'Ringsted st',
            'Koebenhavn H',
          ],
          trainNumber: '1174',
          trainType: 'ECE',
        },
      ])
    );

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
      await within(resultsRegion).findByRole('button', {
        name: /ece 1174 route auswählen, abfahrt 12:51/i,
      })
    ).toBeEnabled();
    expect(within(resultsRegion).getByRole('list')).toBeInTheDocument();
  });
});
