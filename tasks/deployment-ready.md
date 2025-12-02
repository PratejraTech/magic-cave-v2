# Deployment-Ready Task List: Family Advent Calendar v1.0
**Purpose:** Finalize incomplete features, assign specialized agents, and ensure production readiness for beta launch.

## Overview
Analysis of `tasks/prd.md`, `tasks/tasks.md`, and `tasks/bridge.md` reveals core features (0.0-5.0) are largely implemented, but critical gaps remain in backend APIs, notifications, security, and QA. This file prioritizes remaining work with agent assignments for efficient completion.

## Prioritized Incomplete Tasks

### HIGH PRIORITY (Blockers for Beta Launch)
- **Backend API Completion** (Backend Engineer) ✅ COMPLETED
  - Implement /auth/family-login endpoint for child login with family_uuid and password ✅ DONE
  - Implement /calendars/{id}/tiles endpoint to fetch all tiles for a specific calendar ✅ DONE
  - Implement /tiles/{id}/update endpoint for updating tile title, body, media, and gifts ✅ DONE
  - Implement /notifications/settings endpoint for managing parent/child notification preferences ✅ DONE
  - Fix family_uuid generation logic during parent signup to ensure uniqueness ✅ DONE
  - Add server-side validation for child login using family_uuid and password matching ✅ DONE
  - Implement actual notification scheduling service with timezone support (replace placeholders) ✅ DONE
  - Integrate with push notification service (e.g., FCM/APNs) for daily tile alerts ⚠️ PARTIAL (Database scheduling implemented; FCM integration requires Firebase setup)

- **Template Preview UI** (Frontend Engineer)
  - Create template preview component showing sample calendar layout with selected template styling
  - Add preview button/modal in template selection flow during profile creation
  - Ensure template switching updates existing calendar UI dynamically without data loss

- **Profile Editing Enhancements** (Frontend Engineer)
  - Build comprehensive profile editing form for parents (update name, email, child details)
  - Add template change option in profile edit with confirmation dialog
  - Implement child password regeneration feature for parent-managed access
  - Add child profile update capabilities (interests, birthdate, gender)

### MEDIUM PRIORITY (Enhancements for Production Quality)
- **Security & Privacy Audit** (QA Engineer)
  - Conduct full security review of authentication flows for vulnerabilities (SQL injection, XSS)
  - Audit media access controls ensuring signed URLs and proper permissions
  - Implement data deletion endpoint with cascade removal of calendar, tiles, media, and analytics
  - Ensure HTTPS enforcement and secure transport in production environment
  - Verify compliance with child data privacy standards (e.g., COPPA, GDPR for minors)

- **UX & Accessibility Review** (QA Engineer)
  - Test calendar UI responsiveness on mobile and desktop devices
  - Test tile unlock flows, child login, and gift reveal interactions
  - Add ARIA labels, keyboard navigation, and focus management throughout app
  - Ensure screen reader compatibility for all interactive elements
  - Validate PDF export UI functionality and notification permission prompts

- **Performance Testing** (QA Engineer)
  - Measure media upload and download times under various network conditions
  - Test calendar rendering performance with 25 tiles and media content
  - Benchmark PDF generation time for calendars with full content
  - Test notification delivery latency and reliability
  - Perform load testing for concurrent users and database queries

### LOW PRIORITY (Post-Launch Polish)
- **Documentation & Launch Prep** (DevOps Engineer)
  - Update README with setup instructions, API docs, and deployment guide
  - Create comprehensive privacy policy document for parent/child data handling
  - Write detailed user instructions for parents and children (login, customization, unlocking)
  - Define beta rollout strategy including user selection criteria and phased release
  - Set up feedback collection mechanism (forms, surveys) for beta users
  - Configure production monitoring dashboards for application health
  - Set up analytics pipelines for real-time event tracking and reporting

## Agent Assignments & Responsibilities

- **Backend Engineer**: Focus on API endpoints, database constraints, notification scheduling, and server-side logic. Ensure all backend services are functional and secure.
- **Frontend Engineer**: Complete UI components, routing, state management, and user experience flows. Integrate with backend APIs.
- **QA Engineer**: Conduct comprehensive testing (unit, integration, e2e), security audits, performance testing, and accessibility reviews.
- **DevOps Engineer**: Handle deployment, monitoring, documentation, and production environment setup.

## Success Criteria for Deployment
- All HIGH PRIORITY tasks completed and tested
- End-to-end user flows functional: parent signup → child profile → calendar creation → tile customization → child login → tile unlock → gift reveal
- Security audit passed with no critical vulnerabilities
- Performance benchmarks met (load times <3s, PDF export <10s)
- Analytics tracking all key events throughout user journey
- Documentation complete for beta users and maintainers

## Timeline & Next Steps
- **Week 1**: Backend Engineer completes API gaps; Frontend Engineer finishes UI enhancements
- **Week 2**: QA Engineer conducts full audit and testing cycle
- **Week 3**: DevOps Engineer prepares launch documentation and monitoring
- **Target Launch**: Beta release to small user group with feedback loop

## Notes
- All changes must maintain existing code conventions (TypeScript strict, ESLint, Prettier)
- Run `npm run lint`, `npm run typecheck`, and `npm run test` after each task completion
- Update `tasks/bridge.md` with progress timestamps for each sub-task
- Commit changes atomically with task IDs in commit messages