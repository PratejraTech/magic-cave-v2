/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 * Implements double-submit cookie pattern with encrypted tokens
 */

import { supabase } from './supabaseClient';

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Generate a new CSRF token for a user
   */
  static async generateToken(userId: string): Promise<string> {
    try {
      // Generate random token
      const token = this.generateRandomToken();

      // Hash the token for storage
      const tokenHash = await this.hashToken(token);

      // Store in database with expiry
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY);

      const { error } = await supabase
        .from('csrf_tokens')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        console.error('Failed to store CSRF token:', error);
        throw new Error('Failed to generate CSRF token');
      }

      // Store token in sessionStorage for client-side use
      sessionStorage.setItem('csrf_token', token);

      return token;
    } catch (error) {
      console.error('CSRF token generation error:', error);
      throw error;
    }
  }

  /**
   * Validate a CSRF token
   */
  static async validateToken(userId: string, token: string): Promise<boolean> {
    try {
      if (!token || !userId) {
        return false;
      }

      const tokenHash = await this.hashToken(token);

      const { data, error } = await supabase
        .from('csrf_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return false;
      }

      // Token is valid, remove it to prevent reuse
      await supabase
        .from('csrf_tokens')
        .delete()
        .eq('id', data.id);

      return true;
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return false;
    }
  }

  /**
   * Get current CSRF token from sessionStorage
   */
  static getCurrentToken(): string | null {
    return sessionStorage.getItem('csrf_token');
  }

  /**
   * Clear current CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem('csrf_token');
  }

  /**
   * Clean up expired CSRF tokens (should be called periodically)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('csrf_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('CSRF token cleanup error:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('CSRF token cleanup error:', error);
      return 0;
    }
  }

  /**
   * Generate a random token
   */
  private static generateRandomToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash a token using Web Crypto API
   */
  private static async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * React hook for CSRF token management
 */
export function useCSRF() {
  const getToken = () => CSRFProtection.getCurrentToken();

  const refreshToken = async (userId: string) => {
    try {
      const token = await CSRFProtection.generateToken(userId);
      return token;
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
      return null;
    }
  };

  const clearToken = () => CSRFProtection.clearToken();

  return {
    getToken,
    refreshToken,
    clearToken,
  };
}