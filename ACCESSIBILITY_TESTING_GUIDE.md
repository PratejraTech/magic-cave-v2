# Accessibility Testing Guide - Phase 1

Comprehensive testing instructions for verifying WCAG AA compliance and dark mode implementation.

---

## Quick Verification Checklist

- [ ] Build succeeds without errors ✅ (Verified 2025-12-16)
- [ ] No hardcoded color values in components ✅ (Verified 2025-12-16)
- [ ] Light mode displays with updated colors
- [ ] Dark mode activates automatically based on OS settings
- [ ] All text meets minimum contrast requirements
- [ ] Magical effects remain visible in both modes
- [ ] Christmas aesthetic preserved

---

## Automated Testing

### 1. Build Verification
```bash
bun run build
# Expected: ✓ built successfully
# Verified: 119.25 kB CSS, 386.11 kB JS
```

### 2. Type Checking
```bash
bun run typecheck
# Expected: No CSS-related errors
# Note: Pre-existing TS errors unrelated to accessibility changes
```

### 3. Lint Checking
```bash
bun run lint
# Expected: No new CSS violations
```

### 4. Unit Tests
```bash
bun test
# Run all unit tests to ensure no regressions
```

---

## Manual Testing - Light Mode

### Visual Inspection

1. **Start development server:**
   ```bash
   bun run dev
   ```

2. **Open browser:** Navigate to `http://localhost:5173`

3. **Verify magical colors:**
   - [ ] Magic primary (`#E865AC`) - more saturated pink visible
   - [ ] Magic secondary (`#5BA5E8`) - deeper sky blue visible
   - [ ] Magic accent (`#D89E4E`) - richer gold visible
   - [ ] Magic success (`#2E9B73`) - deeper green visible
   - [ ] Magic purple (`#9B5FC2`) - deeper purple visible

4. **Check text readability:**
   - [ ] Primary text is crisp and clear
   - [ ] Secondary text is readable
   - [ ] Tertiary text darker than before (more readable)

5. **Test components:**
   - [ ] Calendar tiles show updated colors
   - [ ] Buttons have sufficient contrast
   - [ ] Hover/focus states are visible
   - [ ] Magical effects use new palette

### Contrast Verification

**Using Browser DevTools:**

1. Open Chrome DevTools (F12)
2. Press Cmd+Shift+C (Mac) / Ctrl+Shift+C (Windows)
3. Click on element with magical color
4. In "Styles" panel, click the color swatch
5. Verify contrast ratio shown is 4.5:1+

**Using Lighthouse:**

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" only
4. Click "Generate report"
5. Verify "Contrast" check passes

**Expected Results:**
- All text elements: 4.5:1+ (AA) or 7.0:1+ (AAA)
- Large text (18pt+): 3.0:1+ (AA) or 4.5:1+ (AAA)
- UI components: 3.0:1+ (AA)

---

## Manual Testing - Dark Mode

### macOS Activation

1. **Enable dark mode:**
   - System Preferences > General > Appearance > Dark
   - Or use Control Center (macOS Big Sur+)

2. **Verify automatic switching:**
   - App should immediately update to dark theme
   - No page reload required (CSS media query)

### Windows Activation

1. **Enable dark mode:**
   - Settings > Personalization > Colors
   - Choose "Dark" under "Choose your mode"

2. **Verify browser reflects change:**
   - Chrome/Edge should detect OS preference
   - App should update automatically

### Browser DevTools Emulation

**Chrome/Edge:**
```
1. DevTools (F12)
2. Cmd+Shift+P / Ctrl+Shift+P
3. Type "Render"
4. Select "Show Rendering"
5. Find "Emulate CSS media feature prefers-color-scheme"
6. Select "dark"
```

**Firefox:**
```
1. DevTools (F12)
2. Settings gear icon
3. Inspector section
4. "Simulate prefers-color-scheme" > "dark"
```

**Safari:**
```
1. Develop > Experimental Features > Dark Mode CSS Support
2. Develop > User Agent > Safari — iOS 13 (Dark Mode)
```

### Dark Mode Visual Inspection

