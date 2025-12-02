/**
 * Encryption utilities for sensitive child data
 * Provides field-level encryption for PII (Personally Identifiable Information)
 */

import CryptoJS from 'crypto-js';

// Environment-based encryption key (should be set securely in production)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

export class DataEncryption {
  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string): string {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid data to encrypt');
      }

      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid data to decrypt');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash data for one-way encryption (passwords, tokens)
   */
  static hash(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if data appears to be encrypted (basic heuristic)
   */
  static isEncrypted(data: string): boolean {
    // AES encrypted data typically contains only base64 characters and is longer than original
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(data) && data.length > 50;
  }
}

/**
 * Field-level encryption for child data
 */
export class ChildDataEncryption {
  // Fields that should be encrypted
  private static readonly SENSITIVE_FIELDS = [
    'name',
    'birthdate',
    'interests'
  ];

  /**
   * Encrypt sensitive child data before storage
   */
  static encryptChildData(childData: Record<string, any>): Record<string, any> {
    const encrypted = { ...childData };

    for (const field of this.SENSITIVE_FIELDS) {
      if (encrypted[field]) {
        try {
          encrypted[field] = DataEncryption.encrypt(String(encrypted[field]));
          encrypted[`${field}_encrypted`] = true;
        } catch (error) {
          console.error(`Failed to encrypt field ${field}:`, error);
          // Keep original data if encryption fails
        }
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive child data after retrieval
   */
  static decryptChildData(encryptedData: Record<string, any>): Record<string, any> {
    const decrypted = { ...encryptedData };

    for (const field of this.SENSITIVE_FIELDS) {
      const encryptedField = `${field}_encrypted`;
      if (decrypted[encryptedField] && decrypted[field]) {
        try {
          decrypted[field] = DataEncryption.decrypt(decrypted[field]);
          delete decrypted[encryptedField];
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Keep encrypted data if decryption fails
        }
      }
    }

    return decrypted;
  }

  /**
   * Check if child data contains encrypted fields
   */
  static hasEncryptedFields(childData: Record<string, any>): boolean {
    return this.SENSITIVE_FIELDS.some(field =>
      childData[`${field}_encrypted`] === true
    );
  }
}

/**
 * Audit logging with encrypted sensitive data
 */
export class SecureAuditLogger {
  /**
   * Log security event with sensitive data masked/encrypted
   */
  static async logSecurityEvent(
    supabase: any,
    event: {
      userId?: string;
      action: string;
      resourceType: string;
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, any>;
      success: boolean;
    }
  ): Promise<void> {
    try {
      // Sanitize metadata to remove sensitive information
      const sanitizedMetadata = this.sanitizeMetadata(event.metadata);

      await supabase.rpc('log_security_event', {
        p_user_id: event.userId || null,
        p_action: event.action,
        p_resource_type: event.resourceType,
        p_resource_id: event.resourceId || null,
        p_ip_address: event.ipAddress || null,
        p_user_agent: event.userAgent || null,
        p_metadata: sanitizedMetadata,
        p_success: event.success
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Sanitize metadata to remove or mask sensitive information
   */
  private static sanitizeMetadata(metadata: Record<string, any> = {}): Record<string, any> {
    const sanitized = { ...metadata };

    // Fields that should be masked
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'email'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Mask partial email addresses
    if (sanitized.email && typeof sanitized.email === 'string') {
      const email = sanitized.email as string;
      const atIndex = email.indexOf('@');
      if (atIndex > 2) {
        sanitized.email = email.substring(0, 2) + '***' + email.substring(atIndex);
      }
    }

    return sanitized;
  }
}

/**
 * Secure token management
 */
export class SecureTokenManager {
  /**
   * Generate a cryptographically secure token
   */
  static generateToken(): string {
    return DataEncryption.generateSecureToken(32);
  }

  /**
   * Generate a secure password reset token
   */
  static generatePasswordResetToken(): { token: string; hashedToken: string; expiresAt: Date } {
    const token = this.generateToken();
    const hashedToken = DataEncryption.hash(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return { token, hashedToken, expiresAt };
  }

  /**
   * Generate a secure family UUID
   */
  static generateFamilyUUID(): string {
    return this.generateToken();
  }

  /**
   * Generate a temporary password
   */
  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

// Export convenience functions
export const encryptChildData = ChildDataEncryption.encryptChildData;
export const decryptChildData = ChildDataEncryption.decryptChildData;
export const logSecurityEvent = SecureAuditLogger.logSecurityEvent;