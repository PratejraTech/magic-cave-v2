#!/usr/bin/env node

/**
 * Generates a comprehensive failure report for test failures.
 * This script reads vitest JSON output and creates a detailed report
 * with all metadata needed for analysis.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const REPORTS_DIR = join(process.cwd(), '.github', 'reports');
const TEST_RESULTS_FILE = join(REPORTS_DIR, 'test-results.json');

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
}

function getGitMetadata() {
  const metadata = {
    commit: process.env.GITHUB_SHA || 'unknown',
    ref: process.env.GITHUB_REF || 'unknown',
    workflow: process.env.GITHUB_WORKFLOW || 'unknown',
    runId: process.env.GITHUB_RUN_ID || 'unknown',
    runNumber: process.env.GITHUB_RUN_NUMBER || 'unknown',
    actor: process.env.GITHUB_ACTOR || 'unknown',
    repository: process.env.GITHUB_REPOSITORY || 'unknown',
    eventName: process.env.GITHUB_EVENT_NAME || 'unknown',
  };
  return metadata;
}

function getSystemMetadata() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function parseTestResults(testResults) {
  // Handle vitest JSON format: { testFiles: [...], numFailedTests: ..., numPassedTests: ... }
  if (!testResults) {
    return {
      hasResults: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      failures: [],
    };
  }

  // Use summary stats if available (more reliable)
  const totalTests = testResults.numTotalTests || 0;
  const passedTests = testResults.numPassedTests || 0;
  const failedTests = testResults.numFailedTests || 0;
  const skippedTests = testResults.numSkippedTests || 0;
  const totalDuration = testResults.duration || 0;

  const failures = [];
  const testFiles = testResults.testFiles || [];

  // Extract failure details from test files
  for (const testFile of testFiles) {
    const tests = testFile.tests || [];
    for (const test of tests) {
      if (test.status === 'failed' || test.status === 'fail') {
        failures.push({
          file: testFile.file || testFile.name || 'unknown',
          name: test.name || 'unknown',
          duration: test.duration || 0,
          error: test.error || null,
          errors: test.errors || [],
          errorMessage: test.error?.message || null,
          errorStack: test.error?.stack || null,
          errorDiff: test.error?.diff || null,
        });
      }
    }
  }

  return {
    hasResults: true,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    totalDuration,
    failures,
    summary: {
      passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%',
      failureRate: totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(2) + '%' : '0%',
    },
  };
}

function generateFailureReport() {
  const datetime = getCurrentDateTime();
  const reportPath = join(REPORTS_DIR, `fail-${datetime}.json`);

  // Read test results if available
  let testResults = null;
  if (existsSync(TEST_RESULTS_FILE)) {
    try {
      const content = readFileSync(TEST_RESULTS_FILE, 'utf-8');
      testResults = JSON.parse(content);
    } catch (error) {
      console.error('Error reading test results:', error.message);
    }
  }

  const parsedResults = parseTestResults(testResults);

  const hasFailures = parsedResults.failedTests > 0;
  const failedTestFiles = parsedResults.failures.reduce((acc, failure) => {
    if (!acc.includes(failure.file)) {
      acc.push(failure.file);
    }
    return acc;
  }, []);

  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      datetime,
      git: getGitMetadata(),
      system: getSystemMetadata(),
      status: hasFailures ? 'failure' : 'success',
    },
    testResults: {
      ...parsedResults,
      rawResults: testResults,
    },
    analysis: {
      hasFailures,
      failureCount: parsedResults.failedTests,
      successCount: parsedResults.passedTests,
      totalTestFiles: testResults?.testFiles?.length || 0,
      failedTestFiles: failedTestFiles.length,
      failedTestFileList: failedTestFiles,
      failureBreakdown: parsedResults.failures.reduce((acc, failure) => {
        const file = failure.file || 'unknown';
        acc[file] = (acc[file] || 0) + 1;
        return acc;
      }, {}),
    },
    recommendations: hasFailures ? [
      'Review failed test cases in the failures array',
      'Check error messages and stack traces for each failure',
      'Verify test environment setup and dependencies',
      'Ensure all required environment variables are set',
      'Check for flaky tests that may need retry logic',
    ] : [
      'All tests passed successfully!',
    ],
  };

  // Write report
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Failure report generated: ${reportPath}`);
  console.log(`Total tests: ${parsedResults.totalTests}`);
  console.log(`Passed: ${parsedResults.passedTests}`);
  console.log(`Failed: ${parsedResults.failedTests}`);
  console.log(`Skipped: ${parsedResults.skippedTests}`);

  return report;
}

// Run if executed directly
// Simple check: if this file is being run directly (not imported)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || import.meta.url.includes('generate-failure-report.mjs')) {
  try {
    generateFailureReport();
  } catch (error) {
    console.error('Error generating failure report:', error);
    process.exit(1);
  }
}

export { generateFailureReport };

