# Bridge State File

## Purpose

This file maintains state when errors or interruptions occur during task execution. It serves as a bridge between conversation sessions to preserve context and progress.

## Usage

When an error interrupts a task:

1. **Timestamp**: Record when the interruption occurred
2. **Task Context**: Describe what was being worked on
3. **Error Details**: Document the error message and stack trace if available
4. **Current State**: Note what was completed and what remains
5. **Next Steps**: List the immediate actions needed to resume
6. **Key Information**: Record any important decisions, file paths, or data

## Format

```markdown
## [YYYY-MM-DD HH:MM] - Task Name

**Status**: [In Progress | Blocked | Pending]

**Context**:
- What was being worked on
- Related files and components

**Error**:
- Error message
- Stack trace (if applicable)

**Completed**:
- ✓ Step 1
- ✓ Step 2

**Remaining**:
- [ ] Step 3
- [ ] Step 4

**Key Information**:
- Important decisions made
- File paths modified
- Environment details
- Dependencies or blockers

**Next Steps**:
1. First action to take
2. Second action to take

---
```

## Example

```markdown
## [2025-12-16 14:30] - Adding Dark Mode Support

**Status**: Blocked

**Context**:
- Implementing dark mode toggle in WinterThemeContext
- Files: src/contexts/WinterThemeContext.tsx, src/styles/design-system.css

**Error**:
- TypeError: Cannot read property 'theme' of undefined
- Occurred in WinterThemeContext.tsx:45

**Completed**:
- ✓ Added CSS variables for dark mode colors
- ✓ Created theme toggle function

**Remaining**:
- [ ] Fix theme persistence in localStorage
- [ ] Update all component styles to use theme variables
- [ ] Test theme switching across all pages

**Key Information**:
- Using CSS custom properties for theme variables
- Theme stored in localStorage as 'winter-theme'
- Default theme is 'light'

**Next Steps**:
1. Add null check for theme context consumer
2. Initialize theme from localStorage on mount
3. Test theme persistence across page reloads

---
```

## Notes

- Keep entries chronological (newest at top)
- Clear completed entries once resolved
- Use this file to communicate state across sessions
- Include enough detail to resume without context loss
