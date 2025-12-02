import { test, expect } from '@playwright/test';
import { loginAsChild, generateTestFamily, getAvailableTiles, getLockedTiles } from './test-helpers';

test.describe('Child User Journey E2E Tests', () => {
  test.describe('Child Login and Authentication', () => {
    test('Child can login with family code and password', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Child Login 🎄');
      await page.waitForSelector('[role="dialog"]');

      const testFamily = generateTestFamily();
      await page.fill('input[placeholder*="family"]', testFamily.familyUuid);
      await page.fill('input[type="password"]', testFamily.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*\/child\/calendar/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('Child sees appropriate error for invalid family code', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Child Login 🎄');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('input[placeholder*="family"]', 'INVALID-CODE');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid family code')).toBeVisible();
    });

    test('Child account locks after failed attempts', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Child Login 🎄');
      await page.waitForSelector('[role="dialog"]');

      // Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await page.fill('input[placeholder*="family"]', 'FAM-123-456');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }

      await expect(page.locator('text=Account temporarily locked')).toBeVisible();
    });
  });

  test.describe('Child Calendar Experience', () => {
    test('Child sees personalized calendar with appropriate tiles', async ({ page }) => {
      await loginAsChild(page, { familyUuid: 'FAM-123-456', password: 'childpass123' });

      // Verify calendar title
      await expect(page.locator('text=Advent Calendar')).toBeVisible();

      // Check village scene
      await expect(page.locator('text=Xmas Village')).toBeVisible();

      // Verify tiles are present (only available ones unlocked)
      const availableTiles = await getAvailableTiles(page);
      await expect(availableTiles.first()).toBeVisible();
    });

    test('Child can unlock available tiles', async ({ page }) => {
      await loginAsChild(page, { familyUuid: 'FAM-123-456', password: 'childpass123' });

      // Click on available tile
      const availableTiles = await getAvailableTiles(page);
      await availableTiles.first().click();

      // Verify unlock modal appears
      await expect(page.locator('text=Unlock this surprise!')).toBeVisible();

      // Add optional note
      await page.fill('textarea[placeholder*="note"]', 'Thank you for the surprise!');

      // Unlock
      await page.click('button:has-text("Unlock")');

      // Verify content is revealed
      await expect(page.locator('.tile-content')).toBeVisible();
    });

    test('Child cannot access locked tiles', async ({ page }) => {
      await loginAsChild(page, { familyUuid: 'FAM-123-456', password: 'childpass123' });

      // Try to click locked tile
      const lockedTiles = await getLockedTiles(page);
      await lockedTiles.first().click();

      // Verify no modal appears and tile stays locked
      await expect(page.locator('text=Not yet available')).toBeVisible();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });
});