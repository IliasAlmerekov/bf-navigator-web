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

  it('uses VITE_TRAIN_ROUTES_API_URL for BASE_URL when provided', async () => {
    vi.stubEnv('VITE_TRAIN_ROUTES_API_URL', 'https://train-routes.example.test');

    const { BASE_URL } = await import('./trainRoutesApi');

    expect(BASE_URL).toBe('https://train-routes.example.test');
  });

  it('falls back to /train-api when VITE_TRAIN_ROUTES_API_URL is not provided', async () => {
    const { BASE_URL } = await import('./trainRoutesApi');

    expect(BASE_URL).toBe('/train-api');
  });

  it('exposes the train routes path as the single switch point for the real backend endpoint', async () => {
    const trainRoutesApiModule = await import('./trainRoutesApi');

    expect(trainRoutesApiModule.TRAIN_ROUTES_PATH).toBe('/routes/trains');
  });

  it('posts train route search requests and returns the backend response', async () => {
    const routeResponse = {
      trips: [
        {
          accessibilitySummary: {
            activeElevators: 2,
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
          transits: [],
        },
      ],
    };
    const request = {
      departureTime: '2026-04-02T08:00:00Z',
      destination: 'Braunschweig Hbf',
      origin: 'Hamburg Hbf',
    };
    const signal = new AbortController().signal;
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(routeResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { searchTrainRoute, TRAIN_ROUTES_PATH } = await import('./trainRoutesApi');

    await expect(searchTrainRoute(request, signal)).resolves.toEqual(routeResponse);

    expect(fetchMock).toHaveBeenCalledWith(`/train-api${TRAIN_ROUTES_PATH}`, {
      body: JSON.stringify(request),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
    });
  });

  it('returns multi-trip backend responses with nested accessibility touchpoints unchanged', async () => {
    const routeResponse = {
      trips: [
        {
          accessibilitySummary: {
            activeElevators: 2,
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
          ],
          transits: [],
        },
        {
          accessibilitySummary: {
            activeElevators: 0,
            activeEscalators: 0,
            inactiveElevators: 1,
            inactiveEscalators: 1,
            mobilityServiceStations: 1,
            status: 'LIMITED',
            stepFreeStations: 1,
            summary: '1/2 stations step-free',
            totalStations: 2,
          },
          arrivalTime: '2026-04-02T12:45:00Z',
          departureTime: '2026-04-02T10:29:00Z',
          destination: 'Hannover Hbf',
          localizedDistanceText: '150 km',
          localizedDurationText: '2 Stunden, 16 Minuten',
          origin: 'Hamburg Hbf',
          touchpoints: [],
          transits: [],
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(routeResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { searchTrainRoute } = await import('./trainRoutesApi');

    await expect(
      searchTrainRoute({
        departureTime: '2026-04-02T08:00:00Z',
        destination: 'Braunschweig Hbf',
        origin: 'Hamburg Hbf',
      })
    ).resolves.toEqual(routeResponse);
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
