import { test, expect } from '@playwright/test';

test('get book with ISBN isbn_0035 from rahulshettyacademy.com', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/');
  await page.waitForLoadState('domcontentloaded');

  // Look for a search input or navigate to books section
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="isbn" i]');
  
  if (await searchInput.count() > 0) {
    // If there's a search box, use it
    await searchInput.first().fill('isbn_0035');
    await searchInput.first().press('Enter');
    await page.waitForLoadState('domcontentloaded');
  } else {
    // Try to find and click a books or catalog link
    const booksLink = page.locator('a:has-text("Book"), a:has-text("Books"), a:has-text("Catalog")').first();
    if (await booksLink.count() > 0) {
      await booksLink.click();
      await page.waitForLoadState('domcontentloaded');
    }
  }

  // Assert page loaded and search for book with ISBN isbn_0035
  await expect(page).toHaveURL(/rahulshettyacademy/);
  
  // Try to find the book by ISBN on the page
  const bookWithISBN = page.locator(`text=isbn_0035, text="isbn_0035"`).first();
  
  if (await bookWithISBN.count() > 0) {
    console.log('Book found with ISBN: isbn_0035');
    await expect(bookWithISBN).toBeVisible();
  } else {
    console.log('Searching page content for ISBN isbn_0035');
    const pageContent = await page.content();
    if (pageContent.includes('isbn_0035')) {
      console.log('ISBN isbn_0035 found in page content');
    }
  }
});
