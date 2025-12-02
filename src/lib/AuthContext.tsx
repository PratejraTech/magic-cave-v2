import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Parent, Child } from '../types/advent';
import { getStoredSessionId, getSessionToken, isHarperSession, isGuestSession } from './cookieStorage';

export type UserType = 'parent' | 'child' | 'guest' | null;

export interface AuthContextType {
  userType: UserType;
  parent: Parent | null;
  child: Child | null;
  sessionId: string | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userType: UserType, sessionToken: string, sessionId: string, parent?: Parent, child?: Child) => void;
  logout: () => void;
  setParent: (parent: Parent) => void;
  setChild: (child: Child) => void;
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from stored session
    const initAuth = () => {
      const storedSessionId = getStoredSessionId();
      const storedSessionToken = getSessionToken();

      if (storedSessionId && storedSessionToken) {
        setSessionId(storedSessionId);
        setSessionTokenState(storedSessionToken);

        // Determine user type from session flags
        if (isHarperSession()) {
          setUserType('child');
        } else if (isGuestSession()) {
          setUserType('guest');
        } else {
          // Default to parent for authenticated sessions without specific flags
          setUserType('parent');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (
    newUserType: UserType,
    newSessionToken: string,
    newSessionId: string,
    newParent?: Parent,
    newChild?: Child
  ) => {
    setUserType(newUserType);
    setSessionTokenState(newSessionToken);
    setSessionId(newSessionId);
    if (newParent) setParent(newParent);
    if (newChild) setChild(newChild);
  };

  const logout = () => {
    setUserType(null);
    setParent(null);
    setChild(null);
    setSessionId(null);
    setSessionTokenState(null);
  };

  const value: AuthContextType = {
    userType,
    parent,
    child,
    sessionId,
    sessionToken,
    isAuthenticated: !!sessionToken && !!sessionId,
    isLoading,
    login,
    logout,
    setParent,
    setChild,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};