# Agent Rules for Calendar-2.0 Project  

## General Behavior Rules  

1. **Read-only by default.** The agent should not modify files unless operating on a defined task in `tasks-calendar-2.0.md`.  
2. **Atomic changes.** Each sub-task should result in a small, focused change — not a large batch of modifications.  
3. **Test-driven reliability.** Whenever new logic is added (APIs, UI components, migrations), the agent must also produce accompanying test(s). Code should compile and tests pass before marking the task finished.  
4. **Feature-branch workflow.**  
   - Always start a new feature branch when beginning a parent task.  
   - Branch name pattern: `feature/calendar-v2-<parentTask>-<shortSlug>`  
5. **Progress tracking.** Use `bridge.md` (or equivalent) to record each sub-task’s status (NEXT_TO_WORK_ON, FINISHED, ERRORS, NOTES), with timestamp and task reference.  
6. **Human oversight for heavy operations.** If the agent proposes to run a full build, add new dependencies, delete legacy files, or perform major refactors — it must raise a `NOTES_FOR_AGENT` and wait for human approval.  

## Style & Formatting  

- Use existing code style rules (lint/formatter) — do not introduce new style patterns.  
- For new UI: adhere to existing component conventions; avoid inline styles when design tokens or shared styles are available.  
- Tests: prefer unit and small integration tests. Mock external dependencies if possible (e.g. storage, external APIs).  

## Commit & PR Guidelines  

- Commit messages must reference the task ID, e.g. `[2.0.3] Add tile-editor UI`  
- After code changes and passing tests: update `bridge.md`, then commit.  
- Ensure no lint or type errors before pushing; tests must pass.  
- For features behind flags: configuration and flag fallback logic must be included.  

## Error Handling Policy  

- Always validate inputs (user data, file uploads, media links).  
- On error: handle gracefully, return useful error messages, do not expose sensitive info.  
- Logging: for backend APIs, log meaningful error context for later debugging.  

## Security & Privacy Considerations  

- Do not expose personally identifying information (PII) in publicly accessible APIs.  
- Media assets to be served via signed URLs or authenticated retrieval only.  
- Provide mechanisms for data deletion (e.g. parent account deletion should cascade to child data, media, analytics).  
- Follow encryption / secure storage guidelines for sensitive data (passwords, tokens, family_uuid).  

## Versioning & Backward Compatibility  

- When changing schema or API contracts, increase major version (e.g. v2.0) and note breaking changes in `CHANGELOG.md`.  
- Support fallback paths or dual-reading if possible when migrating legacy data.  

## When to Halt and Raise for Review  

- If schema changes might break existing data or flows.  
- If external dependencies or large libraries are introduced.  
- If performance or security concerns arise.  
- If the agent is uncertain about user requirement or encounters ambiguous spec.  

