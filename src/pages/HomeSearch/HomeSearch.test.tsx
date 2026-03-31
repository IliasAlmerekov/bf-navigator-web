import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomeSearch from './HomeSearch';

const mockNavigate = vi.fn();
const ACCESSIBILITY_PREFERENCE_STORAGE_KEY = 'bf-navigator-accessibility-preference';

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

function formatCalendarButtonName(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(date);
}

function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function selectStation(fieldLabel: 'Von' | 'Nach', typedValue: string, optionName: RegExp) {
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

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createJsonResponse([]));
    mockNavigate.mockReset();
    mockNavigate.mockResolvedValue(undefined);
    window.localStorage.removeItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY);
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

    const fromInput = screen.getAllByRole('combobox', { name: 'Von' })[0];

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

    const fromInput = screen.getAllByRole('combobox', { name: 'Von' })[0] as HTMLInputElement;

    fireEvent.focus(fromInput);
    fireEvent.change(fromInput, { target: { value: 'Ham' } });

    const option = await screen.findByRole('option', { name: /Hamburg Hbf/i });

    fireEvent.mouseDown(option);
    fireEvent.click(option);

    expect(fromInput.value).toBe('Hamburg Hbf');
  });

  it("renders date input with today's date", () => {
    render(<HomeSearch />);
    const dateButtons = screen.getAllByRole('button', { name: /choose departure date/i });
    expect(dateButtons[0]).toBeInTheDocument();
  });

  it('renders time input with default value', () => {
    render(<HomeSearch />);
    const timeButtons = screen.getAllByRole('button', { name: /choose departure time/i });
    expect(timeButtons[0]).toHaveAccessibleName(/09:00/i);
  });

  it('renders the onboarding accessibility preferences and activates the saved selection', () => {
    window.localStorage.setItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY, 'hearing');

    render(<HomeSearch />);

    const preferencesRegion = screen.getAllByRole('region', { name: 'Reisepräferenzen' })[0];
    const preferenceButtons = within(preferencesRegion).getAllByRole('button');

    expect(preferenceButtons).toHaveLength(5);
    expect(
      within(preferencesRegion).getByRole('button', { name: 'Rollstuhlzugang' })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(preferencesRegion).getByRole('button', { name: 'Sehbehinderung' })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(preferencesRegion).getByRole('button', { name: 'Hörbehinderung' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(preferencesRegion).getByRole('button', { name: 'Eingeschränkte Mobilität' })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(within(preferencesRegion).getByRole('button', { name: 'Kinderwagen' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    expect(
      within(preferencesRegion).queryByRole('button', { name: 'Rollstuhl' })
    ).not.toBeInTheDocument();
    expect(
      within(preferencesRegion).queryByRole('button', { name: 'Stufenfrei bevorzugen' })
    ).not.toBeInTheDocument();
    expect(
      within(preferencesRegion).queryByRole('button', { name: 'Schweres Gepäck' })
    ).not.toBeInTheDocument();
    expect(
      within(preferencesRegion).queryByRole('button', { name: 'Sehunterstützung' })
    ).not.toBeInTheDocument();
  });

  it('lets the user change and clear the active travel preference from home search', () => {
    window.localStorage.setItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY, 'hearing');

    render(<HomeSearch />);

    const preferencesRegion = screen.getAllByRole('region', { name: 'Reisepräferenzen' })[0];
    const hearingButton = within(preferencesRegion).getByRole('button', {
      name: 'Hörbehinderung',
    });
    const strollerButton = within(preferencesRegion).getByRole('button', {
      name: 'Kinderwagen',
    });

    fireEvent.click(strollerButton);

    expect(strollerButton).toHaveAttribute('aria-pressed', 'true');
    expect(hearingButton).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY)).toBe('stroller');

    fireEvent.click(strollerButton);

    expect(strollerButton).toHaveAttribute('aria-pressed', 'false');
    expect(hearingButton).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY)).toBeNull();
  });

  it('blocks submit and shows errors when origin not selected from autocomplete', async () => {
    render(<HomeSearch />);

    const originInput = screen.getAllByRole('combobox', { name: 'Von' })[0];
    fireEvent.focus(originInput);
    fireEvent.change(originInput, { target: { value: 'Ber' } });

    const submitButton = screen.getAllByRole('button', { name: 'Optimale Route finden' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Bitte wählen Sie einen Startbahnhof aus den Vorschlägen aus.')
    ).not.toHaveLength(0);
  });

  it('blocks submit and shows errors when destination not selected from autocomplete', async () => {
    fetchMock.mockResolvedValue(createJsonResponse([]));
    render(<HomeSearch />);

    const destInput = screen.getAllByRole('combobox', { name: 'Nach' })[0];
    fireEvent.focus(destInput);
    fireEvent.change(destInput, { target: { value: 'Mun' } });

    const submitButton = screen.getAllByRole('button', { name: 'Optimale Route finden' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Bitte wählen Sie einen Zielbahnhof aus den Vorschlägen aus.')
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

    await selectStation('Von', 'Ham', /Hamburg Hbf/i);
    await selectStation('Nach', 'Ber', /Berlin Hbf/i);

    const submitButton = screen.getAllByRole('button', { name: 'Optimale Route finden' })[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Bitte wählen Sie einen Startbahnhof aus den Vorschlägen aus.')
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
    const selectedDate = new Date();
    selectedDate.setHours(12, 0, 0, 0);
    selectedDate.setDate(15);

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

    await selectStation('Von', 'Ham', /Hamburg Hbf/i);
    await selectStation('Nach', 'Köl', /Köln Hbf/i);

    fireEvent.click(screen.getAllByRole('button', { name: /choose departure date/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: formatCalendarButtonName(selectedDate) }));
    fireEvent.click(screen.getAllByRole('button', { name: /choose departure time/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: '13:45' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Optimale Route finden' })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        search: {
          accessibilityPreference: '',
          date: formatLocalIsoDate(selectedDate),
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

  it('opens the date picker dialog and closes it after selecting a day', () => {
    const selectedDate = new Date();
    selectedDate.setHours(12, 0, 0, 0);
    selectedDate.setDate(15);

    render(<HomeSearch />);

    const trigger = screen.getAllByRole('button', { name: /choose departure date/i })[0];
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /choose departure date/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: formatCalendarButtonName(selectedDate) }));

    expect(
      screen.queryByRole('dialog', { name: /choose departure date/i })
    ).not.toBeInTheDocument();
  });

  it('opens the time picker dialog and closes it after selecting a time', () => {
    render(<HomeSearch />);

    const trigger = screen.getAllByRole('button', { name: /choose departure time/i })[0];
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /choose departure time/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '13:45' }));

    expect(
      screen.queryByRole('dialog', { name: /choose departure time/i })
    ).not.toBeInTheDocument();
  });

  it('submits the active accessibility preference together with route search params', async () => {
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

    const preferencesRegion = screen.getAllByRole('region', { name: 'Reisepräferenzen' })[0];

    fireEvent.click(
      within(preferencesRegion).getByRole('button', { name: 'Eingeschränkte Mobilität' })
    );

    await selectStation('Von', 'Ham', /Hamburg Hbf/i);
    await selectStation('Nach', 'Köl', /Köln Hbf/i);

    fireEvent.click(screen.getAllByRole('button', { name: 'Optimale Route finden' })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.objectContaining({
          accessibilityPreference: 'mobility',
          destinationEva: '8000207',
          destinationName: 'Köln Hbf',
          originEva: '8002549',
          originName: 'Hamburg Hbf',
        }),
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

    await selectStation('Von', 'Ham', /Hamburg Hbf/i);
    await selectStation('Nach', 'Köl', /Köln Hbf/i);

    fireEvent.click(screen.getAllByRole('button', { name: 'Optimale Route finden' })[0]);

    const loadingAnnouncement = screen.getByText(/zugverbindungen werden geladen/i);
    expect(loadingAnnouncement).toHaveAttribute('aria-live', 'polite');
    expect(screen.getAllByRole('button', { name: 'Optimale Route finden' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Route suchen' })[0]).toBeDisabled();

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

    await selectStation('Von', 'Ham', /Hamburg Hbf/i);
    await selectStation('Nach', 'Köl', /Köln Hbf/i);

    const primarySearchButton = screen.getAllByRole('button', { name: 'Optimale Route finden' })[0];

    fireEvent.click(primarySearchButton);
    fireEvent.click(primarySearchButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);

    navigation.resolve();
  });
});
