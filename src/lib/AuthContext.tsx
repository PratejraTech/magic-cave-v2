import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Parent, Child } from '../types/advent';
import { authService } from './auth';
import type { User, Session } from '@supabase/supabase-js';

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
        setSession(session);
        const currentUser = await authService.getCurrentUser().catch(() => null);
        if (currentUser) {
          setUser(currentUser);
          const { parent: parentData, child: childData } = await fetchProfile(session.access_token);
          if (parentData) {
            setParent(parentData);
            setUserType('parent');
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
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    newUserType: UserType,
    newSession: Session,
    newParent?: Parent,
    newChild?: Child
  ) => {
    setUserType(newUserType);
    setSession(newSession);
    const currentUser = await authService.getCurrentUser().catch(() => null);
    if (currentUser) {
      setUser(currentUser);
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
      if (session) {
        await authService.signOut();
      }
      setUserType(null);
      setParent(null);
      setChild(null);
      setUser(null);
      setSession(null);
      localStorage.removeItem('child_session');
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
    isAuthenticated: !!session || !!child,
    isLoading,
    login,
    logout,
    setParent,
    setChild,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};