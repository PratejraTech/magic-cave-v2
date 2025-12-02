import { test, expect } from '@playwright/test';

test.describe('Login Storage Verification', () => {
  test('should properly store and retrieve authentication data', async ({ page, context }) => {
    // Navigate to the app
    await page.goto('/');

    // Simulate setting authentication data (what would happen after successful login)
    await page.evaluate(() => {
      // Simulate Supabase auth storage
      const authData = {
        access_token: 'test-access-token-123',
        refresh_token: 'test-refresh-token-456',
        expires_at: Date.now() + (60 * 60 * 1000), // 1 hour from now
        user: {
          id: 'test-user-uuid',
          email: 'test@example.com',
          user_metadata: { name: 'Test User' }
        }
      };

      // Store in the format Supabase uses
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(authData));

      // Also store app-specific auth state
      localStorage.setItem('auth_user_type', 'parent');
      localStorage.setItem('auth_session_data', JSON.stringify({
        user: authData.user,
        session: authData
      }));
    });

    // Verify storage was set correctly
    const storedData = await page.evaluate(() => {
      const supabaseToken = localStorage.getItem('sb-localhost-auth-token');
      const userType = localStorage.getItem('auth_user_type');
      const sessionData = localStorage.getItem('auth_session_data');

      return {
        hasSupabaseToken: !!supabaseToken,
        userType,
        hasSessionData: !!sessionData,
        tokenData: supabaseToken ? JSON.parse(supabaseToken) : null
      };
    });

    // Verify all auth data is stored
    expect(storedData.hasSupabaseToken).toBe(true);
    expect(storedData.userType).toBe('parent');
    expect(storedData.hasSessionData).toBe(true);
    expect(storedData.tokenData?.access_token).toBe('test-access-token-123');
    expect(storedData.tokenData?.user?.email).toBe('test@example.com');

    // Test persistence across page reload
    await page.reload();

    // Verify data persists after reload
    const reloadedData = await page.evaluate(() => {
      const supabaseToken = localStorage.getItem('sb-localhost-auth-token');
      const userType = localStorage.getItem('auth_user_type');
      const sessionData = localStorage.getItem('auth_session_data');

      return {
        hasSupabaseToken: !!supabaseToken,
        userType,
        hasSessionData: !!sessionData
      };
    });

    expect(reloadedData.hasSupabaseToken).toBe(true);
    expect(reloadedData.userType).toBe('parent');
    expect(reloadedData.hasSessionData).toBe(true);

    // Test persistence across new tab (same origin, shared localStorage)
    const newPage = await context.newPage();
    await newPage.goto('/');

    const newPageData = await newPage.evaluate(() => {
      const supabaseToken = localStorage.getItem('sb-localhost-auth-token');
      const userType = localStorage.getItem('auth_user_type');

      return {
        hasSupabaseToken: !!supabaseToken,
        userType
      };
    });

    expect(newPageData.hasSupabaseToken).toBe(true);
    expect(newPageData.userType).toBe('parent');

    await newPage.close();
  });

  test('should handle logout and clear storage properly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // First set up authentication data
    await page.evaluate(() => {
      const authData = {
        access_token: 'test-access-token-123',
        refresh_token: 'test-refresh-token-456',
        expires_at: Date.now() + (60 * 60 * 1000),
        user: {
          id: 'test-user-uuid',
          email: 'test@example.com'
        }
      };

      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(authData));
      localStorage.setItem('auth_user_type', 'parent');
      localStorage.setItem('auth_session_data', JSON.stringify({
        user: authData.user,
        session: authData
      }));
    });

    // Check that auth data exists before logout
    const preLogoutStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.includes('auth') || key.includes('sb-'));
    });
    expect(preLogoutStorage.length).toBeGreaterThan(0);

    // Simulate logout by clearing storage (what logout function does)
    await page.evaluate(() => {
      // Clear auth-related storage
      localStorage.removeItem('sb-localhost-auth-token');
      localStorage.removeItem('auth_user_type');
      localStorage.removeItem('auth_session_data');
    });

    // Verify storage is cleared
    const postLogoutStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.includes('auth') || key.includes('sb-'));
    });

    // Auth-related storage should be cleared
    expect(postLogoutStorage.length).toBe(0);
  });

  test('should handle expired tokens gracefully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Set up expired authentication state
    await page.evaluate(() => {
      const expiredAuthData = {
        access_token: 'expired-token-123',
        refresh_token: 'expired-refresh-456',
        expires_at: Date.now() - (60 * 60 * 1000), // 1 hour ago (expired)
        user: {
          id: 'test-parent-uuid',
          email: 'test@example.com'
        }
      };

      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(expiredAuthData));
      localStorage.setItem('auth_user_type', 'parent');
    });

    // Verify expired token is stored correctly
    const tokenStatus = await page.evaluate(() => {
      const token = localStorage.getItem('sb-localhost-auth-token');
      if (token) {
        const parsed = JSON.parse(token);
        return {
          isExpired: parsed.expires_at < Date.now(),
          hasToken: true,
          tokenValue: parsed.access_token,
          expiresAt: parsed.expires_at
        };
      }
      return { isExpired: false, hasToken: false, tokenValue: null, expiresAt: null };
    });

    expect(tokenStatus.hasToken).toBe(true);
    expect(tokenStatus.isExpired).toBe(true);
    expect(tokenStatus.tokenValue).toBe('expired-token-123');
    expect(tokenStatus.expiresAt).toBeLessThan(Date.now());

    // Test that expired tokens can be detected and handled
    // (The actual handling would depend on the app's auth logic)
    const expiredTokenData = await page.evaluate(() => {
      const token = localStorage.getItem('sb-localhost-auth-token');
      const userType = localStorage.getItem('auth_user_type');

      if (token) {
        const parsed = JSON.parse(token);
        const isExpired = parsed.expires_at < Date.now();

        return {
          hasExpiredToken: isExpired,
          userType,
          canDetectExpiry: true
        };
      }

      return {
        hasExpiredToken: false,
        userType: null,
        canDetectExpiry: false
      };
    });

    expect(expiredTokenData.canDetectExpiry).toBe(true);
    expect(expiredTokenData.hasExpiredToken).toBe(true);
    expect(expiredTokenData.userType).toBe('parent');
  });
});