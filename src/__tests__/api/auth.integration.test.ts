import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock bcrypt first
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(() => true),
    hash: vi.fn(() => 'hashedpassword'),
  },
}));

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'test-user-id' } }, error: null })),
      admin: {
        deleteUser: vi.fn(() => ({ error: null })),
        createUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
    })),
    rpc: vi.fn(() => ({ data: true, error: null })),
  })),
}));

// Mock validation functions
vi.mock('../../../src/lib/validation.ts', () => ({
  validateSignup: vi.fn(),
  validateChildLogin: vi.fn(),
  validateProfileUpdate: vi.fn(),
  validateChildAge: vi.fn(),
}));

// Mock auth utils
vi.mock('../../../src/lib/auth', () => ({
  AuthUtils: {
    isValidEmail: vi.fn(() => true),
    sanitizeInput: vi.fn((input) => input),
    isValidBirthdate: vi.fn(() => ({ valid: true })),
    generateFamilyUUID: vi.fn(() => 'test-family-uuid'),
    generateTemporaryPassword: vi.fn(() => 'temp123'),
    isValidPassword: vi.fn(() => ({ valid: true, errors: [] })),
  },
}));

// Mock security headers
vi.mock('../../../src/lib/securityHeaders', () => ({
  createSecureJsonResponse: vi.fn(),
  createSecureErrorResponse: vi.fn(),
}));

// Mock compliance
vi.mock('../../../src/lib/compliance', () => ({
  exportUserData: vi.fn(),
}));



