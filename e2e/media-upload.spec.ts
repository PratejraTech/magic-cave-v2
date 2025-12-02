import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Media Upload Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsParent(page);
    await page.click('text=Edit Tiles');
    await page.click('[data-testid="tile-day-1"]');
  });

  test('Parent can upload image to tile', async ({ page }) => {
    // Create a test image file
    const testImagePath = path.join(__dirname, '../test-assets/test-image.jpg');

    // Upload image
    await page.setInputFiles('input[type="file"]', testImagePath);

    // Wait for upload to complete
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).not.toBeVisible();

    // Verify image appears in preview
    await expect(page.locator('img')).toBeVisible();

    // Save changes
    await page.click('text=Save Changes');

    // Verify image persists in tile overview
    await expect(page.locator('[data-testid="tile-1-media"]')).toBeVisible();
  });

  test('Parent can upload video to tile', async ({ page }) => {
    const testVideoPath = path.join(__dirname, '../test-assets/test-video.mp4');

    await page.setInputFiles('input[type="file"]', testVideoPath);

    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).not.toBeVisible();

    await expect(page.locator('video')).toBeVisible();

    await page.click('text=Save Changes');
    await expect(page.locator('[data-testid="tile-1-media"]')).toBeVisible();
  });

  test('Upload validation - file size limit', async ({ page }) => {
    // Create a large test file (over limit)
    const largeFilePath = path.join(__dirname, '../test-assets/large-file.jpg');

    await page.setInputFiles('input[type="file"]', largeFilePath);

    // Should show error message
    await expect(page.locator('text=File size too large')).toBeVisible();
  });

  test('Upload validation - invalid file type', async ({ page }) => {
    const invalidFilePath = path.join(__dirname, '../test-assets/invalid-file.exe');

    await page.setInputFiles('input[type="file"]', invalidFilePath);

    // Should show error message
    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });

  test('Parent can remove uploaded media', async ({ page }) => {
    // First upload an image
    const testImagePath = path.join(__dirname, '../test-assets/test-image.jpg');
    await page.setInputFiles('input[type="file"]', testImagePath);
    await expect(page.locator('img')).toBeVisible();

    // Click remove button
    await page.click('text=Remove');

    // Image should be gone
    await expect(page.locator('img')).not.toBeVisible();

    // Upload input should be visible again
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('Media upload progress indicator', async ({ page }) => {
    const testImagePath = path.join(__dirname, '../test-assets/test-image.jpg');

    // Start upload
    await page.setInputFiles('input[type="file"]', testImagePath);

    // Should show progress
    await expect(page.locator('.upload-progress')).toBeVisible();

    // Should complete
    await expect(page.locator('.upload-progress')).not.toBeVisible();
  });

  test('Multiple file upload handling', async ({ page }) => {
    const testFiles = [
      path.join(__dirname, '../test-assets/test-image1.jpg'),
      path.join(__dirname, '../test-assets/test-image2.jpg')
    ];

    // Try to upload multiple files
    await page.setInputFiles('input[type="file"]', testFiles);

    // Should only accept first file or show error
    await expect(page.locator('img')).toHaveCount(1);
  });
});

async function loginAsParent(page: any) {
  await page.goto('/auth');
  await page.click('text=Parent Sign In / Sign Up');
  await page.evaluate(() => {
    localStorage.setItem('supabase.auth.token', '{"access_token": "mock-token"}');
    window.location.href = '/parent/dashboard';
  });
  await page.waitForURL('/parent/dashboard');
}