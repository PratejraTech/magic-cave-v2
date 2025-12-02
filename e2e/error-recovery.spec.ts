import { test, expect } from '@playwright/test';

test.describe('Error Recovery and Edge Cases E2E Tests', () => {
  test.setTimeout(90000); // 1.5 minutes for error scenarios

  test.describe('Network Failure Recovery', () => {
    test('User can recover from complete network loss', async ({ page }) => {
      await page.goto('/auth');

      // Simulate network going down during form submission
      await page.fill('input[name="registerEmail"]', 'test@example.com');
      await page.fill('input[name="registerPassword"]', 'password123');

      // Abort all network requests
      await page.route('**/*', route => route.abort());

      await page.click('button[type="submit"]');

      // Verify offline error message
      await expect(page.locator('text=Connection lost')).toBeVisible();
      await expect(page.locator('text=Please check your internet connection')).toBeVisible();

      // Restore network
      await page.unroute('**/*');

      // Verify recovery options
      await expect(page.locator('text=Try Again')).toBeVisible();
      await expect(page.locator('text=Go Offline')).toBeVisible();
    });

    test('User sees offline mode when network fails during use', async ({ page }) => {
      // Login first
      await loginAsParent(page);

      // Simulate network failure during normal operation
      await page.route('**/api/**', route => route.abort());

      // Try to perform an action
      await page.click('text=Edit Tiles');

      // Verify offline mode activated
      await expect(page.locator('text=You are currently offline')).toBeVisible();
      await expect(page.locator('.offline-indicator')).toBeVisible();

      // Verify limited functionality available
      await expect(page.locator('text=Work Offline')).toBeVisible();

      // Restore connection
      await page.unroute('**/api/**');

      // Verify back online
      await expect(page.locator('text=Connection restored')).toBeVisible();
    });

    test('User can queue actions for when connection returns', async ({ page }) => {
      await loginAsParent(page);

      // Go offline
      await page.context().setOffline(true);

      // Perform actions that should be queued
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');
      await page.fill('input[name="title"]', 'Offline Edit');
      await page.click('text=Save Changes');

      // Verify action queued
      await expect(page.locator('text=Changes saved locally')).toBeVisible();
      await expect(page.locator('.queued-actions-count')).toContainText('1');

      // Restore connection
      await page.context().setOffline(false);

      // Verify sync starts
      await expect(page.locator('text=Syncing changes...')).toBeVisible();

      // Verify sync completes
      await expect(page.locator('text=All changes synced')).toBeVisible();
    });
  });

  test.describe('Session Timeout and Authentication Recovery', () => {
    test('User is redirected to login when session expires', async ({ page }) => {
      await loginAsParent(page);

      // Simulate session expiry by clearing auth tokens
      await page.evaluate(() => {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      });

      // Try to access protected resource
      await page.click('text=Edit Tiles');

      // Verify redirect to login
      await page.waitForURL('/auth');
      await expect(page.locator('text=Session expired')).toBeVisible();
      await expect(page.locator('text=Please sign in again')).toBeVisible();
    });

    test('User can recover session with refresh token', async ({ page }) => {
      await loginAsParent(page);

      // Simulate token expiry but valid refresh token
      await page.evaluate(() => {
        const auth = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
        auth.access_token = 'expired-token';
        auth.refresh_token = 'valid-refresh-token';
        localStorage.setItem('supabase.auth.token', JSON.stringify(auth));
      });

      // Trigger token refresh by making an API call
      await page.click('text=Edit Tiles');

      // Verify automatic token refresh
      await expect(page.locator('text=Refreshing session...')).toBeVisible();

      // Verify continued access
      await expect(page.locator('text=Edit Calendar Tiles')).toBeVisible();
    });

    test('User sees appropriate message for concurrent session logout', async ({ page }) => {
      await loginAsParent(page);

      // Simulate logout from another session
      await page.evaluate(() => {
        // Mock API response indicating concurrent logout
        (window as any).mockConcurrentLogout = true;
      });

      // Try to perform action
      await page.click('text=Export PDF');

      // Verify concurrent logout message
      await expect(page.locator('text=You have been logged out from another device')).toBeVisible();
      await expect(page.locator('text=For security reasons, please sign in again')).toBeVisible();
    });
  });

  test.describe('Data Corruption and Recovery', () => {
    test('User can recover from corrupted local storage', async ({ page }) => {
      // Corrupt local storage data
      await page.evaluate(() => {
        localStorage.setItem('calendar-data', 'invalid-json{');
        localStorage.setItem('user-preferences', 'null');
      });

      await loginAsParent(page);

      // Verify corruption detected and recovery initiated
      await expect(page.locator('text=Data corruption detected')).toBeVisible();
      await expect(page.locator('text=Recovering your data...')).toBeVisible();

      // Verify recovery completes
      await expect(page.locator('text=Data recovered successfully')).toBeVisible();

      // Verify functionality restored
      await expect(page.locator('text=Calendar Overview')).toBeVisible();
    });

    test('User can restore from backup when data is lost', async ({ page }) => {
      await loginAsParent(page);

      // Simulate complete data loss
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Reload page
      await page.reload();

      // Verify backup restoration prompt
      await expect(page.locator('text=Welcome back!')).toBeVisible();
      await expect(page.locator('text=Restore from backup?')).toBeVisible();

      // Choose to restore
      await page.click('text=Restore Backup');

      // Verify restoration
      await expect(page.locator('text=Backup restored')).toBeVisible();
      await expect(page.locator('text=Parent Dashboard')).toBeVisible();
    });

    test('User sees conflict resolution when local and server data differ', async ({ page }) => {
      await loginAsParent(page);

      // Edit a tile locally
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');
      await page.fill('input[name="title"]', 'Local Edit');
      await page.click('text=Save Changes');

      // Simulate server having different data
      await page.evaluate(() => {
        (window as any).mockDataConflict = {
          local: { title: 'Local Edit' },
          server: { title: 'Server Edit', lastModified: '2024-12-01T10:00:00Z' }
        };
      });

      // Trigger sync
      await page.click('text=Sync Now');

      // Verify conflict detected
      await expect(page.locator('text=Data conflict detected')).toBeVisible();

      // Choose server version
      await page.click('text=Use Server Version');

      // Verify resolution
      await expect(page.locator('text=Conflict resolved')).toBeVisible();
      await expect(page.locator('text=Server Edit')).toBeVisible();
    });
  });

  test.describe('Application Crash and Recovery', () => {
    test('User can recover from JavaScript errors', async ({ page }) => {
      await loginAsParent(page);

      // Trigger JavaScript error
      await page.evaluate(() => {
        throw new Error('Simulated JavaScript error');
      });

      // Verify error boundary activates
      await expect(page.locator('text=Oops! Something went wrong')).toBeVisible();
      await expect(page.locator('text=Try Again')).toBeVisible();

      // Click recovery
      await page.click('text=Try Again');

      // Verify app recovers
      await expect(page.locator('text=Parent Dashboard')).toBeVisible();
    });

    test('User sees maintenance page during deployment', async ({ page }) => {
      // Simulate maintenance mode
      await page.route('**/*', route => {
        if (route.request().url().includes('/api/')) {
          route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Service temporarily unavailable',
              maintenance: true,
              estimatedTime: '5 minutes'
            })
          });
        } else {
          route.continue();
        }
      });

      await page.goto('/auth');

      // Verify maintenance message
      await expect(page.locator('text=System Maintenance')).toBeVisible();
      await expect(page.locator('text=We\'re currently updating the system')).toBeVisible();
      await expect(page.locator('text=Estimated time: 5 minutes')).toBeVisible();
    });

    test('User can use degraded mode when services are partially down', async ({ page }) => {
      await loginAsParent(page);

      // Simulate partial service degradation
      await page.route('**/api/chat/**', route => route.abort());
      await page.route('**/api/upload/**', route => route.abort());

      // Try to use chat (should fail gracefully)
      await page.click('button[aria-label="Chat with Daddy"]');
      await expect(page.locator('text=Chat service is temporarily unavailable')).toBeVisible();

      // Try to upload (should fail gracefully)
      await page.click('text=Edit Tiles');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./e2e/test-assets/test-image.jpg');
      await expect(page.locator('text=Upload service is temporarily unavailable')).toBeVisible();

      // Verify core functionality still works
      await expect(page.locator('text=Calendar Overview')).toBeVisible();
      await expect(page.locator('text=Edit Tiles')).toBeVisible();
    });
  });

  test.describe('Browser Compatibility and Device Issues', () => {
    test('User sees appropriate message for unsupported browser', async ({ page }) => {
      // Mock user agent for old browser
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0'
      });

      await page.goto('/auth');

      // Verify compatibility warning
      await expect(page.locator('text=Browser Not Supported')).toBeVisible();
      await expect(page.locator('text=Please update your browser')).toBeVisible();
      await expect(page.locator('text=Continue Anyway')).toBeVisible();
    });

    test('User can recover from browser storage quota exceeded', async ({ page }) => {
      await loginAsParent(page);

      // Simulate storage quota exceeded
      await page.evaluate(() => {
        // Fill localStorage to simulate quota exceeded
        for (let i = 0; i < 1000; i++) {
          localStorage.setItem(`test-${i}`, 'x'.repeat(1000));
        }
      });

      // Try to save data
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');
      await page.fill('input[name="title"]', 'Test Title');
      await page.click('text=Save Changes');

      // Verify quota error handled
      await expect(page.locator('text=Storage quota exceeded')).toBeVisible();
      await expect(page.locator('text=Clear some data to continue')).toBeVisible();

      // Verify recovery options
      await expect(page.locator('text=Clear Cache')).toBeVisible();
      await expect(page.locator('text=Manage Storage')).toBeVisible();
    });

    test('User sees appropriate message when cookies are disabled', async ({ page }) => {
      // Disable cookies
      await page.context().addCookies([]);

      await page.goto('/auth');

      // Verify cookie warning
      await expect(page.locator('text=Cookies Required')).toBeVisible();
      await expect(page.locator('text=This application requires cookies to function properly')).toBeVisible();
      await expect(page.locator('text=Please enable cookies and refresh')).toBeVisible();
    });
  });

  test.describe('Rate Limiting and Abuse Prevention', () => {
    test('User sees rate limit message when exceeding limits', async ({ page }) => {
      await page.goto('/auth');

      // Simulate rate limited response
      await page.route('**/api/auth/**', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Too many requests',
            retryAfter: 300,
            limit: 5,
            remaining: 0
          })
        });
      });

      await page.fill('input[name="registerEmail"]', 'test@example.com');
      await page.fill('input[name="registerPassword"]', 'password123');
      await page.click('button[type="submit"]');

      // Verify rate limit message
      await expect(page.locator('text=Too many requests')).toBeVisible();
      await expect(page.locator('text=Please wait 5 minutes before trying again')).toBeVisible();
    });

    test('User can see rate limit countdown', async ({ page }) => {
      await page.goto('/auth');

      // Fill and submit multiple times quickly
      for (let i = 0; i < 6; i++) {
        await page.fill('input[name="registerEmail"]', `test${i}@example.com`);
        await page.fill('input[name="registerPassword"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }

      // Verify rate limit with countdown
      await expect(page.locator('text=Rate limit exceeded')).toBeVisible();
      await expect(page.locator('.countdown-timer')).toBeVisible();
    });
  });

  test.describe('Data Validation and Sanitization Errors', () => {
    test('User sees validation errors for malformed data', async ({ page }) => {
      await loginAsParent(page);
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');

      // Try to submit with invalid data
      await page.fill('input[name="title"]', '<script>alert("xss")</script>');
      await page.fill('textarea[name="body"]', 'Valid body content');
      await page.click('text=Save Changes');

      // Verify sanitization/validation error
      await expect(page.locator('text=Invalid characters in title')).toBeVisible();
      await expect(page.locator('text=Please remove special characters')).toBeVisible();
    });

    test('User can recover from file upload errors', async ({ page }) => {
      await loginAsParent(page);
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-2"]');

      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./e2e/test-assets/invalid-file.exe');

      // Verify file validation error
      await expect(page.locator('text=Invalid file type')).toBeVisible();
      await expect(page.locator('text=Only images are allowed')).toBeVisible();

      // Try with oversized file (mock)
      await page.evaluate(() => {
        // Simulate file too large error
        const event = new CustomEvent('fileTooLarge');
        window.dispatchEvent(event);
      });

      await expect(page.locator('text=File too large')).toBeVisible();
      await expect(page.locator('text=Maximum size is 10MB')).toBeVisible();
    });

    test('User sees helpful error for network payload too large', async ({ page }) => {
      await loginAsParent(page);
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-3"]');

      // Create very large content
      const largeContent = 'x'.repeat(1000000); // 1MB of content
      await page.fill('textarea[name="body"]', largeContent);
      await page.click('text=Save Changes');

      // Verify payload size error
      await expect(page.locator('text=Content too large')).toBeVisible();
      await expect(page.locator('text=Please reduce the content size')).toBeVisible();
    });
  });

  test.describe('Progressive Enhancement and Graceful Degradation', () => {
    test('User can use basic functionality when JavaScript fails', async ({ page }) => {
      // Disable JavaScript
      await page.route('**/*.js', route => route.abort());

      await page.goto('/auth');

      // Verify basic HTML form still works
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="registerEmail"]')).toBeVisible();
      await expect(page.locator('input[name="registerPassword"]')).toBeVisible();

      // Submit should work with server-side validation
      await page.fill('input[name="registerEmail"]', 'test@example.com');
      await page.fill('input[name="registerPassword"]', 'password123');
      await page.click('button[type="submit"]');

      // Should get server response (even if JS fails)
      await expect(page.locator('text=Please enable JavaScript')).toBeVisible();
    });

    test('User sees appropriate message when WebGL fails', async ({ page }) => {
      await loginAsChild(page);

      // Mock WebGL context loss
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
          // Simulate context loss
          const event = new Event('webglcontextlost');
          canvas.dispatchEvent(event);
        }
      });

      // Verify graceful degradation
      await expect(page.locator('text=Visual effects unavailable')).toBeVisible();
      await expect(page.locator('text=Basic functionality will continue to work')).toBeVisible();

      // Verify core features still work
      await expect(page.locator('.calendar-tile')).toBeVisible();
    });

    test('User can continue when third-party services fail', async ({ page }) => {
      await loginAsChild(page);

      // Block analytics/third-party scripts
      await page.route('**/analytics/**', route => route.abort());
      await page.route('**/fonts.googleapis.com/**', route => route.abort());

      // Verify app still loads and works
      await expect(page.locator('text=Emma\'s Advent Calendar')).toBeVisible();
      await expect(page.locator('.calendar-tile')).toHaveCount(25);

      // Verify graceful degradation messages
      await expect(page.locator('text=Some features may be limited')).toBeVisible();
    });
  });

  test.describe('Unexpected User Behavior', () => {
    test('User can recover from accidental navigation away', async ({ page }) => {
      await loginAsParent(page);
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');
      await page.fill('input[name="title"]', 'Unsaved Changes');

      // Navigate away without saving
      await page.goto('/parent/dashboard');

      // Verify unsaved changes warning
      await expect(page.locator('text=You have unsaved changes')).toBeVisible();
      await expect(page.locator('text=Discard Changes')).toBeVisible();
      await expect(page.locator('text=Go Back')).toBeVisible();

      // Choose to go back
      await page.click('text=Go Back');

      // Verify changes preserved
      await expect(page.locator('input[name="title"]')).toHaveValue('Unsaved Changes');
    });

    test('User sees confirmation for destructive actions', async ({ page }) => {
      await loginAsParent(page);

      // Try to delete a tile
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');
      await page.click('text=Delete Tile');

      // Verify confirmation dialog
      await expect(page.locator('text=Are you sure?')).toBeVisible();
      await expect(page.locator('text=This action cannot be undone')).toBeVisible();
      await expect(page.locator('text=Cancel')).toBeVisible();
      await expect(page.locator('text=Delete')).toBeVisible();

      // Cancel action
      await page.click('text=Cancel');

      // Verify tile still exists
      await expect(page.locator('[data-testid="tile-day-1"]')).toBeVisible();
    });

    test('User can undo recent actions', async ({ page }) => {
      await loginAsParent(page);
      await page.click('text=Edit Tiles');
      await page.click('[data-testid="tile-day-1"]');

      // Make a change
      await page.fill('input[name="title"]', 'Original Title');
      await page.click('text=Save Changes');

      // Immediately edit again
      await page.click('[data-testid="tile-day-1"]');
      await page.fill('input[name="title"]', 'Modified Title');
      await page.click('text=Save Changes');

      // Verify undo option appears
      await expect(page.locator('text=Undo last change')).toBeVisible();

      // Click undo
      await page.click('text=Undo last change');

      // Verify reverted
      await expect(page.locator('text=Original Title')).toBeVisible();
    });
  });
});

async function loginAsParent(page: any) {
  // Use test route that bypasses authentication
  await page.goto('/test/parent/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React to render
}

async function loginAsChild(page: any) {
  // Use test route that bypasses authentication
  await page.goto('/test/child/calendar');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React to render
}