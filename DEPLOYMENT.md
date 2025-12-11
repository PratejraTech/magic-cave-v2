# 🚀 Deployment Guide

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make the script executable
chmod +x scripts/setup-deployment.sh

# Run the setup script
./scripts/setup-deployment.sh
```

The script will interactively prompt you for all required secrets and configure them in GitHub.

### Option 2: Manual Secret Configuration

Visit your GitHub repository secrets page:
```
https://github.com/PratejraTech/magic-cave-v2/settings/secrets/actions
```

Add each secret listed in the **Required Secrets** section below.

### Option 3: Direct Deployment (Skip GitHub Actions)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy directly
vercel --prod
```

---

## Required Secrets

### 🔵 Vercel (Primary Hosting)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel deployment token | 1. Go to https://vercel.com/account/tokens<br>2. Create new token<br>3. Copy token |
| `VERCEL_ORG_ID` | Your Vercel organization ID | 1. Go to https://vercel.com/teams/settings<br>2. Copy Team ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | 1. Go to project settings<br>2. Copy Project ID |

### 🟠 Cloudflare (Serverless Functions)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | 1. Go to https://dash.cloudflare.com/profile/api-tokens<br>2. Create token with Workers permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | 1. Go to Cloudflare dashboard<br>2. Copy Account ID from sidebar |

### 🟢 Supabase (Database & Auth)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | 1. Go to https://app.supabase.com/project/_/settings/api<br>2. Copy "Project URL" |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | 1. Same page as above<br>2. Copy "anon/public" key |

### 🔐 Security

| Secret | Description | How to Generate |
|--------|-------------|-----------------|
| `VITE_ENCRYPTION_KEY` | 32-character encryption key | ```bash<br>openssl rand -base64 32<br>``` |

### 🤖 OpenAI (AI Features)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VITE_OPENAI_API_KEY` | OpenAI API key for content generation | 1. Go to https://platform.openai.com/api-keys<br>2. Create new secret key |

### 🔥 Firebase (Optional - if using Firebase features)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | From Firebase console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | From Firebase console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | From Firebase console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | From Firebase console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | From Firebase console → Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | From Firebase console → Project Settings |

### 📊 Monitoring (Optional)

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | 1. Go to https://sentry.io<br>2. Create project<br>3. Copy DSN |
| `VITE_VERCEL_ANALYTICS_ID` | Vercel analytics ID | From Vercel project → Analytics |

---

## Deployment Methods

### Method 1: GitHub Actions (Automated)

**Prerequisites**: All secrets configured in GitHub

**Steps**:
1. Configure secrets (use script or manual method above)
2. Push to main branch:
   ```bash
   git push origin main
   ```
3. Monitor deployment:
   ```bash
   gh run watch
   ```

**What Happens**:
- ✅ Lint check
- ✅ TypeScript check
- ✅ Build application with environment variables
- ✅ Deploy to Vercel
- ✅ Deploy Cloudflare Workers
- ✅ Run health check

### Method 2: Vercel CLI (Direct)

**Prerequisites**: Vercel CLI installed

**Steps**:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link project (first time only):
   ```bash
   vercel link
   ```

4. Set environment variables:
   ```bash
   # Add each env var from .env.example
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   # ... repeat for all variables
   ```

5. Deploy:
   ```bash
   vercel --prod
   ```

### Method 3: Cloudflare Pages (Alternative)

**Prerequisites**: Cloudflare account

**Steps**:
1. Go to https://dash.cloudflare.com/pages
2. Create new project
3. Connect to GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables in Cloudflare Pages settings
6. Deploy

### Method 4: Netlify (Alternative)

**Prerequisites**: Netlify account

**Steps**:
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify settings
6. Deploy

---

## Environment Variables Reference

### Build-Time Variables

These are embedded into the JavaScript bundle at build time:

```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ENCRYPTION_KEY=your-32-char-key
VITE_OPENAI_API_KEY=sk-...

# Firebase (if using)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...

# Monitoring (optional)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_VERCEL_ANALYTICS_ID=xxx

# Environment
VITE_ENV=production
```

### Runtime Variables

These are used by Cloudflare Workers at runtime:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role, not anon key!)
OPENAI_API_KEY=sk-...
```

---

## Verification Steps

After deployment, verify everything works:

### 1. Check Deployment Status
```bash
# GitHub Actions
gh run list --limit 1

# Vercel
vercel ls

# Cloudflare
wrangler deployments list
```

### 2. Test the Application

Visit your deployed URL and test:
- ✅ Landing page loads
- ✅ Can create parent account
- ✅ Can create child account
- ✅ Calendar tiles display correctly
- ✅ Template marketplace works
- ✅ Tile editor functions
- ✅ AI content generation works

### 3. Check Environment Variables

```bash
# Verify Vercel env vars
vercel env ls

# Verify Cloudflare env vars
cd functions && wrangler secret list
```

### 4. Monitor Errors

- **Sentry**: Check https://sentry.io for errors
- **Vercel Logs**: `vercel logs`
- **Cloudflare Logs**: Check Cloudflare dashboard

---

## Troubleshooting

### "Input required and not supplied: vercel-token"

**Problem**: `VERCEL_TOKEN` secret not set in GitHub

**Solution**:
```bash
# Set the secret
gh secret set VERCEL_TOKEN
# Paste your token when prompted
```

### "Build failed: VITE_SUPABASE_URL is not defined"

**Problem**: Environment variable not available during build

**Solution**:
1. Check GitHub secrets are set
2. Verify secret names match exactly (case-sensitive)
3. Re-run deployment

### "Cloudflare Worker deployment failed"

**Problem**: Cloudflare secrets not configured

**Solution**:
```bash
cd functions
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put OPENAI_API_KEY
```

### "Template marketplace not loading"

**Problem**: API endpoint not configured

**Solution**:
1. Check `VITE_CHAT_API_URL` is set correctly
2. Verify Cloudflare Workers are deployed
3. Check CORS settings

---

## Security Best Practices

### ✅ Do:
- Use separate keys for development and production
- Rotate API keys regularly
- Use Supabase Row Level Security (RLS)
- Enable Vercel authentication for preview deployments
- Set up Sentry for error monitoring
- Use environment variables for all secrets

### ❌ Don't:
- Commit `.env` files to git
- Share API keys in public channels
- Use production keys in development
- Expose service role keys in client code
- Skip encryption for sensitive data

---

## Deployment Checklist

- [ ] All GitHub secrets configured
- [ ] Vercel project created and linked
- [ ] Cloudflare Workers account set up
- [ ] Supabase database configured
- [ ] OpenAI API key obtained
- [ ] Environment variables verified
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Deployment workflow runs successfully
- [ ] Application accessible at production URL
- [ ] All features tested in production
- [ ] Monitoring configured (Sentry/Analytics)
- [ ] DNS/Domain configured (if custom domain)
- [ ] SSL certificate active

---

## Quick Reference Commands

```bash
# Setup all secrets interactively
./scripts/setup-deployment.sh

# List current secrets
gh secret list

# Deploy via GitHub Actions
git push origin main

# Watch deployment
gh run watch

# Deploy directly with Vercel
vercel --prod

# Deploy Cloudflare Workers
cd functions && wrangler deploy

# View logs
vercel logs
wrangler tail

# Local build with env vars
npm run build

# Test production build locally
npm run preview
```

---

## Support

**Issues**: https://github.com/PratejraTech/magic-cave-v2/issues

**Vercel Docs**: https://vercel.com/docs
**Cloudflare Docs**: https://developers.cloudflare.com/workers/
**Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: December 10, 2025
**Version**: 2.0.0
