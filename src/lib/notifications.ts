import { supabase } from './supabaseClient';

// Notification system configuration and utilities
export const NOTIFICATION_CONFIG = {
  // Default notification time (24-hour format)
  DEFAULT_HOUR: 0, // Midnight
  DEFAULT_MINUTE: 0,

  // Timezone handling
  DEFAULT_TIMEZONE: 'UTC',

  // Notification types
  TYPES: {
    TILE_AVAILABLE: 'tile_available',
    GIFT_UNLOCKED: 'gift_unlocked',
    CALENDAR_COMPLETE: 'calendar_complete'
  },

  // Delivery methods
  METHODS: {
    PUSH: 'push',
    EMAIL: 'email',
    IN_APP: 'in_app'
  },

  // Scheduling
  SCHEDULER_ENABLED: process.env.NOTIFICATION_SCHEDULER_ENABLED === 'true',
  SCHEDULER_INTERVAL_MINUTES: parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '60', 10),

  // External service configurations
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
  PUSH_SERVICE_API_KEY: process.env.PUSH_SERVICE_API_KEY,
  PUSH_SERVICE_PROJECT_ID: process.env.PUSH_SERVICE_PROJECT_ID
};

// Timezone utilities
export class TimezoneUtils {
  /**
   * Get current time in specified timezone
   */
  static getCurrentTimeInTimezone(): Date {
    // Using date-fns-tz for proper timezone handling
    // This would be implemented with actual timezone library
    const now = new Date();
    // Placeholder - would use tz() from date-fns-tz
    return now;
  }

  /**
   * Check if it's time to send notification in user's timezone
   */
  static isNotificationTime(scheduledHour: number, scheduledMinute: number): boolean {
    const userTime = this.getCurrentTimeInTimezone();
    return userTime.getHours() === scheduledHour && userTime.getMinutes() === scheduledMinute;
  }

  /**
   * Get next notification time in user's timezone
   */
  static getNextNotificationTime(scheduledHour: number, scheduledMinute: number): Date {
    const now = new Date();
    const nextNotification = new Date(now);

    // Set to today's scheduled time
    nextNotification.setHours(scheduledHour, scheduledMinute, 0, 0);

    // If we've already passed today's time, schedule for tomorrow
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    return nextNotification;
  }

  /**
   * Validate timezone string
   */
  static isValidTimezone(timezone: string): boolean {
    // Placeholder validation - would check against IANA timezone database
    const commonTimezones = [
      'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
    ];
    return commonTimezones.includes(timezone);
  }
}

// Notification scheduler interface
export interface NotificationScheduler {
  schedule(calendarId: string, day: number, timezone: string): Promise<void>;
  cancel(calendarId: string, day: number): Promise<void>;
  getScheduledNotifications(): Promise<ScheduledNotification[]>;
}

export interface ScheduledNotification {
  id: string;
  calendarId: string;
  day: number;
  scheduledTime: Date;
  timezone: string;
  status: 'pending' | 'sent' | 'cancelled';
}

// Database-backed notification scheduler
export class DatabaseScheduler implements NotificationScheduler {
  async schedule(calendarId: string, day: number, timezone: string): Promise<void> {
    try {
      // Calculate scheduled time (midnight in user's timezone for the specific day)
      const scheduledTime = this.calculateScheduledTime(day, timezone);

      // Insert or update notification schedule
      const { error } = await supabase
        .from('notification_schedules')
        .upsert({
          calendar_id: calendarId,
          day: day,
          scheduled_time: scheduledTime.toISOString(),
          timezone: timezone,
          notification_type: 'tile_available',
          status: 'pending',
          delivery_methods: ['push', 'email']
        }, {
          onConflict: 'calendar_id,day,notification_type'
        });

      if (error) {
        console.error('Failed to schedule notification:', error);
        throw error;
      }

      console.log(`Scheduled notification for calendar ${calendarId}, day ${day} at ${scheduledTime.toISOString()}`);
    } catch (error) {
      console.error('DatabaseScheduler.schedule error:', error);
      throw error;
    }
  }

