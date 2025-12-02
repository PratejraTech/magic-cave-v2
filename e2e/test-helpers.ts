import { Page, expect } from '@playwright/test';

// Modal interaction helpers
export const openParentAuthModal = async (page: Page) => {
  await page.click('text=Parent Sign In / Sign Up');
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
};

export const openChildLoginModal = async (page: Page) => {
  await page.click('text=Child Login 🎄');
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
};

// Form filling helpers
export const fillParentRegistrationForm = async (page: Page, data: {
  email: string;
  password: string;
  name: string;
  childName: string;
  childBirthdate: string;
}) => {
  // Switch to register mode if not already
  await page.click('text=Create Family Account').catch(() => {
    // Already in register mode
  });

  await page.fill('input[type="email"]', data.email);
  await page.fill('input[type="password"]', data.password);
  await page.fill('input[placeholder*="your name"]', data.name);

  // Child information
  await page.fill('input[placeholder*="child name"]', data.childName);
  await page.fill('input[type="date"]', data.childBirthdate);
};

export const fillParentLoginForm = async (page: Page, data: {
  email: string;
  password: string;
}) => {
  // Switch to login mode
  await page.click('text=Already have an account?');

  await page.fill('input[type="email"]', data.email);
  await page.fill('input[type="password"]', data.password);
};

export const fillChildLoginForm = async (page: Page, data: {
  familyUuid: string;
  password: string;
}) => {
  await page.fill('input[placeholder*="family"]', data.familyUuid);
  await page.fill('input[type="password"]', data.password);
};

// Authentication helpers
export const loginAsParent = async (page: Page, credentials: {email: string, password: string}) => {
  await page.goto('/auth');
  await openParentAuthModal(page);
  await fillParentLoginForm(page, credentials);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/parent/dashboard');
};

export const loginAsChild = async (page: Page, credentials: {familyUuid: string, password: string}) => {
  await page.goto('/auth');
  await openChildLoginModal(page);
  await fillChildLoginForm(page, credentials);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/child/calendar');
};

// OAuth helpers
export const mockOAuthLogin = async (page: Page, provider: 'google' | 'facebook') => {
  await openParentAuthModal(page);

  const buttonText = provider === 'google' ? 'Continue with Google' : 'Continue with Facebook';
  await page.click(`button:has-text("${buttonText}")`);

  // Mock successful OAuth redirect
  await page.goto('/auth/callback?code=mock_oauth_code');
  await page.waitForURL('**/parent/dashboard');
};

// Calendar helpers
export const waitForCalendarTiles = async (page: Page, expectedCount: number = 25) => {
  await page.waitForSelector('[data-testid="calendar-tile"]', { timeout: 10000 });
  await page.waitForFunction(
    (count) => document.querySelectorAll('[data-testid="calendar-tile"]').length === count,
    expectedCount
  );
};

export const getAvailableTiles = async (page: Page) => {
  return page.locator('[data-testid="available-tile"]');
};

export const getLockedTiles = async (page: Page) => {
  return page.locator('[data-testid="locked-tile"]');
};

// Error and validation helpers
export const expectValidationError = async (page: Page, errorText: string) => {
  await expect(page.locator(`text=${errorText}`)).toBeVisible();
};

export const expectNoValidationError = async (page: Page, errorText: string) => {
  await expect(page.locator(`text=${errorText}`)).not.toBeVisible();
};

// Utility helpers
export const waitForLoading = async (page: Page) => {
  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'));
};

export const dismissModal = async (page: Page) => {
  await page.click('[aria-label="Close"]');
  await page.waitForSelector('[role="dialog"]', { state: 'detached' });
};

// Test data generators
export const generateTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'SecurePass123!',
  name: 'Test User',
  childName: 'Test Child',
  childBirthdate: '2015-12-01'
});

export const generateTestFamily = () => ({
  familyUuid: `FAM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  password: 'childpass123'
});

// Environment helpers
export const isCI = () => process.env.CI === 'true';
export const isDev = () => process.env.NODE_ENV === 'development';

// Screenshot helpers for debugging
export const takeScreenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
};

// Performance helpers
export const measurePageLoad = async (page: Page): Promise<number> => {
  const startTime = Date.now();
  await page.waitForLoadState('networkidle');
  return Date.now() - startTime;
};