# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Calendar Creator v2.0 - An interactive advent calendar application combining React frontend with Cloudflare Pages Functions backend, Supabase database, and AI-powered content generation. The app creates personalized daily calendar experiences for children with photos, stories, chat, and animations.

## Core Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Animations**: Framer Motion + GSAP
- **Backend**: Cloudflare Pages Functions (Wrangler)
- **Database**: Supabase (PostgreSQL with row-level security)
- **Workers**: Cloudflare Workers for analytics datalake
- **AI/LLM**: LangChain + OpenAI (gpt-4o-mini) for chat and content generation
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Package Manager**: Bun (required - do not use npm or yarn)

## Package Management - CRITICAL

**ALWAYS use Bun as the package manager. Never use npm, yarn, or pnpm.**

```bash
bun install                    # Install dependencies
bun add <package>              # Add dependency
bun add -d <package>           # Add dev dependency
bun remove <package>           # Remove dependency
bun update                     # Update dependencies
bun outdated                   # Check for outdated packages
```

If you find `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` files, they should be removed. Only `bun.lockb` is valid.

## Development Commands

### Building & Running
```bash
bun run dev                    # Start Vite dev server (port 5173, auto-unlocks calendar entries)
bun run build                  # Production build
bun run preview                # Preview production build
bun run typecheck              # TypeScript type checking (no emit)
```

### Testing
```bash
bun test                       # Run Vitest in watch mode
bun run test:ci                # Run tests with JSON reporter for CI
bun run test:e2e               # Run Playwright E2E tests (headless)
bun run test:e2e:ui            # Playwright UI mode
bun run test:e2e:headed        # Run E2E with browser visible
```

### Code Quality
```bash
bun run lint                   # ESLint check
```

### Content Generation Scripts
```bash
bun run generate:photos        # Generate photoPairs.generated.ts from public/photos/*.json
bun run upload:photos          # Validate and compress photo metadata
bun run generate:bodies        # Regenerate AI story bodies (requires VITE_CHAT_API_URL)
bun run refresh:bodies         # Force refresh all bodies (FORCE_REFRESH_BODIES=true)
```

### Database & Migrations
```bash
bun run migrate:d1             # Run D1 migrations (production)
bun run migrate:d1:local       # Run D1 migrations (local)
bun run backup:database        # Backup Supabase database
```

### Cloudflare Workers
```bash
bun run datalake:setup         # Setup analytics datalake
bun run datalake:deploy        # Deploy datalake worker (cd workers && bunx wrangler deploy)
bun run datalake:trigger       # Trigger scheduled datalake job
bun run cache:letter-chunks    # Cache letter chunks for rendering
bun run cache:letter-chunks:wrangler  # Cache using Wrangler
```

### Single Test Execution
```bash
bunx vitest run path/to/test.test.ts                    # Run specific test file
bunx vitest run -t "test name pattern"                  # Run tests matching pattern
bunx playwright test e2e/specific-test.spec.ts          # Run specific E2E test
```

## AI Model Selection for Development

When using Claude Code or AI-assisted development:

- **Claude Sonnet** (default): Use for routine tasks including:
  - Bug fixes
  - Adding new features with clear requirements
  - Refactoring existing code
  - Writing tests
  - Updating documentation
  - Code reviews
  - Dependency updates

- **Claude Opus**: Use ONLY for extremely complex tasks including:
  - Major architectural changes affecting multiple systems
  - Complex database schema migrations with data transformations
  - Performance optimization requiring deep analysis
  - Security audits and hardening
  - Complex algorithm implementations
  - Multi-service integration planning
  - Production incident resolution with unknown root causes

Default to Sonnet unless the task explicitly requires deep reasoning, multi-step planning across services, or has significant production risk.

## Production-Ready Architecture Principles

All code must be production-ready at all times. This means:

### 1. Error Handling & Resilience
- All async operations wrapped in try-catch with proper error logging
- Graceful degradation when services are unavailable
- User-facing error messages are clear and actionable
- Never expose internal errors, stack traces, or sensitive data to users
- Implement circuit breakers for external service calls (OpenAI, Supabase)
- Retry logic with exponential backoff for transient failures

### 2. Observability & Monitoring
- All critical operations emit analytics events (AnalyticsEvent table)
- Performance metrics tracked (render times, API latencies)
- Error tracking with context (user actions, state snapshots)
- Cloudflare Workers analytics for backend operations
- Console errors/warnings minimized in production

### 3. Security
- All user inputs sanitized and validated (XSS, injection prevention)
- Environment variables never committed or exposed client-side
- Supabase row-level security (RLS) enforced for all data access
- Media served via signed URLs or authenticated endpoints
- HTTPS enforced, secure headers configured
- Rate limiting on API endpoints
- CSRF protection on state-changing operations

