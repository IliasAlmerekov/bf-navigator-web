import { expect, test } from '@playwright/test';

const HAS_COMPLETED_ONBOARDING_STORAGE_KEY = 'bf-navigator-completed-onboarding';
const ACCESSIBILITY_PREFERENCE_STORAGE_KEY = 'bf-navigator-accessibility-preference';

async function setCompletedOnboarding(page: import('@playwright/test').Page) {
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(storageKey, 'true');
  }, HAS_COMPLETED_ONBOARDING_STORAGE_KEY);
}

async function selectStation(
  page: import('@playwright/test').Page,
  fieldLabel: 'Von' | 'Nach',
  typedValue: string,
  optionName: RegExp
) {
  const input = page.getByRole('combobox', { name: fieldLabel }).first();

  await input.click();
  await input.fill(typedValue);

  const option = page.getByRole('option', { name: optionName }).first();
  await expect(option).toBeVisible();
  await option.click();
}

function normalizeSearchValue(value: string | null) {
  if (!value) {
    return value;
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return value;
    }
  }

  return value;
}

test.describe('HomeSearch page', () => {
  const submitButtonName = /route suchen|optimale route finden/i;

  test('redirects to onboarding when onboarding is not completed', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('shows station-selection validation errors on empty submit', async ({ page }) => {
    await setCompletedOnboarding(page);
    await page.goto('/');

    await page.getByRole('button', { name: submitButtonName }).first().click();

    await expect(page.locator('#origin-error-desktop')).toBeVisible();
    await expect(page.locator('#origin-error-desktop')).toHaveText(
      'Bitte wählen Sie einen Startbahnhof aus den Vorschlägen aus.'
    );
    await expect(page.locator('#destination-error-desktop')).toBeVisible();
    await expect(page.locator('#destination-error-desktop')).toHaveText(
      'Bitte wählen Sie einen Zielbahnhof aus den Vorschlägen aus.'
    );
  });

  test('submits selected stations and active accessibility preference', async ({ page }) => {
    await setCompletedOnboarding(page);

    await page.route('**/api/stations/search?**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const query = requestUrl.searchParams.get('query');

      if (query === 'Ham*') {
        await route.fulfill({
          body: JSON.stringify([
            {
              city: 'Hamburg',
              evaNumber: 8002549,
              name: 'Hamburg Hbf',
              number: 1,
            },
          ]),
          contentType: 'application/json',
          status: 200,
        });
        return;
      }

      if (query === 'Köl*') {
        await route.fulfill({
          body: JSON.stringify([
            {
              city: 'Köln',
              evaNumber: 8000207,
              name: 'Köln Hbf',
              number: 1,
            },
          ]),
          contentType: 'application/json',
          status: 200,
        });
        return;
      }

      await route.fulfill({
        body: JSON.stringify([]),
        contentType: 'application/json',
        status: 200,
      });
    });

    await page.goto('/');

    await page.getByRole('button', { name: 'Eingeschränkte Mobilität' }).first().click();

    await selectStation(page, 'Von', 'Ham', /Hamburg Hbf/i);
    await selectStation(page, 'Nach', 'Köl', /Köln Hbf/i);

    await page.getByRole('button', { name: submitButtonName }).first().click();

    await expect(page).toHaveURL(/\/train-search-results/);

    const currentUrl = new URL(page.url());
    expect(normalizeSearchValue(currentUrl.searchParams.get('originName'))).toBe('Hamburg Hbf');
    expect(normalizeSearchValue(currentUrl.searchParams.get('originEva'))).toBe('8002549');
    expect(normalizeSearchValue(currentUrl.searchParams.get('destinationName'))).toBe('Köln Hbf');
    expect(normalizeSearchValue(currentUrl.searchParams.get('destinationEva'))).toBe('8000207');
    expect(normalizeSearchValue(currentUrl.searchParams.get('accessibilityPreference'))).toBe(
      'mobility'
    );

    const storedPreference = await page.evaluate(
      (storageKey) => window.localStorage.getItem(storageKey),
      ACCESSIBILITY_PREFERENCE_STORAGE_KEY
    );
    expect(storedPreference).toBe('mobility');
  });
});
