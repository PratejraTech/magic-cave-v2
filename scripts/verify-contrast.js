#!/usr/bin/env node

/**
 * Contrast Ratio Verification Script
 * Verifies WCAG AA compliance for updated colors
 */

// Simple contrast ratio calculator
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAG(ratio, level = 'AA', size = 'normal') {
  const thresholds = {
    'AA': { normal: 4.5, large: 3.0 },
    'AAA': { normal: 7.0, large: 4.5 }
  };

  return ratio >= thresholds[level][size];
}

// Test colors
console.log('🎨 WCAG AA Contrast Ratio Verification\n');
console.log('═'.repeat(70));

// Light mode tests
console.log('\n📱 LIGHT MODE (Against White #FFFFFF)\n');

const lightModeTests = [
  { name: 'Magic Primary', color: '#C73987', background: '#FFFFFF' },
  { name: 'Magic Secondary', color: '#1E75B8', background: '#FFFFFF' },
  { name: 'Magic Accent', color: '#9C6D28', background: '#FFFFFF' },
  { name: 'Magic Success', color: '#1E7D5A', background: '#FFFFFF' },
  { name: 'Magic Purple', color: '#7F3FA3', background: '#FFFFFF' },
  { name: 'Text Tertiary', color: '#475569', background: '#FFFFFF' },
  { name: 'Text Secondary', color: '#475569', background: '#FFFFFF' },
  { name: 'Text Primary', color: '#0F172A', background: '#FFFFFF' },
];

lightModeTests.forEach(test => {
  const ratio = getContrastRatio(test.color, test.background);
  const passAA = checkWCAG(ratio, 'AA', 'normal');
  const passAAA = checkWCAG(ratio, 'AAA', 'normal');

  const status = passAAA ? '✅ AAA' : passAA ? '✅ AA ' : '❌ FAIL';

  console.log(`${status}  ${test.name.padEnd(20)} ${test.color}  ${ratio.toFixed(2)}:1`);
});

// Dark mode tests
console.log('\n🌙 DARK MODE (Against Dark Navy #0F172A)\n');

const darkModeTests = [
  { name: 'Magic Primary', color: '#FF7AC4', background: '#0F172A' },
  { name: 'Magic Secondary', color: '#6BB9FF', background: '#0F172A' },
  { name: 'Magic Accent', color: '#FFB961', background: '#0F172A' },
  { name: 'Magic Success', color: '#4DCEA3', background: '#0F172A' },
  { name: 'Magic Purple', color: '#C185E6', background: '#0F172A' },
  { name: 'Text Primary', color: '#F8FAFC', background: '#0F172A' },
  { name: 'Text Secondary', color: '#CBD5E1', background: '#0F172A' },
  { name: 'Text Tertiary', color: '#94A3B8', background: '#0F172A' },
  { name: 'Success', color: '#34D399', background: '#0F172A' },
  { name: 'Warning', color: '#FBBF24', background: '#0F172A' },
  { name: 'Error', color: '#F87171', background: '#0F172A' },
  { name: 'Info', color: '#60A5FA', background: '#0F172A' },
];

darkModeTests.forEach(test => {
  const ratio = getContrastRatio(test.color, test.background);
  const passAA = checkWCAG(ratio, 'AA', 'normal');
  const passAAA = checkWCAG(ratio, 'AAA', 'normal');

  const status = passAAA ? '✅ AAA' : passAA ? '✅ AA ' : '❌ FAIL';

  console.log(`${status}  ${test.name.padEnd(20)} ${test.color}  ${ratio.toFixed(2)}:1`);
});

console.log('\n' + '═'.repeat(70));

// Summary
const allTests = [...lightModeTests, ...darkModeTests];
let passed = 0;
let failed = 0;

allTests.forEach(test => {
  const ratio = getContrastRatio(test.color, test.background);
  if (checkWCAG(ratio, 'AA', 'normal')) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\n📊 SUMMARY: ${passed}/${allTests.length} tests passed`);

if (failed === 0) {
  console.log('✅ All colors meet WCAG AA standards!\n');
  process.exit(0);
} else {
  console.log(`❌ ${failed} colors failed WCAG AA compliance\n`);
  process.exit(1);
}
