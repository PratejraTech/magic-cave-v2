import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ParentDashboard from './components/ParentDashboard';
import ChildCalendarView from './components/ChildCalendarView';
import AuthModal from './components/AuthModal';
import ChildLoginModal from './components/ChildLoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeIntegrationService } from './lib/themeIntegration';
import { Parent, Child, Calendar } from './types/calendar';
import type { Session } from '@supabase/supabase-js';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedUserTypes: string[] }> = ({
  children,
  allowedUserTypes
}) => {
  const { userType, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedUserTypes.includes(userType || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
          <p className="text-red-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Auth Page Component
const AuthPage: React.FC = () => {
  const { isAuthenticated, userType, login, refreshProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showChildLogin, setShowChildLogin] = React.useState(false);
  const location = useLocation();

  // Theme integration
  React.useEffect(() => {
    const theme = ThemeIntegrationService.getSeasonalTheme();
    ThemeIntegrationService.applyThemeToPage(theme);
  }, []);

  // Check if this is an OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Supabase handles OAuth callbacks automatically via detectSessionInUrl
      // Just refresh the profile after a short delay to allow session to be established
      if (location.search.includes('code=') || location.hash.includes('access_token=')) {
        setTimeout(async () => {
          await refreshProfile();
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [location, refreshProfile]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (userType === 'parent') {
        window.location.href = '/parent/dashboard';
      } else if (userType === 'child') {
        window.location.href = '/child/calendar';
      }
    }
  }, [isAuthenticated, userType]);

  const handleParentAuthSuccess = async (user: Parent, child?: Child) => {
    // Get session from Supabase
    const { authService } = await import('./lib/auth');
    try {
      const session = await authService.getCurrentSession();
      
      if (session) {
        await login('parent', session, user as Parent, child);
        window.location.href = '/parent/dashboard';
      } else {
        // Session might not be ready yet, wait and retry
        setTimeout(async () => {
          const retrySession = await authService.getCurrentSession();
          if (retrySession) {
            await login('parent', retrySession, user as Parent, child);
            window.location.href = '/parent/dashboard';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
  };

  const handleChildLoginSuccess = async (child: Child, calendar: Calendar) => {
    // Store child session in localStorage
    localStorage.setItem('child_session', JSON.stringify({ child, calendar }));
    await login('child', null as unknown as Session, undefined, child);
    window.location.href = '/child/calendar';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{
           background: 'var(--theme-background)',
           fontFamily: 'var(--theme-font)'
         }}>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full"
             style={{ backgroundColor: 'var(--theme-primary)' }}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full"
             style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full"
             style={{ backgroundColor: 'var(--theme-accent)' }}></div>
      </div>

      <div className="text-center max-w-md w-full mx-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 mb-4 border"
             style={{ borderColor: 'var(--theme-primary)' }}>

          {/* Themed header */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--theme-primary)' }}>
              <span className="text-2xl">🎄</span>
            </div>
            <h1 className="text-3xl font-bold mb-2"
                style={{ color: 'var(--theme-primary)' }}>
              Welcome to Your Advent Calendar!
            </h1>
            <p className="text-gray-600">
              Sign in as a parent to manage your calendar, or log in as a child to unlock your daily surprises.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'white'
              }}
            >
              Parent Sign In / Sign Up
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowChildLogin(true)}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg border-2"
              style={{
                borderColor: 'var(--theme-secondary)',
                color: 'var(--theme-secondary)',
                backgroundColor: 'white'
              }}
            >
              Child Login 🎄
            </button>
          </div>
        </div>

        {/* Seasonal message */}
        <div className="text-center text-sm text-gray-500 mt-4">
          {new Date().getMonth() === 11 && new Date().getDate() <= 25
            ? "🎄 May your Advent season be filled with joy and wonder! 🎄"
            : "❄️ Creating magical moments, one day at a time ❄️"
          }
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleParentAuthSuccess}
      />

      <ChildLoginModal
        isOpen={showChildLogin}
        onClose={() => setShowChildLogin(false)}
        onSuccess={handleChildLoginSuccess}
      />
    </div>
  );
};

// OAuth Callback Handler
const OAuthCallback: React.FC = () => {
  const { refreshProfile, userType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a moment for Supabase to process the callback
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshProfile();
      
      // Wait a bit more for state to update, then redirect
      setTimeout(() => {
        if (userType === 'parent') {
          window.location.href = '/parent/dashboard';
        } else if (userType === 'child') {
          window.location.href = '/child/calendar';
        } else {
          window.location.href = '/auth';
        }
      }, 500);
    };

    if (location.search.includes('code=') || location.hash.includes('access_token=')) {
      handleCallback();
    } else {
      // No OAuth callback detected, redirect to auth
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
  }, [location, refreshProfile, userType]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

// App Router Component
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
         <Route
           path="/parent/dashboard"
           element={
             <ProtectedRoute allowedUserTypes={['parent']}>
               <ParentDashboard />
             </ProtectedRoute>
           }
         />
         <Route
           path="/test/parent/dashboard"
           element={<ParentDashboard testMode={true} />}
         />
         <Route
           path="/child/calendar"
           element={
             <ProtectedRoute allowedUserTypes={['child']}>
               <ChildCalendarView />
             </ProtectedRoute>
           }
         />
         <Route
           path="/test/child/calendar"
           element={<ChildCalendarView testMode={true} />}
         />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