  async cancel(calendarId: string, day: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_schedules')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('calendar_id', calendarId)
        .eq('day', day)
        .eq('notification_type', 'tile_available');

      if (error) {
        console.error('Failed to cancel notification:', error);
        throw error;
      }

      console.log(`Cancelled notification for calendar ${calendarId}, day ${day}`);
    } catch (error) {
      console.error('DatabaseScheduler.cancel error:', error);
      throw error;
    }
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notification_schedules')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Failed to get scheduled notifications:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.schedule_id,
        calendarId: item.calendar_id,
        day: item.day,
        scheduledTime: new Date(item.scheduled_time),
        timezone: item.timezone,
        status: item.status as 'pending' | 'sent' | 'cancelled'
      }));
    } catch (error) {
      console.error('DatabaseScheduler.getScheduledNotifications error:', error);
      throw error;
    }
  }

  private calculateScheduledTime(day: number, timezone: string): Date {
    // For day 1: today at midnight in timezone
    // For day 2: tomorrow at midnight, etc.
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (day - 1));
    baseDate.setHours(0, 0, 0, 0);

    // TODO: Use timezone parameter for proper scheduling
    // For now, schedule in UTC - database handles timezone queries
    console.log(`Scheduling for timezone: ${timezone}`);
    return baseDate;
  }
}

export class CronScheduler implements NotificationScheduler {
  async schedule(calendarId: string, day: number, timezone: string): Promise<void> {
    // Schedule cron job for notification
    console.log(`Scheduling cron job for calendar ${calendarId}, day ${day} in timezone ${timezone}`);
    // Implementation would use node-cron or similar
  }

  async cancel(calendarId: string, day: number): Promise<void> {
    // Cancel cron job
    console.log(`Cancelling cron job for calendar ${calendarId}, day ${day}`);
    // Implementation would destroy cron job
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    // Get list of active cron jobs
    console.log('Retrieving scheduled cron jobs');
    return [];
  }
}

// Notification delivery interfaces
export interface NotificationDeliveryService {
  sendPushNotification(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean>;
  sendEmail(email: string, subject: string, htmlBody: string): Promise<boolean>;
}

export class FirebaseNotificationService implements NotificationDeliveryService {
  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
    try {
      // Get user's FCM token from database
      const { data: tokenData, error } = await supabase
        .from('user_push_tokens')
        .select('fcm_token')
        .eq('user_id', userId)
        .single();

      if (error || !tokenData?.fcm_token) {
        console.warn(`No FCM token found for user ${userId}`);
        return false;
      }

      // Send to FCM
      const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${NOTIFICATION_CONFIG.PUSH_SERVICE_PROJECT_ID}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTIFICATION_CONFIG.PUSH_SERVICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: tokenData.fcm_token,
            notification: {
              title,
              body,
            },
            data: data || {},
          },
        }),
      });

      if (!fcmResponse.ok) {
        console.error('FCM send failed:', await fcmResponse.text());
        return false;
      }

      console.log(`Push notification sent to ${userId}`);
      return true;
    } catch (error) {
      console.error('Firebase push notification error:', error);
      return false;
    }
  }

  async sendEmail(email: string, subject: string, htmlBody: string): Promise<boolean> {
    try {
      // Use a service like SendGrid, Mailgun, etc.
      // For now, placeholder implementation
      console.log(`[EMAIL SERVICE] Would send email to ${email}: ${subject} - Body: ${htmlBody.substring(0, 100)}...`);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }
}

export class MockNotificationService implements NotificationDeliveryService {
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    console.log(`[MOCK] Sending push notification to ${userId}: ${title} - ${body}`);
    return true;
  }

  async sendEmail(email: string, subject: string, htmlBody: string): Promise<boolean> {
    console.log(`[MOCK] Sending email to ${email}: ${subject} - Body length: ${htmlBody.length}`);
    return true;
  }
}

// Notification content templates
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_CONFIG.TYPES.TILE_AVAILABLE]: {
    push: {
      title: 'New Tile Available! 🎄',
      body: 'A new surprise tile is ready to open today!'
    },
    email: {
      subject: 'Your Advent Calendar Has a New Surprise! 🎄',
      template: (childName: string, day: number) => `
        <h1>New Tile Available!</h1>
        <p>Dear Parent,</p>
        <p>A new tile is available for ${childName} to open today (Day ${day})!</p>
        <p>Log in to see what's waiting.</p>
        <p>Happy Holidays! 🎄</p>
      `
    }
  },
  [NOTIFICATION_CONFIG.TYPES.GIFT_UNLOCKED]: {
    push: {
      title: 'Gift Unlocked! 🎁',
      body: 'Your child has unlocked a special gift!'
    },
    email: {
      subject: 'A Gift Has Been Unlocked! 🎁',
      template: (childName: string, day: number) => `
        <h1>Gift Unlocked!</h1>
        <p>${childName} has unlocked their gift for Day ${day}!</p>
        <p>Check their calendar to see what they received.</p>
      `
    }
  }
};

