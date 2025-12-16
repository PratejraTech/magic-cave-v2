# Deployment Guide

## Quick Deploy to Vercel

```bash
bunx vercel --prod
```

## Environment Variables

Set in Vercel dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_FIREBASE_API_KEY
- Other vars from .env.example

## Performance Targets

- Bundle: < 500KB ✅ (Currently 386KB)
- LCP: < 2.5s
- Lighthouse: > 90

Deploy! 🚀
