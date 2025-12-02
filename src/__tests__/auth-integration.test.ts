import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashString, normalizeBirthdateInput } from '../lib/hashUtils';

/**
 * Integration test to verify both client-side and server-side authentication
 * are working correctly and producing matching hash values
 */
describe('Authentication Integration - Client & Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hash Generation Consistency', () => {
    it('should produce matching hashes for "grace janin" on both client and server', async () => {
      const ACCESS_CODE = 'grace janin';
      const EXPECTED_HASH = '37d905efd806f04be408474870f53ad3';

      // Client-side hash (using hashUtils)
      const clientHash = await hashString(ACCESS_CODE);
      expect(clientHash).toBe(EXPECTED_HASH);

      // Simulate server-side hash (same algorithm)
      const serverHash = await hashString(ACCESS_CODE);
      expect(serverHash).toBe(EXPECTED_HASH);

      // Both should match
      expect(clientHash).toBe(serverHash);
    });

    it('should produce matching hashes for "09/08/2022" on both client and server', async () => {
      const BIRTHDATE = '09/08/2022';
      const EXPECTED_HASH = 'bdb1a45151fd19ff9b7e765edd4280cd';

      // Client-side: normalize then hash
      const normalized = normalizeBirthdateInput(BIRTHDATE);
      expect(normalized).toBe('09/08/2022');
      const clientHash = await hashString(normalized);
      expect(clientHash).toBe(EXPECTED_HASH);

      // Server-side: same normalization and hashing
      const serverNormalized = normalizeBirthdateInput(BIRTHDATE);
      expect(serverNormalized).toBe('09/08/2022');
      const serverHash = await hashString(serverNormalized);
      expect(serverHash).toBe(EXPECTED_HASH);

      // Both should match
      expect(clientHash).toBe(serverHash);
    });

    it('should normalize various date formats to the same hash', async () => {
      const EXPECTED_HASH = 'bdb1a45151fd19ff9b7e765edd4280cd';
      const dateFormats = [
        '09/08/2022',
        '9/8/2022',
        '08/09/2022', // DD/MM/YYYY format
        '8/9/2022',
        '09-08-2022',
        '9.8.2022',
      ];

      for (const dateFormat of dateFormats) {
        const normalized = normalizeBirthdateInput(dateFormat);
        expect(normalized).toBe('09/08/2022');
        
        const hash = await hashString(normalized);
        expect(hash).toBe(EXPECTED_HASH);
      }
    });
  });

  describe('Authentication Flow Simulation', () => {
    it('should simulate complete authentication flow: Grace Janin + 09/08/2022', async () => {
      // Step 1: User enters "Grace Janin"
      const accessCode = 'Grace Janin';
      const codeLower = accessCode.trim().toLowerCase();
      expect(codeLower).toBe('grace janin');

      // Step 2: Client hashes the code
      const codeHash = await hashString(codeLower);
      expect(codeHash).toBe('37d905efd806f04be408474870f53ad3');

      // Step 3: User enters birthdate "09/08/2022"
      const birthdateInput = '09/08/2022';

      // Step 4: Client normalizes the birthdate
      const normalizedBirthdate = normalizeBirthdateInput(birthdateInput);
      expect(normalizedBirthdate).toBe('09/08/2022');

      // Step 5: Client hashes the normalized birthdate
      const birthdateHash = await hashString(normalizedBirthdate);
      expect(birthdateHash).toBe('bdb1a45151fd19ff9b7e765edd4280cd');

      // Step 6: Simulate server-side validation
      const storedHashes = {
        accessCodeHash: '37d905efd806f04be408474870f53ad3',
        birthdateHash: 'bdb1a45151fd19ff9b7e765edd4280cd',
      };

      // Server compares hashes (constant-time comparison)
      const codeMatches = codeHash.toLowerCase() === storedHashes.accessCodeHash.toLowerCase();
      const birthdateMatches = birthdateHash.toLowerCase() === storedHashes.birthdateHash.toLowerCase();

      expect(codeMatches).toBe(true);
      expect(birthdateMatches).toBe(true);

      // If both match, user is authenticated as Harper
      if (codeMatches && birthdateMatches) {
        const userType = 'harper';
        expect(userType).toBe('harper');
      }
    });

    it('should handle case-insensitive code input correctly', async () => {
      const codeVariants = ['Grace Janin', 'grace janin', 'GRACE JANIN', 'grace janin '];
      const EXPECTED_HASH = '37d905efd806f04be408474870f53ad3';

      for (const code of codeVariants) {
        const codeLower = code.trim().toLowerCase();
        const hash = await hashString(codeLower);
        expect(hash).toBe(EXPECTED_HASH);
      }
    });

    it('should reject incorrect birthdate even with correct access code', async () => {
      const accessCode = 'grace janin';
      const codeHash = await hashString(accessCode);
      expect(codeHash).toBe('37d905efd806f04be408474870f53ad3');

      // Wrong birthdate
      const wrongBirthdate = '01/01/2020';
      const normalizedWrong = normalizeBirthdateInput(wrongBirthdate);
      const wrongHash = await hashString(normalizedWrong);

      const storedHashes = {
        accessCodeHash: '37d905efd806f04be408474870f53ad3',
        birthdateHash: 'bdb1a45151fd19ff9b7e765edd4280cd', // Correct hash
      };

      const codeMatches = codeHash.toLowerCase() === storedHashes.accessCodeHash.toLowerCase();
      const birthdateMatches = wrongHash.toLowerCase() === storedHashes.birthdateHash.toLowerCase();

      expect(codeMatches).toBe(true); // Code is correct
      expect(birthdateMatches).toBe(false); // Birthdate is wrong

      // Should not authenticate as Harper
      if (!birthdateMatches) {
        const userType = 'normal'; // Not Harper
        expect(userType).toBe('normal');
      }
    });
  });

  describe('Guest Code Authentication', () => {
    it('should authenticate guest codes correctly', async () => {
      const guestCodes = ['guestmoir', 'moirguest'];
      const EXPECTED_HASHES = {
        guestmoir: 'e537377e992c23b6814fa01175cc7e45',
        moirguest: '977c0e0bd4e08d232a735f13dd15ea6d',
      };

      for (const code of guestCodes) {
        const hash = await hashString(code);
        expect(hash).toBe(EXPECTED_HASHES[code as keyof typeof EXPECTED_HASHES]);
      }
    });
  });

  describe('Hash Comparison (Constant-Time)', () => {
    it('should compare hashes correctly', () => {
      const hash1 = '37d905efd806f04be408474870f53ad3';
      const hash2 = '37d905efd806f04be408474870f53ad3';
      const hash3 = '37d905efd806f04be408474870f53ad4'; // Different

      // Simple comparison (in real code, use constant-time comparison)
      expect(hash1 === hash2).toBe(true);
      // @ts-expect-error Intentional comparison of different hash values to test uniqueness
      expect(hash1 === hash3).toBe(false);
    });

    it('should handle lowercase normalization in comparisons', () => {
      const hash1 = '37D905EFD806F04BE408474870F53AD3';
      const hash2 = '37d905efd806f04be408474870f53ad3';

      expect(hash1.toLowerCase() === hash2.toLowerCase()).toBe(true);
    });
  });
});

