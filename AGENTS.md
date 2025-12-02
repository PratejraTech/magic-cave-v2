# AGENTS.md - Family Advent Calendar Web App

**Purpose:** Instructions for AI coding agents working on this React + TypeScript + Vite project.

## Build/Test Commands
- **Build:** `npm run build` (Vite)
- **Lint:** `npm run lint` (ESLint)
- **Typecheck:** `npm run typecheck` (TypeScript strict mode)
- **Test all:** `npm run test` (Vitest + jsdom)
- **Single test:** `npx vitest run src/__tests__/Component.test.tsx`

## Code Style Guidelines
- **Language:** TypeScript with strict mode, no unused locals/parameters
- **Imports:** ES modules, absolute paths from src/
- **Formatting:** ESLint + Prettier (no custom config)
- **Naming:** camelCase functions/variables, PascalCase components/types, UPPER_SNAKE constants
- **Error handling:** Try/catch with meaningful messages, no console.error in prod
- **Types:** Strict typing required, use interfaces for objects, avoid any
- **React:** Functional components with hooks, no class components

## Cursor Rules (from .cursor/rules/rules.md)
- Read-only by default; only modify files for defined tasks in tasks.md
- Atomic changes: small, focused modifications per sub-task
- Test-driven: add tests for new logic; ensure code compiles and tests pass
- Feature-branch workflow: `feature/calendar-v2-<task>-<slug>`
- Progress tracking: update tasks/bridge.md with status/timestamps
- Ask approval for: full builds, new dependencies, major refactors, file deletions

## Directory Structure
- `src/`: React frontend (components, types, lib, __tests__)
- `functions/`: API functions (serverless)
- `workers/`: Cloudflare Workers
- `scripts/`: Build/utility scripts
- `supabase/migrations/`: Database migrations
- `public/`: Static assets

## Workflow
- Load `tasks/tasks.md` first for next task
- Update `tasks/bridge.md` with progress
- Commit format: `[task-id] Brief description`
- Schema changes: update `.cursor/rules/data_model.md` + migrations
