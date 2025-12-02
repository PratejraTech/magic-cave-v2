// Authentication configuration and utilities for Supabase Auth
import { createClient } from '@supabase/supabase-js';

// Auth configuration
export const AUTH_CONFIG = {
  // OAuth providers
  PROVIDERS: {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    EMAIL: 'email'
  },

  // Password requirements
  PASSWORD_MIN_LENGTH: 8,

  // Session configuration
  SESSION_PERSISTENCE: true,

  // Magic link configuration
  MAGIC_LINK_REDIRECT_URL: typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : process.env.MAGIC_LINK_REDIRECT_URL || 'http://localhost:5173/auth/callback'
};

// Initialize Supabase client for authentication
export function createAuthClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: AUTH_CONFIG.SESSION_PERSISTENCE,
      persistSession: AUTH_CONFIG.SESSION_PERSISTENCE,
      detectSessionInUrl: true
    }
  });
}

// Auth utilities
export class AuthUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a secure family UUID for child login
   */
  static generateFamilyUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate a temporary child password
   */
  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate birthdate (must be in past, reasonable age)
   */
  static isValidBirthdate(birthdate: string): { valid: boolean; error?: string } {
    const date = new Date(birthdate);
    const now = new Date();
    const minAge = 2; // minimum 2 years old
    const maxAge = 18; // maximum 18 years old

    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }

    if (date > now) {
      return { valid: false, error: 'Birthdate cannot be in the future' };
    }

    const age = now.getFullYear() - date.getFullYear();
    if (age < minAge) {
      return { valid: false, error: `Child must be at least ${minAge} years old` };
    }

    if (age > maxAge) {
      return { valid: false, error: `Child must be ${maxAge} years old or younger` };
    }

    return { valid: true };
  }
}

// Authentication service class
export class AuthService {
  private supabase = createAuthClient();

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, metadata?: any) {
    const validation = AuthUtils.isValidPassword(password);
    if (!validation.valid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: AuthUtils.sanitizeInput(email),
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: AuthUtils.sanitizeInput(email),
      password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'facebook', redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || AUTH_CONFIG.MAGIC_LINK_REDIRECT_URL
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send magic link for passwordless login
   */
  async sendMagicLink(email: string, redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email: AuthUtils.sanitizeInput(email),
      options: {
        emailRedirectTo: redirectTo || AUTH_CONFIG.MAGIC_LINK_REDIRECT_URL
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(
      AuthUtils.sanitizeInput(email),
      {
        redirectTo: AUTH_CONFIG.MAGIC_LINK_REDIRECT_URL
      }
    );

    if (error) throw error;
    return data;
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const validation = AuthUtils.isValidPassword(newPassword);
    if (!validation.valid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance
export const authService = new AuthService();