### 4. Performance
- Images optimized (sharp processing, responsive sizes)
- Code splitting and lazy loading for features
- Animations use CSS transforms (GPU-accelerated)
- Database queries optimized with proper indexes
- API responses cached appropriately (letter chunks, photo bodies)
- Lighthouse score targets: Performance >90, Accessibility >95

### 5. Testing & Quality
- 80% code coverage minimum (enforced in vitest.config.ts)
- E2E tests for critical user flows (calendar unlock, chat, photo viewing)
- Type safety enforced (no `any` types without justification)
- ESLint rules followed, no warnings in production builds
- Preview deployments tested before production

### 6. Data Integrity
- Database migrations tested in staging before production
- Backup strategy in place (`bun run backup:database`)
- Data validation at API boundaries
- Cascade deletes configured for parent → child → calendar → tiles
- Unique constraints enforced (family_uuid, share_uuid, email)

### 7. Deployment & Rollback
- All deployments via CI/CD (Cloudflare Pages auto-deploy)
- Environment-specific configurations (.env.production)
- Zero-downtime deployments
- Quick rollback capability (Cloudflare deployment history)
- Database migrations backward-compatible when possible

### 8. Documentation
- Critical flows documented in .deploy/ directory
- API contracts documented (request/response schemas)
- Environment variables documented in README or CLAUDE.md
- Breaking changes noted in migrations and commit messages

## Architecture

### Data Model

The application follows a parent-child-calendar-tile hierarchy defined in `.cursor/rules/data_model.md`:

- **Parent**: OAuth-authenticated accounts (Google, Facebook, magic_link) with unique `family_uuid`
- **ChildProfile**: Linked to parent, contains name, birthdate, gender, interests, theme preferences
- **Calendar**: One per child, with 25 CalendarTile entries, publish state, and share_uuid
- **CalendarTile**: Days 1-25 with title, body (AI-generated), media_url, gift_metadata, unlock tracking
- **NotificationSettings**: Timezone-aware daily notifications per calendar
- **AnalyticsEvent**: Tracks tile_opened, gift_unlocked, media_uploaded, etc.

### File Structure

```
src/
├── features/
│   ├── advent/              # Calendar UI, animations, modals
│   │   ├── AdventCalendar.tsx
│   │   ├── components/      # EnchantedBackground, Snowfall, NorthernLights, etc.
│   │   └── utils/           # SoundManager, ConfettiSystem
│   └── chat/                # Chat-with-Daddy feature
│       ├── ChatWithDaddy.tsx
│       ├── chatService.ts   # API client for /api/chat-with-daddy
│       └── systemPrompt.ts
├── components/              # Shared UI (Header, Modal, TileEditor, Butterfly, etc.)
├── contexts/                # React contexts (WinterThemeContext, ThemeModeContext, etc.)
├── lib/                     # Utilities (date helpers, storage, animations)
├── data/                    # Static data (calendarContent.ts, photoPairs.generated.ts)
└── types/                   # TypeScript type definitions

functions/api/               # Cloudflare Pages Functions (chat-with-daddy.mjs, etc.)
workers/                     # Cloudflare Workers (harper-datalake-analytics.mjs)
scripts/                     # Bun scripts (photo generation, migrations, backups)
supabase/migrations/         # Database schema migrations
e2e/                         # Playwright end-to-end tests
public/
├── photos/                  # Photo pairs: day-XX.png + day-XX.json
├── data/                    # daddy-quotes.json for chat RAG
└── music/                   # Background audio files
```

### Photo + Content System

Photos live in `public/photos/` as pairs:
- `day-01.png` (or .jpg) - The image file
- `day-01.json` - Metadata: `{ "Title": "...", "Subtitle": "...", "Body": "...", "cache_key": "...", "day": 1, "body_timestamp": ... }`

Run `bun run generate:photos` to regenerate `src/data/photoPairs.generated.ts` which the calendar reads at runtime.

**Body Generation**: The `Body` field is an AI prompt. Run `bun run generate:bodies` to regenerate actual story text using OpenAI (cached for 48 hours via `body_timestamp`).

### Chat API (Cloudflare Pages Functions)

- Located in `functions/api/chat-with-daddy.mjs`
- Uses OpenAI gpt-4o-mini model
- RAG-enhanced with `public/data/daddy-quotes.json`
- System prompt stored in `CHAT_SYSTEM_PROMPT` environment variable (source: `config/chat-system-prompt.txt`)
- Session persistence via Cloudflare KV (`HARPER_ADVENT` namespace)
- Frontend posts to `/api/chat-sessions` for history tracking
- Frontend uses `VITE_CHAT_API_URL` env var for local dev (e.g., `https://toharper.dad`)

### Environment Variables

**Development** (`.env`):
- `VITE_FORCE_UNLOCK=true` - Unlock all calendar entries for testing (auto-enabled in dev mode)
- `VITE_CHAT_API_URL` - Chat API endpoint (e.g., `https://toharper.dad`)

