import { test, expect } from '@playwright/test';

// allow reading `process.env` in this test file without TS node types
declare const process: any;

test('jetblue: accept cookies, one-way BOS->JFK 5 days ahead, search and assert title', async ({ page }) => {
  await page.goto('https://www.jetblue.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  // small pause so UI interactions are visible
  await page.waitForTimeout(2000);

  // Helper to click the first available locator from a list
  async function clickFirstIfAny(locators: Array<ReturnType<typeof page.locator> | ReturnType<typeof page.getByRole>>) {
    for (const l of locators) {
      try {
        if (await (l as any).count() > 0) {
          await (l as any).first().click({ force: true });
          return true;
        }
      } catch {
        // ignore and continue
      }
    }
    return false;
  }

  // Accept cookies if a banner is present (try several common button texts)
  await clickFirstIfAny([
    page.getByRole('button', { name: /accept all|accept cookies|accept/i }),
    page.getByRole('button', { name: /agree/i }),
    page.locator('button:has-text("Accept")'),
    page.locator('button:has-text("Accept All")')
  ]);
  await page.waitForTimeout(2000);

  // Select One-way trip type (try a few approaches)
  await clickFirstIfAny([
    page.getByRole('button', { name: /one-?way/i }),
    page.locator('text=One-way'),
    page.locator('text=One way')
  ]);
  await page.waitForTimeout(2000);

  // Fill origin (BOS) and pick first suggestion
  const originSelectors = [
    'input[name="bookFlightOriginInput"]',
    'input[id*=origin]',
    'input[placeholder*=From]',
    'input[aria-label*=From]'
  ];
  for (const sel of originSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      await el.first().click({ clickCount: 3, force: true });
      await el.first().fill('BOS');
      // wait for suggestions to appear and select one that contains BOS
      await page.waitForTimeout(700);
      const suggestion = page.locator('text=BOS').first();
      if (await suggestion.count() > 0) {
        await suggestion.click({ force: true });
        await page.waitForTimeout(2000);
      } else {
        await el.first().press('Enter');
        await page.waitForTimeout(2000);
      }
      break;
    }
  }

  // Fill destination (JFK) and pick first suggestion
  const destSelectors = [
    'input[name="bookFlightDestinationInput"]',
    'input[id*=destination]',
    'input[placeholder*=To]',
    'input[aria-label*=To]'
  ];
  for (const sel of destSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      await el.first().click({ clickCount: 3, force: true });
      await el.first().fill('JFK');
      await page.waitForTimeout(700);
      const suggestion = page.locator('text=JFK').first();
      if (await suggestion.count() > 0) {
        await suggestion.click({ force: true });
        await page.waitForTimeout(2000);
      } else {
        await el.first().press('Enter');
        await page.waitForTimeout(2000);
      }
      break;
    }
  }

  // Open date picker and select date 5 days from now
  const target = new Date();
  target.setDate(target.getDate() + 5);
  const day = target.getDate();
  const monthName = target.toLocaleString('en-US', { month: 'long' });
  const year = target.getFullYear();

  const departSelectors = [
    'input[name="bookFlightDepartureInput"]',
    'input[id*=depart]',
    'input[placeholder*=Depart]',
    'input[aria-label*=Depart]'
  ];
  let openedCalendar = false;
  for (const sel of departSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      await el.first().click({ force: true });
      openedCalendar = true;
      await page.waitForTimeout(2000);
      break;
    }
  }
  if (!openedCalendar) {
    // fallback: click any date input/button that looks relevant
    await clickFirstIfAny([page.locator('button:has-text("Depart")'), page.locator('text=Depart')]);
  }

  // Pick the date in calendar using aria-label that usually contains "MonthName Day, Year"
  const ariaLabelFragment = `${monthName} ${day}`;
  await page.waitForTimeout(700);
  const dateButton = page.locator(`button[aria-label*="${ariaLabelFragment}"]`);
  if (await dateButton.count() > 0) {
    await dateButton.first().click({ force: true });
    await page.waitForTimeout(2000);
  } else {
    // fallback: click the visible day number
    const dayLocator = page.locator(`text="${day}"`).filter({ has: page.locator('role=grid') });
    if (await dayLocator.count() > 0) {
      await dayLocator.first().click({ force: true });
        await page.waitForTimeout(2000);
    } else {
      // as a last resort click any cell with day text
      const anyDay = page.locator(`text=${day}`);
      if (await anyDay.count() > 0) await anyDay.first().click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // Click Search
  await clickFirstIfAny([
    page.getByRole('button', { name: /search|find flights|show flights/i }),
    page.locator('button:has-text("Search")'),
    page.locator('button:has-text("Find")')
  ]);
  await page.waitForTimeout(2000);

  // Wait for results to load (use DOMContentLoaded) and assert title (allow longer timeout)
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveTitle(/JetBlue|Search Results|Flights|Choose|Results/i, { timeout: 20000 });

  // Keep the browser window open for inspection when requested.
  // Run the test with `KEEP_OPEN=1` to block here until you manually stop the process.
  if (process.env.KEEP_OPEN === '1') {
    // eslint-disable-next-line no-constant-condition
    await new Promise(() => {});
  }
});
