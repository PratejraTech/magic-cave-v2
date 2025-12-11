#!/bin/bash

# Deployment Setup Script
# This script helps configure all GitHub secrets for automated deployment

set -e

echo "🚀 Deployment Configuration Setup"
echo "=================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=$3

    if [ -z "$secret_value" ]; then
        echo "⏭️  Skipping $secret_name (no value provided)"
        return
    fi

    echo "🔐 Setting $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name" --body -
    echo "✅ $secret_name configured"
}

echo "📝 Deployment Secrets Configuration"
echo "===================================="
echo ""
echo "Enter values for each secret (press Enter to skip):"
echo ""

# Vercel Secrets
echo "--- Vercel Configuration ---"
read -p "VERCEL_TOKEN (get from https://vercel.com/account/tokens): " VERCEL_TOKEN
read -p "VERCEL_ORG_ID (get from Vercel team settings): " VERCEL_ORG_ID
read -p "VERCEL_PROJECT_ID (get from project settings): " VERCEL_PROJECT_ID
echo ""

# Cloudflare Secrets
echo "--- Cloudflare Configuration ---"
read -p "CLOUDFLARE_API_TOKEN (get from Cloudflare dashboard): " CLOUDFLARE_API_TOKEN
read -p "CLOUDFLARE_ACCOUNT_ID (get from Cloudflare dashboard): " CLOUDFLARE_ACCOUNT_ID
echo ""

# Supabase
echo "--- Supabase Configuration ---"
read -p "VITE_SUPABASE_URL (e.g., https://xxx.supabase.co): " VITE_SUPABASE_URL
read -p "VITE_SUPABASE_ANON_KEY: " VITE_SUPABASE_ANON_KEY
echo ""

# Encryption
echo "--- Encryption ---"
read -p "VITE_ENCRYPTION_KEY (32 characters): " VITE_ENCRYPTION_KEY
echo ""

# OpenAI
echo "--- OpenAI ---"
read -p "VITE_OPENAI_API_KEY (sk-...): " VITE_OPENAI_API_KEY
echo ""

# Firebase
echo "--- Firebase Configuration ---"
read -p "VITE_FIREBASE_API_KEY: " VITE_FIREBASE_API_KEY
read -p "VITE_FIREBASE_AUTH_DOMAIN: " VITE_FIREBASE_AUTH_DOMAIN
read -p "VITE_FIREBASE_PROJECT_ID: " VITE_FIREBASE_PROJECT_ID
read -p "VITE_FIREBASE_STORAGE_BUCKET: " VITE_FIREBASE_STORAGE_BUCKET
read -p "VITE_FIREBASE_MESSAGING_SENDER_ID: " VITE_FIREBASE_MESSAGING_SENDER_ID
read -p "VITE_FIREBASE_APP_ID: " VITE_FIREBASE_APP_ID
echo ""

# Monitoring
echo "--- Monitoring & Analytics ---"
read -p "VITE_SENTRY_DSN (optional): " VITE_SENTRY_DSN
read -p "VITE_VERCEL_ANALYTICS_ID (optional): " VITE_VERCEL_ANALYTICS_ID
echo ""

echo "🔄 Configuring GitHub Secrets..."
echo ""

# Set all secrets
set_secret "VERCEL_TOKEN" "Vercel deployment token" "$VERCEL_TOKEN"
set_secret "VERCEL_ORG_ID" "Vercel organization ID" "$VERCEL_ORG_ID"
set_secret "VERCEL_PROJECT_ID" "Vercel project ID" "$VERCEL_PROJECT_ID"
set_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token" "$CLOUDFLARE_API_TOKEN"
set_secret "CLOUDFLARE_ACCOUNT_ID" "Cloudflare account ID" "$CLOUDFLARE_ACCOUNT_ID"
set_secret "VITE_SUPABASE_URL" "Supabase project URL" "$VITE_SUPABASE_URL"
set_secret "VITE_SUPABASE_ANON_KEY" "Supabase anonymous key" "$VITE_SUPABASE_ANON_KEY"
set_secret "VITE_ENCRYPTION_KEY" "Data encryption key" "$VITE_ENCRYPTION_KEY"
set_secret "VITE_OPENAI_API_KEY" "OpenAI API key" "$VITE_OPENAI_API_KEY"
set_secret "VITE_FIREBASE_API_KEY" "Firebase API key" "$VITE_FIREBASE_API_KEY"
set_secret "VITE_FIREBASE_AUTH_DOMAIN" "Firebase auth domain" "$VITE_FIREBASE_AUTH_DOMAIN"
set_secret "VITE_FIREBASE_PROJECT_ID" "Firebase project ID" "$VITE_FIREBASE_PROJECT_ID"
set_secret "VITE_FIREBASE_STORAGE_BUCKET" "Firebase storage bucket" "$VITE_FIREBASE_STORAGE_BUCKET"
set_secret "VITE_FIREBASE_MESSAGING_SENDER_ID" "Firebase messaging sender ID" "$VITE_FIREBASE_MESSAGING_SENDER_ID"
set_secret "VITE_FIREBASE_APP_ID" "Firebase app ID" "$VITE_FIREBASE_APP_ID"
set_secret "VITE_SENTRY_DSN" "Sentry DSN" "$VITE_SENTRY_DSN"
set_secret "VITE_VERCEL_ANALYTICS_ID" "Vercel Analytics ID" "$VITE_VERCEL_ANALYTICS_ID"

echo ""
echo "✅ Deployment configuration complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Verify secrets: gh secret list"
echo "2. Trigger deployment: git push origin main"
echo "3. Monitor deployment: gh run watch"
echo ""
