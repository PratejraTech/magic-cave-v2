# GitHub Actions Workflows

## Test Workflow

The test workflow (`test.yml`) runs automatically on every push to the `main` branch.

### What it does:

1. **Runs all tests** using Vitest with JSON output
2. **Generates a failure report** if tests fail (or always for record-keeping)
3. **Fails the workflow** if any tests don't pass
4. **Uploads failure reports** as artifacts for 30 days

### Failure Reports

Failure reports are generated in `.github/reports/fail-{datetime}.json` and include:

- **Metadata**: Git commit info, workflow run details, system info
- **Test Results**: Summary of passed/failed/skipped tests
- **Failure Details**: Full error messages, stack traces, and test file locations
- **Analysis**: Breakdown of failures by file, failure rates, recommendations

### Running Tests Locally

```bash
# Run tests normally
npm test

# Run tests with CI output (generates JSON report)
npm run test:ci
```

### Manual Report Generation

You can generate a failure report manually:

```bash
node .github/scripts/generate-failure-report.mjs
```

This reads `.github/reports/test-results.json` and generates a comprehensive report.

