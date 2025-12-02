import { vi, describe, it, expect, beforeEach } from 'vitest';
import { analytics } from '../lib/analytics';

// Mock fetch globally
global.fetch = vi.fn();

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({ ok: true });
    // Mock localStorage with auth token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => key === 'supabase.auth.token' ? '{"access_token":"mock-token"}' : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('should log login event', async () => {
    await analytics.logLogin('parent', 'google');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'login',
          metadata: { user_type: 'parent', auth_provider: 'google' },
        }),
      })
    );
  });

  it('should log signup event', async () => {
    await analytics.logSignup('email_magic_link');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'signup',
          metadata: { user_type: 'parent', auth_provider: 'email_magic_link' },
        }),
      })
    );
  });

  it('should log tile opened event', async () => {
    await analytics.logTileOpened('tile-1', 1, 'calendar-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'tile_opened',
          metadata: { tile_id: 'tile-1', day: 1 },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });

  it('should log gift unlocked event', async () => {
    await analytics.logGiftUnlocked('tile-1', 1, 'sticker', 'calendar-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'gift_unlocked',
          metadata: { tile_id: 'tile-1', day: 1, gift_type: 'sticker' },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });

  it('should log note submitted event', async () => {
    await analytics.logNoteSubmitted('tile-1', 1, 10, 'calendar-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'note_submitted',
          metadata: { tile_id: 'tile-1', day: 1, note_length: 10 },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });

  it('should log media upload event', async () => {
    await analytics.logMediaUpload('image/jpeg', 1024, 'tile-1', 'calendar-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'media_upload',
          metadata: { tile_id: 'tile-1', file_type: 'image/jpeg', file_size: 1024 },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });

  it('should log template change event', async () => {
    await analytics.logTemplateChange('new-template', 'old-template', 'calendar-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'template_change',
          metadata: { old_template_id: 'old-template', new_template_id: 'new-template' },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });

  it('should log PDF export event', async () => {
    await analytics.logPdfExport('calendar-1', 25);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          event_type: 'pdf_export',
          metadata: { calendar_id: 'calendar-1', tile_count: 25 },
          calendar_id: 'calendar-1',
        }),
      })
    );
  });
});