#!/bin/bash

# Quick Secret Setup Guide
# Run each command and paste the secret value when prompted

echo "🔐 GitHub Secrets Setup - PratejraTech/magic-cave-v2"
echo "===================================================="
echo ""
echo "Run each command below and paste the secret value when prompted:"
echo ""

cat <<'COMMANDS'
# 1. VERCEL SECRETS (Required)
gh secret set VERCEL_TOKEN --repo PratejraTech/magic-cave-v2
gh secret set VERCEL_ORG_ID --repo PratejraTech/magic-cave-v2
gh secret set VERCEL_PROJECT_ID --repo PratejraTech/magic-cave-v2

# 2. CLOUDFLARE SECRETS (Required for Workers)
gh secret set CLOUDFLARE_API_TOKEN --repo PratejraTech/magic-cave-v2
gh secret set CLOUDFLARE_ACCOUNT_ID --repo PratejraTech/magic-cave-v2

# 3. SUPABASE SECRETS (Required)
gh secret set VITE_SUPABASE_URL --repo PratejraTech/magic-cave-v2
gh secret set VITE_SUPABASE_ANON_KEY --repo PratejraTech/magic-cave-v2

# 4. ENCRYPTION (Required)
# Generate with: openssl rand -base64 32
gh secret set VITE_ENCRYPTION_KEY --repo PratejraTech/magic-cave-v2

# 5. OPENAI (Required for AI features)
gh secret set VITE_OPENAI_API_KEY --repo PratejraTech/magic-cave-v2

# 6. FIREBASE (Optional - only if using Firebase)
gh secret set VITE_FIREBASE_API_KEY --repo PratejraTech/magic-cave-v2
gh secret set VITE_FIREBASE_AUTH_DOMAIN --repo PratejraTech/magic-cave-v2
gh secret set VITE_FIREBASE_PROJECT_ID --repo PratejraTech/magic-cave-v2
gh secret set VITE_FIREBASE_STORAGE_BUCKET --repo PratejraTech/magic-cave-v2
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --repo PratejraTech/magic-cave-v2
gh secret set VITE_FIREBASE_APP_ID --repo PratejraTech/magic-cave-v2

# 7. MONITORING (Optional)
gh secret set VITE_SENTRY_DSN --repo PratejraTech/magic-cave-v2
gh secret set VITE_VERCEL_ANALYTICS_ID --repo PratejraTech/magic-cave-v2

# Verify all secrets are set
gh secret list --repo PratejraTech/magic-cave-v2

COMMANDS

echo ""
echo "📚 Where to Get Each Secret:"
echo "----------------------------"
echo ""
echo "VERCEL_TOKEN:"
echo "  → https://vercel.com/account/tokens"
echo ""
echo "VERCEL_ORG_ID & VERCEL_PROJECT_ID:"
echo "  → https://vercel.com/ (go to project settings)"
echo ""
echo "CLOUDFLARE_API_TOKEN:"
echo "  → https://dash.cloudflare.com/profile/api-tokens"
echo "  → Create token with 'Workers Scripts' permissions"
echo ""
echo "CLOUDFLARE_ACCOUNT_ID:"
echo "  → https://dash.cloudflare.com/ (visible in sidebar)"
echo ""
echo "VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY:"
echo "  → https://app.supabase.com/project/_/settings/api"
echo ""
echo "VITE_ENCRYPTION_KEY:"
echo "  → Run: openssl rand -base64 32"
echo ""
echo "VITE_OPENAI_API_KEY:"
echo "  → https://platform.openai.com/api-keys"
echo ""
echo "FIREBASE (Optional):"
echo "  → https://console.firebase.google.com/ → Project Settings"
echo ""
echo "SENTRY (Optional):"
echo "  → https://sentry.io/ → Project Settings → Client Keys (DSN)"
echo ""
