# PRD: Personalized Advent Calendar Platform with Parent Portal, Templates, Gifts & Notifications (v1.0)

## 0. Purpose & Scope

### 0.1 Purpose

Enhance the existing Advent Calendar application to deliver a deeply personalized, family-friendly, emotionally resonant experience for children. This includes parent-managed child profiles, customizable tile content and media, rewards/gifts, daily unlock notifications, and end-of-season export. The platform aims to offer a magical, surprise-filled journey that parents can tailor to their child’s preferences and store as a keepsake.

- The ***prd.md*** is broken down into ***tasks.md*** and state is written to ***bridge.md***

# ALWAYS
- Before every phase review files
- Make updates to ***tasks/bridge.md*** before every commit

### 0.2 Scope (v1.0)

- Single child per parent account
    
- Christmas-style calendar: 25 tiles/days
    
- Parent-managed customization: templates, tile titles/bodies/media, gifts
    
- Notifications for new tile availability
    
- Gift unlocking by child with optional note
    
- Export completed calendar as PDF
    
- Analytics instrumentation (basic engagement metrics)
    
- Secure authentication (parent + child access), data privacy/compliance
    
- Simplified UI/UX integration — keep existing animation & reveal mechanics
    

---

## 1. Data Model & Entities

Here is the proposed schema. Use UUIDs for primary keys; JSON (or JSONB) for flexible fields; relational constraints for consistency.

`Table: parents - parent_uuid (PK, uuid) - name (string) - email (string, unique) - auth_provider (enum: 'google' | 'facebook' | 'email_magic_link') - auth_provider_id (string | null) - family_uuid (uuid, unique)  // for child login - created_at (timestamp) - updated_at (timestamp)  Table: children - child_uuid (PK, uuid) - parent_uuid (FK → parents.parent_uuid) ON DELETE CASCADE - name (string) - birthdate (date) - gender (enum: 'female' | 'male' | 'other' | 'unspecified') - interests (jsonb)  // e.g. { "butterflies": true, "dogs": true, "swings": true } - selected_template (FK → templates.template_id) - created_at (timestamp) - updated_at (timestamp)  Table: templates - template_id (PK, uuid or string) - name (string)  // e.g. “Pastel Dreams”, “Adventure Boy”, “Rainbow Fantasy” - description (string) - metadata (jsonb) // style info: colors, fonts, icon sets, UI assets, default layout settings - created_at, updated_at  Table: calendars - calendar_id (PK, uuid) - child_uuid (FK → children.child_uuid), UNIQUE  // one calendar per child - year (int)  // e.g. 2025 - version (int)  // increment when structural/template changes happen - template_id (FK → templates.template_id)  // snapshot at creation or last update - last_tile_opened (int, nullable)  // 0 to 25 - settings (jsonb)  // e.g. { notifications_enabled: true, locale, export_on_complete: true, ... } - created_at, updated_at  Table: calendar_tiles - tile_id (PK, uuid) - calendar_id (FK → calendars.calendar_id) ON DELETE CASCADE - day (int)  // 1..25 - title (string, nullable)  // custom or default - body (text, nullable)   // custom or default - media_url (string, nullable)   // photo / video / asset link - gift (jsonb, nullable)   // e.g. { type: "sticker" | "video" | "experience" | "external_link", data: {...} } - gift_unlocked (boolean, default false) - note_from_child (text, nullable) - opened_at (timestamp, nullable) - version (int, default 1)  // content / schema version - created_at, updated_at  Table: audit_logs (optional but strongly recommended) - log_id (PK, uuid) - entity (string)  // e.g. 'calendar_tiles', 'calendars', etc. - entity_id (uuid) - action (string)  // 'create' | 'update' | 'delete' - data (jsonb)   // snapshot or diff - timestamp (timestamp)  Table: analytics_events (for MVP analytics) - event_id (PK, uuid) - parent_uuid (uuid, nullable) - child_uuid (uuid, nullable) - calendar_id (uuid, nullable) - tile_id (uuid, nullable) - event_type (string)  // e.g. 'tile_opened', 'gift_unlocked', 'note_submitted', 'export_pdf', 'login', 'signup', etc. - metadata (jsonb)  // optional additional info: timestamp, timezone, device_type, etc. - created_at (timestamp)`

