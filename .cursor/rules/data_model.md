# data_model.md  
**Purpose:** define the data model/schema for the expanded “Family Calendar / Advent Calendar” application — including parent portal, children, calendars, tiles, gifts, notifications, analytics, and export metadata.  

## 1. Core Entities  

### 1.1 Parent  
| Field | Type | Description | Constraints / Notes |
|---|---|---|---|  
| parent_uuid | UUID, PK | Unique identifier for a parent account | Generated on sign-up |  
| name | String | Parent’s full name | Required, non-empty |  
| email | String | Parent’s login email | Required, unique |  
| auth_provider | String | “google”, “facebook”, “magic_link” | Required |  
| auth_provider_id | String / Nullable | Provider-specific ID (if OAuth) | Nullable for magic_link |  
| family_uuid | String | Family code used for child login | Required, unique |  
| created_at | Timestamp | Timestamp of parent account creation | Default now |  
| updated_at | Timestamp | Last update timestamp | Auto-updated |  

### 1.2 ChildProfile  
| Field | Type | Description | Constraints |  
|---|---|---|---|  
| child_uuid | UUID, PK | Unique identifier for child profile | Generated on creation |  
| parent_uuid | UUID, FK → Parent.parent_uuid | Links child to parent | Required |  
| name | String | Child’s name | Required |  
| birthdate | Date | Child’s date of birth | Required |  
| gender | String (enum: “male”, “female”, “other”) | Gender / pronoun selection | Required |  
| interests | JSON / Text Array | List of child’s interests (e.g. “dogs”, “butterflies”, “swings”) | Optional |  
| theme_choice | String / enum / FK → Template.table | Selected UI template | Required |  
| created_at | Timestamp | Profile creation time | Default now |  
| updated_at | Timestamp | Last update | Auto-updated |  

### 1.3 Template (Calendar Style)  
| Field | Type | Description | Notes / Constraints |  
|---|---|---|---|  
| template_id | UUID, PK | Unique identifier for template | Pre-seeded (e.g. boy-style, girl-style, neutral) |  
| name | String | Human-readable template name | Required |  
| description | String | Short description for parent UI | Required |  
| style_metadata | JSON | Defines colors, fonts, icons/assets for UI | Required |  
| created_at | Timestamp | Template creation time | Default now |  
| updated_at | Timestamp | Last update time | Auto-updated |  
| retired | Boolean | Whether template is active / available | Default false |  

### 1.4 Calendar  
| Field | Type | Description | Constraints |  
|---|---|---|---|  
| calendar_id | UUID, PK | Unique identifier for the calendar | Generated on creation |  
| child_uuid | UUID, FK → ChildProfile.child_uuid | Which child this calendar belongs to | Required, unique (one calendar per child) |  
| parent_uuid | UUID, FK → Parent.parent_uuid | For reference / access control | Required |  
| template_id | UUID, FK → Template.template_id | Template chosen for this calendar | Required |  
| share_uuid | String | Public share code / link identifier | Unique, generated at publish | Nullable until publish |  
| is_published | Boolean | Whether calendar is published / live | Default false |  
| created_at | Timestamp | When calendar was created | Default now |  
| updated_at | Timestamp | Last update | Auto-updated |  
| last_tile_opened | Int (1–25) | Highest tile number opened so far (progress tracking) | Default 0 |  

### 1.5 CalendarTile  
| Field | Type | Description | Notes / Constraints |  
|---|---|---|---|  
| tile_id | UUID, PK | Unique for this tile | Generated on calendar creation |  
| calendar_id | UUID, FK → Calendar.calendar_id | Parent calendar | Required |  
| day | Int (1–25) | The day number / tile index | Required, unique per calendar |  
| title | String / Nullable | Title for the tile (e.g. “Day 1: Magic Surprise”) | Nullable (parent may leave blank) |  
| body | Text / Nullable | Body text / poem / message for the tile | Nullable |  
| media_url | String / Nullable | URL to image or video for tile | Nullable |  
| gift_metadata | JSON / Nullable | Defines gift/reward if tile has one (type, asset URL or link, description) | Nullable |  
| gift_unlocked | Boolean | Whether child has unlocked gift | Default false |  
| unlocked_at | Timestamp / Nullable | When gift was unlocked | Nullable |  
| child_note | Text / Nullable | Optional note from child to parent when unlocking gift | Nullable |  
| created_at | Timestamp | When tile entry created | Default now |  
| updated_at | Timestamp | Last updated | Auto-updated |  

