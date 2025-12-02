# Body Field Regeneration System

## Overview

The `Body` field in photo JSON files is designed to be automatically regenerated every 2 days with fresh, creative ideas from the LLM. This keeps the calendar content dynamic and engaging.

## How It Works

1. **Timestamp Tracking**: Each JSON file includes a `body_timestamp` field that records when the Body was last generated.

2. **2-Day Refresh Cycle**: The `generatePhotoBodies.mjs` script checks if Body fields are older than 2 days and regenerates them automatically.

3. **Creative Generation**: The LLM uses a creative system prompt to generate unique, imaginative content each time, ensuring variety.

## Usage

### Manual Regeneration

To manually regenerate all stale Body fields (older than 2 days):

```bash
npm run refresh:bodies
```

Or with a custom API URL:

```

```bash
VITE_CHAT_API_URL=https://toharper.dad npm run generate:bodies
```

### Automatic Regeneration (Recommended)

Set up a scheduled task to run every 2 days:

#### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line to run every 2 days at 2 AM
0 2 */2 * * cd /path/to/harper-advent && VITE_CHAT_API_URL=https://toharper.dad npm run generate:bodies >> /tmp/body-regeneration.log 2>&1
```

#### Using GitHub Actions

Create `.github/workflows/refresh-bodies.yml`:

```yaml
name: Refresh Photo Bodies

on:
  schedule:
    - cron: '0 2 */2 * *'  # Every 2 days at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Regenerate Bodies
        env:
          VITE_CHAT_API_URL: https://toharper.dad
        run: npm run generate:bodies
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/photos/*_compressed.json
          git commit -m "Auto-refresh: Regenerate Body fields" || exit 0
          git push
```

#### Using Cloudflare Workers Cron Triggers

If deploying to Cloudflare, you can use Workers cron triggers to call your API endpoint that runs the regeneration script.

## Script Behavior

- **Checks file age**: Compares `body_timestamp` (or file modification time) against current time
- **Regenerates stale bodies**: Any Body older than 2 days (48 hours) is regenerated
- **Preserves other fields**: Only updates Body and body_timestamp fields
- **Creative prompts**: Uses enhanced system prompt for fresh, imaginative content each time

## Field Schema

After regeneration, JSON files include:

```json
{
  "Title": "...",
  "Subtitle": "Daddy Loves You!",
  "Body": "Fresh LLM-generated content...",
  "cache_key": "harper-day-15",
  "day": 15,
  "body_timestamp": 1763815724565.047
}
```

## Troubleshooting

- **No files regenerated**: All bodies are fresh (within 2 days). Wait or manually force regeneration.
- **API unavailable**: Ensure `VITE_CHAT_API_URL` is set correctly or the production API is accessible.
- **Missing timestamps**: Run `node scripts/backfillBodyTimestamps.mjs` to add timestamps to existing files.