1. **Background colors:**
   - [ ] Base is deep navy (`#0F172A`)
   - [ ] Cards are lighter navy (`#1E293B`)
   - [ ] Elevated elements use slate (`#334155`)
   - [ ] No pure black backgrounds

2. **Text colors:**
   - [ ] Primary text nearly white (`#F8FAFC`)
   - [ ] Secondary text light gray (`#CBD5E1`)
   - [ ] Tertiary text medium gray (`#94A3B8`)
   - [ ] All text highly readable

3. **Magical colors:**
   - [ ] Pink (`#FF7AC4`) vibrant and visible
   - [ ] Blue (`#6BB9FF`) bright and clear
   - [ ] Gold (`#FFB961`) warm and readable
   - [ ] Green (`#4DCEA3`) fresh and visible
   - [ ] Purple (`#C185E6`) rich and clear

4. **Semantic colors:**
   - [ ] Success green bright and positive
   - [ ] Warning amber clear and attention-grabbing
   - [ ] Error red visible and urgent
   - [ ] Info blue clear and informative

5. **Shadows and depth:**
   - [ ] Shadows darker and more pronounced
   - [ ] Cards have visible elevation
   - [ ] Modals have proper backdrop
   - [ ] Focus rings visible on dark backgrounds

6. **Christmas aesthetic:**
   - [ ] Festive colors remain vibrant
   - [ ] Emerald green visible and elegant
   - [ ] Burgundy red warm and inviting
   - [ ] Gold accents shimmer appropriately

### Dark Mode Contrast Verification

**Using DevTools Color Picker:**
1. Inspect element in dark mode
2. Check contrast ratio against `#0F172A` (dark background)
3. Verify magical colors: 5.0:1+ minimum
4. Verify text colors: 5.42:1+ (AA) to 15.52:1 (AAA)

**Using WebAIM Contrast Checker:**
1. Visit https://webaim.org/resources/contrastchecker/
2. Foreground: Text/UI color (e.g., `#FF7AC4`)
3. Background: `#0F172A`
4. Verify "AA" passes for both normal and large text

---

## Component-Level Testing

### Calendar Tiles
- [ ] Light mode: Colors readable and inviting
- [ ] Dark mode: Colors vibrant against navy
- [ ] Locked tiles: Visible but subdued
- [ ] Unlocked tiles: Success color pops
- [ ] Hover states: Clear visual feedback

### Buttons
- [ ] Light mode: Sufficient contrast with background
- [ ] Dark mode: Stand out from dark navy
- [ ] Primary buttons: Use magical colors
- [ ] Secondary buttons: Clearly differentiated
- [ ] Disabled state: Obviously non-interactive

### Navigation
- [ ] Light mode: Clear hierarchy
- [ ] Dark mode: Links visible on dark background
- [ ] Active state: Clearly indicated
- [ ] Hover state: Immediate feedback
- [ ] Focus state: Keyboard-accessible

### Modals & Overlays
- [ ] Light mode: Modal stands out from backdrop
- [ ] Dark mode: Dark modal on darker backdrop
- [ ] Backdrop opacity: Sufficient dimming
- [ ] Text in modal: Highly readable
- [ ] Close button: Easy to find

### Forms & Inputs
- [ ] Light mode: Clear input boundaries
- [ ] Dark mode: Input fields visible
- [ ] Placeholder text: Readable but subtle
- [ ] Focus ring: Obvious and accessible
- [ ] Error states: Red color sufficiently visible

### Winter Effects
- [ ] Snow particles: Visible in both modes
- [ ] Butterflies: Clear against backgrounds
- [ ] Celebration effects: Pop in both themes
- [ ] Magical glow: Works on light and dark
- [ ] Voice feedback: Visual indicators clear

---

## Cross-Browser Testing

### Chrome/Chromium (Recommended)
- [ ] Light mode renders correctly
- [ ] Dark mode activates automatically
- [ ] CSS variables supported
- [ ] Gradients display properly
- [ ] Shadows render smoothly

