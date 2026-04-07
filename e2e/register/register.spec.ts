import { expect, test } from '@playwright/test';

const HAS_COMPLETED_ONBOARDING_STORAGE_KEY = 'bf-navigator-completed-onboarding';
const ACCESSIBILITY_PREFERENCE_STORAGE_KEY = 'bf-navigator-accessibility-preference';

type RegisterResponse = {
  status: number;
  body: Record<string, unknown>;
};

test.describe('Register page', () => {
  const entryRoutes = ['/register', '/register-desktop'] as const;

  async function stubRegisterAndCapturePayload(
    page: import('@playwright/test').Page,
    response: RegisterResponse
  ) {
    let payload: Record<string, unknown> | null = null;

    await page.route(/\/auth\/register$/, async (route) => {
      const postData = route.request().postData();
      payload = postData ? (JSON.parse(postData) as Record<string, unknown>) : null;

      await route.fulfill({
        body: JSON.stringify(response.body),
        contentType: 'application/json',
        status: response.status,
      });
    });

    return () => payload;
  }

  async function fillRegisterForm(page: import('@playwright/test').Page) {
    await page.getByLabel('Vorname').fill('Max');
    await page.getByLabel('Nachname').fill('Mustermann');
    await page.getByLabel('E-Mail Addresse').fill('max@example.com');
    await page.getByLabel('Passwort', { exact: true }).fill('secret1');
    await page.getByLabel('Passwort Bestätigen').fill('secret1');
    await page.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i }).check();
  }

  for (const entryRoute of entryRoutes) {
    test.describe(`entrypoint ${entryRoute}`, () => {
      test('submits successfully and redirects to login', async ({ page }) => {
        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [ACCESSIBILITY_PREFERENCE_STORAGE_KEY, 'vision']
        );

        const getPayload = await stubRegisterAndCapturePayload(page, {
          status: 201,
          body: {
            id: 1,
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com',
            accessibilityTypes: ['VISUAL_IMPAIRMENT'],
          },
        });

        await page.goto(entryRoute);
        await fillRegisterForm(page);
        await page.getByRole('button', { name: 'Konto erstellen' }).click();

        await expect(page).toHaveURL(/\/login$/);

        const payload = getPayload();
        expect(payload).toEqual({
          accessibilityTypes: ['VISUAL_IMPAIRMENT'],
          email: 'max@example.com',
          firstName: 'Max',
          lastName: 'Mustermann',
          password: 'secret1',
        });

        const hasCompletedOnboarding = await page.evaluate(
          (key) => window.localStorage.getItem(key),
          HAS_COMPLETED_ONBOARDING_STORAGE_KEY
        );
        expect(hasCompletedOnboarding).toBe('true');
      });

      test('shows required field errors and does not send request', async ({ page }) => {
        let requestCount = 0;
        await page.route(/\/auth\/register$/, async (route) => {
          requestCount += 1;
          await route.fulfill({
            body: JSON.stringify({}),
            contentType: 'application/json',
            status: 201,
          });
        });

        await page.goto(entryRoute);
        await page.getByRole('button', { name: 'Konto erstellen' }).click();

        await expect(page.getByText('Vorname ist erforderlich')).toBeVisible();
        await expect(page.getByText('Nachname ist erforderlich')).toBeVisible();
        await expect(page.getByText('E-Mail ist erforderlich')).toBeVisible();
        await expect(page.getByText('Passwort ist erforderlich')).toBeVisible();
        await expect(page.getByText('Passwort wiederholen erforderlich')).toBeVisible();
        await expect(page.getByText('Nutzungsbedingungen müssen akzeptiert werden')).toBeVisible();
        expect(requestCount).toBe(0);
      });

      test('shows conflict error message in polite status region', async ({ page }) => {
        await stubRegisterAndCapturePayload(page, {
          status: 409,
          body: {},
        });

        await page.goto(entryRoute);
        await fillRegisterForm(page);
        await page.getByRole('button', { name: 'Konto erstellen' }).click();

        const status = page.getByRole('status');
        await expect(status).toHaveAttribute('aria-live', 'polite');
        await expect(status).toContainText('Diese E-Mail-Adresse ist bereits vergeben');
        await expect(page).toHaveURL(new RegExp(`${entryRoute}$`));
      });

      test('toggles password visibility for both password fields', async ({ page }) => {
        await page.goto(entryRoute);

        const passwordInput = page.getByLabel('Passwort', { exact: true });
        const passwordRepeatInput = page.getByLabel('Passwort Bestätigen');
        const passwordToggleButton = page.locator('input#password + button');
        const passwordRepeatToggleButton = page.locator('input#passwordRepeat + button');

        await expect(passwordInput).toHaveAttribute('type', 'password');
        await expect(passwordRepeatInput).toHaveAttribute('type', 'password');

        await passwordToggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        await passwordToggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');

        await passwordRepeatToggleButton.click();
        await expect(passwordRepeatInput).toHaveAttribute('type', 'text');
        await passwordRepeatToggleButton.click();
        await expect(passwordRepeatInput).toHaveAttribute('type', 'password');
      });
    });
  }
});
