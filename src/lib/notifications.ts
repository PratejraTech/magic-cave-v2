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

// Placeholder implementations for different scheduling backends
export class DatabaseScheduler implements NotificationScheduler {
  async schedule(calendarId: string, day: number, timezone: string): Promise<void> {
    // Store notification schedule in database
    console.log(`Scheduling notification for calendar ${calendarId}, day ${day} in timezone ${timezone}`);
    // Implementation would insert into notification_schedules table
  }

  async cancel(calendarId: string, day: number): Promise<void> {
    // Remove notification schedule from database
    console.log(`Cancelling notification for calendar ${calendarId}, day ${day}`);
    // Implementation would update/delete from notification_schedules table
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    // Query pending notifications from database
    console.log('Retrieving scheduled notifications');
    // Implementation would query notification_schedules table
    return [];
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
  sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<boolean>;
  sendEmail(email: string, subject: string, htmlBody: string): Promise<boolean>;
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
    deliveryService: NotificationDeliveryService = new MockNotificationService()
  ) {
    this.scheduler = scheduler;
    this.deliveryService = deliveryService;
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
}

// Export singleton instance
export const notificationService = new NotificationService();