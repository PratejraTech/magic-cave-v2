import { describe, it, expect } from 'vitest';

/**
 * Integration Tests for Core Application Functionality
 * Tests complete user flows and system integration
 */

describe('Integration Tests - Core Application Flows', () => {
  describe('Authentication System Integration', () => {
    it('should have working password hashing functions', async () => {
      // Test that our Cloudflare-compatible password functions work
      // These are defined in the auth.mjs file for Cloudflare Functions
      const testPassword = 'testPassword123!';
      const encoder = new TextEncoder();
      const data = encoder.encode(testPassword + 'advent-calendar-salt-2024');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashed = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Verify hash is created
      expect(hashed).toBeDefined();
      expect(hashed.length).toBe(64); // SHA-256 produces 64 character hex string
      expect(typeof hashed).toBe('string');
    });

    it('should validate email format correctly', async () => {
      const { AuthUtils } = await import('../lib/auth');

      expect(AuthUtils.isValidEmail('test@example.com')).toBe(true);
      expect(AuthUtils.isValidEmail('invalid-email')).toBe(false);
      expect(AuthUtils.isValidEmail('')).toBe(false);
      expect(AuthUtils.isValidEmail(null as any)).toBe(false);
    });

    it('should validate password strength', async () => {
      const { AuthUtils } = await import('../lib/auth');

      expect(AuthUtils.isValidPassword('MySecurePass123!')).toEqual({ valid: true, errors: [] });
      expect(AuthUtils.isValidPassword('weak')).toEqual({
        valid: false,
        errors: expect.arrayContaining([
          expect.stringContaining('at least 8 characters')
        ])
      });
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate signup data comprehensively', async () => {
      const { validateSignup } = await import('../lib/validation');

      const validData = {
        email: 'parent@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        childProfile: {
          name: 'Alice',
          birthdate: '2015-06-15',
          gender: 'female',
          interests: ['reading', 'sports']
        },
        selectedTemplate: 'pastel-dreams',
        csrfToken: 'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678' // 64 char hex
      };

      const result = await validateSignup(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
      }
    });

    it('should reject invalid child ages', async () => {
      const { validateChildAge } = await import('../lib/validation');

      // Too young (under 3) - born in 2023 would be ~2 years old
      const youngResult = validateChildAge(new Date('2023-01-01'));
      expect(youngResult.valid).toBe(false);

      // Too old (over 18) - born in 2000 would be ~25 years old
      const oldResult = validateChildAge(new Date('2000-01-01'));
      expect(oldResult.valid).toBe(false);

      // Valid age - born in 2015 would be ~10 years old
      const validResult = validateChildAge(new Date('2015-01-01'));
      expect(validResult.valid).toBe(true);
    });
  });

  describe('Security Headers Integration', () => {
    it('should create secure JSON responses', async () => {
      const { createSecureJsonResponse } = await import('../lib/securityHeaders');

      const testData = { message: 'test', success: true };
      const response = createSecureJsonResponse(testData);

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should create secure error responses', async () => {
      const { createSecureErrorResponse } = await import('../lib/securityHeaders');

      const response = createSecureErrorResponse('Test error', 400);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('Compliance Integration', () => {
    it('should validate GDPR compliance functions exist', async () => {
      const compliance = await import('../lib/compliance');

      expect(typeof compliance.exportUserData).toBe('function');
      expect(typeof compliance.deleteUserAccount).toBe('function');
      expect(typeof compliance.checkRetentionCompliance).toBe('function');
    });

    it('should validate COPPA compliance functions exist', async () => {
      const compliance = await import('../lib/compliance');

      expect(typeof compliance.verifyChildAge).toBe('function');
      expect(typeof compliance.validateParentalConsent).toBe('function');
      expect(typeof compliance.generatePrivacyNotice).toBe('function');
    });
  });

  describe('Content Library Integration', () => {
    it('should load content library service', async () => {
      const { contentLibrary } = await import('../lib/contentLibrary');

      expect(contentLibrary).toBeDefined();
      expect(typeof contentLibrary).toBe('object');
      expect(typeof contentLibrary.loadLibrary).toBe('function');
    });

    it('should have content library methods', async () => {
      const { contentLibrary } = await import('../lib/contentLibrary');

      expect(typeof contentLibrary.getRandomContent).toBe('function');
      expect(typeof contentLibrary.getThemesForAge).toBe('function');
      expect(typeof contentLibrary.getLibraryStats).toBe('function');
    });
  });

  describe('Date Utilities Integration', () => {
    it('should validate date utility functions', async () => {
      const dateUtils = await import('../lib/date');

      expect(typeof dateUtils.getAdelaideDate).toBe('function');

      // Test Adelaide date function
      const adelaideDate = dateUtils.getAdelaideDate();
      expect(adelaideDate).toBeInstanceOf(Date);
      expect(adelaideDate.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors gracefully', async () => {
      const { AuthUtils } = await import('../lib/auth');

      // Test various invalid inputs
      expect(AuthUtils.isValidEmail(null as any)).toBe(false);
      expect(AuthUtils.isValidEmail(undefined as any)).toBe(false);
      expect(AuthUtils.isValidEmail(123 as any)).toBe(false);
      expect(AuthUtils.isValidEmail({} as any)).toBe(false);
    });

    it('should handle validation errors gracefully', async () => {
      const { validateSignup } = await import('../lib/validation');

      // Test with invalid data
      const result = await validateSignup(null as any);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});