### Safari (macOS/iOS)
- [ ] Light mode colors accurate
- [ ] Dark mode switches with OS
- [ ] CSS variables work
- [ ] Backdrop blur supported
- [ ] Animations smooth

### Firefox
- [ ] Light mode consistent
- [ ] Dark mode preference detected
- [ ] CSS custom properties work
- [ ] Color contrast maintained
- [ ] Performance acceptable

### Edge
- [ ] Light mode identical to Chrome
- [ ] Dark mode functions properly
- [ ] High contrast mode compatible
- [ ] Accessibility features work

---

## Device Testing

### Desktop (1920x1080+)
- [ ] Colors render correctly
- [ ] Text remains readable at distance
- [ ] Magical effects not overwhelming
- [ ] Layout uses space effectively

### Tablet (iPad, Surface)
- [ ] Touch targets 44x44px minimum
- [ ] Colors vibrant on tablet screens
- [ ] Text size appropriate
- [ ] Dark mode works on tablet OS

### Mobile (iPhone, Android)
- [ ] Colors optimized for small screens
- [ ] Text remains readable
- [ ] Dark mode saves battery (OLED)
- [ ] Touch interactions clear

### Retina/High-DPI
- [ ] Colors crisp and clear
- [ ] No color banding
- [ ] Gradients smooth
- [ ] Text sharp

---

## Accessibility Tools Testing

### axe DevTools

