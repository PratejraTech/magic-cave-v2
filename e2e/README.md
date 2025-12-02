# E2E Tests

This directory contains end-to-end tests for the Family Advent Calendar application using Playwright.

## Test Structure

- `parent-portal.spec.ts` - Tests for parent dashboard functionality
- `auth-flows.spec.ts` - Tests for authentication (login, registration, OAuth)
- `child-portal.spec.ts` - Tests for child calendar view
- `media-upload.spec.ts` - Tests for media upload functionality
- `test-utils.ts` - Shared utilities and helper functions

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test parent-portal.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:
- Base URL: `http://localhost:5173`
- Automatic dev server startup
- Screenshots on failure
- Video recording on failure
- Cross-browser testing (Chrome, Firefox, Safari)

## Test Data and Mocking

Tests use mocked authentication and data to avoid dependencies on external services:
- Supabase auth is mocked
- Test data is created programmatically
- File uploads use test assets

## Writing New Tests

1. Use descriptive test names
2. Follow the Page Object Model pattern
3. Use test utilities from `test-utils.ts`
4. Mock external dependencies
5. Add appropriate assertions

## CI/CD Integration

Tests can be run in CI with:
```bash
npm run test:e2e
```

The configuration includes:
- Parallel test execution
- Automatic retries on failure
- HTML reports
- Screenshots and videos for debugging

## Debugging Tests

- Use `--debug` flag for step-by-step execution
- Check `test-results/` directory for screenshots/videos
- Use `page.pause()` to debug interactively
- Check browser console logs in headed mode