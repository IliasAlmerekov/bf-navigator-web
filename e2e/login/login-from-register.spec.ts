import { expect, test } from '@playwright/test';

const AUTH_TOKEN_STORAGE_KEY = 'bf-navigator-auth-token';
const LOGIN_INVALID_CREDENTIALS_MESSAGE = 'E-Mail oder Passwort ungültig';

type RegisteredUser = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

async function stubRegister(page: import('@playwright/test').Page, registeredUser: RegisteredUser) {
  await page.route(/\/auth\/register$/, async (route) => {
    const rawPostData = route.request().postData();
    const payload = rawPostData ? (JSON.parse(rawPostData) as Record<string, unknown>) : null;

    expect(payload).toEqual({
      accessibilityTypes: [],
      email: registeredUser.email,
      firstName: registeredUser.firstName,
      lastName: registeredUser.lastName,
      password: registeredUser.password,
    });

    await route.fulfill({
      body: JSON.stringify({
        accessibilityTypes: [],
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        id: 10,
        lastName: registeredUser.lastName,
      }),
      contentType: 'application/json',
      status: 201,
    });
  });
}

async function stubLogin(page: import('@playwright/test').Page, registeredUser: RegisteredUser) {
  await page.route(/\/auth\/login$/, async (route) => {
    const rawPostData = route.request().postData();
    const payload = rawPostData
      ? (JSON.parse(rawPostData) as { email?: string; password?: string })
      : {};

    const credentialsMatch =
      payload.email === registeredUser.email && payload.password === registeredUser.password;

    if (!credentialsMatch) {
      await route.fulfill({
        body: JSON.stringify({}),
        contentType: 'application/json',
        status: 401,
      });
      return;
    }

    await route.fulfill({
      body: JSON.stringify({ token: 'test-token-123' }),
      contentType: 'application/json',
      status: 200,
    });
  });
}

async function registerViaForm(
  page: import('@playwright/test').Page,
  registeredUser: RegisteredUser
) {
  await page.goto('/register');
  await page.getByLabel('Vorname').fill(registeredUser.firstName);
  await page.getByLabel('Nachname').fill(registeredUser.lastName);
  await page.getByLabel('E-Mail Addresse').fill(registeredUser.email);
  await page.getByLabel('Passwort', { exact: true }).fill(registeredUser.password);
  await page.getByLabel('Passwort Bestätigen').fill(registeredUser.password);
  await page.getByRole('checkbox', { name: /ich stimme den nutzungsbedingungen zu/i }).check();
  await page.getByRole('button', { name: 'Konto erstellen' }).click();

  await expect(page).toHaveURL(/\/login$/);
}

test.describe('Login with credentials from Register', () => {
  test('registers a new user and logs in with the same credentials', async ({ page }) => {
    const registeredUser = {
      email: 'max@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      password: 'secret1',
    };

    await stubRegister(page, registeredUser);
    await stubLogin(page, registeredUser);
    await registerViaForm(page, registeredUser);

    await page.getByLabel('E-Mail-Adresse').fill(registeredUser.email);
    await page.getByLabel('Passwort', { exact: true }).fill(registeredUser.password);
    await page.getByRole('button', { name: /^anmelden$/i }).click();

    await expect(page).toHaveURL(/\/$/);

    const storedToken = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      AUTH_TOKEN_STORAGE_KEY
    );
    expect(storedToken).toBe('test-token-123');
  });

  test('shows invalid credentials error when logging in with a wrong password after register', async ({
    page,
  }) => {
    const registeredUser = {
      email: 'lara@example.com',
      firstName: 'Lara',
      lastName: 'Musterfrau',
      password: 'secret1',
    };

    await stubRegister(page, registeredUser);
    await stubLogin(page, registeredUser);
    await registerViaForm(page, registeredUser);

    await page.getByLabel('E-Mail-Adresse').fill(registeredUser.email);
    await page.getByLabel('Passwort', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: /^anmelden$/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('status')).toContainText(LOGIN_INVALID_CREDENTIALS_MESSAGE);

    const storedToken = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      AUTH_TOKEN_STORAGE_KEY
    );
    expect(storedToken).toBeNull();
  });
});
