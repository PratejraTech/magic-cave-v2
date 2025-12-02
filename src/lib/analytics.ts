import { AnalyticsEventType, AnalyticsEventMetadata, GiftType } from '../types/advent';

/**
 * Analytics utility for logging user events
 */
class Analytics {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }

  /**
   * Log an analytics event
   */
  async logEvent(
    eventType: AnalyticsEventType,
    metadata: AnalyticsEventMetadata,
    options?: {
      calendarId?: string;
      parentUuid?: string;
      childUuid?: string;
    }
  ): Promise<void> {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        console.warn('No auth token found, skipping analytics event');
        return;
      }

      const response = await fetch(`${this.baseUrl}/functions/v1/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
        },
        body: JSON.stringify({
          event_type: eventType,
          metadata,
          calendar_id: options?.calendarId,
          parent_uuid: options?.parentUuid,
          child_uuid: options?.childUuid,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log analytics event:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }

  /**
   * Convenience methods for specific events
   */
  async logLogin(userType: 'parent' | 'child', authProvider?: 'google' | 'facebook' | 'email_magic_link'): Promise<void> {
    await this.logEvent('login', { user_type: userType, auth_provider: authProvider });
  }

  async logSignup(authProvider: 'google' | 'facebook' | 'email_magic_link'): Promise<void> {
    await this.logEvent('signup', { user_type: 'parent', auth_provider: authProvider });
  }

  async logTileOpened(tileId: string, day: number, calendarId?: string): Promise<void> {
    await this.logEvent('tile_opened', { tile_id: tileId, day }, { calendarId });
  }

  async logGiftUnlocked(tileId: string, day: number, giftType: GiftType, calendarId?: string): Promise<void> {
    await this.logEvent('gift_unlocked', { tile_id: tileId, day, gift_type: giftType }, { calendarId });
  }

  async logNoteSubmitted(tileId: string, day: number, noteLength: number, calendarId?: string): Promise<void> {
    await this.logEvent('note_submitted', { tile_id: tileId, day, note_length: noteLength }, { calendarId });
  }

  async logMediaUpload(fileType: string, fileSize: number, tileId?: string, calendarId?: string): Promise<void> {
    await this.logEvent('media_upload', { tile_id: tileId, file_type: fileType, file_size: fileSize }, { calendarId });
  }

  async logTemplateChange(newTemplateId: string, oldTemplateId?: string, calendarId?: string): Promise<void> {
    await this.logEvent('template_change', { old_template_id: oldTemplateId, new_template_id: newTemplateId }, { calendarId });
  }

  async logPdfExport(calendarId: string, tileCount: number): Promise<void> {
    await this.logEvent('pdf_export', { calendar_id: calendarId, tile_count: tileCount }, { calendarId });
  }

  async logNotificationSent(notificationType: string, scheduledFor: string, calendarId?: string): Promise<void> {
    await this.logEvent('notification_sent', { notification_type: notificationType, scheduled_for: scheduledFor }, { calendarId });
  }

  async logNotificationClicked(notificationType: string, calendarId?: string): Promise<void> {
    await this.logEvent('notification_clicked', { notification_type: notificationType }, { calendarId });
  }
}

export const analytics = new Analytics();