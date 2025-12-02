import { test, expect } from '@playwright/test';
import {
  openParentAuthModal,
  openChildLoginModal,
  fillParentRegistrationForm,
  fillParentLoginForm,
  fillChildLoginForm,
  mockOAuthLogin,
  generateTestUser,
  generateTestFamily
} from './test-helpers';

test.describe('Authentication Flows', () => {
  test('Parent registration with email', async ({ page }) => {
    await page.goto('/auth');
    await openParentAuthModal(page);

    const testData = generateTestUser();
    await fillParentRegistrationForm(page, testData);
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*\/parent\/dashboard/);
  });

  test('Parent login with email', async ({ page }) => {
    await page.goto('/auth');
    await openParentAuthModal(page);

    await fillParentLoginForm(page, {
      email: 'existing@example.com',
      password: 'password123'
    });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/parent\/dashboard/);
  });

  test('OAuth login with Google', async ({ page }) => {
    await mockOAuthLogin(page, 'google');
    await expect(page).toHaveURL(/.*\/parent\/dashboard/);
  });

  test('OAuth login with Facebook', async ({ page }) => {
    await mockOAuthLogin(page, 'facebook');
    await expect(page).toHaveURL(/.*\/parent\/dashboard/);
  });

  test('Child login with family UUID', async ({ page }) => {
    await page.goto('/auth');
    await openChildLoginModal(page);

    const testFamily = generateTestFamily();
    await fillChildLoginForm(page, testFamily);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/child\/calendar/);
  });

  test('Invalid login shows error', async ({ page }) => {
    await page.goto('/auth');
    await openParentAuthModal(page);

    await fillParentLoginForm(page, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('Registration validation errors', async ({ page }) => {
    await page.goto('/auth');
    await openParentAuthModal(page);

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});