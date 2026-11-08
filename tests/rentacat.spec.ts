import { test, expect } from '@playwright/test';
 
const BASE_URL = 'http://localhost:8080/';
 
// Helper: set cookies "1", "2", "3" to the given value (the page must already be open).
async function setCookies(page: Page, c1: boolean, c2: boolean, c3: boolean) {
  await page.evaluate(([a, b, c]) => {
    document.cookie = '1=' + a;
    document.cookie = '2=' + b;
    document.cookie = '3=' + c;
  }, [c1, c2, c3]);
}
 
// The cat names listing is a numbered list (<ol>) on both the Catalog and Rent-A-Cat pages.
// (The nav links are a separate bulleted list, so 'ol > li' skips them.)
const listing = (page: Page) => page.locator('.list-group-item');
 // Cat photos listing on the Catalog page (numbered list of images)
const photos = (page: Page) => page.locator('ol > li');
// TEST FIXTURE
test.beforeEach(async ({ page }) => {
  // 2. The URL https://cs1632.appspot.com/ is open on the web browser.
  await page.goto(BASE_URL);
  // 3. Cookies "1", "2", "3" are set to "false" (no cats are rented).
  await setCookies(page, false, false, false);
});
 
test('TEST-1-RESET', async ({ page }) => {
  // Preconditions: cats 1, 2, 3 are rented.
  await setCookies(page, true, true, true);
  // 1. Press the "Reset" link.
  await page.getByRole('link', { name: 'Reset' }).click();
  // Postconditions
  await expect(listing(page).nth(0)).toHaveText('ID 1. Jennyanydots');
  await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});
 
test('TEST-2-CATALOG', async ({ page }) => {
  // 1. Press the "Catalog" link.
  await page.getByRole('link', { name: 'Catalog' }).click();
  // Postcondition
  await expect(photos(page).nth(1).getByRole('img')).toHaveAttribute('src', '/images/cat2.jpg');
});
 
test('TEST-3-LISTING', async ({ page }) => {
  // 1. Press the "Catalog" link.
  await page.getByRole('link', { name: 'Catalog' }).click();
  // Postconditions
  await expect(listing(page)).toHaveCount(3);
  await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});
 
test('TEST-4-RENT-A-CAT', async ({ page }) => {
  // 1. Press the "Rent-A-Cat" link.
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  // Postconditions
  await expect(page.getByRole('button', { name: 'Rent', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return', exact: true })).toBeVisible();
});
 
test('TEST-5-RENT', async ({ page }) => {
  // 1. Press the "Rent-A-Cat" link.
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  // 2. Enter "1" into the input box for the rented cat ID.
  await page.getByRole('textbox').first().fill('1');
  // 3. Press the "Rent" button.
  await page.getByRole('button', { name: 'Rent', exact: true }).click();
  // Postconditions
  await expect(listing(page).nth(0)).toHaveText('Rented out');
  await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(listing(page).nth(2)).toHaveText('ID 3. Mistoffelees');
  await expect(page.getByText('Success!')).toBeVisible();
});
 
test('TEST-6-RETURN', async ({ page }) => {
  // Preconditions: cats 2 and 3 are rented.
  await setCookies(page, false, true, true);
  // 1. Press the "Rent-A-Cat" link.
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  // 2. Enter "2" into the input box for the returned cat ID.
  await page.getByRole('textbox').nth(1).fill('2');
  // 3. Press the "Return" button.
  await page.getByRole('button', { name: 'Return', exact: true }).click();
  // Postconditions
  await expect(listing(page).nth(0)).toHaveText('ID 1. Jennyanydots');
  await expect(listing(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(listing(page).nth(2)).toHaveText('Rented out');
  await expect(page.getByText('Success!')).toBeVisible();
});
 
test('TEST-7-FEED-A-CAT', async ({ page }) => {
  // 1. Press the "Feed-A-Cat" link.
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
  // Postcondition
  await expect(page.getByRole('button', { name: 'Feed', exact: true })).toBeVisible();
});
 
test('TEST-8-FEED', async ({ page }) => {
  // 1. Press the "Feed-A-Cat" link.
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
  // 2. Enter "6" into the input box for number of catnips.
  await page.getByRole('textbox').fill('6');
  // 3. Press the "Feed" button.
  await page.getByRole('button', { name: 'Feed', exact: true }).click();
  // Postcondition (the response takes ~7 seconds, so extend the timeout)
  await expect(page.getByText('Nom, nom, nom.')).toBeVisible({ timeout: 10000 });
});
 
test('TEST-9-GREET-A-CAT', async ({ page }) => {
  // 1. Press the "Greet-A-Cat" link.
  await page.getByRole('link', { name: 'Greet-A-Cat' }).click();
  // Postcondition
  await expect(page.getByText('Meow!Meow!Meow!')).toBeVisible();
});
 
test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
  // 1. Navigate to the /greet-a-cat/Jennyanydots URL.
  await page.goto(BASE_URL + 'greet-a-cat/Jennyanydots');
  // Postcondition
  await expect(page.getByText('Meow! from Jennyanydots.')).toBeVisible();
});
 
test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
  // Preconditions: cats 1, 2, 3 are rented.
  await setCookies(page, true, true, true);
  // 1. Press the "Feed-A-Cat" link.
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
  // Postcondition
  await expect(page.locator('body')).toHaveScreenshot();
});