describe('Authentication API Integration Tests', () => {
  let supabaseClient: any;
  const mockEnv = {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  };

  beforeAll(() => {
    supabaseClient = createClient(mockEnv.SUPABASE_URL, mockEnv.SUPABASE_SERVICE_ROLE_KEY);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully create a parent account with valid data', async () => {
      // Mock validation success
      const { validateSignup } = await import('../../../src/lib/validation.ts');
      (validateSignup as any).mockResolvedValue({
        success: true,
        value: {
          email: 'parent@example.com',
          password: 'ValidPass123!',
          name: 'John Doe',
          childProfile: {
            name: 'Jane Doe',
            birthdate: '2015-06-15',
            gender: 'female',
          },
          selectedTemplate: 'pastel-dreams',
        },
      });

      // Mock child age validation
      const { validateChildAge } = await import('../../../src/lib/validation.ts');
      (validateChildAge as any).mockReturnValue({ valid: true });

      // Mock rate limiting
      supabaseClient.rpc.mockResolvedValueOnce({ data: true });

      // Mock Supabase auth signup
      supabaseClient.auth.admin = {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'parent-uuid-123' } },
        }),
      };

      // Mock database operations
      supabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      }));

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '127.0.0.1',
          'User-Agent': 'Test Browser',
        },
        body: JSON.stringify({
          email: 'parent@example.com',
          password: 'ValidPass123!',
          name: 'John Doe',
          childProfile: {
            name: 'Jane Doe',
            birthdate: '2015-06-15',
            gender: 'female',
          },
          selectedTemplate: 'pastel-dreams',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      console.log('Signup Response status:', response.status);
      console.log('Signup Response result:', result);

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.parent).toBeDefined();
      expect(result.child).toBeDefined();
      expect(result.familyUuid).toBeDefined();
    });

    it('should reject signup with invalid email', async () => {
      const { validateSignup } = await import('../../../src/lib/validation');
      (validateSignup as any).mockResolvedValue({
        success: false,
        errors: ['Invalid email format'],
      });

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'ValidPass123!',
          name: 'John Doe',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid input data');
    });

    it('should enforce rate limiting for signup attempts', async () => {
      // Mock rate limit exceeded
      supabaseClient.rpc.mockResolvedValueOnce({ data: false });

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '127.0.0.1',
        },
        body: JSON.stringify({
          email: 'parent@example.com',
          password: 'ValidPass123!',
          name: 'John Doe',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toContain('Too many signup attempts');
    });
  });

  describe('POST /api/auth/child-login', () => {
    it('should successfully authenticate child with valid credentials', async () => {
      const { validateChildLogin } = await import('../../../src/lib/validation');
      (validateChildLogin as any).mockResolvedValue({
        success: true,
        value: {
          familyUuid: 'family-uuid-123',
          password: 'childpass123',
        },
      });

      // Mock rate limiting
      supabaseClient.rpc.mockResolvedValueOnce({ data: true });

      // Mock parent lookup
      supabaseClient.from.mockImplementation((table: string) => {
        if (table === 'parents') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { parent_uuid: 'parent-uuid-123', name: 'John Doe', family_uuid: 'family-uuid-123' },
                  error: null,
                }),
              })),
            })),
          };
        }

        if (table === 'children') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    child_uuid: 'child-uuid-123',
                    name: 'Jane Doe',
                    birthdate: '2015-06-15',
                    gender: 'female',
                    interests: ['reading', 'art'],
                    selected_template: 'winter-wonderland',
                    password_hash: '$2b$12$hashedpassword',
                    login_attempts: 0,
                    locked_until: null,
                  },
                  error: null,
                }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          };
        }

        if (table === 'calendars') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    calendar_id: 'calendar-uuid-123',
                    last_tile_opened: 5,
                    settings: { theme: 'winter' },
                  },
                  error: null,
                }),
              })),
            })),
          };
        }

        return {};
      });

      // Mock bcrypt compare
      const { default: bcrypt } = await import('bcrypt');
      (bcrypt.compare as any).mockResolvedValue(true);

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/child-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '127.0.0.1',
          'User-Agent': 'Test Browser',
        },
        body: JSON.stringify({
          familyUuid: 'family-uuid-123',
          password: 'childpass123',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.child).toBeDefined();
      expect(result.child.id).toBe('child-uuid-123');
      expect(result.calendar).toBeDefined();
    });

    it('should reject login with invalid family UUID', async () => {
      const { validateChildLogin } = await import('../../../src/lib/validation');
      (validateChildLogin as any).mockResolvedValue({
        success: true,
        value: {
          familyUuid: 'invalid-family-uuid',
          password: 'childpass123',
        },
      });

      supabaseClient.from.mockImplementation((_table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          })),
        })),
      }));

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/child-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyUuid: 'invalid-family-uuid',
          password: 'childpass123',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Invalid family code');
    });

    it('should handle account lockout after failed attempts', async () => {
      const { validateChildLogin } = await import('../../../src/lib/validation');
      (validateChildLogin as any).mockResolvedValue({
        success: true,
        value: {
          familyUuid: 'family-uuid-123',
          password: 'wrongpassword',
        },
      });

      // Mock parent lookup
      supabaseClient.from.mockImplementation((table: string) => {
        if (table === 'parents') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { parent_uuid: 'parent-uuid-123', family_uuid: 'family-uuid-123' },
                  error: null,
                }),
              })),
            })),
          };
        }

        if (table === 'children') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    child_uuid: 'child-uuid-123',
                    login_attempts: 4, // One more attempt will lock
                    locked_until: null,
                  },
                  error: null,
                }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          };
        }

        return {};
      });

      // Mock bcrypt compare (wrong password)
      const { default: bcrypt } = await import('bcrypt');
      (bcrypt.compare as any).mockResolvedValue(false);

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/child-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyUuid: 'family-uuid-123',
          password: 'wrongpassword',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Invalid password');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      // Mock authenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'parent-uuid-123',
            email: 'parent@example.com',
          },
        },
        error: null,
      });

      // Mock profile data
      supabaseClient.from.mockImplementation((_table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                parent_uuid: 'parent-uuid-123',
                name: 'John Doe',
                email: 'parent@example.com',
                family_uuid: 'family-uuid-123',
              },
              error: null,
            }),
          })),
        })),
      }));

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
        },
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.profile.parent.name).toBe('John Doe');
    });

    it('should reject unauthorized profile access', async () => {
      // Mock unauthenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('should successfully delete user account and all data', async () => {
      // Mock authenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'parent-uuid-123',
          },
        },
        error: null,
      });

      // Mock admin delete user
      supabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: null,
      });

      // Mock database operations
      supabaseClient.from.mockImplementation((_table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: _table === 'parents' ? { parent_uuid: 'parent-uuid-123', family_uuid: 'family-uuid-123' } :
                   _table === 'children' ? { child_uuid: 'child-uuid-123' } :
                   { calendar_id: 'calendar-uuid-123' },
              error: null,
            }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      }));

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
        },
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Account and all associated data deleted');
    });
  });

  describe('GET /api/auth/export', () => {
    it('should export user data for GDPR compliance', async () => {
      // Mock authenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'parent-uuid-123',
          },
        },
        error: null,
      });

      // Mock export function
      const { exportUserData } = await import('../../../src/lib/compliance');
      (exportUserData as any).mockResolvedValue({
        success: true,
        data: {
          parent: { name: 'John Doe', email: 'parent@example.com' },
          child: { name: 'Jane Doe', birthdate: '2015-06-15' },
          analytics: [],
        },
      });

      // Mock security response
      const { createSecureJsonResponse } = await import('../../../src/lib/securityHeaders');
      (createSecureJsonResponse as any).mockImplementation((data: any) => {
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/export', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'CF-Connecting-IP': '127.0.0.1',
          'User-Agent': 'Test Browser',
        },
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.parent.name).toBe('John Doe');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid data', async () => {
      // Mock authenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'parent-uuid-123',
          },
        },
        error: null,
      });

      // Mock validation
      const { validateProfileUpdate } = await import('../../../src/lib/validation');
      (validateProfileUpdate as any).mockResolvedValue({
        success: true,
        value: {
          updates: {
            parent: { name: 'Updated Name' },
            child: { name: 'Updated Child Name' },
          },
          csrfToken: 'valid-csrf-token',
        },
      });

      // Mock CSRF validation
      supabaseClient.rpc.mockResolvedValue({ data: true });

      // Mock database updates
      supabaseClient.from.mockImplementation((_table: string) => ({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      }));

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: {
            parent: { name: 'Updated Name' },
            child: { name: 'Updated Child Name' },
          },
          csrfToken: 'valid-csrf-token',
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Profile updated successfully');
    });

    it('should reject profile update without CSRF token', async () => {
      // Mock authenticated user
      supabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'parent-uuid-123',
          },
        },
        error: null,
      });

      // Mock validation without CSRF token
      const { validateProfileUpdate } = await import('../../../src/lib/validation');
      (validateProfileUpdate as any).mockResolvedValue({
        success: true,
        value: {
          updates: { parent: { name: 'Updated Name' } },
          csrfToken: null,
        },
      });

      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: { parent: { name: 'Updated Name' } },
        }),
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('CSRF token required');
    });
  });

  describe('CORS handling', () => {
    it('should handle OPTIONS requests for CORS preflight', async () => {
      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'OPTIONS',
      });

      const response = await onRequest({ request, env: mockEnv });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/unknown-endpoint', {
        method: 'GET',
      });

      const response = await onRequest({ request, env: mockEnv });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('Endpoint not found');
    });

    it('should handle missing Supabase configuration', async () => {
      const { onRequest } = await import('../../../functions/api/auth.mjs' as any);

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
      });

      const response = await onRequest({ request, env: {} });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Supabase configuration missing');
    });
  });
});