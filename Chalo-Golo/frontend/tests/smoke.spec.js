import { test, expect } from '@playwright/test';

test('landing loads Chalo Golo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1', { hasText: 'Chalo Golo' })).toBeVisible();
});

test('demo mode reaches dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Live Demo' }).first().click();
  await expect(page.getByText('Chalo Golo').first()).toBeVisible();
});
