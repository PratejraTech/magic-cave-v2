import { test, expect } from '@playwright/test';

test.describe('Demo E2E Tests', () => {
  test('Basic page load test', async ({ page }) => {
    await page.goto('/');

    // This test demonstrates the test framework is working
    // In a real scenario, you'd test actual app functionality
    await expect(page).toHaveTitle(/Advent Calendar/);
  });

  test('Test utilities work', async ({ }) => {
    // This demonstrates the test utilities are importable
    const { loginAsParent } = await import('./test-utils');

    // The function exists
    expect(typeof loginAsParent).toBe('function');
  });
});