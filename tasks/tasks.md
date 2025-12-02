Here is a detailed **tasks file draft** — `tasks-calendar-2.0.md` — breaking down the PRD into parent tasks and sub-tasks. This is designed for an LLM-enabled build agent (or dev team) building the expanded Advent Calendar platform. As requested, each major feature starts with a new feature branch.

```markdown
# tasks-calendar-2.0.md  
**Purpose:** implement the enhanced Advent Calendar + Parent Portal + templates/gifts/notifications/exports as defined in PRD v1.0  
- Always refer to the ***tasks/prd.md***
- Write state to ***tasks/bridge.md***

## Parent Tasks (High-Level)

- [ ] 0.0 Setup / Preparation & Data Model  
- [ ] 1.0 Authentication & Parent Portal  
- [ ] 2.0 Templates & Calendar Initialization  
- [ ] 3.0 Tile Content Customization & Media Upload  
- [ ] 4.0 Gift / Reward System  
- [ ] 5.0 Daily Notifications (New Tile Alerts)  
- [ ] 6.0 Export Calendar as PDF  
- [ ] 7.0 Analytics Instrumentation (MVP)  
 - [ ] 8.0 QA, Privacy & Launch Preparation
 - [ ] 9.0 LLM Integration for Personalized Content

---

## Sub-Tasks (Detailed Instructions)

### 0.0 Setup / Preparation & Data Model  
- [ ] 0.0.1 Create a new feature branch, e.g. `feature/calendar-v2-setup`  
- [ ] 0.0.2 Design and write database schema migrations for the new tables/entities: parents, children, templates, calendars, calendar_tiles, analytics_events (and audit_logs if used)  
- [ ] 0.0.3 Implement migration scripts using project’s existing migration tooling (e.g. in `supabase/migrations`)  
- [ ] 0.0.4 Write unit tests for CRUD operations on each new table: create, read, update, delete; also test relational constraints (e.g. child → parent, calendar → child, tiles → calendar)  
- [ ] 0.0.5 Set up secure media storage backend (e.g. S3 or object store) configuration, define access control policy for media assets, and integration with backend services  
- [ ] 0.0.6 Plan notification scheduling infrastructure (timezone handling, scheduling service or cron-job setup) — prepare config and placeholders  

**Success Criteria for 0.0:**  
- All migrations apply cleanly; database schema reflects all entities with correct constraints  
- CRUD tests pass consistently  
- Media storage configured and secure (test upload / retrieval with signed URL or restricted access)  
- Notification scheduling infrastructure scaffold exists (even if disabled)  

---

### 1.0 Authentication & Parent Portal  
- [ ] 1.0.1 Create feature branch: `feature/auth-parent-portal`  
- [ ] 1.0.2 Implement authentication backend: support Google OAuth, Facebook OAuth, and email magic-link login flow  
- [ ] 1.0.3 Build frontend Parent Portal UI: registration / login page, form for parent name + email + child profile (child name, birthdate, gender, interests), template selection dropdown  
- [ ] 1.0.4 On successful parent sign-up: generate `family_uuid` (unique per parent), and create a temporary child password (or allow parent to set) — store securely  
- [ ] 1.0.5 Implement “child login” flow: allow child login using `family_uuid` + password; child view should be minimal (no editing of profiles)  
- [ ] 1.0.6 Build profile editing UI (parent only): allow updates to child profile, change template, update interests, change password, regenerate `family_uuid` if needed  
- [ ] 1.0.7 Write backend validations: email uniqueness, valid birthdate, required fields, sanitation of inputs  
- [ ] 1.0.8 Write unit/integration tests covering auth flows, profile creation, profile editing, child login, error cases (invalid credentials, duplicate email)  

**Success Criteria for 1.0:**  
- Parent sign-up/login works reliably via OAuth and magic-link flows  
- Child login works with provided `family_uuid` and password; child accesses only child-view calendar  
- Profile creation and editing persist correctly; data validated and sanitized  
- Tests cover edge cases; no regressions  

---

### 2.0 Templates & Calendar Initialization  
- [ ] 2.0.1 Create new branch: `feature/templates-calendar-init`  
- [ ] 2.0.2 Define 3 default templates with metadata (name, description, style metadata — e.g. colors, fonts, icons/assets) in code or seed data  
- [ ] 2.0.3 Add frontend logic to apply template styling globally (CSS variables, dynamic asset references) based on template metadata when parent or child views load  
- [ ] 2.0.4 On child profile completion, auto-create a `calendar` record and generate 25 `calendar_tiles` records (days 1 through 25) with default empty content (title/body/media/gift)  
- [ ] 2.0.5 Ensure database enforces constraint: exactly one calendar per child (or maintain uniqueness condition)  
- [ ] 2.0.6 Write tests: calendar creation, tile generation, correct default values, template association, uniqueness constraint enforcement  
- [ ] 2.0.7 Provide UI for parent to preview template before confirming selection (optional)  

**Success Criteria for 2.0:**  
- Upon profile creation, calendar and 25 tiles exist for the child in DB  
- Templates style is correctly applied in UI for parent and child views  
- Switching template (before any customization) updates UI accordingly  
- Tests pass, uniqueness enforced  

---

### 3.0 Tile Content Customization & Media Upload  
- [ ] 3.0.1 Create branch: `feature/tile-customization`  
- [ ] 3.0.2 Build tile-editor UI: allow parent to select a tile (day 1–25), set title (string), body (text), upload media (image or video), view preview  
- [ ] 3.0.3 Backend: implement endpoints for tile update (title/body/media), media upload handling, storing `media_url`, linking to calendar_tile record  
- [ ] 3.0.4 Implement media validation: file type, size limits, security checks, sanitization  
- [ ] 3.0.5 Ensure that media assets are only accessible to authenticated parent/child (use signed URLs or authenticated retrieval)  
- [ ] 3.0.6 Write unit/integration tests covering tile updates, media upload flows, invalid input handling (e.g. unsupported file type, oversized file)  
- [ ] 3.0.7 UI feedback & error handling: show upload progress, errors, ability to remove/replace media  

**Success Criteria for 3.0:**  
- Parent can successfully customize any tile with title/body/media  
- Media upload works, files stored securely, accessible only under proper auth  
- Invalid inputs rejected gracefully, with clear error messages  
- Tests verify correct behavior  

---

### 4.0 Gift / Reward System  
- [ ] 4.0.1 Create branch: `feature/gifts-rewards`  
- [ ] 4.0.2 Extend tile model to include gift metadata (in `gift` JSON field) — support gift types: sticker, video/link, downloadable asset, external link, “experience” (text instruction), etc.  
- [ ] 4.0.3 Build parent UI to assign a gift to a tile: select gift type, upload asset or link, add optional instructions or description  
- [ ] 4.0.4 Backend endpoints for gift assignment; validation for gift metadata and media (if uploading)  
- [ ] 4.0.5 Build child unlock flow in frontend: when child opens a tile — if gift exists → prompt child to optionally write a short note to parent → then reveal gift (show sticker, play video, show link, etc.)  
- [ ] 4.0.6 Persist unlock event: mark `gift_unlocked = true`, record `opened_at`, record `note_from_child` if provided  
- [ ] 4.0.7 Prevent re-unlocking: once a gift has been unlocked, disallow further unlocking or note edits for that tile  
- [ ] 4.0.8 Write tests: gift assignment, unlock flow, note submission, gift reveal, re-unlock prevention, edge cases (missing gift, child logout mid-flow)  

**Success Criteria for 4.0:**  
- Parents can assign gifts to tiles reliably  
- Child unlock + note + gift reveal works as expected  
- Gift unlock persists correctly in DB; repeated unlock attempts blocked  
- Tests pass for all intended flows, including edge cases  

---

### 5.0 Daily Notifications (New Tile Alerts)  
- [ ] 5.0.1 Create branch: `feature/daily-notifications`  
- [ ] 5.0.2 Extend calendar settings to include `notifications_enabled` and store child/parent timezone or locale for scheduling  
- [ ] 5.0.3 Build opt-in UI: allow parent (and optionally child) to consent to notifications; record preference  
- [ ] 5.0.4 Implement backend scheduling logic: for each active calendar with notifications enabled — schedule a notification at 00:00 *local time* (child’s timezone) for each day from 1 to 25  
- [ ] 5.0.5 Integrate with push-notification service (or email fallback) to send daily alert: “New tile available today!” with link to calendar  
- [ ] 5.0.6 Build UI for notification settings: allow disable/enable, change preferences, unsubscribe; store preferences persistently  
- [ ] 5.0.7 Write tests for scheduling logic, time zone correctness, sending/not sending based on preference, unsubscribe flow  

**Success Criteria for 5.0:**  
- Notifications are sent at correct local midnight times (or skipped if disabled) for each tile day  
- Users can manage preferences; opt-in/opt-out works reliably  
- Tests verify scheduling and delivery logic  

---

### 6.0 Export Calendar as PDF  
- [ ] 6.0.1 Create branch: `feature/pdf-export`  
- [ ] 6.0.2 Build backend or frontend functionality to gather all calendar data: tile titles, bodies, media thumbnails (or placeholders), gift markers, child’s notes (if any)  
- [ ] 6.0.3 Implement PDF generation using a library (e.g. `@react-pdf/renderer` or server-side via headless browser) that respects current template styling for consistent look & feel  
- [ ] 6.0.4 Provide export UI: parent (or child) can trigger “Export Calendar PDF” once calendar complete (or any time) and receive a downloadable PDF file  
- [ ] 6.0.5 Log export event in analytics (event_type = `export_pdf`)  
- [ ] 6.0.6 Write tests: PDF generation (layout correctness, handling many media items), download link reliability, export event logging, file size / performance constraints  

**Success Criteria for 6.0:**  
- PDF export produces a correctly styled, complete calendar including all tiles and metadata  
- Downloadable file works on major browsers/devices  
- Export event logged to analytics successfully  
- Tests verify all related behaviors  

---

### 7.0 Analytics Instrumentation (MVP)  
- [ ] 7.0.1 Create branch: `feature/analytics-mvp`  
- [ ] 7.0.2 Define event schema: event types (login/signup, tile_opened, gift_unlocked, note_submitted, media_upload, template_change, pdf_export, notification_sent, notification_clicked) and associated metadata structure  
- [ ] 7.0.3 Implement backend endpoints / logic to log each event into `analytics_events` table (or designated analytics store) whenever the corresponding user action occurs  
- [ ] 7.0.4 Optional: build a simple reporting dashboard for parents/admins showing summary metrics (e.g. tiles opened %, gifts unlocked, media uploads, export count)  
- [ ] 7.0.5 Write tests to verify analytics logging on user actions, data integrity, and dashboard correctness if implemented  

**Success Criteria for 7.0:**  
- All defined events are logged correctly with appropriate metadata  
- Analytics data stored and retrievable  
- Dashboard (if implemented) displays correct aggregated metrics  
- Tests pass for logging and retrieval  

---

### 4.1 Application Integration & Routing (CRITICAL - Immediate)
- [ ] 4.1.1 Create global authentication context and routing guards
- [ ] 4.1.2 Implement main app routing: /auth, /parent/dashboard, /parent/calendar, /child/calendar
- [ ] 4.1.3 Build parent dashboard with calendar overview, profile management, settings
- [ ] 4.1.4 Integrate TileEditor into parent calendar view with data fetching
- [ ] 4.1.5 Integrate ChildCalendar into child view with unlock functionality
- [ ] 4.1.6 Add loading states and error boundaries throughout the app
- [ ] 4.1.7 Implement data fetching hooks for calendars, tiles, and user profiles
- [ ] 4.1.8 Add navigation between parent/child views and logout functionality

### 4.2 User Experience Improvements (CRITICAL - Immediate)
- [ ] 4.2.1 Make all components mobile-responsive with proper touch targets
- [ ] 4.2.2 Add accessibility features (ARIA labels, keyboard navigation, screen reader support)
- [ ] 4.2.3 Implement proper loading states and skeleton screens
- [ ] 4.2.4 Add confirmation dialogs for destructive actions (delete, logout)
- [ ] 4.2.5 Improve error messages and user feedback throughout the app
- [ ] 4.2.6 Add progress indicators for multi-step processes (registration, unlock flow)

### 4.3 Data Management & State (HIGH - Immediate)
- [ ] 4.3.1 Implement proper state management for user sessions and calendar data
- [ ] 4.3.2 Add offline support for viewing unlocked tiles
- [ ] 4.3.3 Implement data caching and optimistic updates
- [ ] 4.3.4 Add proper error handling for network failures
- [ ] 4.3.5 Implement data validation on both client and server sides

### 5.0 Daily Notifications (New Tile Alerts)
- [ ] 5.0.1 Create branch: `feature/daily-notifications`
- [ ] 5.0.2 Extend calendar settings to include `notifications_enabled` and store child/parent timezone or locale for scheduling
- [ ] 5.0.3 Build opt-in UI: allow parent (and optionally child) to consent to notifications; record preference
- [ ] 5.0.4 Implement backend scheduling logic: for each active calendar with notifications enabled — schedule a notification at 00:00 *local time* (child's timezone) for each day from 1 to 25
- [ ] 5.0.5 Integrate with push-notification service (or email fallback) to send daily alert: "New tile available today!" with link to calendar
- [ ] 5.0.6 Build UI for notification settings: allow disable/enable, change preferences, unsubscribe; store preferences persistently
- [ ] 5.0.7 Write tests for scheduling logic, time zone correctness, sending/not sending based on preference, unsubscribe flow

### 8.0 QA, Privacy & Launch Preparation
- [ ] 8.0.1 Create branch: `feature/qa-privacy-launch`
- [ ] 8.0.2 Conduct security audit: verify authentication flows, media access controls, data deletion paths, encrypted storage of sensitive tokens, secure transport (HTTPS), compliance with privacy best-practices
- [ ] 8.0.3 Implement data deletion feature: allow parent to delete account / child / calendar → cascade delete all related data including media and analytics; ensure media assets removed from storage
- [ ] 8.0.4 Perform UX & accessibility review: test calendar UI, tile flow, child login flows, mobile and desktop views, media rendering, PDF export, notification permissions — ensure user-friendly and accessible
- [ ] 8.0.5 Performance testing: media load times, calendar rendering, PDF generation responsiveness, notification delivery/latency under load, concurrency issues if many users
- [ ] 8.0.6 Documentation: update README, privacy policy / data-handling docs, parental consent notice, user instructions (parent & child), feature flag description (if used), versioning policy, changelog template
- [ ] 8.0.7 Beta release plan: define rollout strategy (e.g. small group of users), feedback collection mechanism, bug-reporting flow, rollback plan if necessary  

**Success Criteria for 8.0:**
- All security/privacy checks passed; data deletion works completely
- UI/UX works smoothly across devices; no major accessibility or usability issues
- Performance acceptable under realistic load; no crashes or major lag
- Documentation complete and clear; release plan defined

---

### 9.0 LLM Integration for Personalized Content
- [ ] 9.0.1 Create branch: `feature/llm-integration-setup`
- [ ] 9.0.2 Set up LLM service integration (OpenAI/Anthropic) with secure API key management and rate limiting
- [ ] 9.0.3 Implement personalized tile content generation: use child's interests, age, and family context to generate custom advent messages
- [ ] 9.0.4 Build AI-powered chat enhancement: integrate LLM responses into existing ChatWithDaddy feature for more engaging conversations
- [ ] 9.0.5 Add content moderation and safety filters for all AI-generated content
- [ ] 9.0.6 Implement caching layer for LLM responses to reduce API costs and improve performance
- [ ] 9.0.7 Create parent controls for AI features: enable/disable AI content generation, content guidelines, and usage monitoring
- [ ] 9.0.8 Write comprehensive tests for LLM integration, including mock responses, error handling, and content safety validation

**Success Criteria for 9.0:**
- AI-generated content is personalized, age-appropriate, and family-friendly
- Chat interactions are enhanced with contextual AI responses
- All AI features include proper safety filters and parent controls
- Performance is optimized with caching and rate limiting
- Tests verify AI integration reliability and safety

---

## Breaking-Change Awareness & Versioning Guideline  

- Use semantic versioning for releases (e.g. `v2.0.0`) if breaking changes are introduced. :contentReference[oaicite:0]{index=0}  
- Maintain a `CHANGELOG.md` to document new features, removed/deprecated features, fixes, and migration notes. :contentReference[oaicite:1]{index=1}  
- For any breaking change (e.g. migration of existing data schema, removal or renaming of fields, change in API contract), increment the **major** version. :contentReference[oaicite:2]{index=2}  
- Prefer additive changes (new endpoints, optional parameters) to avoid breaking existing flows. :contentReference[oaicite:3]{index=3}  
- Ensure migrations support backward compatibility or provide migration scripts; consider dual-writing or dual-reading if migrating from old schema in production. :contentReference[oaicite:4]{index=4}  

---

## Notes to the Agent / Developer  

- For every parent task: start with a fresh feature branch, commit atomic changes grouped by sub-task, and write clear commit messages referencing the task ID. This improves traceability and aligns with VCS best practices. :contentReference[oaicite:5]{index=5}  
- Ensure migrations are tested locally and on staging before applying to production; include rollback strategy.  
- Media uploads should be optional (i.e. tiles may have no media) to support minimal initial adoption.  
- For notifications: respect user preferences and timezones; consider daylight savings/timezone shifts.  
- Ensure analytics does not store sensitive personal data in clear text; avoid PII exposure.  
- Maintain modularity: each feature (auth, calendar, gifts, notifications, export, analytics) should be loosely coupled so that future changes or deprecations are manageable.

```

---