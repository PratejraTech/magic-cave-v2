import { test, expect } from '@playwright/test';

test.describe('Parent Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');

    // Mock Supabase auth for testing
    await page.addScriptTag({
      content: `
        window.mockAuth = {
          signInWithOAuth: () => Promise.resolve({ user: { id: 'parent-123' } }),
          signOut: () => Promise.resolve()
        };
      `
    });
  });

  test('Parent dashboard loads correctly', async ({ page }) => {
    // Navigate directly to dashboard with mocked auth
    await loginAsParent(page);

    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText('Parent Dashboard');
    await expect(page.locator('text=Calendar Overview')).toBeVisible();
    await expect(page.locator('text=Edit Tiles')).toBeVisible();
    await expect(page.locator('text=Export PDF')).toBeVisible();
  });

  test('Parent can edit tiles', async ({ page }) => {
    // Login first
    await loginAsParent(page);

    // Click Edit Tiles button
    await page.click('text=Edit Tiles');

    // Verify tile editor opens
    await expect(page.locator('text=Edit Calendar Tiles')).toBeVisible();

    // Select a tile
    await page.click('text=Day 1');

    // Edit tile content
    await page.fill('input[placeholder*="e.g., A Special Message"]', 'Test Title');
    await page.fill('textarea[placeholder*="Write a personal message"]', 'Test body content');

    // Save changes
    await page.click('text=Save Changes');

    // Verify tile updated in overview
    await expect(page.locator('text=Test Title')).toBeVisible();
  });

  test('Parent can assign gifts to tiles', async ({ page }) => {
    await loginAsParent(page);
    await page.click('text=Edit Tiles');
    await page.click('text=Day 1');

    // Select gift type
    await page.selectOption('select', 'sticker');

    // Add gift details
    await page.fill('input[placeholder="Gift title"]', 'Special Sticker');
    await page.fill('textarea[placeholder*="Description"]', 'A magical sticker for you!');

    // Save changes (this saves the gift)
    await page.click('text=Save Changes');

    // Verify gift indicator appears in overview
    await expect(page.locator('text=🎁')).toBeVisible();
  });

  test('Parent can export calendar as PDF', async ({ page }) => {
    await loginAsParent(page);

    // Click export button
    await page.click('text=Export PDF');

    // Verify download starts (mock the download)
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('advent-calendar');
  });

  test('Parent can view profile settings', async ({ page }) => {
    await loginAsParent(page);

    // Click profile settings button (be specific to avoid modal header)
    await page.click('button[aria-label="Profile and settings"]');

    // Verify modal opens by checking for the modal header
    await expect(page.locator('h2:has-text("Profile & Settings")')).toBeVisible();

    // Test timezone selection
    await page.selectOption('select', 'America/New_York');

    // Test notification toggle
    await page.check('input[type="checkbox"]');

    // Save settings
    await page.click('text=Save Changes');

    // Verify modal closes
    await expect(page.locator('h2:has-text("Profile & Settings")')).not.toBeVisible();
  });

  test('Parent can switch to child view', async ({ page }) => {
    await loginAsParent(page);

    // Click switch to child view
    await page.click('text=Switch to Child View');

    // Should redirect to child calendar
    await expect(page).toHaveURL('/child/calendar');
  });
});

async function loginAsParent(page: any) {
  // Use the test route that bypasses authentication
  await page.goto('/test/parent/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React to render
}