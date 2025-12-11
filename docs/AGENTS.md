# Repository Guidelines

Contributors can use this guide to navigate the Family Advent Calendar codebase quickly and consistently.

## Project Structure & Module Organization
`src/` contains the React + TypeScript frontend (components, hooks, lib utilities, and `src/__tests__`). API handlers live in `functions/`, background automation in `workers/`, and operational helpers in `scripts/`. Static assets belong in `public/`, while schema updates live under `supabase/migrations/`. Keep environment or infrastructure artifacts inside `server/`, `terraform/`, and `infrastructure/` so application code stays clean.

## Build, Test, and Development Commands
Use `npm run dev` for the Vite dev server and `npm run build` for production builds. Run `npm run lint` (ESLint + Prettier), `npm run typecheck` (tsc strict mode), and `npm run test` (Vitest + jsdom). Component-specific tests can be triggered with `npx vitest run src/__tests__/Component.test.tsx`, while `npm run test:e2e` covers Playwright scenarios. Always run lint, typecheck, and unit tests before pushing.

## Coding Style & Naming Conventions
Code is strict TypeScript; avoid `any` and prefer typed interfaces. Modules use ES imports with absolute paths from `src/`. Follow camelCase for functions/variables, PascalCase for components/types, and UPPER_SNAKE for constants. React code is hook-based; no class components. Keep JSX under 80–100 columns where feasible, extract helpers for business logic, and rely on ESLint + Prettier defaults via `npm run lint`.

## Testing Guidelines
Vitest with Testing Library drives unit coverage; Playwright handles e2e flows. Mirror file names (`Component.test.tsx`) and colocate mocks inside `src/__tests__`. Aim for coverage on new logic (state reducers, hooks, API handlers) and include regression tests when patching bugs. When tests touch async API calls, stub Supabase/LLM clients to keep suites deterministic.

## Commit & Pull Request Guidelines
Feature branches follow `feature/calendar-v2-<task>-<slug>` (example: `feature/calendar-v2-setup-auth`). Commits use `[task-id] Description` pulled from `tasks/tasks.md`. PRs should summarize scope, link the parent task, list test commands executed, and attach screenshots for UI changes. Keep diffs atomic—split lint-only or formatting updates from logic where possible.

## Security & Agent Workflow
Load `tasks/tasks.md` first to confirm scope, then append progress entries to `tasks/bridge.md` using ISO-8601 timestamps. Request approval before deleting files, adding dependencies, or running full builds when required. Store secrets in env files or platform config, never in Git. Follow least privilege when touching Supabase, Workers, or automation scripts, and prefer reviewing `.cursor/rules/` before updating schema or infrastructure files.