**Notes & Rationale:**

- `family_uuid` allows child login with a shared family identifier plus a parent-managed password.
    
- `interests` enable personalization (e.g. default imagery or suggestions based on child likes: butterflies, dogs, swings).
    
- `templates.metadata` stores styling/theming information so UI can dynamically apply correct visuals.
    
- Use of JSON/JSONB ensures flexibility for future expansions (e.g. extra gift types, future features).
    
- `audit_logs` and `version` fields support versioning, history tracking, and rollback capability.
    
- `analytics_events` serves as the foundation for MVP analytics (engagement, unlock rates, etc.).
    

---

## 2. Core Features & Behavior

### 2.1 Authentication & Access

- **Parent flow**: sign-up / login via Google OAuth, Facebook OAuth, or email magic-link. Collect parent name & email.
    
- **Child flow**: parent obtains `family_uuid` + parent-defined password; child uses those credentials to log in. Child view is minimal (tile unlocking, note writing).
    
- **Access control**: parents see full portal, can edit all; child sees only calendar for unlocking; no access to profile edits or other children.
    

### 2.2 Parent Portal & Profile Management

- On first login, parent fills out child profile: name, birthdate, gender, interests — and selects a template.
    
- Parent can update profile any time: change template, interests, child info.
    
- Changing template immediately updates styling for calendar and future tiles. Existing media/content persists.
    

### 2.3 Template / Theming

- Provide at least 3 default templates (e.g. “Pastel Dreams”, “Adventure Boy”, “Rainbow Fantasy”) — each with distinct visuals (color palette, fonts, icons/graphics).
    
- Template metadata includes style definitions (CSS/asset references), layout rules, and default placeholders for tile borders/backgrounds.
    
- Template switching applies globally to calendar UI; parent may preview before confirming.
    

### 2.4 Calendar & Tile Content Customization

- On calendar creation, generate 25 tile records (days 1–25) with empty title/body/media.
    
- Parent can customize per-tile: set a title, body (text), upload media (image or video), or leave blank to optionally later fill.
    
- Validation: enforce reasonable length constraints; sanitize input to prevent XSS or broken formatting.
    

### 2.5 Gifts / Rewards Mechanism

- Parent may designate any tile to include a gift — of types: sticker, video, downloadable file, experience suggestion, external link, etc.
    
- On child opening tile: if gift exists, prompt for a short child note (optional but encouraged) → on submission, mark `gift_unlocked = true`, record `opened_at`.
    
- Display the gift: e.g. show sticker/graphics, play video, show download link or instructions — immediately after unlock.
    
- Prevent duplicate unlocks; once unlocked, cannot re-unlock.
    

### 2.6 Notifications

- If `settings.notifications_enabled = true`, send a notification (push or email) to the parent AND/OR child at **00:00 local time (child’s timezone)** every day during the 25-day calendar period informing of a “new tile available”.
    
