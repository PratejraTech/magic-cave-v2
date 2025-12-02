import { test, expect } from '@playwright/test';
import { loginAsParent, generateTestUser, waitForCalendarTiles } from './test-helpers';

test.describe('Parent User Journey E2E Tests', () => {
  test.describe('Complete Parent Registration Flow', () => {
    test('Parent can complete full registration and setup', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Parent Sign In / Sign Up');
      await page.waitForSelector('[role="dialog"]');

      // Fill registration form
      const testData = generateTestUser();
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[type="password"]', testData.password);
      await page.fill('input[placeholder*="your name"]', testData.name);

      // Child profile
      await page.fill('input[placeholder*="child name"]', testData.childName);
      await page.fill('input[type="date"]', testData.childBirthdate);

      // Select template
      await page.click('button:has-text("Winter Wonderland")');

      // Submit
      await page.click('button[type="submit"]');

      // Verify dashboard access
      await expect(page).toHaveURL(/.*\/parent\/dashboard/);
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('Registration validates required fields', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Parent Sign In / Sign Up');
      await page.waitForSelector('[role="dialog"]');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Check validation
      await expect(page.locator('text=Email is required')).toBeVisible();
    });

    test('Registration validates child age restrictions', async ({ page }) => {
      await page.goto('/auth');
      await page.click('text=Parent Sign In / Sign Up');
      await page.waitForSelector('[role="dialog"]');

      // Fill form with underage child
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.fill('input[placeholder*="child name"]', 'Test Child');
      await page.fill('input[type="date"]', '2020-01-01'); // Too young

      await page.click('button[type="submit"]');
      await expect(page.locator('text=Child must be at least 3 years old')).toBeVisible();
    });
  });

  test.describe('Parent Dashboard Management', () => {
    test('Parent can customize calendar tiles with content', async ({ page }) => {
      await loginAsParent(page, { email: 'test@example.com', password: 'password123' });

      // Navigate to tile editor
      await page.click('button:has-text("Edit Tile")');
      await page.waitForSelector('[role="dialog"]');

      // Customize tile
      await page.fill('input[placeholder*="title"]', 'Test Title');
      await page.fill('textarea[placeholder*="message"]', 'Test message for child');

      // Upload media (mock)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./e2e/test-assets/test-image.jpg');

      // Save
      await page.click('button:has-text("Save")');

      // Verify
      await expect(page.locator('text=Test Title')).toBeVisible();
    });

    test('Parent can view calendar overview with progress tracking', async ({ page }) => {
      await loginAsParent(page, { email: 'test@example.com', password: 'password123' });

      // Check calendar overview
      await expect(page.locator('text=Advent Calendar Overview')).toBeVisible();

      // Verify tile count (should show 25 tiles)
      await waitForCalendarTiles(page, 25);

      // Check progress indicators
      await expect(page.locator('.progress-indicator')).toBeVisible();
    });

    test('Parent can assign gifts to tiles', async ({ page }) => {
      await loginAsParent(page, { email: 'test@example.com', password: 'password123' });

      // Open tile editor
      await page.click('[data-testid="tile-1"]');
      await page.waitForSelector('[role="dialog"]');

      // Select gift type
      await page.click('button:has-text("Add Gift")');
      await page.click('text=Digital Gift');

      // Configure gift
      await page.fill('input[placeholder*="gift name"]', 'Test Gift');
      await page.fill('textarea[placeholder*="description"]', 'A special surprise!');

      // Save
      await page.click('button:has-text("Save Gift")');

      // Verify gift indicator
      await expect(page.locator('.gift-indicator')).toBeVisible();
    });
  });
});