// Main notification service
export class NotificationService {
  private scheduler: NotificationScheduler;
  private deliveryService: NotificationDeliveryService;

  constructor(
    scheduler: NotificationScheduler = new DatabaseScheduler(),
    deliveryService?: NotificationDeliveryService
  ) {
    this.scheduler = scheduler;

    // Use real services if configured, otherwise mock
    if (deliveryService) {
      this.deliveryService = deliveryService;
    } else if (NOTIFICATION_CONFIG.PUSH_SERVICE_API_KEY && NOTIFICATION_CONFIG.PUSH_SERVICE_PROJECT_ID) {
      this.deliveryService = new FirebaseNotificationService();
    } else {
      this.deliveryService = new MockNotificationService();
    }
  }

  /**
   * Schedule daily notifications for a calendar
   */
  async scheduleCalendarNotifications(calendarId: string, timezone: string): Promise<void> {
    for (let day = 1; day <= 25; day++) {
      await this.scheduler.schedule(calendarId, day, timezone);
    }
  }

  /**
   * Cancel all notifications for a calendar
   */
  async cancelCalendarNotifications(calendarId: string): Promise<void> {
    for (let day = 1; day <= 25; day++) {
      await this.scheduler.cancel(calendarId, day);
    }
  }

  /**
   * Send notification for tile availability
   */
  async sendTileAvailableNotification(
    parentEmail: string,
    parentId: string,
    childName: string,
    day: number,
    deliveryMethods: string[] = ['push', 'email']
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[NOTIFICATION_CONFIG.TYPES.TILE_AVAILABLE];

    if (deliveryMethods.includes('push')) {
      await this.deliveryService.sendPushNotification(
        parentId,
        template.push.title,
        template.push.body,
        { type: 'tile_available', day }
      );
    }

    if (deliveryMethods.includes('email')) {
      const htmlBody = template.email.template(childName, day);
      await this.deliveryService.sendEmail(parentEmail, template.email.subject, htmlBody);
    }
  }

  /**
    * Send notification for gift unlock
    */
  async sendGiftUnlockedNotification(
    parentEmail: string,
    parentId: string,
    childName: string,
    day: number,
    deliveryMethods: string[] = ['push', 'email']
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[NOTIFICATION_CONFIG.TYPES.GIFT_UNLOCKED];

    if (deliveryMethods.includes('push')) {
      await this.deliveryService.sendPushNotification(
        parentId,
        template.push.title,
        template.push.body,
        { type: 'gift_unlocked', day }
      );
    }

    if (deliveryMethods.includes('email')) {
      const htmlBody = template.email.template(childName, day);
      await this.deliveryService.sendEmail(parentEmail, template.email.subject, htmlBody);
    }
  }

  /**
   * Process pending notifications (call this periodically)
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await this.scheduler.getScheduledNotifications();

      for (const notification of pendingNotifications) {
        try {
          // Get calendar and parent info
          const { data: calendar, error: calendarError } = await supabase
            .from('calendars')
            .select(`
              parent_uuid,
              parents!calendars_parent_uuid_fkey(email),
              children!calendars_child_uuid_fkey(name)
            `)
            .eq('calendar_id', notification.calendarId)
            .single();

          if (calendarError || !calendar) {
            console.error(`Calendar not found for notification ${notification.id}`);
            continue;
          }

          const parentId = calendar.parent_uuid;
          const parents = calendar.parents as Record<string, unknown> | undefined;
          const children = calendar.children as Record<string, unknown> | undefined;
          const parentEmail = parents?.email as string | undefined;
          const childName = children?.name as string | undefined;

          // Send the notification
          await this.sendTileAvailableNotification(
            parentEmail,
            parentId,
            childName,
            notification.day,
            ['push', 'email'] // TODO: Get from notification.delivery_methods
          );

          // Mark as sent
          await supabase.rpc('update_notification_status', {
            p_schedule_id: notification.id,
            p_status: 'sent'
          });

        } catch (error) {
          console.error(`Failed to send notification ${notification.id}:`, error);

          // Mark as failed
          await supabase.rpc('update_notification_status', {
            p_schedule_id: notification.id,
            p_status: 'failed',
            p_error_message: (error as Error).message
          });
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();