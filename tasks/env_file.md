# Environment Secrets for Family Advent Calendar Web App

This file lists all environment variables required for the application, database, and integrations.
Values should be stored securely (e.g., via .env files, not committed to Git).
For production, use environment-specific secrets management (e.g., Supabase secrets, cloud provider vaults).

## General Application
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| VITE_APP_ENV | Environment (development/staging/production) | REQUIRED | One of: development, staging, production | Public (used in frontend) | Set manually |
| VITE_SUPABASE_URL | Supabase project URL | REQUIRED | Valid HTTPS URL | Public (used in frontend) | Supabase Dashboard > Settings > API |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key for client-side auth | REQUIRED | 64-char string starting with 'eyJ' | Public (safe for frontend) | Supabase Dashboard > Settings > API |

## Backend/Supabase (Server-Side)
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| SUPABASE_URL | Supabase project URL (server-side) | REQUIRED | Valid HTTPS URL | Secret (server-only) | Supabase Dashboard > Settings > API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key for admin operations | REQUIRED | 64-char string starting with 'eyJ' | Highly secret (full DB access) | Supabase Dashboard > Settings > API |
| SUPABASE_JWT_SECRET | JWT secret for custom auth (if used) | OPTIONAL | 32+ char string | Secret | Supabase Dashboard > Settings > API |

## Authentication
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| GOOGLE_CLIENT_ID | Google OAuth client ID | REQUIRED (if OAuth enabled) | String starting with 'xxx' | Public (used in frontend) | Google Cloud Console > APIs & Services > Credentials |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | REQUIRED (if OAuth enabled) | 24-char string | Secret | Google Cloud Console > APIs & Services > Credentials |
| FACEBOOK_APP_ID | Facebook OAuth app ID | REQUIRED (if OAuth enabled) | Numeric string | Public | Facebook Developers > App Settings |
| FACEBOOK_APP_SECRET | Facebook OAuth app secret | REQUIRED (if OAuth enabled) | 32-char string | Secret | Facebook Developers > App Settings |

## Media Storage
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| SUPABASE_STORAGE_BUCKET | Supabase Storage bucket name | REQUIRED | String (e.g., 'advent-media') | Public | Supabase Dashboard > Storage > Buckets |
| SUPABASE_STORAGE_URL | Storage URL (if custom) | OPTIONAL | Valid HTTPS URL | Public | Supabase Dashboard > Storage |

## Notifications (Future)
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| PUSH_NOTIFICATION_KEY | Push notification service key (e.g., Firebase) | OPTIONAL | API key format | Secret | Firebase Console > Project Settings > Cloud Messaging |
| EMAIL_SERVICE_API_KEY | Email service API key (e.g., SendGrid) | OPTIONAL | API key format | Secret | SendGrid Dashboard > Settings > API Keys |

## Stripe Integration (Future/Premium Features)
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key for frontend | REQUIRED (if payments enabled) | String starting with 'pk_' | Public (safe for frontend) | Stripe Dashboard > Developers > API Keys |
| STRIPE_SECRET_KEY | Stripe secret key for backend | REQUIRED (if payments enabled) | String starting with 'sk_' | Highly secret (payment processing) | Stripe Dashboard > Developers > API Keys |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret for event verification | REQUIRED (if webhooks enabled) | String starting with 'whsec_' | Secret | Stripe Dashboard > Developers > Webhooks |
| STRIPE_PRICE_ID_PREMIUM | Stripe price ID for premium subscription | OPTIONAL | String starting with 'price_' | Public | Stripe Dashboard > Products > Pricing |

## Analytics & Monitoring
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| ANALYTICS_API_KEY | External analytics service key (e.g., Mixpanel) | OPTIONAL | API key format | Secret | Mixpanel Dashboard > Project Settings |

## Development/Testing
| Variable | Description | Required | Validation | Security Notes | Source |
|----------|-------------|----------|------------|----------------|--------|
| VITE_DEV_MODE | Enable dev features (e.g., test data) | OPTIONAL | Boolean (true/false) | Public | Set manually |
| DATABASE_URL | Direct DB URL for local testing | OPTIONAL | PostgreSQL connection string | Secret | Supabase Dashboard > Settings > Database |

## Notes
- **Validation:** Use regex or type checks in code to validate variables at startup.
- **Security:** Never commit secrets to Git. Use .env files locally and cloud secrets in production.
- **Obtaining Keys:** Follow provider docs for setup (e.g., enable OAuth in Google/Facebook consoles).
- **Testing:** Use test/sandbox keys for development (e.g., Stripe test keys).
- **Updates:** Revise this file as new features (e.g., Stripe) are added.