- Use Web Push / Mobile Push / Email depending on user’s opt-in preferences. Use best practices for push: personalization, relevance, clear CTA. [xtremepush.com+2CleverTap+2](https://www.xtremepush.com/the-complete-guide-to-push-notifications-for-app-and-web?utm_source=chatgpt.com)
    
- Respect notification frequency and avoid over-notifying (once per day max). [Toptal+1](https://www.toptal.com/designers/ux/push-notification-best-practices?utm_source=chatgpt.com)
    
- Provide parental controls to disable notifications.
    

### 2.7 Export as PDF

- After all 25 tiles are opened or on parent request (e.g. “export calendar”), generate a PDF version of the calendar — including tile titles, bodies, media thumbnails (or indicatives), gift markers, and optionally child’s notes.
    
- Use a library such as `@react-pdf/renderer` (or similar) to render PDF from React components. [react-pdf.org+2Stack Overflow+2](https://react-pdf.org/?utm_source=chatgpt.com)
    
- For large media or many pages, consider using a web-worker to avoid blocking UI. [DEV Community](https://dev.to/simonhessel/creating-pdf-files-without-slowing-down-your-app-a42?utm_source=chatgpt.com)
    
- Provide download link to parent; store audit/log indicating export event.
    

### 2.8 Analytics (MVP)

Track and record usage data to inform future improvements:

- Events: tile_opened, gift_unlocked, note_submitted, export_pdf, login/signup, template_change, media_upload, notifications_sent, notifications_clicked, etc.
    
- Metrics: daily active users (parents / children), tile open rate (% of tiles opened), gift unlock rate, export rate, template usage distribution, media upload rate, average time between tile unlocks, engagement over 25-day period, etc.
    
- Store analytics in `analytics_events` table; optionally aggregate in analytics pipeline / data warehouse for reporting.
    

### 2.9 Privacy, Security & Compliance

- Child data (name, birthdate, interests, media) should be stored securely; media assets should be private (not publicly accessible).
    
- Access control: only authenticated parent or logged-in child (with correct family_uuid + password) can view corresponding calendar and media.
    
- Provide a “Delete account / calendar / child data” option — which deletes all related data (calendar, tiles, media, analytics) and media assets.
    
- Use encrypted storage for sensitive tokens (OAuth, magic links), secure transport (HTTPS), and adhere to best practices for user data protection.
    

---

## 3. System & Integration Requirements

- Backend: TypeScript (Node.js) API service — for auth, data storage, calendar/tile CRUD, media uploads, notifications scheduling, analytics logging, PDF generation endpoint.
    
- Frontend: React + Vite + Tailwind — UI for Parent Portal, calendar view, tile editor, child view, notifications consent, PDF export, media upload.
    
- Media storage: e.g. S3 or managed object storage; deliver via secure URLs or signed URLs to authenticated users.
    
- Notification system: Use Push API (web) or optional email fallback for desktop; for mobile builds (if any), use FCM / APNs. [MDN Web Docs+1](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API?utm_source=chatgpt.com)
    
- PDF generation: Use `@react-pdf/renderer` or server-side generation via headless browser (Puppeteer) / Node service for higher fidelity if needed. [Apryse+2Stack Overflow+2](https://apryse.com/blog/react/react-to-pdf?utm_source=chatgpt.com)
    
- Analytics: store events in backend database; option to pipeline to analytics/data-lake for long-term reporting.
    

---

## 4. Phase-by-Phase Development Plan (v1.0)

``Phase 0 — Preparatory & Data Modeling   - 0.0 Create feature branch (e.g. feature/parent-portal-v1)   - 0.1 Implement database schema: parents, children, templates, calendars, calendar_tiles, analytics_events, audit_logs   - 0.2 Write migrations / ensure backward compatibility (for existing calendar data)   - 0.3 Unit/integration tests for schema + CRUD operations   - 0.4 Set up media storage (object store), access controls, storage conventions   - 0.5 Define and configure push-notification service (or plan), timezone handling for scheduling daily alerts  Phase 1 — Authentication & Parent Portal     - 1.0 New branch: feature/auth-parent-portal     - 1.1 Implement OAuth (Google, Facebook) + magic-link / email auth     - 1.2 Build Parent Portal UI: profile creation (parent + child), input fields (name, birthdate, gender, interests, template pick)     - 1.3 Persist profile; validations (birthdate reasonable, required fields)     - 1.4 Generate `family_uuid` and temporary password for child login; display and copy option for parent     - 1.5 Profile editing UI; template change option     - 1.6 Tests: auth flows, profile creation/edit, child login via family_uuid    Phase 2 — Templates & Calendar Initialization     - 2.0 Branch: feature/templates-calendar-init     - 2.1 Define 3 default templates with metadata (styles, assets)     - 2.2 Frontend style logic: apply template styling globally (themes, CSS variables, asset loading)     - 2.3 Upon profile completion, auto-create `calendar` and 25 `calendar_tiles` (empty content)     - 2.4 Persist to DB; ensure constraints (one calendar per child)     - 2.5 Tests: calendar creation, template switching, tile initialization    Phase 3 — Tile Content Customization & Media Upload     - 3.0 Branch: feature/tile-customization     - 3.1 UI: tile editor — set title, body, upload media (image/video/link), preview tile     - 3.2 Backend: endpoints for tile update, media uploads (with validation), store `media_url`     - 3.3 Media access: secure storage & retrieval (signed URLs or permitted access only)     - 3.4 Input validation and sanitization for title/body     - 3.5 Tests: content CRUD, upload media, rendering media, edge cases (invalid files, missing uploads)    Phase 4 — Gift / Reward System     - 4.0 Branch: feature/gifts-rewards     - 4.1 UI: allow parent to assign gift per tile — choose gift type, upload or provide link/data     - 4.2 Persist gift metadata in `calendar_tiles.gift`     - 4.3 Child’s unlock flow: when child opens tile → check gift → prompt for note (optional) → mark `gift_unlocked`, record `opened_at`, `note_from_child`     - 4.4 UI for unlocked gift reveal: display sticker/video/asset; support download or view     - 4.5 Tests: unlocking flow, gift reveal, preventing re-unlock, note capture    Phase 5 — Notifications (Daily Tile Unlock Alerts)     - 5.0 Branch: feature/daily-notifications     - 5.1 On calendar creation or before launch, request notification permission from user (parent or child, depending on model)     - 5.2 Schedule daily notifications for 25 days at 00:00 local time (child’s timezone) indicating a new tile is available     - 5.3 Backend or cron-worker: compute next send time considering timezone, send push or email depending on user preferences     - 5.4 UI: allow user to enable/disable notifications, set preferences     - 5.5 Tests: scheduling logic, timezone correctness, notification delivery, unsubscribe flow    Phase 6 — Export Calendar as PDF     - 6.0 Branch: feature/pdf-export     - 6.1 Implement export: gather calendar data (tile content, media thumbnails or placeholders, notes, gift markers)     - 6.2 Use `@react-pdf/renderer` or server-side generation (e.g. Puppeteer) to produce styled PDF     - 6.3 Provide download link in UI; store export event in `analytics_events`     - 6.4 Tests: PDF generation, layout correctness, large media handling, download reliability    Phase 7 — Analytics & Reporting (MVP)     - 7.0 Branch: feature/analytics-mvp     - 7.1 Instrument key events: login/signup, tile_opened, gift_unlocked, note_submitted, media_upload, pdf_export, template_change, notification_sent/clicked     - 7.2 Build backend endpoints and store in `analytics_events` table     - 7.3 Optionally implement simple reporting dashboard for parents (e.g. % of tiles opened, gifts unlocked)     - 7.4 Tests: event logging, data integrity, reporting correctness    Phase 8 — QA, Privacy & Launch Preparation     - 8.0 Branch: feature/qa-privacy-launch     - 8.1 Security audit: verify auth flows, media permissions, data deletion flow, encryption, secure storage     - 8.2 UX & accessibility review: ensure calendar works for parents and child login, mobile and desktop     - 8.3 Performance testing: media load, calendar render speed, PDF generation time, notification reliability     - 8.4 Documentation: README updates, privacy policy, parental consent notice, instructions for parent/child login, data deletion     - 8.5 Beta release to selected users, gather feedback``  

---

## 5. Risk & Considerations

| Risk / Challenge                                                 | Mitigation / Notes                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Notifications may annoy users** (daily for 25 days)            | Ensure user opt-in, allow easy disable; follow push-notification best practices — personalize, give value, avoid spam. [Toptal+1](https://www.toptal.com/designers/ux/push-notification-best-practices?utm_source=chatgpt.com) |
| **Timezone / scheduling complexity** (users globally)            | Store child’s timezone (or compute from birthdate / parent locale) and schedule server-side jobs accordingly; robust timezone handling required.                                                                               |
| **Large media storage & bandwidth use** (photos/videos per tile) | Use efficient media storage (S3 or similar), compress/rescale media, use CDNs, limit upload size/format, lazy-load media.                                                                                                      |
| **PDF export performance & fidelity**                            | Use `@react-pdf/renderer` for vector PDF generation; possibly server-side generation for heavy content; or use Web-Worker to avoid blocking UI. [react-pdf.org+2Medium+2](https://react-pdf.org/?utm_source=chatgpt.com)       |
| **Privacy & child data protection**                              | Enforce strong access controls; parents must consent; provide data deletion; secure storage and transport; minimal data collected.                                                                                             |
| **Complexity of UI / mixing many custom features**               | Provide good defaults (empty calendar, default template) to lower friction; progressive enhancement — parents may optionally customize.                                                                                        |
| **Versioning & migration complexity**                            | Use schema versioning and audit logs; write thorough migration scripts and tests.                                                                                                                                              |