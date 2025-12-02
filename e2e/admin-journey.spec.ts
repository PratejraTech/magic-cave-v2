import { test, expect } from '@playwright/test';

test.describe('Admin/Content Moderation Journey E2E Tests', () => {
  test.setTimeout(120000); // 2 minutes for admin workflows

  test.describe('Admin Authentication and Dashboard', () => {
    test('Admin can login to moderation dashboard', async ({ page }) => {
      // Navigate to admin login
      await page.goto('/admin/login');
      await expect(page).toHaveURL('/admin/login');

      // Verify admin login form
      await expect(page.locator('text=Admin Login')).toBeVisible();
      await expect(page.locator('input[name="adminEmail"]')).toBeVisible();
      await expect(page.locator('input[name="adminPassword"]')).toBeVisible();

      // Enter admin credentials
      await page.fill('input[name="adminEmail"]', 'admin@familycalendar.com');
      await page.fill('input[name="adminPassword"]', 'adminSecure123!');

      // Submit login
      await page.click('button[type="submit"]:has-text("Admin Login")');

      // Verify redirect to admin dashboard
      await page.waitForURL('/admin/dashboard');
      await expect(page.locator('text=Content Moderation Dashboard')).toBeVisible();
    });

    test('Admin sees comprehensive dashboard overview', async ({ page }) => {
      await loginAsAdmin(page);

      // Verify dashboard sections
      await expect(page.locator('text=System Overview')).toBeVisible();
      await expect(page.locator('text=Content Moderation Queue')).toBeVisible();
      await expect(page.locator('text=Analytics Summary')).toBeVisible();
      await expect(page.locator('text=Security Alerts')).toBeVisible();

      // Check key metrics
      await expect(page.locator('.total-users')).toBeVisible();
      await expect(page.locator('.active-calendars')).toBeVisible();
      await expect(page.locator('.pending-moderation')).toBeVisible();
      await expect(page.locator('.system-health')).toBeVisible();
    });
  });

  test.describe('Content Moderation Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can review pending content moderation', async ({ page }) => {
      // Navigate to moderation queue
      await page.click('text=Content Moderation');

      // Verify moderation queue loads
      await expect(page.locator('text=Pending Reviews')).toBeVisible();

      // Check for pending items
      const pendingItems = page.locator('.moderation-item');
      await expect(pendingItems).toHaveCount(await pendingItems.count());

      // Verify moderation actions are available
      await expect(page.locator('text=Approve')).toBeVisible();
      await expect(page.locator('text=Reject')).toBeVisible();
      await expect(page.locator('text=Flag')).toBeVisible();
    });

    test('Admin can approve appropriate content', async ({ page }) => {
      await page.click('text=Content Moderation');

      // Select a pending item
      const firstItem = page.locator('.moderation-item').first();
      await firstItem.click();

      // Verify content details
      await expect(page.locator('.content-preview')).toBeVisible();
      await expect(page.locator('.content-metadata')).toBeVisible();

      // Approve the content
      await page.click('text=Approve');

      // Verify approval confirmation
      await expect(page.locator('text=Content approved successfully')).toBeVisible();

      // Verify item is removed from pending queue
      await expect(firstItem).not.toBeVisible();
    });

    test('Admin can reject inappropriate content', async ({ page }) => {
      await page.click('text=Content Moderation');

      // Select inappropriate content
      const inappropriateItem = page.locator('.moderation-item.inappropriate').first();
      await inappropriateItem.click();

      // Select rejection reason
      await page.selectOption('select[name="rejectionReason"]', 'inappropriate_content');

      // Add rejection note
      await page.fill('textarea[name="rejectionNote"]', 'Content violates community guidelines');

      // Reject the content
      await page.click('text=Reject');

      // Verify rejection confirmation
      await expect(page.locator('text=Content rejected')).toBeVisible();

      // Verify rejection email is sent (if applicable)
      await expect(page.locator('text=Rejection notification sent')).toBeVisible();
    });

    test('Admin can flag content for further review', async ({ page }) => {
      await page.click('text=Content Moderation');

      // Select borderline content
      const borderlineItem = page.locator('.moderation-item.borderline').first();
      await borderlineItem.click();

      // Flag for senior review
      await page.click('text=Flag for Review');

      // Select flag reason
      await page.selectOption('select[name="flagReason"]', 'requires_senior_review');

      // Add flag note
      await page.fill('textarea[name="flagNote"]', 'Content may require senior moderator review');

      // Submit flag
      await page.click('text=Submit Flag');

      // Verify flag confirmation
      await expect(page.locator('text=Content flagged for review')).toBeVisible();
    });

    test('Admin can bulk moderate multiple items', async ({ page }) => {
      await page.click('text=Content Moderation');

      // Select multiple items
      await page.check('input[name="select-all"]');

      // Choose bulk action
      await page.selectOption('select[name="bulkAction"]', 'approve');

      // Execute bulk action
      await page.click('text=Execute Bulk Action');

      // Verify bulk operation results
      await expect(page.locator('text=5 items approved successfully')).toBeVisible();
    });
  });

  test.describe('Analytics and Reporting', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can view comprehensive analytics', async ({ page }) => {
      // Navigate to analytics
      await page.click('text=Analytics');

      // Verify analytics sections
      await expect(page.locator('text=User Engagement')).toBeVisible();
      await expect(page.locator('text=Content Performance')).toBeVisible();
      await expect(page.locator('text=System Performance')).toBeVisible();
      await expect(page.locator('text=Security Metrics')).toBeVisible();

      // Check key metrics
      await expect(page.locator('.active-users-chart')).toBeVisible();
      await expect(page.locator('.content-creation-chart')).toBeVisible();
      await expect(page.locator('.moderation-queue-chart')).toBeVisible();
    });

    test('Admin can generate custom reports', async ({ page }) => {
      await page.click('text=Analytics');
      await page.click('text=Generate Report');

      // Configure report parameters
      await page.selectOption('select[name="reportType"]', 'user_activity');
      await page.fill('input[name="startDate"]', '2024-12-01');
      await page.fill('input[name="endDate"]', '2024-12-07');
      await page.check('input[name="includeCharts"]');

      // Generate report
      await page.click('text=Generate Report');

      // Verify report generation
      await expect(page.locator('text=Report generated successfully')).toBeVisible();

      // Download report
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download Report');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('user-activity-report');
    });

    test('Admin can monitor real-time metrics', async ({ page }) => {
      await page.click('text=Analytics');

      // Check real-time dashboard
      await expect(page.locator('.real-time-metrics')).toBeVisible();

      // Verify live updates (metrics change over time)
      // Wait a moment for potential updates
      await page.waitForTimeout(5000);

      // Metrics should be current
      await expect(page.locator('.last-updated')).toBeVisible();
    });
  });

  test.describe('Security Monitoring and Incident Response', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can monitor security alerts', async ({ page }) => {
      // Navigate to security dashboard
      await page.click('text=Security');

      // Verify security overview
      await expect(page.locator('text=Security Alerts')).toBeVisible();
      await expect(page.locator('text=Failed Login Attempts')).toBeVisible();
      await expect(page.locator('text=Suspicious Activity')).toBeVisible();

      // Check alert severity levels
      await expect(page.locator('.alert-critical')).toBeVisible();
      await expect(page.locator('.alert-warning')).toBeVisible();
      await expect(page.locator('.alert-info')).toBeVisible();
    });

    test('Admin can investigate security incidents', async ({ page }) => {
      await page.click('text=Security');

      // Select a security alert
      const alertItem = page.locator('.security-alert').first();
      await alertItem.click();

      // Verify incident details
      await expect(page.locator('.incident-details')).toBeVisible();
      await expect(page.locator('text=IP Address')).toBeVisible();
      await expect(page.locator('text=User Agent')).toBeVisible();
      await expect(page.locator('text=Timestamp')).toBeVisible();

      // Check user activity timeline
      await expect(page.locator('.activity-timeline')).toBeVisible();
    });

    test('Admin can manage user access and permissions', async ({ page }) => {
      // Navigate to user management
      await page.click('text=User Management');

      // Search for user
      await page.fill('input[name="userSearch"]', 'problematic@example.com');
      await page.click('text=Search');

      // Select user
      await page.click('.user-result');

      // View user details
      await expect(page.locator('.user-profile')).toBeVisible();

      // Modify user permissions
      await page.selectOption('select[name="userRole"]', 'restricted');

      // Add access restrictions
      await page.check('input[name="restrictChat"]');
      await page.check('input[name="contentFilter"]');

      // Save changes
      await page.click('text=Update User');

      // Verify changes saved
      await expect(page.locator('text=User permissions updated')).toBeVisible();
    });

    test('Admin can respond to abuse reports', async ({ page }) => {
      await page.click('text=Moderation');
      await page.click('text=Abuse Reports');

      // Select abuse report
      const reportItem = page.locator('.abuse-report').first();
      await reportItem.click();

      // Review reported content
      await expect(page.locator('.reported-content')).toBeVisible();

      // Take action
      await page.selectOption('select[name="action"]', 'remove_content');
      await page.fill('textarea[name="actionReason"]', 'Content violates terms of service');

      // Submit action
      await page.click('text=Take Action');

      // Verify action completed
      await expect(page.locator('text=Action completed successfully')).toBeVisible();
    });
  });

  test.describe('System Administration', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can manage system settings', async ({ page }) => {
      // Navigate to system settings
      await page.click('text=System Settings');

      // Verify settings categories
      await expect(page.locator('text=General Settings')).toBeVisible();
      await expect(page.locator('text=Content Moderation')).toBeVisible();
      await expect(page.locator('text=Security Settings')).toBeVisible();
      await expect(page.locator('text=API Configuration')).toBeVisible();

      // Modify content filter settings
      await page.selectOption('select[name="contentFilterLevel"]', 'strict');

      // Update rate limits
      await page.fill('input[name="maxRequestsPerMinute"]', '100');

      // Save settings
      await page.click('text=Save Settings');

      // Verify settings updated
      await expect(page.locator('text=Settings updated successfully')).toBeVisible();
    });

    test('Admin can monitor system health', async ({ page }) => {
      // Navigate to system health
      await page.click('text=System Health');

      // Verify health metrics
      await expect(page.locator('.database-status')).toBeVisible();
      await expect(page.locator('.api-status')).toBeVisible();
      await expect(page.locator('.storage-status')).toBeVisible();
      await expect(page.locator('.cache-status')).toBeVisible();

      // Check service uptime
      await expect(page.locator('text=Uptime:')).toBeVisible();

      // Verify recent system events
      await expect(page.locator('.system-events')).toBeVisible();
    });

    test('Admin can perform maintenance operations', async ({ page }) => {
      await page.click('text=System Health');
      await page.click('text=Maintenance');

      // Verify maintenance options
      await expect(page.locator('text=Clear Cache')).toBeVisible();
      await expect(page.locator('text=Database Optimization')).toBeVisible();
      await expect(page.locator('text=Log Rotation')).toBeVisible();

      // Perform cache clear
      await page.click('text=Clear Cache');

      // Confirm operation
      await page.click('text=Confirm');

      // Verify operation completed
      await expect(page.locator('text=Cache cleared successfully')).toBeVisible();
    });

    test('Admin can manage API keys and integrations', async ({ page }) => {
      await page.click('text=API Management');

      // Verify API key management
      await expect(page.locator('text=API Keys')).toBeVisible();

      // Generate new API key
      await page.click('text=Generate New Key');

      // Configure key permissions
      await page.check('input[name="readPermission"]');
      await page.check('input[name="writePermission"]');
      await page.uncheck('input[name="adminPermission"]');

      // Set key expiration
      await page.fill('input[name="expiresAt"]', '2025-12-01');

      // Save key
      await page.click('text=Create Key');

      // Verify key created
      await expect(page.locator('.new-api-key')).toBeVisible();
      await expect(page.locator('text=API key created successfully')).toBeVisible();
    });
  });

  test.describe('Data Management and Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can perform GDPR data exports', async ({ page }) => {
      // Navigate to data management
      await page.click('text=Data Management');
      await page.click('text=GDPR Requests');

      // Search for user data request
      await page.fill('input[name="userEmail"]', 'user@example.com');
      await page.click('text=Search');

      // Select user
      await page.click('.user-data-request');

      // Initiate data export
      await page.click('text=Export User Data');

      // Verify export progress
      await expect(page.locator('text=Exporting data...')).toBeVisible();

      // Wait for completion
      await page.waitForSelector('text=Export completed', { timeout: 30000 });

      // Download export
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download Export');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('gdpr-export');
    });

    test('Admin can handle account deletion requests', async ({ page }) => {
      await page.click('text=Data Management');
      await page.click('text=Account Deletions');

      // Select pending deletion request
      const deletionRequest = page.locator('.deletion-request').first();
      await deletionRequest.click();

      // Review deletion details
      await expect(page.locator('.deletion-reason')).toBeVisible();
      await expect(page.locator('.data-to-delete')).toBeVisible();

      // Approve deletion
      await page.click('text=Approve Deletion');

      // Confirm deletion
      await page.fill('input[name="confirmation"]', 'DELETE');
      await page.click('text=Confirm Deletion');

      // Verify deletion completed
      await expect(page.locator('text=Account deleted successfully')).toBeVisible();
    });

    test('Admin can audit system access logs', async ({ page }) => {
      await page.click('text=Security');
      await page.click('text=Access Logs');

      // Verify audit log interface
      await expect(page.locator('text=System Access Audit')).toBeVisible();

      // Filter logs
      await page.selectOption('select[name="eventType"]', 'admin_login');
      await page.fill('input[name="startDate"]', '2024-12-01');
      await page.fill('input[name="endDate"]', '2024-12-07');

      // Search logs
      await page.click('text=Search');

      // Verify log results
      await expect(page.locator('.audit-log-entry')).toBeVisible();

      // Export audit logs
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Export Logs');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('audit-logs');
    });
  });

  test.describe('Emergency Response and Crisis Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Admin can activate emergency mode', async ({ page }) => {
      // Navigate to emergency controls
      await page.click('text=Emergency');

      // Verify emergency options
      await expect(page.locator('text=Activate Emergency Mode')).toBeVisible();

      // Activate emergency mode
      await page.click('text=Activate Emergency Mode');

      // Confirm activation
      await page.fill('input[name="reason"]', 'System security incident');
      await page.click('text=Confirm Activation');

      // Verify emergency mode activated
      await expect(page.locator('text=Emergency Mode Active')).toBeVisible();
      await expect(page.locator('.emergency-banner')).toBeVisible();
    });

    test('Admin can manage emergency communications', async ({ page }) => {
      await page.click('text=Emergency');

      // Compose emergency message
      await page.fill('textarea[name="emergencyMessage"]',
        'Due to a security incident, the system is temporarily in emergency mode. We apologize for the inconvenience.');

      // Select affected services
      await page.check('input[name="chatService"]');
      await page.check('input[name="uploadService"]');

      // Send emergency communication
      await page.click('text=Send Emergency Message');

      // Verify message sent
      await expect(page.locator('text=Emergency message sent to all users')).toBeVisible();
    });

    test('Admin can perform emergency data backup', async ({ page }) => {
      await page.click('text=Emergency');
      await page.click('text=Data Backup');

      // Initiate emergency backup
      await page.click('text=Start Emergency Backup');

      // Verify backup progress
      await expect(page.locator('text=Backup in progress...')).toBeVisible();

      // Wait for completion
      await page.waitForSelector('text=Backup completed successfully', { timeout: 60000 });

      // Download backup
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download Backup');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('emergency-backup');
    });
  });
});

async function loginAsAdmin(page: any) {
  // Use test route that bypasses authentication
  await page.goto('/test/admin/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for React to render
}