**Production** (Cloudflare Pages):
- `OPENAI_API_KEY` - OpenAI API key
- `CHAT_SYSTEM_PROMPT` - System prompt for chat AI
- `UPLOAD_SUBTITLE` - Default subtitle for photo upload script

**Scripts**:
- `FORCE_REFRESH_BODIES=true` - Force regenerate all bodies instead of using cache

### Testing Strategy

**Unit Tests** (Vitest):
- Setup in `src/test/setup.ts` with jsdom environment
- Coverage thresholds: 80% branches/functions/lines/statements
- Run with `bun test`

**E2E Tests** (Playwright):
- Config in `playwright.config.ts`
- Tests in `e2e/` directory
- Runs against dev server on port 5173
- Supports chromium, firefox, webkit
- Run with `bun run test:e2e`

**Coverage Exclusions**: node_modules, test files, config files, public/, functions/, workers/, scripts/

## Agent Development Rules (from `.cursor/rules/rules.md`)

1. **Read-only by default** - Only modify files when working on defined tasks
2. **Atomic changes** - Small, focused changes per sub-task
3. **Test-driven reliability** - New logic requires accompanying tests; code must compile and tests pass
4. **Feature-branch workflow** - Pattern: `feature/calendar-v2-<parentTask>-<shortSlug>`
5. **Commit messages** - Must reference task ID: `[2.0.3] Add tile-editor UI`
6. **No lint/type errors** - Ensure clean before pushing; tests must pass
7. **Error handling** - Validate inputs, handle gracefully, never expose sensitive info
8. **Security** - No PII in public APIs; use signed URLs for media; support data deletion cascades
9. **Halt for review** - Stop if schema changes break data, external deps introduced, or performance/security concerns arise

## Brand & UX Guidelines (from `BRAND_GUIDE.md`)

- **Visual Theme**: Magical village with butterflies/hearts symbolizing love and discovery
- **Colors**: Electric pinks (FF5FA2–FF78D6), calming cyans (4EFCFF–72D8FF), sunset oranges, lavender, midnight blues
- **Typography**: Rounded display fonts for headlines, geometric sans for body text
- **Components**: Heart-shaped doors with neon outlines, split-layout modals (hero image left, story right)
- **Motion**: Soft wisp animations (Snowfall, NorthernLights, Fireflies), scale/bounce interactions
- **Audio**: Background music with soft fade, light sound effects (never startling)
- **Tone**: Dad's caring voice - safe, awe-inspiring, encouraging exploration

## Deployment

### Cloudflare Pages
- Frontend builds from `dist/` after `bun run build`
- Functions auto-deploy from `functions/` directory
- See `.deploy/CLOUDFLARE_DEPLOYMENT.md` for detailed instructions

### Supabase
- Migrations in `supabase/migrations/` and `supabase/migrationsv2/`
- Config in `supabase/config.toml`
- Use `bun run backup:database` before schema changes

### Cloudflare Workers
- Analytics datalake worker in `workers/harper-datalake-analytics.mjs`
- Deploy with `bun run datalake:deploy`

## Important File Locations

- **Calendar content**: `src/data/calendarContent.ts`, `src/data/photoPairs.generated.ts`
- **Photo metadata**: `public/photos/*.json`
- **Chat quotes**: `public/data/daddy-quotes.json`
- **System prompt**: `config/chat-system-prompt.txt`
- **Data model spec**: `.cursor/rules/data_model.md`
- **Agent rules**: `.cursor/rules/rules.md`
- **Deployment docs**: `.deploy/` directory

## Key Dependencies

- `@supabase/supabase-js` - Database client
- `langchain` + `@langchain/openai` - AI/LLM integration
- `framer-motion` - Declarative animations
- `gsap` - Complex animation sequences
- `react-router-dom` - Client-side routing
- `date-fns` + `date-fns-tz` - Timezone-aware date handling (Adelaide/Australia timezone)
- `sharp` - Image processing in scripts
- `wrangler` - Cloudflare deployment

## Notes

- Calendar unlocking is timezone-aware using Adelaide/Australia (`getAdelaideDate()` in `src/lib/date.ts`)
- Dev mode auto-unlocks all entries unless `VITE_FORCE_UNLOCK=false`
- Photo bodies are cached for 48 hours (`body_timestamp`) to avoid regenerating AI content unnecessarily
- Chat session history stored in localStorage (`chat-with-daddy`) and Cloudflare KV
- Test coverage enforced at 80% - any new features must include tests
- **Bun is the required package manager** - never use npm, yarn, or pnpm
- **All code must be production-ready** - follow error handling, security, and performance guidelines above
- **Use Claude Sonnet by default, Opus only for extremely complex tasks**
