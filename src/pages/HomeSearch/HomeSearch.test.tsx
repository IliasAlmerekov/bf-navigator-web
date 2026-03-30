import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeSearch from './HomeSearch';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getRequestedQuery(input: Request | string | URL) {
  const requestUrl = input instanceof Request ? input.url : String(input);
  return new URL(requestUrl, 'http://localhost').searchParams.get('query');
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

async function selectStation(fieldLabel: 'From' | 'To', typedValue: string, optionName: RegExp) {
  const input = screen.getAllByRole('combobox', { name: fieldLabel })[0];

  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: typedValue } });

  await waitFor(() => {
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([request]) => getRequestedQuery(request) === `${typedValue}*`)
    ).toBe(true);
  });

  const option = await screen.findByRole('option', { name: optionName }, { timeout: 3000 });

  fireEvent.mouseDown(option);
  fireEvent.click(option);
}

describe('HomeSearch', () => {
  const fetchMock = vi.mocked(fetch);

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createJsonResponse([]));
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
  });

  it('shows station suggestions for a typed city', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          city: 'Hamburg',
          evaNumber: 8002549,
          name: 'Hamburg Hbf',
          number: 1,
        },
      ])
    );

    render(<HomeSearch />);

    const fromInput = screen.getAllByRole('combobox', { name: 'From' })[0];

    fireEvent.focus(fromInput);
    fireEvent.change(fromInput, { target: { value: 'Ham' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole('option', { name: /Hamburg Hbf/i })).toBeInTheDocument();
  });

  it('fills the field when a station is selected', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          city: 'Hamburg',
          evaNumber: 8002549,
          name: 'Hamburg Hbf',
          number: 1,
        },
      ])
    );

    render(<HomeSearch />);

    const fromInput = screen.getAllByRole('combobox', { name: 'From' })[0] as HTMLInputElement;

    fireEvent.focus(fromInput);
    fireEvent.change(fromInput, { target: { value: 'Ham' } });

    const option = await screen.findByRole('option', { name: /Hamburg Hbf/i });

    fireEvent.mouseDown(option);
    fireEvent.click(option);

    expect(fromInput.value).toBe('Hamburg Hbf');
  });

  it("renders date input with today's date", () => {
    render(<HomeSearch />);
    const today = new Date().toISOString().slice(0, 10);
    const dateInputs = screen.getAllByLabelText('Date');
    expect((dateInputs[0] as HTMLInputElement).value).toBe(today);
  });

  it('renders time input with default value', () => {
    render(<HomeSearch />);
    const timeInputs = screen.getAllByLabelText('Time');
    expect((timeInputs[0] as HTMLInputElement).value).toBe('09:00');
  });

  it('blocks submit and shows errors when origin not selected from autocomplete', async () => {
    render(<HomeSearch />);

    const originInput = screen.getAllByRole('combobox', { name: 'From' })[0];
    fireEvent.focus(originInput);
    fireEvent.change(originInput, { target: { value: 'Ber' } });

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Please select an origin station from the suggestions.')
    ).not.toHaveLength(0);
  });

  it('blocks submit and shows errors when destination not selected from autocomplete', async () => {
    fetchMock.mockResolvedValue(createJsonResponse([]));
    render(<HomeSearch />);

    const destInput = screen.getAllByRole('combobox', { name: 'To' })[0];
    fireEvent.focus(destInput);
    fireEvent.change(destInput, { target: { value: 'Mun' } });

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Please select a destination station from the suggestions.')
    ).not.toHaveLength(0);
  });

  it('navigates when both stations are selected', async () => {
    fetchMock.mockImplementation(async (input) => {
      const query = getRequestedQuery(input);

      if (query === 'Ham*') {
        return createJsonResponse([
          { city: 'Hamburg', evaNumber: 8002549, name: 'Hamburg Hbf', number: 1 },
        ]);
      }

      if (query === 'Ber*') {
        return createJsonResponse([
          { city: 'Berlin', evaNumber: 8011160, name: 'Berlin Hbf', number: 1 },
        ]);
      }

      return createJsonResponse([]);
    });

    render(<HomeSearch />);

    await selectStation('From', 'Ham', /Hamburg Hbf/i);
    await selectStation('To', 'Ber', /Berlin Hbf/i);

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Please select an origin station from the suggestions.')
      ).not.toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({
          destinationEva: '8011160',
          destinationName: 'Berlin Hbf',
          originEva: '8002549',
          originName: 'Hamburg Hbf',
        }),
        to: '/train-search-results',
      })
    );
  });

  it('submits selected stations and date/time via route search params', async () => {
    fetchMock.mockImplementation(async (input) => {
      const query = getRequestedQuery(input);

      if (query === 'Ham*') {
        return createJsonResponse([
          { city: 'Hamburg', evaNumber: 8002549, name: 'Hamburg Hbf', number: 1 },
        ]);
      }

      if (query === 'Köl*') {
        return createJsonResponse([
          { city: 'Köln', evaNumber: 8000207, name: 'Köln Hbf', number: 1 },
        ]);
      }

      return createJsonResponse([]);
    });

    render(<HomeSearch />);

    await selectStation('From', 'Ham', /Hamburg Hbf/i);
    await selectStation('To', 'Köl', /Köln Hbf/i);

    fireEvent.change(screen.getAllByLabelText('Date')[0], { target: { value: '2026-04-02' } });
    fireEvent.change(screen.getAllByLabelText('Time')[0], { target: { value: '13:45' } });

    fireEvent.click(screen.getAllByRole('button', { name: 'Find Optimal Route' })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        search: {
          date: '2026-04-02',
          destinationEva: '8000207',
          destinationName: 'Köln Hbf',
          originEva: '8002549',
          originName: 'Hamburg Hbf',
          time: '13:45',
        },
        to: '/train-search-results',
      });
    });
  });

  it('shows an immediate loading announcement and disables search buttons while submit is in progress', async () => {
    const navigation = createDeferred<void>();

    fetchMock.mockImplementation(async (input) => {
      const query = getRequestedQuery(input);

      if (query === 'Ham*') {
        return createJsonResponse([
          { city: 'Hamburg', evaNumber: 8002549, name: 'Hamburg Hbf', number: 1 },
        ]);
      }

      if (query === 'Köl*') {
        return createJsonResponse([
          { city: 'Köln', evaNumber: 8000207, name: 'Köln Hbf', number: 1 },
        ]);
      }

      return createJsonResponse([]);
    });
    mockNavigate.mockReturnValueOnce(navigation.promise);

    render(<HomeSearch />);

    await selectStation('From', 'Ham', /Hamburg Hbf/i);
    await selectStation('To', 'Köl', /Köln Hbf/i);

    fireEvent.click(screen.getAllByRole('button', { name: 'Find Optimal Route' })[0]);

    const loadingAnnouncement = screen.getByText(/loading train results/i);
    expect(loadingAnnouncement).toHaveAttribute('aria-live', 'polite');
    expect(screen.getAllByRole('button', { name: 'Find Optimal Route' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Find route' })[0]).toBeDisabled();

    navigation.resolve();
  });

  it('prevents duplicate submissions while the search is loading', async () => {
    const navigation = createDeferred<void>();

    fetchMock.mockImplementation(async (input) => {
      const query = getRequestedQuery(input);

      if (query === 'Ham*') {
        return createJsonResponse([
          { city: 'Hamburg', evaNumber: 8002549, name: 'Hamburg Hbf', number: 1 },
        ]);
      }

      if (query === 'Köl*') {
        return createJsonResponse([
          { city: 'Köln', evaNumber: 8000207, name: 'Köln Hbf', number: 1 },
        ]);
      }

      return createJsonResponse([]);
    });
    mockNavigate.mockReturnValue(navigation.promise);

    render(<HomeSearch />);

    await selectStation('From', 'Ham', /Hamburg Hbf/i);
    await selectStation('To', 'Köl', /Köln Hbf/i);

    const primarySearchButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];

    fireEvent.click(primarySearchButton);
    fireEvent.click(primarySearchButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);

    navigation.resolve();
  });
});
