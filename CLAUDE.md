# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Magic Cave Calendars is a Christmas advent calendar application with AI-powered personalization, interactive winter effects, and dual parent/child interfaces. Built with React, TypeScript, Vite, and Supabase.

## Development Commands

```bash
# Development
bun run dev              # Start dev server (uses bun per user preference)
npm run dev              # Alternative with npm

# Building
bun run build            # Production build
npm run preview          # Preview production build

# Testing
bun test                 # Run unit tests (Vitest)
bun run test:e2e         # Run Playwright end-to-end tests
bun run test:e2e:ui      # Run E2E tests with UI

# Code Quality
bun run lint             # ESLint
bun run typecheck        # TypeScript type checking

# Database & Content
bun run generate:photos  # Generate AI photo pairs for tiles
bun run generate:bodies  # Generate tile content with AI
bun run refresh:bodies   # Force refresh all AI-generated content
bun run upload:photos    # Upload photos to storage
```

## Architecture Overview

### Core Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Card, etc.)
│   ├── winter/         # Winter effects (Snow, Butterflies, Voice, Gestures)
│   ├── decorative/     # Christmas decorations (Tree, Ornaments)
│   ├── ParentDashboard.tsx
│   ├── ChildCalendarView.tsx
│   └── AuthModal.tsx
├── lib/                # Business logic & utilities
│   ├── auth.ts         # Authentication (Supabase)
│   ├── soundSystem.ts  # Christmas sound effects
│   ├── analytics.ts    # Event tracking
│   ├── useCalendarData.ts  # Calendar data hook
│   └── winterAnimationSystem.ts
├── contexts/           # React Context providers
│   ├── WinterEffectsContext.tsx
│   ├── WinterThemeContext.tsx
│   └── AuthContext.tsx
├── pages/              # Route-level components
├── routes/             # Route configuration
├── styles/             # Global CSS
│   ├── design-system.css
│   └── mobile-optimizations.css
└── types/              # TypeScript definitions
```

### Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion + GSAP
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe
- **Messaging**: Firebase Cloud Messaging
- **Testing**: Vitest + Playwright + Testing Library

### Design System

The app uses a comprehensive CSS variable-based design system (see `src/styles/design-system.css`):

- **Colors**: Organized by semantic purpose (primary, secondary, accents, magic)
- **Typography**: Display, body, and mono font families with size scales
- **Spacing**: Consistent spacing scale using design tokens
- **Shadows**: Multiple shadow levels for depth
- **Animations**: Custom keyframes for snow, butterflies, etc.

### Important Patterns

#### 1. Winter Effects System

The `WinterEffectsContext` orchestrates all magical interactions:

```typescript
// Usage example
import { useWinterEffects } from '../contexts/WinterEffectsContext';

const { triggerCelebration, handleGestureMagic } = useWinterEffects();

// Trigger celebration
triggerCelebration('tap_magic', { x: 100, y: 200 });
```

#### 2. Sound System

Christmas sounds are managed by the singleton `christmasSounds`:

```typescript
import { christmasSounds, soundPatterns } from '../lib/soundSystem';

// Play individual sounds
christmasSounds.play('tile_unlock');

// Use patterns
soundPatterns.celebrate();  // Full celebration sequence
soundPatterns.tileUnlock(); // Unlock sequence
```

#### 3. Calendar Data Hook

The `useCalendarData` hook manages tile data and operations:

```typescript
const { tiles, loading, error, updateTile, unlockTile } = useCalendarData();
```

#### 4. Authentication

Uses Supabase Auth with custom context:

```typescript
const { userType, isAuthenticated, parent, child, logout } = useAuth();
```

### Performance Optimizations

1. **Code Splitting**: Routes use `React.lazy()` for lazy loading
2. **Performance Tiers**: Device capabilities determine effect intensity
3. **FPS Monitoring**: Snow particles adapt based on frame rate
4. **Image Optimization**: Sharp for image processing
5. **Service Worker**: Firebase messaging uses SW

### Mobile Responsiveness

- **Breakpoints**:
  - Mobile: < 640px (2-3 column calendar grid)
  - Tablet: 640px-1024px (5 column grid)
  - Desktop: > 1024px (5 column grid with spacing)
- **Touch Targets**: Minimum 44x44px on mobile
- **Safe Areas**: iPhone notch/home indicator support
- **Orientation**: Landscape mode optimizations

### Accessibility Features

- Semantic HTML with proper ARIA labels
- Keyboard navigation support (Enter/Space to activate)
- Focus management in modals
- `prefers-reduced-motion` respect
- High contrast mode support
- Screen reader friendly

### Environment Variables

Required `.env` variables:

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# API
VITE_CHAT_API_URL=https://toharper.dad

# Stripe (if using payments)
VITE_STRIPE_PUBLISHABLE_KEY=
```

### Common Development Tasks

#### Adding a New Winter Effect

1. Define effect in `src/components/winter/WinterEffects.tsx`
2. Add trigger in `WinterEffectsContext`
3. Implement effect component
4. Add sound effect to `soundSystem.ts`

#### Creating a New Template

1. Add template definition to `src/data/templates.ts`
2. Define metadata (colors, fonts, icons, layout)
3. Add styling in `templateStyling.ts`
4. Test in TemplateMarketplace

#### Adding Analytics Events

```typescript
import { analytics } from '../lib/analytics';

analytics.logTileOpened(tileId, day, calendarId);
analytics.logTemplateChange(templateId);
analytics.logLogin('parent', 'email');
```

### Testing Guidelines

- **Unit Tests**: Test individual components and utilities
- **E2E Tests**: Test critical user flows (signup, unlock, etc.)
- **Accessibility**: Run axe-core checks
- **Performance**: Monitor bundle size and FPS

### Deployment Notes

- Build outputs to `dist/`
- Uses Vite for optimized production builds
- Tree-shaking enabled for unused code
- CSS is minimized and extracted
- Assets are fingerprinted for caching

### Known Constraints

- Voice commands require HTTPS (Web Speech API)
- Gestures work best on touch devices
- AI features require backend API
- Some browsers don't support all Web Audio features

### Future Enhancements

- PWA capabilities (offline support)
- More celebration effects
- Additional templates
- Multi-language support
- Advanced analytics dashboard

## Tips

- Always use `bun` as package manager (user preference)
- Follow existing design system patterns
- Test on mobile devices frequently
- Respect performance tiers for effects
- Add ARIA labels for accessibility
- Use TypeScript strictly
- Maintain backward compatibility with legacy tokens
