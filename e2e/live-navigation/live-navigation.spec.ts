import { expect, test } from '@playwright/test';

test.describe('LiveNavigation page', () => {
  test('uses browser geolocation and renders live guidance', async ({ page }) => {
    await page.context().grantPermissions(['geolocation'], {
      origin: 'http://127.0.0.1:4173',
    });
    await page.context().setGeolocation({
      latitude: 50.10736,
      longitude: 8.66312,
    });

    await page.goto('/live-navigation');

    await expect(page.getByRole('status')).toContainText('Live-Standort wird aktualisiert.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aufzug E4');
    await expect(page.getByRole('button', { name: /alternativweg: südrampe/i })).toBeVisible();

    await page.getByRole('button', { name: /alternativweg: südrampe/i }).click();
    await expect(page.getByRole('region', { name: 'Alternativweg Details' })).toBeVisible();
  });

  test('falls back to manual start selection when location permission is denied', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const deniedError = {
        code: 1,
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      Object.defineProperty(window.navigator, 'geolocation', {
        configurable: true,
        value: {
          clearWatch: () => {},
          getCurrentPosition: () => {},
          watchPosition: (_success: unknown, error?: (value: unknown) => void) => {
            error?.(deniedError);
            return 1;
          },
        },
      });
    });

    await page.goto('/live-navigation');

    await expect(page.getByRole('status')).toContainText('Standortfreigabe wurde abgelehnt.');
    await expect(
      page.getByRole('radiogroup', { name: 'Manuellen Startpunkt wählen' })
    ).toBeVisible();

    await page.getByRole('radio', { name: 'Info Point' }).check();

    await expect(page.getByRole('status')).toContainText('Manueller Startpunkt aktiv.');
    await expect(page.getByRole('radio', { name: 'Info Point' })).toBeChecked();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Biegen Sie links ab');
  });
});
