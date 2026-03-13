import { test, expect } from 'playwright/test';

test.describe('Smoke tests', () => {
  test('explore page loads', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).toHaveTitle(/OSSInsight/i, { timeout: 30000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('collections page loads', async ({ page }) => {
    await page.goto('/collections');
    await expect(page).toHaveTitle(/OSSInsight/i, { timeout: 30000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('org analyze page loads', async ({ page }) => {
    await page.goto('/analyze/pingcap');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    // Check page rendered with org name
    await expect(page.locator('body')).toContainText(/pingcap/i, { timeout: 15000 });
  });

  test('repo analyze page loads', async ({ page }) => {
    await page.goto('/analyze/pingcap/tidb');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    // Check page rendered with repo name
    await expect(page.locator('body')).toContainText(/tidb/i, { timeout: 15000 });
  });
});
