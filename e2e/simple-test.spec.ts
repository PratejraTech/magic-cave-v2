import { test, expect } from '@playwright/test';

test('Auth page loads and renders React content', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('/auth');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Wait for React to mount - look for the root div to have content
  await page.waitForTimeout(3000); // Give React time to mount

  // Take a screenshot to see what's actually on the page
  await page.screenshot({ path: 'test-results/auth-page.png', fullPage: true });

  // Log any errors
  if (errors.length > 0) {
    console.log('Console errors:', errors);
  }

  // Log recent logs
  if (logs.length > 0) {
    console.log('Recent console logs:', logs.slice(-5));
  }

  // Check page title
  console.log('Page title:', await page.title());

  // Check if body has content
  const bodyText = await page.textContent('body');
  console.log('Body text length:', bodyText?.length);

  // Check if root div has content
  const rootContent = await page.textContent('#root');
  console.log('Root div content length:', rootContent?.length);

  // Look for any visible text on the page
  const visibleText = await page.locator('body *').filter({ hasText: /.+/ }).allTextContents();
  console.log('Visible text elements:', visibleText.slice(0, 10));

  // Try different selectors for the welcome message
  const possibleSelectors = [
    'text=Welcome to Your Advent Calendar',
    'text=Welcome',
    'text=Parent Sign In',
    'text=Child Login',
    'h1',
    '.welcome',
    '[class*="welcome"]'
  ];

  for (const selector of possibleSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        const text = await element.textContent();
        console.log(`Found element with selector "${selector}": "${text}"`);
        break;
      }
    } catch (e) {
      // Selector not found, continue
    }
  }

  // Check if there are any buttons visible
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`Found ${buttonCount} buttons on page`);

  if (buttonCount > 0) {
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const buttonText = await buttons.nth(i).textContent();
      console.log(`Button ${i + 1}: "${buttonText}"`);
    }
  }

  // If we get here without finding expected content, the test will fail
  // but we'll have good debugging info
  const welcomeText = page.locator('text=/Welcome|Parent|Child/i');
  await expect(welcomeText.first()).toBeVisible({ timeout: 5000 });
});