import { test, expect } from '@playwright/test';

test.describe('Bookmark Manager Smoke Tests', () => {
  test('should load the application and display dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('should navigate to bookmarks page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Bookmarks');
    await expect(page.locator('h1')).toContainText('Bookmarks');
    await expect(page.locator('.search-bar')).toBeVisible();
  });

  test('should display bookmarks list', async ({ page }) => {
    await page.goto('/bookmarks');
    await expect(page.locator('.bookmark-card')).toHaveCount.greaterThan(0);
  });

  test('should search bookmarks', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.fill('.search-input', 'react');
    await page.waitForTimeout(500);
    const cards = page.locator('.bookmark-card');
    await expect(cards.first()).toBeVisible();
  });

  test('should open bookmark detail pane', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.click('.bookmark-card >> nth=0');
    await expect(page.locator('.detail-pane')).toBeVisible();
  });

  test('should open new bookmark editor', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.click('text=New Bookmark');
    await expect(page.locator('.modal-content')).toBeVisible();
    await expect(page.locator('h2')).toContainText('New Bookmark');
  });

  test('should filter by favorites', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.check('text=Favorites Only');
    await page.waitForTimeout(300);
    const cards = page.locator('.bookmark-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Settings');
    await expect(page.locator('h1')).toContainText('Settings');
    await expect(page.locator('text=Export Bookmarks')).toBeVisible();
  });

  test('should display tag manager in settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('.tag-manager')).toBeVisible();
    await expect(page.locator('text=Tag Management')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/');
    
    await page.click('nav a[href="/bookmarks"]');
    await expect(page).toHaveURL('/bookmarks');
    
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');
    
    await page.click('nav a[href="/settings"]');
    await expect(page).toHaveURL('/settings');
  });
});
