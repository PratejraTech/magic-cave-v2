/**
 * Security headers middleware for Cloudflare Workers
 * Implements comprehensive security headers for production deployment
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  hsts?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  contentTypeOptions?: boolean;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: 'require-corp' | 'credentialless';
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  crossOriginResourcePolicy?: 'same-origin' | 'same-site' | 'cross-origin';
}

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  contentSecurityPolicy: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://www.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co https://*.firebase.com https://*.googleapis.com wss://*.supabase.co;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim(),

  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: false
  },

  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',

  permissionsPolicy: `
    camera=(),
    microphone=(),
    geolocation=(),
    gyroscope=(),
    accelerometer=(),
    magnetometer=(),
    payment=(),
    usb=()
  `.replace(/\s+/g, ' ').trim(),

  crossOriginEmbedderPolicy: 'credentialless',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'cross-origin'
};

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_HEADERS, ...config };
  }

  /**
   * Apply security headers to a Response object
   */
  applyHeaders(response: Response): Response {
    const headers = new Headers(response.headers);

    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      headers.set('Content-Security-Policy', this.config.contentSecurityPolicy);
    }

    // HTTP Strict Transport Security
    if (this.config.hsts) {
      const hstsValue = `max-age=${this.config.hsts.maxAge}${
        this.config.hsts.includeSubDomains ? '; includeSubDomains' : ''
      }${this.config.hsts.preload ? '; preload' : ''}`;
      headers.set('Strict-Transport-Security', hstsValue);
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      headers.set('X-Frame-Options', this.config.frameOptions);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    // Cross-Origin Embedder Policy
    if (this.config.crossOriginEmbedderPolicy) {
      headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin Opener Policy
    if (this.config.crossOriginOpenerPolicy) {
      headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    // Cross-Origin Resource Policy
    if (this.config.crossOriginResourcePolicy) {
      headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }

    // Additional security headers
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    // Remove server header for security
    headers.delete('server');
    headers.delete('x-powered-by');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Create a new Response with security headers
   */
  createSecureResponse(
    body: unknown,
    options: ResponseInit = {},
    contentType: string = 'application/json'
  ): Response {
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type') && contentType) {
      headers.set('Content-Type', contentType);
    }

    const response = new Response(
      typeof body === 'string' ? body : JSON.stringify(body),
      { ...options, headers }
    );

    return this.applyHeaders(response);
  }

  /**
   * Middleware function for Cloudflare Workers
   */
  middleware() {
    return async (request: Request) => {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
        };

        return this.createSecureResponse(null, {
          status: 200,
          headers: corsHeaders
        });
      }

      // Continue with normal request processing
      // This would be used in a middleware chain
      return null;
    };
  }
}

/**
 * Default security headers instance
 */
export const securityHeaders = new SecurityHeaders();

/**
 * Utility function to create secure JSON responses
 */
export function createSecureJsonResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return securityHeaders.createSecureResponse(data, {
    status,
    headers: additionalHeaders
  });
}

/**
 * Utility function to create secure error responses
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): Response {
  const errorResponse: Record<string, unknown> = {
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    errorResponse.details = details;
  }

  return securityHeaders.createSecureResponse(errorResponse, {
    status,
    headers: {
      'X-Error-Type': 'application_error'
    }
  });
}

/**
 * Security headers for development (less restrictive)
 */
export const developmentSecurityHeaders = new SecurityHeaders({
  contentSecurityPolicy: `
    default-src 'self' 'unsafe-inline' 'unsafe-eval';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:*;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob: http://localhost:* https://localhost:*;
    connect-src 'self' http://localhost:* https://localhost:* https://*.supabase.co wss://*.supabase.co;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),

  hsts: undefined, // Disable HSTS in development
  crossOriginEmbedderPolicy: undefined, // Disable COEP in development
});

/**
 * Environment-aware security headers
 */
export const getSecurityHeaders = (): SecurityHeaders => {
  // Check if we're in production mode
  const isProduction = import.meta.env.MODE === 'production' ||
                      import.meta.env.VITE_ENV === 'production';

  return isProduction ? securityHeaders : developmentSecurityHeaders;
};