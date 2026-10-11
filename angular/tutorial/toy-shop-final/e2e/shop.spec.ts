import { expect, test } from '@playwright/test';
import { open } from './helpers';

test('the home page shows toys, and the groups filter them', async ({ page }) => {
  await open(page, '/');
  await expect(page.getByRole('heading', { name: 'All toys', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toBeVisible();

  await page.getByRole('link', { name: 'Puzzles' }).click();
  await expect(page).toHaveURL(/category=puzzles/);
  await expect(page.getByRole('link', { name: 'Jigsaw Castle' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toHaveCount(0);
});

test('searching finds a toy by name', async ({ page }) => {
  await open(page, '/');
  await page.getByRole('searchbox', { name: 'Search toys' }).fill('panda');
  await expect(page.getByRole('link', { name: 'Sleepy Panda' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toHaveCount(0);
});

test('a shopper can fill the cart, log in, and place an order', async ({ page }) => {
  await open(page, '/');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('$13.50');

  // Checkout needs a login, so the guard sends us to the login page first.
  await page.getByRole('link', { name: /Cart/ }).click();
  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fcheckout/);

  await page.getByLabel('Email').fill('mia@toys.com');
  await page.getByLabel('Password').fill('toys123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Pressing the button too early shows what is missing.
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Please type your street.')).toBeVisible();

  await page.getByLabel('Street').fill('1 Toy Lane');
  await page.getByLabel('City').fill('Toyville');
  await page.getByLabel('ZIP code').fill('12345');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByRole('heading', { name: /Thank you, mia/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('$0.00');
});

test('visitors cannot open the admin corner, but admins can', async ({ page }) => {
  await open(page, '/admin');
  await expect(page.getByRole('heading', { name: /Oops/ })).toBeVisible();

  await open(page, '/login');
  await page.getByLabel('Email').fill('admin@toys.com');
  await page.getByLabel('Password').fill('toys123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: /Admin corner/ })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});

test('the main pages open without console errors', async ({ page }) => {
  // A broken security policy (CSP), a missing file, or a crash all show up here.
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  for (const path of ['/', '/product/1', '/cart', '/wishlist', '/login', '/no-such-page']) {
    await open(page, path);
    await page.waitForLoadState('networkidle');
  }
  expect(problems).toEqual([]);
});
