import { test, expect } from '@playwright/test';

test('API: get book with ISBN isbn_0035 from rahulshettyacademy.com', async ({ request }) => {
  // Common API endpoints for book data
  const endpoints = [
    'https://rahulshettyacademy.com/api/books',
    'https://rahulshettyacademy.com/api/books?isbn=isbn_0035',
    'https://rahulshettyacademy.com/api/book/isbn_0035'
  ];

  let bookFound = false;
  let responseData: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await request.get(endpoint);
      
      if (response.ok()) {
        const data = await response.json();
        console.log(`✓ Endpoint: ${endpoint}`);
        console.log(`Status: ${response.status()}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));

        // Check if response contains our ISBN
        const responseString = JSON.stringify(data);
        if (responseString.includes('isbn_0035')) {
          bookFound = true;
          responseData = data;
          console.log('✓ Book with ISBN isbn_0035 found!');
          break;
        }
      }
    } catch (error) {
      console.log(`✗ Endpoint failed: ${endpoint}`);
    }
  }

  // Assert that we got a successful response
  expect(bookFound || responseData).toBeTruthy();
  console.log('API test completed');
});
