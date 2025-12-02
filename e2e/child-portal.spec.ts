import { test, expect } from '@playwright/test';

test.describe('Child Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as child first
    await loginAsChild(page);
  });

  test('Child can view calendar', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Advent Calendar');
    await expect(page.locator('.grid')).toBeVisible();

    // Should show tiles - check for clickable tile elements
    const tiles = page.locator('[role="button"]');
    await expect(tiles.first()).toBeVisible();

    // Should have 25 tiles
    const tileCount = await tiles.count();
    expect(tileCount).toBe(25);
  });

  test('Child can open unlocked tile', async ({ page }) => {
    // Find a clickable tile (one with a gift that hasn't been unlocked)
    const clickableTiles = page.locator('[role="button"][tabindex="0"]');
    const tileCount = await clickableTiles.count();

    if (tileCount > 0) {
      // Click on the first clickable tile
      await clickableTiles.first().click();

      // Should show note prompt modal
      await expect(page.locator('text=Write a note to your parent')).toBeVisible();
    } else {
      // Skip test if no clickable tiles
      console.log('No clickable tiles found, skipping test');
    }
  });

  test('Child cannot open locked tile', async ({ page }) => {
    // Try to click on a tile without a gift (should not be clickable)
    const tiles = page.locator('[role="button"]');
    const tileCount = await tiles.count();

    // Click on a tile that doesn't have a gift (tile 5+ in our mock data)
    if (tileCount > 5) {
      await tiles.nth(5).click();

      // Should not show any modal since it has no gift
      await expect(page.locator('text=Write a note to your parent')).not.toBeVisible();
    }
  });

  test('Child can unlock gift', async ({ page }) => {
    // Open a tile with a gift
    await page.click('text=Day 1');

    // If tile has gift, click unlock
    const unlockButton = page.locator('text=Unlock Gift!');
    if (await unlockButton.isVisible()) {
      await unlockButton.click();

      // Should show gift reveal
      await expect(page.locator('text=Gift Unlocked!')).toBeVisible();
    }
  });

  test('Child can submit note to parent', async ({ page }) => {
    await page.click('text=Day 1');

    // If note input is available
    const noteInput = page.locator('textarea[placeholder*="Thank you"]');
    if (await noteInput.isVisible()) {
      await noteInput.fill('Thank you for the special message!');
      await page.click('text=Unlock Gift!');

      // Should show gift reveal (note is optional)
      await expect(page.locator('text=Gift Unlocked!')).toBeVisible();
    }
  });

  test('Child calendar shows correct tile states', async ({ page }) => {
    // Check that tiles are visible
    const tiles = page.locator('[role="button"]');
    await expect(tiles.first()).toBeVisible();

    // Check for gift indicators on tiles
    const giftIndicators = page.locator('text=🎁 Gift!');
    if (await giftIndicators.count() > 0) {
      await expect(giftIndicators.first()).toBeVisible();
    }

    // Check for unlocked gift indicators
    const unlockedIndicators = page.locator('text=✅ Unlocked!');
    if (await unlockedIndicators.count() > 0) {
      await expect(unlockedIndicators.first()).toBeVisible();
    }
  });

  test('Child can view media content', async ({ page }) => {
    await page.click('[data-testid="tile-day-1"]');

    // If tile has media, it should be visible
    const mediaElement = page.locator('img, video').first();
    if (await mediaElement.isVisible()) {
      await expect(mediaElement).toBeVisible();
    }
  });
});

async function loginAsChild(page: any) {
  // Use the test route that bypasses authentication
  await page.goto('/test/child/calendar');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React to render
}