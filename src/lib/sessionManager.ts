/**
 * Enhanced session management utilities
 * Handles session creation, validation, rotation, and cleanup
 */

import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionManager {
  private static readonly PARENT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly CHILD_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
    * Create a new session record in the database
    */
  static async createSession(
    userId: string,
    session: Session,
    userType: 'parent' | 'child' = 'parent',
    ipAddress?: string,
    userAgent?: string
  ): Promise<SessionInfo | null> {
    try {
      const duration = userType === 'child' ? this.CHILD_SESSION_DURATION : this.PARENT_SESSION_DURATION;
      const expiresAt = new Date(Date.now() + duration);
      const sessionTokenHash = await this.hashSessionToken(session.access_token);

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token_hash: sessionTokenHash,
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        expiresAt: new Date(data.expires_at),
        lastActivity: new Date(data.last_activity),
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
      };
    } catch (error) {
      console.error('Session creation error:', error);
      return null;
    }
  }

  /**
   * Validate and refresh an existing session
   */
  static async validateSession(session: Session): Promise<boolean> {
    try {
      const sessionTokenHash = await this.hashSessionToken(session.access_token);

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token_hash', sessionTokenHash)
        .eq('user_id', session.user.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return false;
      }

      // Update last activity
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', data.id);

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
    * Rotate session token (create new session, invalidate old)
    */
  static async rotateSession(
    userId: string,
    oldSession: Session,
    newSession: Session,
    userType: 'parent' | 'child' = 'parent',
    ipAddress?: string,
    userAgent?: string
  ): Promise<SessionInfo | null> {
    try {
      // Invalidate old session
      const oldTokenHash = await this.hashSessionToken(oldSession.access_token);
      await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('session_token_hash', oldTokenHash)
        .eq('user_id', userId);

      // Create new session
      return await this.createSession(userId, newSession, userType, ipAddress, userAgent);
    } catch (error) {
      console.error('Session rotation error:', error);
      return null;
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Failed to get user sessions:', error);
        return [];
      }

      return (data || []).map(session => ({
        id: session.id,
        userId: session.user_id,
        expiresAt: new Date(session.expires_at),
        lastActivity: new Date(session.last_activity),
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
      }));
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Terminate a specific session
   */
  static async terminateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Session termination error:', error);
      return false;
    }
  }

  /**
   * Terminate all sessions for a user (except current)
   */
  static async terminateAllSessions(userId: string, currentSessionId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (currentSessionId) {
        query = query.neq('id', currentSessionId);
      }

      const { error } = await query;
      return !error;
    } catch (error) {
      console.error('Terminate all sessions error:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Session cleanup error:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }

  /**
   * Hash session token for storage (using Web Crypto API)
   */
  private static async hashSessionToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Start periodic session validation
   */
  static startSessionValidation(callback: (isValid: boolean) => void): () => void {
    const validate = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const isValid = await this.validateSession(session);
          callback(isValid);
        } else {
          callback(false);
        }
      } catch (error) {
        console.error('Session validation check error:', error);
        callback(false);
      }
    };

    // Initial validation
    validate();

    // Set up periodic checks
    const intervalId = setInterval(validate, this.SESSION_CHECK_INTERVAL);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}