import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createJsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

describe('trainRoutesApi', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses VITE_API_URL for BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    const { BASE_URL } = await import('./trainRoutesApi');

    expect(BASE_URL).toBe('https://api.example.test');
  });

  it('falls back to /api when VITE_API_URL is not provided', async () => {
    const { BASE_URL } = await import('./trainRoutesApi');

    expect(BASE_URL).toBe('/api');
  });

  it('posts train route search requests and returns the backend response', async () => {
    const routeResponse = {
      arrivalTime: '2026-04-02T10:45:00Z',
      departureTime: '2026-04-02T08:29:00Z',
      destination: 'Braunschweig Hbf',
      localizedDistanceText: '240 km',
      localizedDurationText: '2 Stunden, 20 Minuten',
      origin: 'Hamburg Hbf',
      transits: [],
    };
    const request = {
      departureTime: '2026-04-02T08:00:00Z',
      destination: 'Braunschweig Hbf',
      origin: 'Hamburg Hbf',
    };
    const signal = new AbortController().signal;
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(routeResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { searchTrainRoute } = await import('./trainRoutesApi');

    await expect(searchTrainRoute(request, signal)).resolves.toEqual(routeResponse);

    expect(fetchMock).toHaveBeenCalledWith('/api/routes/trains/debug', {
      body: JSON.stringify(request),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
    });
  });

  it('throws TrainRoutesApiError for non-2xx responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ message: 'Bad request' }, { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const { TrainRoutesApiError, searchTrainRoute } = await import('./trainRoutesApi');

    await expect(
      searchTrainRoute({
        departureTime: '2026-04-02T08:00:00Z',
        destination: 'Braunschweig Hbf',
        origin: 'Hamburg Hbf',
      })
    ).rejects.toMatchObject({
      message: 'Unable to search train routes.',
      name: 'TrainRoutesApiError',
      status: 400,
    });

    await expect(
      searchTrainRoute({
        departureTime: '2026-04-02T08:00:00Z',
        destination: 'Braunschweig Hbf',
        origin: 'Hamburg Hbf',
      })
    ).rejects.toBeInstanceOf(TrainRoutesApiError);
  });
});
