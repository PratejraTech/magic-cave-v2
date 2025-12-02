import { Page, expect } from '@playwright/test';

// Common test utilities for E2E tests

export async function loginAsParent(page: Page): Promise<void> {
  await page.goto('/auth');
  await page.click('text=Parent Sign In / Sign Up');

  // Mock successful login
  await page.evaluate(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      user: { id: 'parent-123', email: 'parent@example.com' }
    }));
    window.location.href = '/parent/dashboard';
  });

  await page.waitForURL('/parent/dashboard');
}

export async function loginAsChild(page: Page): Promise<void> {
  await page.goto('/child/login');

  // Mock child login
  await page.evaluate(() => {
    localStorage.setItem('child.auth', JSON.stringify({
      familyUuid: 'FAM-123-456',
      childId: 'child-123'
    }));
    window.location.href = '/child/calendar';
  });

  await page.waitForURL('/child/calendar');
}

export async function fillRegistrationForm(page: Page, overrides: Partial<{
  email: string;
  password: string;
  name: string;
  childName: string;
  childBirthdate: string;
  childGender: string;
}> = {}): Promise<void> {
  const defaults = {
    email: 'parent@example.com',
    password: 'password123',
    name: 'Test Parent',
    childName: 'Test Child',
    childBirthdate: '2015-01-01',
    childGender: 'unspecified'
  };

  const data = { ...defaults, ...overrides };

  await page.fill('input[name="registerEmail"]', data.email);
  await page.fill('input[name="registerPassword"]', data.password);
  await page.fill('input[name="registerName"]', data.name);
  await page.fill('input[name="childName"]', data.childName);
  await page.fill('input[name="childBirthdate"]', data.childBirthdate);
  await page.selectOption('select[name="childGender"]', data.childGender);
}

export async function createMockTile(page: Page, day: number, data: {
  title?: string;
  body?: string;
  hasMedia?: boolean;
  hasGift?: boolean;
}): Promise<void> {
  await page.click(`[data-testid="tile-day-${day}"]`);

  if (data.title) {
    await page.fill('input[name="title"]', data.title);
  }

  if (data.body) {
    await page.fill('textarea[name="body"]', data.body);
  }

  if (data.hasGift) {
    await page.selectOption('select[name="giftType"]', 'sticker');
    await page.fill('input[name="giftTitle"]', 'Test Gift');
  }

  await page.click('text=Save Changes');
}

export async function mockSupabaseAuth(page: Page): Promise<void> {
  await page.addScriptTag({
    content: `
      window.mockSupabase = {
        auth: {
          signInWithOAuth: () => Promise.resolve({ user: { id: 'test-user' } }),
          signOut: () => Promise.resolve(),
          getUser: () => Promise.resolve({ user: { id: 'test-user' } })
        }
      };
    `
  });
}

export async function waitForLoadingToComplete(page: Page): Promise<void> {
  await page.waitForSelector('.loading-spinner', { state: 'hidden' });
}

export async function expectErrorMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`)).toBeVisible();
}

export async function expectSuccessMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`)).toBeVisible();
}