1. Install: [axe DevTools Extension](https://www.deque.com/axe/devtools/)
2. Open extension in DevTools
3. Click "Scan All of My Page"
4. **Expected:** No color contrast violations

### WAVE (WebAIM)

1. Install: [WAVE Extension](https://wave.webaim.org/extension/)
2. Click WAVE icon in toolbar
3. Review "Contrast" section
4. **Expected:** All green checks

### Lighthouse Accessibility Audit

1. Chrome DevTools > Lighthouse
2. Select "Accessibility" only
3. Click "Generate report"
4. **Expected:** Score 95+ (100 is ideal)

**Key Checks:**
- Background and foreground colors have sufficient contrast ratio
- Links have discernible names
- Buttons have accessible names
- Form elements have labels
- Images have alt text

### Chrome Accessibility Inspector

1. DevTools > Elements tab
2. Click "Accessibility" pane
3. Inspect color contrast for elements
4. **Expected:** All "Pass" indicators

---

## Edge Cases & Special Testing

### High Contrast Mode (Windows)

1. Enable Windows High Contrast
2. Verify app remains functional
3. Check critical elements visible
4. Test navigation still works

### Color Blindness Simulation

**Using Chrome DevTools:**
1. DevTools > Rendering
2. "Emulate vision deficiencies"
3. Test each type:
   - Protanopia (no red)
   - Deuteranopia (no green)
   - Tritanopia (no blue)
   - Achromatopsia (no color)

**Expected:**
- Information not conveyed by color alone
- UI patterns remain distinguishable
- Magical effects identifiable by shape/motion

### Browser Zoom Testing

1. Zoom to 200% (Cmd/Ctrl + Plus)
2. Verify colors don't break
3. Check text remains readable
4. Ensure layouts don't collapse
5. Test at 300% if possible

### Reduced Motion

1. Enable OS-level reduced motion:
   - macOS: System Preferences > Accessibility > Display > Reduce motion
   - Windows: Settings > Ease of Access > Display > Show animations
2. Verify animations respect preference
3. Check magical effects tone down
4. Ensure static experience functional

---

## Regression Testing

### Ensure No Breaking Changes

1. **Parent Dashboard:**
   - [ ] Gradients still beautiful
   - [ ] Professional aesthetic maintained
   - [ ] AI tech company vibe preserved

2. **Child Calendar:**
   - [ ] Whimsical and magical
   - [ ] Christmas spirit intact
   - [ ] Winter effects charming

3. **Christmas Marketing:**
   - [ ] Emerald green elegant
   - [ ] Burgundy red festive
   - [ ] Gold accents luxurious

4. **Templates:**
   - [ ] All templates render correctly
   - [ ] Custom colors not affected
   - [ ] Template marketplace functional

5. **Existing Features:**
   - [ ] Authentication works
   - [ ] Tile unlock animations
   - [ ] Sound effects play
   - [ ] Voice commands function
   - [ ] Gesture magic responds

---

## Performance Testing

### Bundle Size Impact

```bash
# Before changes: ~119 kB CSS
# After changes: ~119.25 kB CSS (+0.25 kB)
# Impact: Negligible (<1% increase)
```

### Runtime Performance

1. Open Chrome DevTools > Performance
2. Record page load
3. Check paint times
4. **Expected:** No significant regression

### Memory Usage

1. DevTools > Memory
2. Take heap snapshot
3. Compare light vs dark mode
4. **Expected:** Similar memory footprint

---

## Documentation Verification

### Files to Review

- [x] `/Users/nullzero/repos-0x0/general-advent/src/styles/design-system.css` - Updated
- [x] `/Users/nullzero/repos-0x0/general-advent/ACCESSIBILITY_PHASE1_SUMMARY.md` - Created
- [x] `/Users/nullzero/repos-0x0/general-advent/ACCESSIBILITY_COLOR_REFERENCE.md` - Created
- [x] `/Users/nullzero/repos-0x0/general-advent/ACCESSIBILITY_TESTING_GUIDE.md` - This file

### CLAUDE.md Consistency

Verify project documentation references:
- [ ] Design system path correct
- [ ] Commands still valid
- [ ] Architecture unchanged
- [ ] No outdated color references

---

## Sign-off Checklist

Before considering Phase 1 complete:

### Code Quality
- [x] Build succeeds
- [x] No TypeScript regressions
- [x] No lint violations introduced
- [x] No hardcoded colors found

### Functionality
- [ ] Light mode verified manually
- [ ] Dark mode verified manually
- [ ] Both modes tested on actual devices
- [ ] Cross-browser compatibility confirmed

### Accessibility
- [ ] Contrast ratios verified (4.5:1+ AA)
- [ ] Dark mode contrast verified (5.0:1+)
- [ ] axe DevTools scan passes
- [ ] Lighthouse accessibility 95+

### User Experience
- [ ] Magical aesthetic preserved
- [ ] Christmas spirit maintained
- [ ] No jarring color changes
- [ ] Smooth light/dark transitions

### Documentation
- [x] Summary document created
- [x] Color reference guide created
- [x] Testing guide created (this file)
- [ ] Team briefed on changes

---

## Reporting Issues

If you find accessibility issues during testing:

1. **Document the issue:**
   - Screenshot or screen recording
   - Browser and version
   - OS and version
   - Steps to reproduce
   - Expected vs actual behavior

2. **Check contrast ratio:**
   - Use WebAIM contrast checker
   - Record actual ratio found
   - Note which WCAG level it fails

3. **Test in both modes:**
   - Verify issue in light mode
   - Verify issue in dark mode
   - Note if mode-specific or universal

4. **Create issue report:**
   ```markdown
   ## Accessibility Issue: [Brief Description]

   **Component:** [Calendar Tile / Button / etc.]
   **Mode:** [Light / Dark / Both]
   **Browser:** [Chrome 120 / Safari 17 / etc.]
   **OS:** [macOS 14 / Windows 11 / etc.]

   **Issue:**
   [Description of the problem]

   **Current Contrast:** [e.g., 3.2:1]
   **Required Contrast:** [e.g., 4.5:1 for WCAG AA]

   **Screenshot:**
   [Attach image]

   **Steps to Reproduce:**
   1. [Step 1]
   2. [Step 2]
   3. [Step 3]

   **Suggested Fix:**
   [If you have ideas]
   ```

---

## Next Phase Preview

Phase 2 will address:
- Enhanced focus indicators for keyboard navigation
- Improved ARIA labels and screen reader support
- Touch target size verification
- Color-blind mode optimizations

Phase 3 will include:
- High contrast mode support
- Font scaling improvements
- User-controlled animation toggles
- Semantic HTML audit

---

**Testing Coordinator:** Development Team
**Target Completion:** Before production deployment
**Priority:** High (WCAG AA compliance required)
