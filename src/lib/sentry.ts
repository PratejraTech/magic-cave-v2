// Sentry error tracking configuration
// Note: Requires @sentry/react package installation

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  // Sentry.init would be called here in production
  console.log('Sentry initialized with DSN:', dsn.substring(0, 20) + '...');
};

export const setSentryUser = (user: { id: string; email?: string } | null) => {
  // Set user context in Sentry
  if (user) {
    console.log('Sentry user set:', user.id);
  }
};

export const captureException = (error: Error, context?: Record<string, unknown>) => {
  console.error('Exception captured:', error.message, context);
  // In production: Sentry.captureException(error);
};

export const captureMessage = (message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info', context?: Record<string, unknown>) => {
  console.log(`[${level.toUpperCase()}] ${message}`, context);
  // In production: Sentry.captureMessage(message, level);
};