# Architecture Documentation
## Family Advent Calendar Application

**Version**: 2.0
**Last Updated**: December 2025
**Design System**: Modern AI Tech Company (OpenAI/Anthropic Aesthetic)

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Feature Workflows](#feature-workflows)
4. [Component Architecture](#component-architecture)
5. [Data Flow](#data-flow)
6. [Testing Strategy](#testing-strategy)
7. [Performance Considerations](#performance-considerations)
8. [Accessibility](#accessibility)

---

## Overview

The Family Advent Calendar is a modern web application that allows parents to create personalized advent calendars for their children with daily messages, media, and gifts. The application features a dual-experience design:

- **Parent Experience**: Professional dashboard with sidebar navigation, template marketplace, and inline tile editor
- **Child Experience**: Refined magical UI with soft pastel colors and gentle animations

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + CSS Custom Properties
- **Animation**: Framer Motion
- **Backend**: Cloudflare Pages Functions
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library + Playwright

---

## Design Philosophy

### Core Principles

1. **Modern AI Aesthetic**: Warm gradients (peach→rose→purple), soft shadows, clean typography
2. **Approachable Professionalism**: Easy to use, not overwhelming, purposeful design
3. **Performance First**: Optimized animations, lazy loading, minimal bundle size
4. **Accessibility**: WCAG AA compliance, keyboard navigation, screen reader support
5. **Refined Whimsy**: Magical for children without being overwhelming

### Design Tokens

```css
/* Primary Colors - Warm Gradients */
--color-primary-peach: #FF9A76;
--color-primary-rose: #FF6B9D;
--color-primary-purple: #C250E8;

/* Child UI - Soft Magical */
--color-magic-primary: #FDB4D8;    /* Soft pink */
--color-magic-secondary: #B4E4FF;  /* Soft blue */
--color-magic-accent: #FFE4B5;     /* Soft gold */

/* Typography */
--font-display: 'Plus Jakarta Sans', 'Inter', system-ui;
--font-body: 'Inter', system-ui;

/* Spacing (8pt grid) */
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px

/* Shadows (Soft OpenAI Style) */
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-sm: 0 2px 4px rgba(15, 23, 42, 0.06);
--shadow-md: 0 4px 8px rgba(15, 23, 42, 0.08);
--shadow-gradient: 0 8px 32px rgba(255, 107, 157, 0.2);
```

---

## Feature Workflows

### 1. Landing Page Journey

**User Goal**: Learn about the product and sign up

**Flow**:
```
Landing Page
  ├─> Hero Section (value proposition + 2 CTAs)
  ├─> Features (3-column grid)
  ├─> Template Showcase (carousel)
  ├─> Process Steps (3-step visual guide)
  ├─> Testimonials (social proof)
  └─> Final CTA → /auth
```

**Key Components**:
- `LandingPage.tsx` - Main landing page
- Gradient backgrounds with soft orbs
- Subtle snowfall (30 particles, opacity 0.08-0.15)
- 3 pastel butterflies (#FDB4D8, #B4E4FF)

**Success Metrics**:
- CTA click-through rate
- Template showcase engagement
- Time on page

---

### 2. Parent Dashboard Workflow

**User Goal**: Manage advent calendar, apply templates, edit tiles

**Flow**:
```
Authentication
  └─> Parent Dashboard (Sidebar Layout)
      ├─> Overview
      │   ├─> Statistics (tiles, gifts, unlocked)
      │   ├─> Quick Actions
      │   └─> Calendar Preview Grid
      │
      ├─> Template Marketplace ⭐
      │   ├─> Search & Filter
      │   ├─> Template Grid (cards with previews)
      │   ├─> Preview Modal
      │   └─> Apply Template → API Call
      │
      ├─> Calendar Editor
      │   ├─> Tile Grid (25 tiles)
      │   ├─> Inline Editor Panel
      │   ├─> Title & Message Input
      │   ├─> Media Upload (drag & drop)
      │   ├─> AI Content Generation
      │   ├─> Gift Configuration
      │   └─> Save → API Call
      │
      ├─> Analytics
      │   ├─> Engagement Metrics
      │   ├─> Export PDF
      │   └─> Child Interaction Data
      │
      └─> Settings
          ├─> Profile Information
          ├─> Preferences (timezone, AI personality)
          ├─> Child Login Credentials
          └─> Logout
```

**Key Components**:
- `ParentDashboard.tsx` - Main container with routing
- `Sidebar.tsx` - Navigation (desktop + mobile drawer)
- `TemplateMarketplace.tsx` - Browse and apply templates
- `TileEditor.tsx` - Inline tile editing
- `OverviewView`, `AnalyticsView`, `SettingsView` - View components

**Data Flow**:
```typescript
User Action (click "Apply Template")
  → TemplateMarketplace.onSelectTemplate()
  → API: PUT /api/calendar/template
  → Supabase: Update calendar.template_id
  → applyTemplateStyling() - Update CSS variables
  → UI: Show success message
  → Re-render with new template
```

**Success Metrics**:
- Template application rate
- Tile completion rate (all 25 customized)
- Time to complete calendar setup
- Feature adoption (AI generation, media upload)

---

### 3. Template Marketplace Workflow

**User Goal**: Find and apply a beautiful calendar theme

**Flow**:
```
Template Marketplace
  ├─> Search by keyword
  ├─> Filter by category (all, popular, modern, whimsical, elegant)
  ├─> Browse template cards
  │   ├─> Icon + Title + Tags
  │   ├─> Mini calendar preview
  │   └─> Preview / Apply buttons
  ├─> Preview Modal (full-screen simulation)
  └─> Apply → Confirm → Update calendar
```

**Features**:
- **Search**: Real-time filtering by name, headline, tags
- **Filters**: Category-based filtering with "Clear filters"
- **Preview**: Modal with live template simulation
- **Current Badge**: Shows which template is active
- **Animations**: Smooth transitions with Framer Motion

**Technical Implementation**:
```typescript
// Template filtering
const filteredTemplates = useMemo(() => {
  let filtered = [...TEMPLATE_LIBRARY];

  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter(t =>
      t.tags?.some(tag => tag.toLowerCase() === filterCategory)
    );
  }

  return filtered;
}, [searchQuery, filterCategory]);
```

**Success Metrics**:
- Template application rate
- Search usage
- Preview modal engagement
- Template diversity (not everyone using same template)

---

### 4. Tile Editor Workflow

**User Goal**: Customize each day of the advent calendar

**Flow**:
```
Calendar Editor View
  ├─> Tile Grid (left panel)
  │   ├─> 5x5 grid of 25 tiles
  │   ├─> Visual indicators (media icon, gift icon)
  │   └─> Selected state (gradient highlight)
  │
  └─> Editor Panel (right panel, sticky)
      ├─> Title Input (optional)
      ├─> Message Textarea
      │   ├─> Library button → Browse pre-written content
      │   ├─> Theme selector (Christmas, Encouragement, Love)
      │   └─> AI Generate button → Fetch from API
      ├─> Media Upload
      │   ├─> Drag & drop zone
      │   ├─> File input (image/video)
      │   └─> Preview uploaded media
      ├─> Gift Configuration
      │   ├─> Gift type selector
      │   └─> Conditional fields (URL, sticker, instructions)
      └─> Actions
          ├─> Cancel → Clear selection
          └─> Save → Update tile
```

**Key Features**:
- **Side-by-side layout**: Tile grid + editor panel
- **Visual feedback**: Selected tiles highlighted, content indicators
- **Sticky panel**: Editor stays visible while scrolling
- **AI Integration**: Generate personalized messages
- **Media handling**: Upload, preview, remove
- **Gift types**: Sticker, Video, Downloadable, Link, Experience

**Technical Implementation**:
```typescript
const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
const [editForm, setEditForm] = useState({ title, body, media_url, gift });

const handleSave = () => {
  onUpdateTile(selectedTile.tile_id, {
    title: editForm.title,
    body: editForm.body,
    media_url: editForm.media_url,
    gift: editForm.gift
  });
  setSelectedTile(null);
};
```

**Success Metrics**:
- Tiles with custom content (target: 80%+)
- AI generation usage
- Media upload rate
- Gift assignment rate

---

### 5. Child Calendar Workflow

**User Goal**: Unlock daily surprises in a magical interface

**Flow**:
```
Child Login
  └─> Child Calendar View
      ├─> Soft gradient background (pastel pink/blue)
      ├─> Calendar grid (25 tiles)
      │   ├─> Locked tiles (soft glow)
      │   ├─> Unlocked tiles (accessible)
      │   └─> Current day (highlighted)
      ├─> Tile Unlock
      │   ├─> Click tile
      │   ├─> Optional note prompt
      │   ├─> API: POST /api/unlock-tile
      │   ├─> Celebration animation (confetti)
      │   └─> Show message + media + gift
      └─> Gift Interaction
          ├─> Sticker → Display emoji
          ├─> Video → Play inline
          ├─> Download → Trigger download
          └─> Experience → Show instructions
```

**Refined Whimsy**:
- **Background**: Soft pastel gradients (20% opacity)
- **Snowfall**: 30 particles, opacity 0.08-0.15, slow movement
- **Butterflies**: 3 pastel butterflies, gentle flight paths
- **Tiles**: Soft shadows, gradient highlights
- **Animations**: Smooth, purposeful (200-300ms transitions)

**Success Metrics**:
- Daily unlock rate
- Gift interaction rate
- Note submission rate
- Session duration

---

## Component Architecture

### Component Hierarchy

```
App
├─> LandingPage
│   ├─> Hero
│   ├─> Features (Card components)
│   ├─> TemplateShowcase (Card grid)
│   ├─> Process
│   ├─> Testimonials
│   └─> CTASection
│
├─> ParentDashboard
│   ├─> Sidebar
│   │   ├─> SidebarSection
│   │   └─> SidebarNavItem
│   └─> Content Area (route-based)
│       ├─> OverviewView
│       ├─> MarketplaceView
│       │   └─> TemplateMarketplace
│       ├─> EditorView
│       │   └─> TileEditor
│       ├─> AnalyticsView
│       └─> SettingsView
│
└─> ChildCalendarView
    ├─> WonderlandLayout (refined animations)
    └─> ChildCalendar
        ├─> Calendar grid
        └─> Unlock modal
```

### Design System Components

**Core Components** (`src/components/ui/`):
- `WonderButton.tsx` - Primary button with variants (primary, secondary, ghost, outline, soft, danger)
- `card.tsx` - Flexible card system with variants (default, feature, stats, content, elevated)
- `Input.tsx` - Text input with label, icons, error states
- `Textarea.tsx` - Multiline input with character counting
- `Select.tsx` - Custom dropdown with gradient focus
- `Toggle.tsx` - Switch component with spring animation
- `Sidebar.tsx` - Navigation sidebar (desktop + mobile)
- `Modal.tsx` - Centered dialog system with compound components

**Compound Components Pattern**:
```typescript
<Card variant="feature" hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <CardTags>
      <CardTag>Tag 1</CardTag>
      <CardTag>Tag 2</CardTag>
    </CardTags>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

---

## Data Flow

### State Management

**Local State** (useState):
- UI state (selected tile, open modals, form inputs)
- Transient data (search queries, filters)

**Context API**:
- `AuthContext` - User authentication, session, profile
- `WinterEffectsContext` - Animation triggers, celebration effects
- `EmotionalResponseContext` - Mood-based animations

**Server State** (Custom hooks):
- `useCalendarData()` - Fetch tiles, update tiles, upload media
- `useAuth()` - Authentication status, user profile

### API Integration

**Endpoints**:
```typescript
// Calendar Management
GET  /api/calendar/tiles          // Fetch all tiles
PUT  /api/calendar/template        // Apply template
PUT  /api/calendar/tile/:id        // Update tile
POST /api/calendar/upload          // Upload media

// Child Interaction
POST /api/unlock-tile              // Unlock tile
POST /api/note                     // Submit child note

// AI Content
POST /api/generate-content         // Generate AI message

// Export
GET  /api/export/pdf               // Export calendar
```

**Error Handling**:
```typescript
try {
  const response = await fetch('/api/calendar/tile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Update failed');
  }

  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  alert('Failed to update. Please try again.');
}
```

---

## Testing Strategy

### Test Pyramid

```
        E2E (Playwright)           ← 10%
        Integration (Vitest)       ← 30%
        Unit (Vitest)              ← 60%
```

### High-Level Integration Tests

**Coverage Areas**:
1. **Landing Page**: Hero, features, template showcase, CTAs
2. **Parent Dashboard**: Navigation, view switching, statistics
3. **Template Marketplace**: Search, filter, apply
4. **Tile Editor**: Select, edit, save
5. **End-to-End Flows**: Complete user journeys
6. **Accessibility**: ARIA labels, keyboard navigation
7. **Performance**: Render times, bundle size

**Example Test**:
```typescript
describe('Parent Workflow', () => {
  it('should complete full workflow', async () => {
    render(<ParentDashboard />);

    // Navigate to marketplace
    fireEvent.click(screen.getByText(/Template Marketplace/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    // Navigate to editor
    fireEvent.click(screen.getByText(/Calendar Editor/i));
    await waitFor(() => {
      expect(screen.getByText(/Calendar Tiles/i)).toBeInTheDocument();
    });

    // Select and edit tile
    const tiles = screen.getAllByText(/^[0-9]+$/);
    fireEvent.click(tiles[0]);
    await waitFor(() => {
      expect(screen.getByText(/Edit Day 1/i)).toBeInTheDocument();
    });
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% coverage
- **Integration Tests**: Critical user paths
- **E2E Tests**: Happy path scenarios
- **Accessibility**: WCAG AA compliance

---

## Performance Considerations

### Optimizations Implemented

1. **Animation Refinement**:
   - Reduced snowfall: 50 → 30 particles
   - Removed WebGL shader (heavy GPU usage)
   - Softer animations: opacity 0.08-0.15 instead of 0.2-1.0
   - Slower durations: 16-24s instead of 5-10s

2. **Bundle Size**:
   - Current: 355 KB JS (114 KB gzipped)
   - CSS: 89.5 KB
   - Removed heavy animation files (unused)

3. **Lazy Loading**:
   - Route-based code splitting
   - Dynamic imports for modals
   - Image optimization

4. **Rendering Performance**:
   - React.memo for expensive components
   - useMemo for filtered lists
   - useCallback for event handlers
   - Framer Motion for GPU-accelerated animations

### Performance Metrics

**Target Lighthouse Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Accessibility

### WCAG AA Compliance

**Implemented Features**:
1. **Semantic HTML**: Proper heading hierarchy, landmark roles
2. **Keyboard Navigation**: All interactive elements accessible via keyboard
3. **ARIA Labels**: Descriptive labels for screen readers
4. **Focus Management**: Visible focus indicators, logical tab order
5. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
6. **Alternative Text**: All images have descriptive alt text
7. **Error Identification**: Clear error messages with ARIA live regions

**Example Implementation**:
```tsx
<button
  onClick={handleClick}
  aria-label="Apply Winter Wonderland template"
  aria-describedby="template-description"
  className="focus-visible:ring-2 focus-visible:ring-primary-rose"
>
  Apply Template
</button>
```

### Screen Reader Support

- All interactive elements have accessible names
- Form inputs have associated labels
- Dynamic content updates announced via ARIA live regions
- Skip navigation links for keyboard users

---

## Migration Notes

### Breaking Changes (v1.0 → v2.0)

1. **Theme System**: Removed WinterThemeContext variants (feminine/masculine/neutral)
2. **Button Component**: Removed 'frosted' variant, added 'soft' variant
3. **Card Component**: Changed from data-variant to variant prop
4. **Color System**: Complete CSS custom property rename

### Backward Compatibility

- Existing templates supported with migration script
- Database schema unchanged (only UI transformation)
- API endpoints unchanged

---

## Future Enhancements

### Planned Features

1. **Advanced Analytics**:
   - Heatmap of tile interactions
   - Engagement trends over time
   - Export detailed reports

2. **Template Builder**:
   - Visual template editor
   - Custom color schemes
   - Upload custom icons

3. **Social Features**:
   - Share calendars with other families
   - Public template library
   - Community ratings

4. **Mobile Apps**:
   - iOS and Android native apps
   - Push notifications for daily reminders
   - Offline support

### Technical Debt

- [ ] Add E2E tests with Playwright
- [ ] Implement comprehensive error boundary
- [ ] Add performance monitoring (Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Add internationalization (i18n)

---

## Conclusion

This architecture supports a modern, performant, and accessible advent calendar application with a professional parent experience and magical child experience. The modular component design, clear data flow, and comprehensive testing strategy ensure maintainability and scalability.

For questions or contributions, see [CLAUDE.md](./CLAUDE.md).
