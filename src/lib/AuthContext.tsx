import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Parent, Child } from '../types/calendar';
import { authService } from './auth';
import type { User, Session } from '@supabase/supabase-js';
import { getMessaging, getToken } from 'firebase/messaging';
import { supabase } from './supabaseClient';
import { SessionManager } from './sessionManager';
import { CSRFProtection } from './csrf';

export type UserType = 'parent' | 'child' | 'guest' | null;

export interface AuthContextType {
  userType: UserType;
  parent: Parent | null;
  child: Child | null;
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userType: UserType, session: Session, parent?: Parent, child?: Child) => Promise<void>;
  logout: () => Promise<void>;
  setParent: (parent: Parent) => void;
  setChild: (child: Child) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Register push notification token for the current user
   */
  const registerPushToken = async (userId: string) => {
    try {
      // Check if Firebase messaging is available
      interface WindowWithFirebase extends Window {
        firebaseMessaging?: unknown;
      }
      if (!('serviceWorker' in navigator) || !(window as WindowWithFirebase).firebaseMessaging) {
        console.log('Firebase messaging not available');
        return;
      }

      const messaging = getMessaging();

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered:', registration);

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log('FCM token obtained:', token);

        // Store token in database
        const { error } = await supabase
          .from('user_push_tokens')
          .upsert({
            user_id: userId,
            fcm_token: token,
            platform: 'web',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,platform'
          });

        if (error) {
          console.error('Failed to store FCM token:', error);
        } else {
          console.log('FCM token stored successfully');
        }
      } else {
        console.log('No FCM token received');
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  /**
   * Fetch parent and child profiles from API
   */
  const fetchProfile = async (accessToken: string): Promise<{ parent: Parent | null; child: Child | null }> => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          return { parent: null, child: null };
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return {
        parent: data.profile?.parent || null,
        child: data.profile?.child || null,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { parent: null, child: null };
    }
  };

  /**
   * Initialize auth state from Supabase session
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session from Supabase
        const currentSession = await authService.getCurrentSession();
        const currentUser = await authService.getCurrentUser().catch(() => null);

        if (currentSession && currentUser) {
          setSession(currentSession);
          setUser(currentUser);

          // Fetch profile data
          const { parent: parentData, child: childData } = await fetchProfile(currentSession.access_token);
          
          if (parentData) {
            setParent(parentData);
            setUserType('parent');
            // Register push token for parent notifications
            if (currentUser?.id) {
              registerPushToken(currentUser.id);
            }
          } else if (childData) {
            setChild(childData);
            setUserType('child');
          } else {
            // User exists but no profile - might be a new user
            setUserType('parent');
          }
        } else {
          // Check for child session in localStorage (for child login without Supabase)
          const childSessionData = localStorage.getItem('child_session');
          if (childSessionData) {
            try {
              const parsed = JSON.parse(childSessionData);
              if (parsed.child && parsed.calendar) {
                setChild(parsed.child);
                setUserType('child');
              }
            } catch {
              // Invalid child session data
            }
          }

          // Check for guest session in localStorage
          const guestSessionData = localStorage.getItem('guest_session');
          if (guestSessionData && !child) {
            try {
              const parsed = JSON.parse(guestSessionData);
              if (parsed.child && parsed.calendar && parsed.isGuest) {
                setChild(parsed.child);
                setUserType('guest');
              }
            } catch {
              // Invalid guest session data
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Validate session before accepting it
        const currentUser = await authService.getCurrentUser().catch(() => null);
        if (currentUser) {
          const isValidSession = await SessionManager.validateSession(session);
          if (!isValidSession) {
            // Invalid session, sign out
            await authService.signOut();
            return;
          }

          setSession(session);
          setUser(currentUser);
          const { parent: parentData, child: childData } = await fetchProfile(session.access_token);
          if (parentData) {
            setParent(parentData);
            setUserType('parent');
            // Register push token for parent notifications
            if (currentUser?.id) {
              registerPushToken(currentUser.id);
            }
          } else if (childData) {
            setChild(childData);
            setUserType('child');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setParent(null);
        setChild(null);
        setUserType(null);
        localStorage.removeItem('child_session');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Validate refreshed session
        const currentUser = await authService.getCurrentUser().catch(() => null);
        if (currentUser) {
          const isValidSession = await SessionManager.validateSession(session);
          if (isValidSession) {
            setSession(session);
          } else {
            // Invalid refreshed session, sign out
            await authService.signOut();
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    newUserType: UserType,
    newSession: Session | null,
    newParent?: Parent,
    newChild?: Child
  ) => {
    setUserType(newUserType);

    // Handle guest users differently - no Supabase session
    if (newUserType === 'guest') {
      setSession(null);
      setUser(null);
      if (newChild) {
        setChild(newChild);
        // Guest session is already stored in localStorage by the calling component
      }
      return;
    }

    setSession(newSession);
    const currentUser = await authService.getCurrentUser().catch(() => null);
    if (currentUser) {
      setUser(currentUser);

      // Create session record for enhanced session management
      if (newSession) {
        await SessionManager.createSession(
          currentUser.id,
          newSession,
          newUserType as 'parent' | 'child',
          undefined, // IP address (will be set by server)
          navigator.userAgent
        );

        // Generate CSRF token for form protection (only for parents)
        if (newUserType === 'parent') {
          await CSRFProtection.generateToken(currentUser.id);
        }
      }
    }
    if (newParent) setParent(newParent);
    if (newChild) {
      setChild(newChild);
      // Store child session in localStorage for persistence
      localStorage.setItem('child_session', JSON.stringify({ child: newChild }));
    }
  };

  const logout = async () => {
    try {
      if (session && user) {
        // Terminate all sessions for this user
        await SessionManager.terminateAllSessions(user.id);
      }

      if (session) {
        await authService.signOut();
      }

      setUserType(null);
      setParent(null);
      setChild(null);
      setUser(null);
      setSession(null);
      localStorage.removeItem('child_session');
      localStorage.removeItem('guest_session');
      CSRFProtection.clearToken();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      const { parent: parentData, child: childData } = await fetchProfile(session.access_token);
      if (parentData) {
        setParent(parentData);
        setUserType('parent');
      } else if (childData) {
        setChild(childData);
        setUserType('child');
      }
    }
  };

  const value: AuthContextType = {
    userType,
    parent,
    child,
    user,
    session,
    isAuthenticated: !!session || !!child || userType === 'guest',
    isLoading,
    login,
    logout,
    setParent,
    setChild,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};