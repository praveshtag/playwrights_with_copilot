import { test, expect } from '@playwright/test';

test('navigate to jetblue.com', async ({ page }) => {
  await page.goto('https://www.jetblue.com/');
  await expect(page).toHaveURL(/jetblue\.com/);
  await expect(page).toHaveTitle(/jetblue/i);
});
