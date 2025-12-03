/**
 * Security Assessment Runner
 * Executes comprehensive security testing for production readiness
 */

import { runSecurityAssessment } from '../src/lib/securityTesting.ts';

async function main() {
  console.log('🚀 Starting Security Assessment for Family Advent Calendar v2.0\n');

  try {
    const assessment = await runSecurityAssessment();

    console.log('\n📊 ASSESSMENT RESULTS');
    console.log('===================');
    console.log(`Overall Security Score: ${assessment.overallScore}/100`);
    console.log(`Total Tests: ${assessment.totalTests}`);
    console.log(`Passed: ${assessment.passedTests}`);
    console.log(`Failed: ${assessment.failedTests}`);
    console.log(`Critical Issues: ${assessment.criticalIssues}`);
    console.log(`Assessment Date: ${assessment.assessmentDate}`);

    if (assessment.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS');
      console.log('==================');
      assessment.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('\n📋 DETAILED RESULTS');
    console.log('==================');

    assessment.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const severity = result.severity.toUpperCase();
      console.log(`${status} [${severity}] ${result.testName}`);
      console.log(`   ${result.description}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });

    // Exit with appropriate code
    if (assessment.criticalIssues > 0 || assessment.overallScore < 80) {
      console.log('❌ SECURITY ASSESSMENT FAILED - Critical issues found');
      process.exit(1);
    } else {
      console.log('✅ SECURITY ASSESSMENT PASSED');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Security assessment failed with error:', error);
    process.exit(1);
  }
}

main();