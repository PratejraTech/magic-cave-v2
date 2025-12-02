import { describe, it, expect } from 'vitest';
import { runSecurityAssessment } from '../lib/securityTesting';

describe('Security Assessment', () => {
  it('should run full security assessment', async () => {
    const assessment = await runSecurityAssessment();

    console.log('\n📊 SECURITY ASSESSMENT RESULTS');
    console.log('===============================');
    console.log(`Overall Score: ${assessment.overallScore}/100`);
    console.log(`Tests: ${assessment.passedTests}/${assessment.totalTests} passed`);
    console.log(`Critical Issues: ${assessment.criticalIssues}`);

    if (assessment.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      assessment.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Basic assertions
    expect(assessment.totalTests).toBeGreaterThan(0);
    expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
    expect(assessment.overallScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(assessment.results)).toBe(true);
    expect(Array.isArray(assessment.recommendations)).toBe(true);

    // Should pass basic security tests
    expect(assessment.criticalIssues).toBeLessThanOrEqual(2); // Allow some tolerance
  }, 60000); // 60 second timeout for comprehensive testing
});