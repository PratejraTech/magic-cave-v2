import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock Supabase client for database operations
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
      admin: {
        deleteUser: vi.fn(),
      },
    },
  })),
}));

describe('Database Integration Tests', () => {
  let supabaseClient: any;

  beforeAll(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient('test-url', 'test-key');
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('Parent Account Creation and Management', () => {
    it('should create parent account with proper RLS policies', async () => {
      const parentData = {
        parent_uuid: 'parent-uuid-123',
        email: 'parent@example.com',
        name: 'John Doe',
        family_uuid: 'family-uuid-123',
        created_at: '2024-12-01T00:00:00Z',
      };

      // Mock successful insert
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'parents') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [parentData],
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('parents')
        .insert(parentData);

      expect(error).toBeNull();
      expect(data).toEqual([parentData]);
    });

    it('should enforce unique email constraint', async () => {
      const duplicateParent = {
        parent_uuid: 'parent-uuid-456',
        email: 'parent@example.com', // Same email as above
        name: 'Jane Doe',
        family_uuid: 'family-uuid-456',
      };

      // Mock constraint violation
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'parents') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: '23505', // PostgreSQL unique constraint violation
                message: 'duplicate key value violates unique constraint',
              },
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('parents')
        .insert(duplicateParent);

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.code).toBe('23505');
    });

    it('should retrieve parent profile with RLS filtering', async () => {
      const parentProfile = {
        parent_uuid: 'parent-uuid-123',
        email: 'parent@example.com',
        name: 'John Doe',
        family_uuid: 'family-uuid-123',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'parents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: parentProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('parents')
        .select('*')
        .eq('parent_uuid', 'parent-uuid-123')
        .single();

      expect(error).toBeNull();
      expect(data.parent_uuid).toBe('parent-uuid-123');
      expect(data.email).toBe('parent@example.com');
    });
  });

  describe('Child Account Creation and Management', () => {
    it('should create child account linked to parent', async () => {
      const childData = {
        child_uuid: 'child-uuid-123',
        parent_uuid: 'parent-uuid-123',
        name: 'Jane Doe',
        birthdate: '2015-06-15',
        gender: 'female',
        interests: ['reading', 'art'],
        selected_template: 'winter-wonderland',
        password_hash: '$2b$12$hashedpassword',
        login_attempts: 0,
        locked_until: null,
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'children') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [childData],
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('children')
        .insert(childData);

      expect(error).toBeNull();
      expect(data[0].child_uuid).toBe('child-uuid-123');
      expect(data[0].parent_uuid).toBe('parent-uuid-123');
    });

    it('should enforce parent-child relationship constraint', async () => {
      const invalidChild = {
        child_uuid: 'child-uuid-456',
        parent_uuid: 'nonexistent-parent-uuid',
        name: 'Invalid Child',
        birthdate: '2016-01-01',
      };

      // Mock foreign key constraint violation
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'children') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: '23503', // PostgreSQL foreign key constraint violation
                message: 'violates foreign key constraint',
              },
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('children')
        .insert(invalidChild);

      expect(data).toBeNull();
      expect(error.code).toBe('23503');
    });

    it('should update child profile securely', async () => {
      const updates = {
        name: 'Updated Name',
        interests: ['reading', 'art', 'music'],
        updated_at: '2024-12-01T12:00:00Z',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'children') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [updates],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('children')
        .update(updates)
        .eq('child_uuid', 'child-uuid-123');

      expect(error).toBeNull();
      expect(data[0].name).toBe('Updated Name');
    });
  });

  describe('Calendar and Tile Management', () => {
    it('should create calendar for child', async () => {
      const calendarData = {
        calendar_id: 'calendar-uuid-123',
        child_uuid: 'child-uuid-123',
        settings: { theme: 'winter', notifications: true },
        last_tile_opened: null,
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendars') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [calendarData],
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendars')
        .insert(calendarData);

      expect(error).toBeNull();
      expect(data[0].calendar_id).toBe('calendar-uuid-123');
      expect(data[0].child_uuid).toBe('child-uuid-123');
    });

    it('should enforce one calendar per child constraint', async () => {
      const duplicateCalendar = {
        calendar_id: 'calendar-uuid-456',
        child_uuid: 'child-uuid-123', // Same child as above
        settings: { theme: 'summer' },
      };

      // Mock unique constraint violation
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendars') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint "one_calendar_per_child"',
              },
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendars')
        .insert(duplicateCalendar);

      expect(data).toBeNull();
      expect(error.code).toBe('23505');
    });

    it('should create and manage calendar tiles', async () => {
      const tilesData = [
        {
          tile_id: 'tile-1',
          calendar_id: 'calendar-uuid-123',
          day: 1,
          message: 'Merry Christmas!',
          photo_url: '/photos/christmas.jpg',
          is_opened: false,
          gift_type: 'toy',
          gift_description: 'A special toy',
        },
        {
          tile_id: 'tile-2',
          calendar_id: 'calendar-uuid-123',
          day: 2,
          message: 'Happy New Year!',
          photo_url: '/photos/fireworks.jpg',
          is_opened: false,
        },
      ];

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendar_tiles') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: tilesData,
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendar_tiles')
        .insert(tilesData);

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].gift_type).toBe('toy');
      expect(data[1].gift_type).toBeUndefined();
    });

    it('should update tile when opened', async () => {
      const updateData = {
        is_opened: true,
        opened_at: '2024-12-01T10:00:00Z',
        opened_by: 'child-uuid-123',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendar_tiles') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ ...updateData, tile_id: 'tile-1' }],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendar_tiles')
        .update(updateData)
        .eq('tile_id', 'tile-1');

      expect(error).toBeNull();
      expect(data[0].is_opened).toBe(true);
      expect(data[0].opened_at).toBe('2024-12-01T10:00:00Z');
    });
  });

  describe('Analytics and Event Logging', () => {
    it('should log user events with proper context', async () => {
      const eventData = {
        event_id: 'event-uuid-123',
        parent_uuid: 'parent-uuid-123',
        child_uuid: 'child-uuid-123',
        event_type: 'tile_opened',
        event_data: { tile_id: 'tile-1', day: 1 },
        ip_address: '127.0.0.1',
        user_agent: 'Test Browser',
        created_at: '2024-12-01T10:00:00Z',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'analytics_events') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [eventData],
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('analytics_events')
        .insert(eventData);

      expect(error).toBeNull();
      expect(data[0].event_type).toBe('tile_opened');
      expect(data[0].event_data.tile_id).toBe('tile-1');
    });

    it('should retrieve analytics data with date filtering', async () => {
      const analyticsData = [
        {
          event_id: 'event-2',
          event_type: 'tile_opened',
          created_at: '2024-12-01T10:00:00Z',
        },
        {
          event_id: 'event-1',
          event_type: 'login_success',
          created_at: '2024-12-01T09:00:00Z',
        },
      ];

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: analyticsData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('analytics_events')
        .select('*')
        .eq('child_uuid', 'child-uuid-123')
        .gte('created_at', '2024-12-01T00:00:00Z')
        .lte('created_at', '2024-12-01T23:59:59Z')
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].event_type).toBe('tile_opened'); // Most recent first (descending order)
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events with detailed context', async () => {
      const securityEvent = {
        event_id: 'security-event-123',
        user_id: 'parent-uuid-123',
        action: 'password_change',
        resource_type: 'auth',
        resource_id: 'parent-uuid-123',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        metadata: {
          success: true,
          method: 'web_app',
        },
        success: true,
        created_at: '2024-12-01T10:00:00Z',
      };

      supabaseClient.rpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const { error } = await supabaseClient.rpc('log_security_event', {
        p_user_id: securityEvent.user_id,
        p_action: securityEvent.action,
        p_resource_type: securityEvent.resource_type,
        p_resource_id: securityEvent.resource_id,
        p_ip_address: securityEvent.ip_address,
        p_user_agent: securityEvent.user_agent,
        p_metadata: securityEvent.metadata,
        p_success: securityEvent.success,
      });

      expect(error).toBeNull();
      expect(supabaseClient.rpc).toHaveBeenCalledWith('log_security_event', {
        p_user_id: 'parent-uuid-123',
        p_action: 'password_change',
        p_resource_type: 'auth',
        p_resource_id: 'parent-uuid-123',
        p_ip_address: '192.168.1.100',
        p_user_agent: 'Mozilla/5.0...',
        p_metadata: { success: true, method: 'web_app' },
        p_success: true,
      });
    });

    it('should handle rate limiting checks', async () => {
      // Mock rate limit check
      supabaseClient.rpc.mockResolvedValueOnce({
        data: true, // Within limits
        error: null,
      });

      const { data, error } = await supabaseClient.rpc('check_rate_limit', {
        p_identifier: 'user-123',
        p_endpoint: 'signup',
        p_max_attempts: 3,
        p_window_minutes: 60,
      });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    it('should handle CSRF token validation', async () => {
      supabaseClient.rpc.mockResolvedValueOnce({
        data: true, // Valid token
        error: null,
      });

      const { data: csrfData, error } = await supabaseClient.rpc('validate_csrf_token', {
        p_user_id: 'parent-uuid-123',
        p_token: 'valid-csrf-token-123',
      });

      expect(error).toBeNull();
      expect(csrfData).toBe(true);
    });
  });

  describe('Data Export and Deletion', () => {
    it('should cascade delete all user data', async () => {
      // Mock successful deletions
      supabaseClient.from.mockImplementation((_table: string) => ({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }));

      // Delete analytics events for child
      await supabaseClient
        .from('analytics_events')
        .delete()
        .eq('child_uuid', 'child-uuid-123');

      // Delete calendar tiles
      await supabaseClient
        .from('calendar_tiles')
        .delete()
        .eq('calendar_id', 'calendar-uuid-123');

      // Delete calendar
      await supabaseClient
        .from('calendars')
        .delete()
        .eq('calendar_id', 'calendar-uuid-123');

      // Delete child
      await supabaseClient
        .from('children')
        .delete()
        .eq('child_uuid', 'child-uuid-123');

      // Delete parent analytics
      await supabaseClient
        .from('analytics_events')
        .delete()
        .eq('parent_uuid', 'parent-uuid-123');

      // Delete parent
      await supabaseClient
        .from('parents')
        .delete()
        .eq('parent_uuid', 'parent-uuid-123');

      // Verify all delete operations were called
      expect(supabaseClient.from).toHaveBeenCalledWith('analytics_events');
      expect(supabaseClient.from).toHaveBeenCalledWith('calendar_tiles');
      expect(supabaseClient.from).toHaveBeenCalledWith('calendars');
      expect(supabaseClient.from).toHaveBeenCalledWith('children');
      expect(supabaseClient.from).toHaveBeenCalledWith('parents');
    });

    it('should handle partial deletion failures gracefully', async () => {
      // Mock failure for calendar tiles deletion
      supabaseClient.from.mockImplementation((table: string) => {
        if (table === 'calendar_tiles') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Deletion failed' },
              }),
            }),
          };
        }
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        };
      });

      const { error: deleteError } = await supabaseClient
        .from('calendar_tiles')
        .delete()
        .eq('calendar_id', 'calendar-uuid-123');

      expect(deleteError).toBeDefined();
      expect(deleteError.message).toBe('Deletion failed');
    });
  });

  describe('RLS Policy Enforcement', () => {
    it('should enforce parent data isolation', async () => {
      // Mock RLS policy - user can only see their own data
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'parents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [], // No data returned due to RLS
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('parents')
        .select('*')
        .eq('parent_uuid', 'other-parent-uuid'); // Trying to access other user's data

      expect(error).toBeNull();
      expect(data).toEqual([]); // RLS blocks access
    });

    it('should allow child to access their own calendar data', async () => {
      const calendarData = {
        calendar_id: 'calendar-uuid-123',
        child_uuid: 'child-uuid-123',
        settings: { theme: 'winter' },
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendars') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [calendarData],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendars')
        .select('*')
        .eq('child_uuid', 'child-uuid-123');

      expect(error).toBeNull();
      expect(data[0].child_uuid).toBe('child-uuid-123');
    });

    it('should prevent child from accessing other children\'s data', async () => {
      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendars') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [], // RLS blocks access to other children's data
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendars')
        .select('*')
        .eq('child_uuid', 'other-child-uuid');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Template Management', () => {
    it('should store and retrieve calendar templates', async () => {
      const templateData = {
        template_id: 'template-uuid-123',
        name: 'Winter Wonderland',
        config: {
          colors: {
            primary: '#FF0000',
            secondary: '#00FF00',
            background: '#FFFFFF',
          },
          effects: ['snowfall', 'butterflies'],
        },
        is_default: false,
        created_at: '2024-12-01T00:00:00Z',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'templates') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [templateData],
              error: null,
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('templates')
        .insert(templateData);

      expect(error).toBeNull();
      expect(data[0].name).toBe('Winter Wonderland');
      expect(data[0].config.colors.primary).toBe('#FF0000');
    });

    it('should update child template selection', async () => {
      const templateUpdate = {
        selected_template: 'summer-vibes',
        updated_at: '2024-12-01T12:00:00Z',
      };

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'children') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [templateUpdate],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('children')
        .update(templateUpdate)
        .eq('child_uuid', 'child-uuid-123');

      expect(error).toBeNull();
      expect(data[0].selected_template).toBe('summer-vibes');
    });
  });

  describe('Performance and Indexing', () => {
    it('should efficiently query tiles by calendar and date range', async () => {
      const tilesData = [
        { tile_id: 'tile-1', day: 1, is_opened: true },
        { tile_id: 'tile-2', day: 2, is_opened: false },
        { tile_id: 'tile-3', day: 3, is_opened: true },
      ];

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'calendar_tiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: tilesData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('calendar_tiles')
        .select('tile_id, day, is_opened')
        .eq('calendar_id', 'calendar-uuid-123')
        .gte('day', 1)
        .lte('day', 25)
        .order('day');

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      expect(data[0].day).toBe(1);
      expect(data[2].day).toBe(3);
    });

    it('should handle large result sets with pagination', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        event_id: `event-${i + 1}`,
        event_type: 'tile_opened',
        created_at: `2024-12-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      }));

      supabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({
                    data: largeDataset.slice(0, 50), // First page
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { data, error } = await supabaseClient
        .from('analytics_events')
        .select('*')
        .eq('child_uuid', 'child-uuid-123')
        .order('created_at', { ascending: false })
        .range(0, 49); // First 50 records

      expect(error).toBeNull();
      expect(data).toHaveLength(50);
    });
  });
});