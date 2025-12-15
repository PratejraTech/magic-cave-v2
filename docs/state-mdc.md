# State Management & Core Feature Interactions

**Version**: 2.0
**Last Updated**: December 2025
**Application**: Family Advent Calendar (Harper's Xmas Village)

---

## Table of Contents

1. [Overview](#overview)
2. [State Architecture](#state-architecture)
3. [Core Feature Interactions](#core-feature-interactions)
4. [Data Flow Patterns](#data-flow-patterns)
5. [User Journey State Maps](#user-journey-state-maps)
6. [API Integration Layer](#api-integration-layer)
7. [Real-Time Event System](#real-time-event-system)
8. [State Persistence Strategy](#state-persistence-strategy)

---

## Overview

The Family Advent Calendar application uses a **hybrid state management approach** combining React Context API for global application state, local component state for UI-specific data, and custom hooks for server state management. This architecture supports two distinct user experiences:

- **Parent Experience**: Dashboard-driven interface with template marketplace, calendar editor, and analytics
- **Child Experience**: Magical calendar interface with daily tile unlocking and gift interactions

### State Management Philosophy

1. **Single Source of Truth**: Server (Supabase) is the ultimate source of truth for calendar data
2. **Optimistic Updates**: UI updates immediately, with background server synchronization
3. **Minimal Global State**: Only truly global concerns (auth, theme, effects) live in Context
4. **Derived State**: Compute values on-demand rather than storing redundant data
5. **Event-Driven**: User interactions trigger events that flow through the state management layer

---

## State Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Root                       │
│                       (main.tsx)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Providers                        │
│  • AuthContext (user, session, profile)                     │
│  • WinterThemeContext (theme variant, winter mode)          │
│  • WinterEffectsContext (animations, celebrations)          │
│  • ThemeModeContext (light/dark mode)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Parent Routes   │  │  Child Routes    │
        └──────────────────┘  └──────────────────┘
                   │                 │
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Server State    │  │  Server State    │
        │  (useCalendar)   │  │  (useCalendar)   │
        └──────────────────┘  └──────────────────┘
                   │                 │
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Local UI State  │  │  Local UI State  │
        │  (useState)      │  │  (useState)      │
        └──────────────────┘  └──────────────────┘
```

---

## State Layers

### Layer 1: Global Context State

**Purpose**: Share cross-cutting concerns across the entire application

#### 1. AuthContext

**Responsibilities**:
- User authentication status (parent or child)
- Session management (JWT tokens, refresh logic)
- User profile data (parent/child details)
- Authorization checks

**State Shape**:
```typescript
interface AuthState {
  user: Parent | Child | null;
  userType: 'parent' | 'child' | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Key Actions**:
```typescript
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<Parent | Child>) => Promise<void>;
}
```

**Usage Example**:
```typescript
const { state, login, logout } = useAuth();

if (!state.isAuthenticated) {
  return <LoginScreen onLogin={login} />;
}

return state.userType === 'parent'
  ? <ParentDashboard />
  : <ChildCalendar />;
```

---

#### 2. WinterThemeContext

**Responsibilities**:
- Toggle winter wonderland mode on/off
- Select theme variant (feminine, masculine, neutral)
- Preview theme variants before applying
- Persist theme preferences to localStorage

**State Shape**:
```typescript
interface WinterThemeState {
  isWinterActive: boolean;
  variant: 'feminine' | 'masculine' | 'neutral';
  previewVariant: 'feminine' | 'masculine' | 'neutral' | null;
  isLoading: boolean;
}
```

**Key Actions**:
```typescript
interface WinterThemeContextType {
  state: WinterThemeState;
  toggleWinter: () => void;
  setVariant: (variant: WinterVariant) => void;
  setPreviewVariant: (variant: WinterVariant | null) => void;
}
```

**Theme Application Flow**:
```
User clicks "Toggle Winter Mode"
  ↓
toggleWinter() called
  ↓
isWinterActive state updated
  ↓
useEffect detects change
  ↓
CSS classes applied to document.body
  ↓
CSS custom properties update (smooth transition)
  ↓
localStorage updated for persistence
```

**Usage Example**:
```typescript
const { state, toggleWinter, setVariant } = useWinterTheme();

return (
  <ThemeSelector>
    <Toggle checked={state.isWinterActive} onChange={toggleWinter} />
    {state.isWinterActive && (
      <VariantPicker
        value={state.variant}
        onChange={setVariant}
      />
    )}
  </ThemeSelector>
);
```

---

#### 3. WinterEffectsContext

**Responsibilities**:
- Trigger celebration animations (confetti, sparkles, fireworks)
- Handle gesture-based interactions (swipe, pinch, long-press)
- Process voice commands (if enabled)
- Manage personalization profile (adaptive UI)
- Track interaction history for analytics

**State Shape**:
```typescript
interface WinterEffectsState {
  celebrationTrigger: CelebrationTrigger | null;
  isGestureActive: boolean;
  isVoiceActive: boolean;
  personalizationProfile: PersonalizationProfile | null;
  lastGesture: GestureEvent | null;
  lastVoiceCommand: VoiceCommand | null;
}

interface CelebrationTrigger {
  type: string; // 'tile_unlock', 'gift_reveal', 'magical_swipe_up', etc.
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}
```

**Key Actions**:
```typescript
interface WinterEffectsContextType {
  state: WinterEffectsState;
  handleGestureMagic: (gesture: GestureEvent) => void;
  handleVoiceCommand: (command: VoiceCommand) => void;
  handlePersonalizationUpdate: (profile: PersonalizationProfile) => void;
  handleAdaptiveEffect: (effect: AdaptiveEffect) => void;
  triggerCelebration: (type: string, position?: Point, metadata?: any) => void;
  clearCelebration: () => void;
  getGestureHistory: () => GestureEvent[];
  getVoiceHistory: () => VoiceCommand[];
  getMoodScore: () => number; // 0.0 - 1.0
}
```

**Celebration Flow**:
```
Child clicks tile to unlock
  ↓
onClick handler calls triggerCelebration('tile_unlock', position)
  ↓
WinterEffectsContext updates celebrationTrigger state
  ↓
ConfettiSystem component listens to celebrationTrigger
  ↓
Confetti animation triggered at position
  ↓
Auto-clear after 3 seconds via setTimeout
```

**Usage Example**:
```typescript
const { triggerCelebration } = useWinterEffects();

const handleTileUnlock = (tile: CalendarTile, event: MouseEvent) => {
  // Unlock tile via API
  await unlockTile(tile.tile_id);

  // Trigger celebration at click position
  triggerCelebration('tile_unlock', {
    x: event.clientX,
    y: event.clientY
  }, {
    day: tile.day,
    giftType: tile.gift?.type
  });
};
```

---

### Layer 2: Server State (Custom Hooks)

**Purpose**: Manage data fetched from backend APIs with caching, optimistic updates, and error handling

#### useCalendarData Hook

**Responsibilities**:
- Fetch calendar tiles for current user
- Update individual tiles (title, body, media, gift)
- Apply template to calendar (bulk update)
- Upload media files (images/videos)
- Handle loading, error, and success states

**Hook Interface**:
```typescript
interface UseCalendarDataReturn {
  // Data
  tiles: CalendarTile[];
  calendar: Calendar | null;
  template: Template | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isUploading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchTiles: () => Promise<void>;
  updateTile: (tileId: string, updates: Partial<CalendarTile>) => Promise<void>;
  unlockTile: (tileId: string, note?: string) => Promise<void>;
  applyTemplate: (templateId: string) => Promise<void>;
  uploadMedia: (file: File, tileId: string) => Promise<string>; // Returns URL

  // Utility
  getTileByDay: (day: number) => CalendarTile | undefined;
  getUnlockedTiles: () => CalendarTile[];
  getLockedTiles: () => CalendarTile[];
}
```

**Implementation Pattern**:
```typescript
const useCalendarData = (calendarId: string) => {
  const [tiles, setTiles] = useState<CalendarTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/calendar/${calendarId}/tiles`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tiles');

      const data = await response.json();
      setTiles(data.tiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [calendarId]);

  const updateTile = useCallback(async (tileId: string, updates: Partial<CalendarTile>) => {
    // Optimistic update
    setTiles(prev => prev.map(tile =>
      tile.tile_id === tileId ? { ...tile, ...updates } : tile
    ));

    try {
      const response = await fetch(`/api/calendar/tile/${tileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        // Rollback on failure
        await fetchTiles();
        throw new Error('Failed to update tile');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTiles]);

  useEffect(() => {
    fetchTiles();
  }, [fetchTiles]);

  return {
    tiles,
    isLoading,
    error,
    fetchTiles,
    updateTile,
    // ... other methods
  };
};
```

**Usage Example**:
```typescript
const TileEditor: React.FC = () => {
  const { tiles, updateTile, isUpdating } = useCalendarData(calendarId);
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);

  const handleSave = async () => {
    if (!selectedTile) return;

    await updateTile(selectedTile.tile_id, {
      title: formData.title,
      body: formData.body,
      media_url: formData.media_url
    });

    setSelectedTile(null);
    toast.success('Tile updated successfully!');
  };

  return (
    <EditorPanel>
      {tiles.map(tile => (
        <TileCard key={tile.tile_id} onClick={() => setSelectedTile(tile)} />
      ))}
      {selectedTile && (
        <EditForm onSave={handleSave} isLoading={isUpdating} />
      )}
    </EditorPanel>
  );
};
```

---

### Layer 3: Local Component State

**Purpose**: Manage UI-specific state that doesn't need to be shared globally

**Examples**:
- Form inputs (controlled components)
- Modal open/closed state
- Selected items (e.g., selected tile in editor)
- Transient search/filter values
- Accordion expand/collapse state
- Tooltip visibility

**Pattern**:
```typescript
const TemplateMarketplace: React.FC = () => {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Server state (from custom hook)
  const { templates, applyTemplate } = useTemplates();

  // Derived state (computed from local state)
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t =>
        t.metadata.category === filterCategory
      );
    }

    return filtered;
  }, [templates, searchQuery, filterCategory]);

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter value={filterCategory} onChange={setFilterCategory} />

      <TemplateGrid>
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.template_id}
            template={template}
            onPreview={() => setPreviewTemplate(template)}
            onApply={() => applyTemplate(template.template_id)}
          />
        ))}
      </TemplateGrid>

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
};
```

---

## Core Feature Interactions

### Feature 1: Parent Login → Dashboard

**User Journey**:
```
1. User visits landing page
2. Clicks "Parent Login" CTA
3. Redirected to /auth
4. Authenticates via Google/Email Magic Link
5. Redirected to /dashboard
```

**State Changes**:
```typescript
// Step 1: Initial state (unauthenticated)
AuthState: {
  user: null,
  userType: null,
  isAuthenticated: false,
  isLoading: false
}

// Step 3: Authentication initiated
AuthState: {
  user: null,
  userType: null,
  isAuthenticated: false,
  isLoading: true
}

// Step 5: Authentication complete
AuthState: {
  user: { parent_uuid: '...', name: 'Dad', email: '...' },
  userType: 'parent',
  isAuthenticated: true,
  isLoading: false
}

// Dashboard loads calendar data
CalendarState: {
  tiles: [...25 tiles],
  calendar: { calendar_id: '...', template_id: '...' },
  isLoading: false
}
```

**API Calls**:
```
POST /api/auth/login
  ← { access_token, refresh_token, user }

GET /api/calendar/tiles
  ← { tiles: [...], calendar: {...} }
```

---

### Feature 2: Apply Template from Marketplace

**User Journey**:
```
1. Parent navigates to Template Marketplace
2. Browses available templates
3. Clicks "Preview" on a template
4. Reviews template in preview modal
5. Clicks "Apply Template"
6. Confirmation prompt appears
7. Confirms application
8. Template applied to calendar
9. Success message shown
```

**State Changes**:
```typescript
// Step 1: Marketplace loaded
LocalState: {
  searchQuery: '',
  filterCategory: 'all',
  previewTemplate: null
}

TemplateState: {
  templates: [...20 templates],
  isLoading: false
}

// Step 3: Preview opened
LocalState: {
  searchQuery: '',
  filterCategory: 'all',
  previewTemplate: { template_id: 'winter-wonderland', ... }
}

// Step 5: Apply initiated
LocalState: {
  isApplying: true
}

// Step 8: Template applied
CalendarState: {
  calendar: {
    ...prevCalendar,
    template_id: 'winter-wonderland'
  },
  tiles: [...tiles with updated styling]
}

WinterThemeState: {
  variant: 'winter-wonderland',
  isWinterActive: true
}

// Step 9: Success shown
LocalState: {
  isApplying: false,
  showSuccessToast: true
}
```

**API Calls**:
```
PUT /api/calendar/template
  Body: { template_id: 'winter-wonderland' }
  ← { success: true, calendar: {...} }
```

**Side Effects**:
```typescript
const applyTemplate = async (templateId: string) => {
  setIsApplying(true);

  try {
    // 1. Update calendar record
    await fetch(`/api/calendar/${calendarId}/template`, {
      method: 'PUT',
      body: JSON.stringify({ template_id: templateId })
    });

    // 2. Update theme context
    const template = templates.find(t => t.template_id === templateId);
    if (template) {
      setVariant(template.metadata.variant);
      toggleWinter(true);
    }

    // 3. Trigger celebration
    triggerCelebration('template_applied');

    // 4. Show success message
    toast.success('Template applied successfully!');

    // 5. Refresh calendar data
    await fetchTiles();
  } catch (error) {
    toast.error('Failed to apply template');
  } finally {
    setIsApplying(false);
  }
};
```

---

### Feature 3: Edit Calendar Tile

**User Journey**:
```
1. Parent navigates to Calendar Editor
2. Clicks on a tile (e.g., Day 5)
3. Editor panel opens with tile data
4. Parent updates:
   - Title: "Magic Cocoa Day"
   - Body: "Let's make hot chocolate together!"
   - Uploads photo of cocoa
   - Adds gift: sticker "☕"
5. Clicks "Save"
6. Tile updates with new content
```

**State Changes**:
```typescript
// Step 2: Tile selected
LocalState: {
  selectedTile: {
    tile_id: 'tile-5',
    day: 5,
    title: 'Day 5',
    body: '',
    media_url: null,
    gift: null
  },
  formData: {
    title: 'Day 5',
    body: '',
    media_url: null,
    gift: null
  }
}

// Step 4: Form updated
LocalState: {
  selectedTile: {...},
  formData: {
    title: 'Magic Cocoa Day',
    body: 'Let\'s make hot chocolate together!',
    media_url: 'https://cdn.example.com/cocoa.jpg',
    gift: { type: 'sticker', sticker: '☕', title: 'Hot Cocoa' }
  }
}

// Step 5: Optimistic update
CalendarState: {
  tiles: [
    ...tiles.slice(0, 4),
    {
      tile_id: 'tile-5',
      day: 5,
      title: 'Magic Cocoa Day',
      body: 'Let\'s make hot chocolate together!',
      media_url: 'https://cdn.example.com/cocoa.jpg',
      gift: { type: 'sticker', sticker: '☕', title: 'Hot Cocoa' }
    },
    ...tiles.slice(5)
  ]
}

// Step 6: Server confirmed
CalendarState: {
  tiles: [...updated tiles with server timestamps]
}
```

**API Calls**:
```
POST /api/calendar/upload
  Body: FormData(file)
  ← { url: 'https://cdn.example.com/cocoa.jpg' }

PUT /api/calendar/tile/tile-5
  Body: {
    title: 'Magic Cocoa Day',
    body: 'Let\'s make hot chocolate together!',
    media_url: 'https://cdn.example.com/cocoa.jpg',
    gift: { type: 'sticker', sticker: '☕', title: 'Hot Cocoa' }
  }
  ← { tile: {...}, success: true }
```

---

### Feature 4: Child Unlocks Tile

**User Journey**:
```
1. Child logs in with passcode
2. Views calendar with 25 tiles
3. Current day (Dec 5) is highlighted
4. Child clicks on Day 5 tile
5. Unlock animation plays (confetti + sparkles)
6. Modal opens showing:
   - Title: "Magic Cocoa Day"
   - Photo of cocoa
   - Message from parent
   - Gift: Hot cocoa emoji sticker
7. Optional: Child writes note to parent
8. Child clicks "Close" or taps outside modal
9. Tile marked as opened with checkmark
```

**State Changes**:
```typescript
// Step 2: Calendar loaded
CalendarState: {
  tiles: [
    { tile_id: 'tile-1', day: 1, gift_unlocked: true, opened_at: '2025-12-01T08:00:00Z' },
    { tile_id: 'tile-2', day: 2, gift_unlocked: true, opened_at: '2025-12-02T09:15:00Z' },
    ...
    { tile_id: 'tile-5', day: 5, gift_unlocked: false, opened_at: null }, // Today
    { tile_id: 'tile-6', day: 6, gift_unlocked: false, opened_at: null }, // Locked (future)
    ...
  ]
}

// Step 4: Unlock initiated
LocalState: {
  isUnlocking: true,
  unlockingTileId: 'tile-5'
}

WinterEffectsState: {
  celebrationTrigger: {
    type: 'tile_unlock',
    position: { x: 450, y: 300 },
    metadata: { day: 5, giftType: 'sticker' }
  }
}

// Step 5: Unlock complete
CalendarState: {
  tiles: [
    ...
    {
      tile_id: 'tile-5',
      day: 5,
      gift_unlocked: true,
      opened_at: '2025-12-05T10:23:45Z'
    },
    ...
  ]
}

LocalState: {
  isUnlocking: false,
  unlockingTileId: null,
  openedTile: { tile_id: 'tile-5', ... } // Triggers modal
}

// Step 7: Child writes note
LocalState: {
  noteText: 'Thank you Daddy! I love hot cocoa ❤️'
}

// Step 8: Note submitted
CalendarState: {
  tiles: [
    ...
    {
      tile_id: 'tile-5',
      ...
      note_from_child: 'Thank you Daddy! I love hot cocoa ❤️'
    },
    ...
  ]
}
```

**API Calls**:
```
POST /api/unlock-tile
  Body: { tile_id: 'tile-5' }
  ← { tile: {...}, success: true }

POST /api/note
  Body: { tile_id: 'tile-5', note: 'Thank you Daddy! I love hot cocoa ❤️' }
  ← { success: true }
```

**Analytics Tracking**:
```typescript
// Unlock event
trackAnalyticsEvent({
  event_type: 'tile_opened',
  metadata: {
    tile_id: 'tile-5',
    day: 5
  }
});

// Gift interaction
trackAnalyticsEvent({
  event_type: 'gift_unlocked',
  metadata: {
    tile_id: 'tile-5',
    day: 5,
    gift_type: 'sticker'
  }
});

// Note submission
trackAnalyticsEvent({
  event_type: 'note_submitted',
  metadata: {
    tile_id: 'tile-5',
    day: 5,
    note_length: 39
  }
});
```

---

### Feature 5: AI Content Generation

**User Journey**:
```
1. Parent editing tile in Calendar Editor
2. Clicks "AI Generate" button in message field
3. Theme selector appears (Christmas, Encouragement, Love, Gratitude)
4. Selects "Encouragement"
5. Loading spinner appears
6. AI-generated message appears in textarea:
   "Harper, you're growing so brave and kind.
   I'm so proud of the wonderful person you're becoming.
   Keep shining! Love, Dad"
7. Parent can edit or accept message
8. Clicks "Save"
```

**State Changes**:
```typescript
// Step 2: AI generation initiated
LocalState: {
  isGenerating: false,
  showThemeSelector: true
}

// Step 4: Theme selected, generation starts
LocalState: {
  isGenerating: true,
  showThemeSelector: false,
  generationTheme: 'encouragement'
}

// Step 6: Content received
LocalState: {
  isGenerating: false,
  formData: {
    ...formData,
    body: "Harper, you're growing so brave and kind..."
  }
}
```

**API Calls**:
```
POST /api/generate-content
  Body: {
    child_name: 'Harper',
    day: 5,
    theme: 'encouragement',
    context: {
      interests: ['butterflies', 'cocoa', 'stories'],
      age: 3,
      previous_messages: [...]
    }
  }
  ← {
    content: "Harper, you're growing so brave and kind...",
    cache_key: 'gen_5_encouragement_abc123',
    cached: false
  }
```

**Caching Strategy**:
```typescript
// First request (uncached)
generateContent({
  child_name: 'Harper',
  day: 5,
  theme: 'encouragement'
})
→ OpenAI API call (costs $0.002)
→ Cache result for 48 hours
→ Return content

// Second request within 48 hours (cached)
generateContent({
  child_name: 'Harper',
  day: 5,
  theme: 'encouragement'
})
→ Retrieve from cache
→ Return content (no API call)
```

---

## Data Flow Patterns

### Pattern 1: Optimistic Updates

**Goal**: Provide instant UI feedback while background API call completes

**Implementation**:
```typescript
const updateTile = async (tileId: string, updates: Partial<CalendarTile>) => {
  // 1. Save current state for rollback
  const previousTiles = tiles;

  // 2. Update UI immediately (optimistic)
  setTiles(prev => prev.map(tile =>
    tile.tile_id === tileId ? { ...tile, ...updates } : tile
  ));

  try {
    // 3. Send API request
    const response = await fetch(`/api/calendar/tile/${tileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Update failed');

    // 4. Optionally merge server response (timestamps, computed fields)
    const serverTile = await response.json();
    setTiles(prev => prev.map(tile =>
      tile.tile_id === tileId ? serverTile : tile
    ));
  } catch (error) {
    // 5. Rollback on error
    setTiles(previousTiles);
    toast.error('Failed to update tile. Please try again.');
  }
};
```

**Benefits**:
- Instant UI feedback (no waiting for API)
- Smooth user experience
- Automatic rollback on failure

---

### Pattern 2: Derived State with useMemo

**Goal**: Compute values from existing state without storing redundant data

**Implementation**:
```typescript
const TemplateMarketplace: React.FC = () => {
  const { templates } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Derived state (computed on every render, but memoized)
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(t =>
        t.metadata.category === filterCategory
      );
    }

    return result;
  }, [templates, searchQuery, filterCategory]);

  return (
    <TemplateGrid templates={filteredTemplates} />
  );
};
```

**Benefits**:
- No redundant state storage
- Automatic re-computation when dependencies change
- Performance optimization (memo prevents unnecessary recalculations)

---

### Pattern 3: Event Propagation (Bottom-Up)

**Goal**: Child components trigger events that bubble up to parent handlers

**Implementation**:
```typescript
// Leaf component (DayCard)
interface DayCardProps {
  tile: CalendarTile;
  onUnlock: (tileId: string, position: Point) => void;
}

const DayCard: React.FC<DayCardProps> = ({ tile, onUnlock }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (tile.gift_unlocked) return; // Already unlocked

    onUnlock(tile.tile_id, {
      x: e.clientX,
      y: e.clientY
    });
  };

  return <Card onClick={handleClick}>{tile.day}</Card>;
};

// Parent component (ChildCalendar)
const ChildCalendar: React.FC = () => {
  const { tiles, unlockTile } = useCalendarData();
  const { triggerCelebration } = useWinterEffects();

  const handleUnlock = async (tileId: string, position: Point) => {
    try {
      // 1. API call
      await unlockTile(tileId);

      // 2. Trigger celebration
      triggerCelebration('tile_unlock', position);

      // 3. Track analytics
      trackEvent('tile_opened', { tile_id: tileId });
    } catch (error) {
      toast.error('Failed to unlock tile');
    }
  };

  return (
    <Grid>
      {tiles.map(tile => (
        <DayCard key={tile.tile_id} tile={tile} onUnlock={handleUnlock} />
      ))}
    </Grid>
  );
};
```

**Benefits**:
- Clear separation of concerns
- Reusable leaf components
- Centralized business logic in parent

---

### Pattern 4: Context for Cross-Cutting Concerns

**Goal**: Share state across deeply nested components without prop drilling

**When to Use**:
- Authentication status (used everywhere)
- Theme settings (affects all UI components)
- Celebration effects (triggered from any component)

**When NOT to Use**:
- Data fetching (use custom hooks instead)
- Form state (use local state)
- List filtering (use local state + useMemo)

**Example (Auth Context)**:
```typescript
// Provider (root level)
<AuthProvider>
  <App />
</AuthProvider>

// Consumer (deeply nested component)
const ProfileMenu: React.FC = () => {
  const { state, logout } = useAuth();

  return (
    <Menu>
      <MenuItem>{state.user?.name}</MenuItem>
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  );
};
```

---

## User Journey State Maps

### Journey 1: Parent Creates Full Calendar

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Authentication                                      │
│ State: user=null → user=Parent, isAuthenticated=true       │
│ API: POST /api/auth/login                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Dashboard Load                                      │
│ State: tiles=[], calendar=null → tiles=[...], calendar={...}│
│ API: GET /api/calendar/tiles                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Apply Template                                      │
│ State: template_id=null → template_id='winter-wonderland'  │
│ API: PUT /api/calendar/template                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Edit Tiles (x25)                                    │
│ For each tile:                                              │
│   - Select tile (selectedTile=tile)                         │
│   - Update form (formData={...})                            │
│   - Upload media (media_url=URL)                            │
│   - AI generate message (body=generated)                    │
│   - Save tile (API: PUT /api/calendar/tile/:id)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Review & Publish                                    │
│ State: is_published=false → is_published=true              │
│ API: PUT /api/calendar (update settings)                   │
└─────────────────────────────────────────────────────────────┘
```

---

### Journey 2: Child Unlocks All Tiles

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Child Login                                         │
│ State: user=null → user=Child, userType='child'            │
│ API: POST /api/auth/login (passcode)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: View Calendar                                       │
│ State: tiles=[...25 tiles], currentDay=5                   │
│ API: GET /api/calendar/tiles                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Unlock Today's Tile (Dec 5)                         │
│ State: tiles[4].gift_unlocked=false → true                 │
│       celebrationTrigger='tile_unlock'                      │
│ API: POST /api/unlock-tile                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: View Content Modal                                  │
│ State: openedTile=tiles[4], showModal=true                 │
│ UI: Display title, message, photo, gift                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Write Note to Parent                                │
│ State: noteText='Thank you!' → tiles[4].note_from_child    │
│ API: POST /api/note                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Close Modal                                         │
│ State: showModal=false, openedTile=null                    │
│ UI: Return to calendar grid                                │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integration Layer

### REST API Endpoints

#### Authentication
```
POST /api/auth/login
  Body: { email, password } OR { passcode }
  Returns: { user, session, access_token, refresh_token }

POST /api/auth/logout
  Headers: { Authorization: Bearer <token> }
  Returns: { success: true }

POST /api/auth/refresh
  Body: { refresh_token }
  Returns: { access_token }
```

#### Calendar Management
```
GET /api/calendar/tiles
  Headers: { Authorization: Bearer <token> }
  Returns: { tiles: CalendarTile[], calendar: Calendar }

PUT /api/calendar/template
  Headers: { Authorization: Bearer <token> }
  Body: { template_id }
  Returns: { calendar: Calendar, success: true }

PUT /api/calendar/tile/:id
  Headers: { Authorization: Bearer <token> }
  Body: Partial<CalendarTile>
  Returns: { tile: CalendarTile, success: true }

POST /api/calendar/upload
  Headers: { Authorization: Bearer <token> }
  Body: FormData(file)
  Returns: { url: string }
```

#### Child Interactions
```
POST /api/unlock-tile
  Headers: { Authorization: Bearer <token> }
  Body: { tile_id }
  Returns: { tile: CalendarTile, success: true }

POST /api/note
  Headers: { Authorization: Bearer <token> }
  Body: { tile_id, note }
  Returns: { success: true }
```

#### AI Content Generation
```
POST /api/generate-content
  Headers: { Authorization: Bearer <token> }
  Body: {
    child_name,
    day,
    theme: 'christmas' | 'encouragement' | 'love' | 'gratitude',
    context: { interests, age, previous_messages }
  }
  Returns: {
    content: string,
    cache_key: string,
    cached: boolean
  }
```

#### Analytics Export
```
GET /api/export/pdf
  Headers: { Authorization: Bearer <token> }
  Returns: Binary PDF file (Content-Type: application/pdf)
```

---

### Error Handling Strategy

**Standardized Error Responses**:
```typescript
interface APIError {
  error: string;
  code: 'AUTH_REQUIRED' | 'INVALID_REQUEST' | 'NOT_FOUND' | 'SERVER_ERROR';
  details?: Record<string, unknown>;
}
```

**Client-Side Error Handling**:
```typescript
const handleAPIError = (error: APIError) => {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      // Redirect to login
      router.push('/auth');
      break;
    case 'INVALID_REQUEST':
      // Show validation errors
      toast.error(error.error);
      break;
    case 'NOT_FOUND':
      // Show 404 message
      toast.error('Resource not found');
      break;
    case 'SERVER_ERROR':
      // Show generic error
      toast.error('Something went wrong. Please try again.');
      break;
  }
};
```

**Retry Logic** (for transient failures):
```typescript
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error('Client error');
      }

      // Retry server errors (5xx)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};
```

---

## Real-Time Event System

### WebSocket Connection (Future Enhancement)

**Purpose**: Enable real-time updates when parent edits calendar while child is viewing

**Implementation Plan**:
```typescript
// Server (Supabase Realtime)
const supabase = createClient(url, key);

supabase
  .channel('calendar_updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'calendar_tiles',
    filter: `calendar_id=eq.${calendarId}`
  }, (payload) => {
    // Broadcast to connected clients
    channel.send({
      type: 'TILE_UPDATED',
      tile: payload.new
    });
  })
  .subscribe();

// Client
const useRealtimeCalendar = (calendarId: string) => {
  const [tiles, setTiles] = useState<CalendarTile[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`calendar:${calendarId}`);

    channel
      .on('broadcast', { event: 'TILE_UPDATED' }, ({ tile }) => {
        setTiles(prev => prev.map(t =>
          t.tile_id === tile.tile_id ? tile : t
        ));

        toast.info('Calendar updated!');
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [calendarId]);

  return { tiles };
};
```

---

## State Persistence Strategy

### Local Storage

**Persisted Data**:
- `winter-theme-active`: boolean (theme toggle state)
- `winter-variant`: 'feminine' | 'masculine' | 'neutral'
- `auth-session`: { access_token, refresh_token, expires_at }
- `child-passcode-hint`: string (optional reminder for parent)

**Implementation**:
```typescript
// Save to localStorage
const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Load from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;

  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;

  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};
```

---

### Session Storage

**Persisted Data** (cleared on tab close):
- `preview-template`: Template (temporary preview state)
- `draft-tile-edits`: Partial<CalendarTile> (unsaved edits)

---

### IndexedDB (Future Enhancement)

**Use Cases**:
- Offline support (cache calendar data)
- Media file queue (upload when back online)
- Analytics event buffer (batch send)

---

## State Debugging Tools

### React DevTools Integration

**Recommended Extensions**:
- React Developer Tools
- Redux DevTools (if migrating to Redux)

**Custom DevTools Panel**:
```typescript
// Add global state inspector (development only)
if (import.meta.env.DEV) {
  window.__DEBUG__ = {
    auth: () => console.log(useAuth.getState()),
    calendar: () => console.log(useCalendarData.getState()),
    effects: () => console.log(useWinterEffects.getState())
  };
}
```

---

### State Logging Middleware

```typescript
const withLogging = <T extends (...args: any[]) => any>(fn: T, name: string): T => {
  return ((...args: any[]) => {
    console.group(`[${name}]`);
    console.log('Args:', args);

    const result = fn(...args);

    if (result instanceof Promise) {
      result
        .then(res => console.log('Result:', res))
        .finally(() => console.groupEnd());
    } else {
      console.log('Result:', result);
      console.groupEnd();
    }

    return result;
  }) as T;
};

// Usage
const updateTile = withLogging(
  (tileId: string, updates: Partial<CalendarTile>) => {
    // implementation
  },
  'updateTile'
);
```

---

## Migration Path to Advanced State Management

### When to Consider Redux/Zustand

**Migrate if**:
- Context re-renders become a performance issue
- State logic becomes too complex for Context
- Need advanced dev tools (time-travel debugging)
- Team prefers centralized state management

**Migration Strategy**:
```
1. Install Zustand (lightweight alternative to Redux)
2. Create stores for each context:
   - authStore (replaces AuthContext)
   - calendarStore (replaces useCalendarData hook)
   - effectsStore (replaces WinterEffectsContext)
3. Gradually replace Context consumers with store hooks
4. Remove Context providers once migration complete
```

**Example (Zustand Store)**:
```typescript
import { create } from 'zustand';

interface CalendarStore {
  tiles: CalendarTile[];
  isLoading: boolean;
  error: string | null;

  fetchTiles: (calendarId: string) => Promise<void>;
  updateTile: (tileId: string, updates: Partial<CalendarTile>) => Promise<void>;
  unlockTile: (tileId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  tiles: [],
  isLoading: false,
  error: null,

  fetchTiles: async (calendarId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/calendar/${calendarId}/tiles`);
      const data = await response.json();
      set({ tiles: data.tiles, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateTile: async (tileId, updates) => {
    // Optimistic update
    set(state => ({
      tiles: state.tiles.map(t => t.tile_id === tileId ? { ...t, ...updates } : t)
    }));

    try {
      await fetch(`/api/calendar/tile/${tileId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      // Rollback
      await get().fetchTiles(calendarId);
    }
  },

  unlockTile: async (tileId) => {
    // implementation
  }
}));
```

---

## Summary

This state management architecture provides:

✅ **Clear separation of concerns** (global vs local state)
✅ **Optimistic updates** for instant UI feedback
✅ **Type-safe API layer** with TypeScript
✅ **Event-driven celebrations** triggered by user actions
✅ **Scalable patterns** (custom hooks, derived state, context)
✅ **Analytics tracking** at every interaction point
✅ **Persistence strategy** (localStorage, future IndexedDB)
✅ **Migration path** to advanced state management (Zustand/Redux)

The system supports both parent and child experiences with distinct user flows while maintaining a unified state management approach. All state changes are traceable, debuggable, and optimized for performance.

---

**Next Steps**:
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for component structure
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for API deployment configuration
3. Implement real-time features using Supabase Realtime
4. Add comprehensive state logging for debugging
5. Consider Zustand migration if performance issues arise
