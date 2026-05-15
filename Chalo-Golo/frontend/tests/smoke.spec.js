import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('landing loads Chalo Golo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1', { hasText: 'Chalo Golo' })).toBeVisible();
});

test('demo mode reaches dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Live Demo' }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Good')).toBeVisible();
  await expect(page.locator('img[src*="/images/profile-pictures/"]').first()).toBeVisible();
});

test('browser back and forward preserve SPA routes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Live Demo' }).first().click();
  await page.getByRole('button', { name: 'Community' }).click();
  await expect(page).toHaveURL(/\/community$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/community$/);
});

test('deep routes refresh without crashing', async ({ page }) => {
  await page.goto('/battle');
  await expect(page.getByText('Neural Sprint Battle')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Neural Sprint Battle')).toBeVisible();
});

test('battle mode reaches realtime simulation screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Live Demo' }).first().click();
  await page.getByRole('button', { name: /Battle/ }).click();
  await expect(page.getByText('VERSUS MODE')).toBeVisible();
  await expect(page.getByText('ByteBoss AI')).toBeVisible();
});

test('presence and mute controls are interactive', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Live Demo' }).first().click();
  await page.getByRole('button', { name: 'Community' }).click();
  await page.getByRole('button', { name: /Online/ }).click();
  await expect(page.getByRole('button', { name: /Offline/ })).toBeVisible();
  await page.goBack();
  await page.getByTitle('Mute sound effects').click();
  await expect(page.getByTitle('Unmute sound effects')).toBeVisible();
});
