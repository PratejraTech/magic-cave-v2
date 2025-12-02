import crypto from 'crypto';

/**
 * Test script to verify hash generation and comparison
 * Ensures client and server hash functions produce matching results
 */

function hashString(input) {
  const hash = crypto.createHash('sha256').update(String(input).toLowerCase().trim()).digest('hex');
  return hash.substring(0, 32);
}

function compareHashes(inputHash, storedHash) {
  if (!inputHash || !storedHash || inputHash.length !== storedHash.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

// Test cases
const testCases = [
  {
    input: 'grace janin',
    expectedHash: '37d905efd806f04be408474870f53ad3',
    description: 'Access phrase (Harper)'
  },
  {
    input: 'guestmoir',
    expectedHash: 'e537377e992c23b6814fa01175cc7e45',
    description: 'Guest code (guestmoir)'
  },
  {
    input: 'moirguest',
    expectedHash: '977c0e0bd4e08d232a735f13dd15ea6d',
    description: 'Guest code (moirguest)'
  },
  {
    input: '09/08/2022',
    expectedHash: 'bdb1a45151fd19ff9b7e765edd4280cd',
    description: 'Birthdate'
  }
];

console.log('🔍 Verifying Hash Generation and Comparison\n');

let allPassed = true;

for (const testCase of testCases) {
  const generatedHash = hashString(testCase.input);
  const matches = compareHashes(generatedHash, testCase.expectedHash);
  const status = matches ? '✅' : '❌';
  
  console.log(`${status} ${testCase.description}`);
  console.log(`   Input: "${testCase.input}"`);
  console.log(`   Generated: ${generatedHash}`);
  console.log(`   Expected:  ${testCase.expectedHash}`);
  console.log(`   Match: ${matches ? 'YES' : 'NO'}\n`);
  
  if (!matches) {
    allPassed = false;
  }
}

// Test comparison with normalized hashes
console.log('🔍 Testing Hash Comparison Logic\n');
const testHash1 = hashString('guestmoir');
const testHash2 = hashString('GUESTMOIR'); // Different case
const testHash3 = hashString('guestmoir '); // With space
const storedHash = 'e537377e992c23b6814fa01175cc7e45';

console.log(`Test 1: "guestmoir" vs stored hash`);
console.log(`   Hash: ${testHash1}`);
console.log(`   Match: ${compareHashes(testHash1, storedHash) ? '✅ YES' : '❌ NO'}\n`);

console.log(`Test 2: "GUESTMOIR" (uppercase) vs stored hash`);
console.log(`   Hash: ${testHash2}`);
console.log(`   Match: ${compareHashes(testHash2, storedHash) ? '✅ YES' : '❌ NO'}\n`);

console.log(`Test 3: "guestmoir " (with space) vs stored hash`);
console.log(`   Hash: ${testHash3}`);
console.log(`   Match: ${compareHashes(testHash3, storedHash) ? '✅ YES' : '❌ NO'}\n`);

// Test moirguest
const moirGuestHash = hashString('moirguest');
const moirGuestStored = '977c0e0bd4e08d232a735f13dd15ea6d';
console.log(`Test 4: "moirguest" vs stored hash`);
console.log(`   Hash: ${moirGuestHash}`);
console.log(`   Expected: ${moirGuestStored}`);
console.log(`   Match: ${compareHashes(moirGuestHash, moirGuestStored) ? '✅ YES' : '❌ NO'}\n`);

if (allPassed && 
    compareHashes(testHash1, storedHash) && 
    compareHashes(testHash2, storedHash) && 
    compareHashes(testHash3, storedHash) &&
    compareHashes(moirGuestHash, moirGuestStored)) {
  console.log('✅ All hash verification tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some hash verification tests failed!');
  process.exit(1);
}