### 1.6 NotificationSettings  
| Field | Type | Description | Notes / Constraints |  
|---|---|---|---|  
| notif_id | UUID, PK | Unique ID for settings record | Generated |  
| calendar_id | UUID, FK → Calendar.calendar_id | Which calendar this applies to | Required, unique per calendar |  
| timezone | String | Timezone identifier for scheduling (e.g. “Australia/Adelaide”) | Required |  
| notifications_enabled | Boolean | Whether daily tile-alert notifications are enabled | Default false |  
| created_at | Timestamp | Creation time | Default now |  
| updated_at | Timestamp | Last update | Auto-updated |  

### 1.7 ExportLog  
| Field | Type | Description | Notes |  
|---|---|---|---|  
| export_id | UUID, PK | Unique export event ID | Generated |  
| calendar_id | UUID, FK → Calendar.calendar_id | Calendar exported | Required |  
| exported_at | Timestamp | Time of export | Default now |  
| export_format | String (e.g. “pdf”) | Format used | Required |  
| file_url | String | URL where exported file is stored (signed or protected) | Required |  

### 1.8 AnalyticsEvent  
| Field | Type | Description | Notes |  
|---|---|---|---|  
| event_id | UUID, PK | Unique event ID | Generated |  
| calendar_id | UUID / Nullable | Which calendar — if relevant | Nullable (some events may be global) |  
| parent_uuid | UUID / Nullable | Parent associated, if relevant | Nullable |  
| child_uuid | UUID / Nullable | Child associated, if relevant | Nullable |  
| event_type | String | E.g. “tile_opened”, “gift_unlocked”, “note_submitted”, “media_uploaded”, “template_changed”, “pdf_export”, “notification_sent”, “notification_clicked” | Required |  
| metadata | JSON / Nullable | Contextual metadata (e.g. tile_id, day, timezone, media_size, etc.) | Nullable |  
| created_at | Timestamp | Event time | Default now |  

---

## 2. Relationships & Constraints  

- `Parent` 1 → many `ChildProfile` (but actual UX enforces only one child per parent)  
- `ChildProfile` 1 → 1 `Calendar`  
- `Calendar` 1 → many `CalendarTile` (exactly 25)  
- `Calendar` 0..1 → `NotificationSettings`  
- `Calendar` 0..many → `ExportLog`  
- `Calendar` 0..many → `AnalyticsEvent`  
- `CalendarTile` may reference zero or one gift (via `gift_metadata`)  

## 3. Data Integrity & Security Notes  

- Unique constraints on parent email, family_uuid, child → calendar, calendar → share_uuid, tile (calendar_id + day)  
- Use signed URLs or authenticated access for media and exported files  
- Sanitize user inputs (title, body, notes) to avoid injection, XSS, or unintended markup  
- PII (names, email, birthdate) stored securely; access controlled by auth and row-level security  
- All date/time fields in UTC internally; timezone adjustments handled at scheduling or display layer  

## 4. Versioning & Migration Strategy  

- Maintain a schema version identifier (e.g. in a `metadata` or `schema_version` table) to track upgrades  
- New fields or tables must have migration scripts with backward-compatible defaults  
- For breaking schema changes: provide data migration and fallback paths (e.g. read old fields if present)  
- Avoid removing or renaming fields until after holiday season / user data migration  

## 5. Example JSON Representation (Calendar + Tiles)  

```json
{
  "calendar_id": "uuid-1234",
  "child_uuid": "child-uuid-5678",
  "template_id": "template-uuid-bbbb",
  "is_published": false,
  "last_tile_opened": 0,
  "tiles": [
    {
      "day": 1,
      "title": null,
      "body": null,
      "media_url": null,
      "gift_metadata": null,
      "gift_unlocked": false
    },
    {
      "day": 2,
      ...
    }
    // ... up to day 25
  ],
  "notification_settings": {
    "timezone": "Australia/Adelaide",
    "notifications_enabled": true
  }
}
