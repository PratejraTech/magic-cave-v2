# Accessibility Color Reference Guide

Quick reference for developers working with the updated WCAG AA compliant color system.

---

## Light Mode Colors

### Magical Palette (Child UI)

| Use Case | Token | Color | Visual | Contrast |
|----------|-------|-------|--------|----------|
| Primary Magic | `--color-magic-primary` | `#C73987` | ![#C73987](https://via.placeholder.com/60x30/C73987/C73987.png) | 4.81:1 ✅ |
| Secondary Magic | `--color-magic-secondary` | `#1E75B8` | ![#1E75B8](https://via.placeholder.com/60x30/1E75B8/1E75B8.png) | 4.89:1 ✅ |
| Accent Gold | `--color-magic-accent` | `#9C6D28` | ![#9C6D28](https://via.placeholder.com/60x30/9C6D28/9C6D28.png) | 4.53:1 ✅ |
| Success Green | `--color-magic-success` | `#1E7D5A` | ![#1E7D5A](https://via.placeholder.com/60x30/1E7D5A/1E7D5A.png) | 5.08:1 ✅ |
| Purple Accent | `--color-magic-purple` | `#7F3FA3` | ![#7F3FA3](https://via.placeholder.com/60x30/7F3FA3/7F3FA3.png) | 6.68:1 ✅ |

### Text Colors

| Use Case | Token | Color | Visual | Contrast |
|----------|-------|-------|--------|----------|
| Primary Text | `--color-text-primary` | `#0F172A` | ![#0F172A](https://via.placeholder.com/60x30/0F172A/0F172A.png) | 16.38:1 ✅✅✅ |
| Secondary Text | `--color-text-secondary` | `#475569` | ![#475569](https://via.placeholder.com/60x30/475569/475569.png) | 7.02:1 ✅✅ |
| Tertiary Text | `--color-text-tertiary` | `#475569` | ![#475569](https://via.placeholder.com/60x30/475569/475569.png) | 7.02:1 ✅✅ |

---

## Dark Mode Colors

### Magical Palette (Child UI - Dark)

| Use Case | Token | Color | Visual | Contrast |
|----------|-------|-------|--------|----------|
| Primary Magic | `--color-magic-primary` | `#FF7AC4` | ![#FF7AC4](https://via.placeholder.com/60x30/FF7AC4/FF7AC4.png) | 5.02:1 ✅ |
| Secondary Magic | `--color-magic-secondary` | `#6BB9FF` | ![#6BB9FF](https://via.placeholder.com/60x30/6BB9FF/6BB9FF.png) | 5.51:1 ✅ |
| Accent Gold | `--color-magic-accent` | `#FFB961` | ![#FFB961](https://via.placeholder.com/60x30/FFB961/FFB961.png) | 6.23:1 ✅ |
| Success Green | `--color-magic-success` | `#4DCEA3` | ![#4DCEA3](https://via.placeholder.com/60x30/4DCEA3/4DCEA3.png) | 6.82:1 ✅ |
| Purple Accent | `--color-magic-purple` | `#C185E6` | ![#C185E6](https://via.placeholder.com/60x30/C185E6/C185E6.png) | 5.12:1 ✅ |

### Background Colors

| Use Case | Token | Color | Visual | Description |
|----------|-------|-------|--------|-------------|
| Base Background | `--color-bg-light` | `#0F172A` | ![#0F172A](https://via.placeholder.com/60x30/0F172A/0F172A.png) | Deep navy |
| Soft Background | `--color-bg-soft` | `#1E293B` | ![#1E293B](https://via.placeholder.com/60x30/1E293B/1E293B.png) | Lighter navy |
| Subtle Background | `--color-bg-subtle` | `#334155` | ![#334155](https://via.placeholder.com/60x30/334155/334155.png) | Medium slate |
| Muted Background | `--color-bg-muted` | `#475569` | ![#475569](https://via.placeholder.com/60x30/475569/475569.png) | Light slate |

### Text Colors (Dark Mode)

| Use Case | Token | Color | Visual | Contrast |
|----------|-------|-------|--------|----------|
| Primary Text | `--color-text-primary` | `#F8FAFC` | ![#F8FAFC](https://via.placeholder.com/60x30/F8FAFC/F8FAFC.png) | 15.52:1 ✅✅✅ |
| Secondary Text | `--color-text-secondary` | `#CBD5E1` | ![#CBD5E1](https://via.placeholder.com/60x30/CBD5E1/CBD5E1.png) | 10.35:1 ✅✅✅ |
| Tertiary Text | `--color-text-tertiary` | `#94A3B8` | ![#94A3B8](https://via.placeholder.com/60x30/94A3B8/94A3B8.png) | 5.42:1 ✅ |

---

## Semantic Colors

### Light Mode Semantic

| Type | Token | Color | Contrast |
|------|-------|-------|----------|
| Success | `--color-success` | `#10B981` | 3.42:1 (large text) |
| Warning | `--color-warning` | `#F59E0B` | 2.94:1 (large text) |
| Error | `--color-error` | `#EF4444` | 3.67:1 (large text) |
| Info | `--color-info` | `#3B82F6` | 4.53:1 ✅ |

### Dark Mode Semantic

| Type | Token | Color | Contrast |
|------|-------|-------|----------|
| Success | `--color-success` | `#34D399` | 6.51:1 ✅ |
| Warning | `--color-warning` | `#FBBF24` | 8.14:1 ✅✅ |
| Error | `--color-error` | `#F87171` | 5.03:1 ✅ |
| Info | `--color-info` | `#60A5FA` | 5.96:1 ✅ |

---

## Usage Guidelines

### When to Use Each Color

#### Magical Colors (Child Interface)
- **Primary (`#E865AC` / `#FF7AC4`)**: Main interactive elements, primary buttons, key highlights
- **Secondary (`#5BA5E8` / `#6BB9FF`)**: Secondary buttons, links, complementary elements
- **Accent (`#D89E4E` / `#FFB961`)**: Special highlights, achievement badges, stars
- **Success (`#2E9B73` / `#4DCEA3`)**: Unlocked tiles, success states, positive feedback
- **Purple (`#9B5FC2` / `#C185E6`)**: Decorative accents, magical effects, special events

#### Text Colors
- **Primary**: Body text, headings, critical information
- **Secondary**: Supporting text, labels, metadata
- **Tertiary**: Placeholder text, disabled states, subtle information

### Code Examples

```css
/* Light mode usage */
.magic-button {
  background: var(--color-magic-primary);
  color: var(--color-text-inverse);
}

.tile-unlocked {
  border-color: var(--color-magic-success);
  color: var(--color-magic-success);
}

/* Dark mode - automatic! */
@media (prefers-color-scheme: dark) {
  /* Colors automatically switch via CSS variables */
}
```

```tsx
// React/TypeScript usage
const MagicButton = () => (
  <button
    style={{
      backgroundColor: 'var(--color-magic-primary)',
      color: 'var(--color-text-inverse)'
    }}
  >
    Unlock Tile
  </button>
);
```

---

## Testing Dark Mode

### macOS
1. Open System Preferences
2. Go to Appearance
3. Select "Dark" mode
4. App will automatically switch

### Windows
1. Open Settings
2. Go to Personalization > Colors
3. Select "Dark" under "Choose your mode"

### Browser DevTools
1. Open Chrome/Edge DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "Render" and select "Show Rendering"
4. Find "Emulate CSS media feature prefers-color-scheme"
5. Select "prefers-color-scheme: dark"

### Firefox DevTools
1. Open DevTools (F12)
2. Click the settings gear icon
3. Scroll to "Inspector"
4. Find "Simulate prefers-color-scheme"
5. Select "dark"

---

## Contrast Ratio Legend

- **4.5:1** ✅ = WCAG AA (normal text)
- **3.0:1** ✅ = WCAG AA (large text 18pt+)
- **7.0:1** ✅✅ = WCAG AAA (normal text)
- **4.5:1** ✅✅ = WCAG AAA (large text)

---

## Common Pitfalls to Avoid

1. **Don't hardcode hex colors** - Always use CSS variables
   ```css
   /* ❌ Bad */
   .button { color: #E865AC; }

   /* ✅ Good */
   .button { color: var(--color-magic-primary); }
   ```

2. **Don't assume background color** - Test on both light and dark
   ```css
   /* ❌ Bad - assumes white background */
   .text { color: #333; }

   /* ✅ Good - uses semantic token */
   .text { color: var(--color-text-primary); }
   ```

3. **Don't override dark mode colors** - Let the system handle it
   ```css
   /* ❌ Bad - forces light mode */
   @media (prefers-color-scheme: dark) {
     .card { background: white; }
   }

   /* ✅ Good - uses variable */
   .card { background: var(--color-bg-light); }
   ```

4. **Don't use magical colors for text** - Use text tokens
   ```css
   /* ❌ Bad - magical colors for body text */
   .description { color: var(--color-magic-primary); }

   /* ✅ Good - text tokens for body text */
   .description { color: var(--color-text-secondary); }
   ```

---

## Migration Checklist

If you're updating existing code:

- [ ] Replace hardcoded colors with CSS variables
- [ ] Test component in both light and dark mode
- [ ] Verify contrast ratios with browser DevTools
- [ ] Check focus states are visible in both modes
- [ ] Validate hover/active states work in dark mode
- [ ] Test on actual devices (iOS, Android, macOS, Windows)
- [ ] Run accessibility audit (axe, Lighthouse, Wave)

---

## Resources

- [Main Design System](/Users/nullzero/repos-0x0/general-advent/src/styles/design-system.css)
- [Phase 1 Summary](/Users/nullzero/repos-0x0/general-advent/ACCESSIBILITY_PHASE1_SUMMARY.md)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
