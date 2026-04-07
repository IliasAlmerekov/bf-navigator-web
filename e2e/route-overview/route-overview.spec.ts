import { expect, test } from '@playwright/test';

const SAVED_TRIPS_STORAGE_KEY = 'bf-navigator-saved-trips';
const SELECTED_TRAIN_ROUTE_STORAGE_KEY = 'bf-navigator-selected-train-route';

test.describe('RouteOverview page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('renders fallback route overview content and navigation actions', async ({ page }) => {
    await page.goto('/route-overview');

    const timeline = page.getByRole('list', { name: 'Reiseverlauf' });

    await expect(
      page.getByRole('heading', { level: 2, name: 'Detaillierter Reiseverlauf' })
    ).toBeVisible();
    await expect(timeline).toContainText('Frankfurt (Main) Hbf');
    await expect(timeline).toContainText('Berlin Hbf');

    await expect(page.getByRole('link', { name: 'Alternativen anzeigen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Live-Navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Routenvorschau vergrößern' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Routenvorschau verkleinern' })).toBeVisible();
  });

  test('saves and removes the displayed route from saved trips storage', async ({ page }) => {
    await page.goto('/route-overview');

    const saveButton = page.getByRole('button', { name: 'Route speichern' });

    await saveButton.click();
    await expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByText('Route wurde zu deinen gespeicherten Reisen hinzugefügt.')
    ).toBeVisible();

    const savedAfterAdd = await page.evaluate((storageKey) => {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as Array<{
        destination: string;
        origin: string;
      }>;
    }, SAVED_TRIPS_STORAGE_KEY);

    expect(savedAfterAdd).toHaveLength(1);
    expect(savedAfterAdd[0]).toMatchObject({
      destination: 'Berlin',
      origin: 'Frankfurt (Main) Hbf',
    });

    await saveButton.click();
    await expect(saveButton).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByText('Route wurde aus deinen gespeicherten Reisen entfernt.')
    ).toBeVisible();

    const savedAfterRemove = await page.evaluate((storageKey) => {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    }, SAVED_TRIPS_STORAGE_KEY);

    expect(savedAfterRemove).toEqual([]);
  });

  test('renders selected train route from session storage', async ({ page }) => {
    await page.addInitScript((storageKey) => {
      const selectedRoute = {
        accessibilitySummary: {
          activeElevators: 0,
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
        destination: 'Braunschweig Hauptbahnhof',
        localizedDistanceText: '240 km',
        localizedDurationText: '2 Stunden, 16 Minuten',
        origin: 'Hamburg Hauptbahnhof',
        touchpoints: [
          {
            accessibility: {
              activeElevators: 0,
              activeEscalators: 0,
              hasFacilityData: false,
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
            station: null,
            stationName: 'Hamburg Hauptbahnhof',
          },
          {
            accessibility: {
              activeElevators: 0,
              activeEscalators: 0,
              hasFacilityData: false,
              inactiveElevators: 0,
              inactiveEscalators: 0,
              mobilityServiceAvailable: true,
              status: 'ACCESSIBLE',
              stepFreeAvailable: true,
              summary: 'Step-free access available',
            },
            arrivalTime: '2026-04-02T09:48:00Z',
            departureTime: '2026-04-02T10:05:00Z',
            facilities: [],
            kind: 'TRANSFER',
            station: null,
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
              status: 'ACCESSIBLE',
              stepFreeAvailable: true,
              summary: 'Step-free access available',
            },
            arrivalTime: '2026-04-02T10:45:00Z',
            departureTime: null,
            facilities: [],
            kind: 'DESTINATION',
            station: null,
            stationName: 'Braunschweig Hauptbahnhof',
          },
        ],
        transits: [],
      };

      window.sessionStorage.setItem(storageKey, JSON.stringify(selectedRoute));
    }, SELECTED_TRAIN_ROUTE_STORAGE_KEY);

    await page.goto('/route-overview');

    const timeline = page.getByRole('list', { name: 'Reiseverlauf' });

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Hamburg Hauptbahnhof nach Braunschweig Hauptbahnhof',
      })
    ).toBeVisible();
    await expect(timeline).toContainText('Hamburg Hauptbahnhof');
    await expect(timeline).toContainText('Hannover Hauptbahnhof');
    await expect(timeline).toContainText('Braunschweig Hauptbahnhof');

    await expect(timeline).not.toContainText('Frankfurt (Main) Hbf');
    await expect(timeline).not.toContainText('Berlin Hbf');
  });
});
