import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ParentDashboard from './components/ParentDashboard';
import ChildCalendarView from './components/ChildCalendarView';
import AuthModal from './components/AuthModal';
import ChildLoginModal from './components/ChildLoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeIntegrationService } from './lib/themeIntegration';
import { EmotionalBackgroundProvider } from './lib/EmotionalBackground';
import { Parent, Child, Calendar } from './types/calendar';
import type { Session } from '@supabase/supabase-js';
import { authService } from './lib/auth';

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
  const navigate = useNavigate();

  // Theme integration - Enable Winter Wonderland
  React.useEffect(() => {
    // Apply Winter Wonderland theme for magical Christmas experience
    ThemeIntegrationService.applyWinterWonderlandTheme({
      enabled: true,
      genderVariant: 'neutral', // Start with neutral, can be customized per user
      enhancedEffects: true
    });

    // Fallback seasonal theme if Winter Wonderland fails
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
    try {
      // Wait for session to be established
      let session = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!session && attempts < maxAttempts) {
        session = await authService.getCurrentSession();
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (session) {
        await login('parent', session, user as Parent, child);
        // Use React Router navigation instead of window.location.href
        navigate('/parent/dashboard');
      } else {
        console.error('Failed to establish session after signup');
        // Show error to user
        alert('Authentication failed. Please try logging in manually.');
      }
    } catch (error) {
      console.error('Error in parent auth success:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const handleChildLoginSuccess = async (child: Child, calendar: Calendar) => {
    // Store child session in localStorage
    localStorage.setItem('child_session', JSON.stringify({ child, calendar }));
    await login('child', null as unknown as Session, undefined, child);
    navigate('/child/calendar');
  };

  const handleGuestLogin = async () => {
    try {
      // Create a guest session with demo data
      const guestChild: Child = {
        child_uuid: 'guest-' + Date.now(),
        parent_uuid: 'guest-parent',
        name: 'Guest Explorer',
        birthdate: '2018-01-01', // 6 years old
        gender: 'unspecified',
        interests: { butterflies: true, books: true },
        selected_template: 'pastel-dreams',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const guestCalendar: Calendar = {
        calendar_id: 'guest-calendar',
        child_uuid: guestChild.child_uuid,
        parent_uuid: 'guest-parent',
        template_id: '550e8400-e29b-41d4-a716-446655440000', // pastel-dreams
        share_uuid: undefined,
        is_published: false,
        year: new Date().getFullYear(),
        version: 1,
        last_tile_opened: 0,
        settings: { theme: 'pastel-dreams', isGuest: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store guest session in localStorage
      localStorage.setItem('guest_session', JSON.stringify({
        child: guestChild,
        calendar: guestCalendar,
        isGuest: true
      }));

      await login('child', null as unknown as Session, undefined, guestChild);
      navigate('/child/calendar');
    } catch (error) {
      console.error('Guest login error:', error);
      alert('Failed to start guest session. Please try again.');
    }
  };

  const [authStep, setAuthStep] = React.useState<'welcome' | 'parent-options' | 'child-options'>('welcome');

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden winter-wonderland-bg">

      {/* Winter Wonderland Snow Effects */}
      <div className="winter-snow-overlay">
        <div className="winter-snow-particle large" style={{left: '10%', animationDelay: '0s'}}>❄️</div>
        <div className="winter-snow-particle medium" style={{left: '25%', animationDelay: '2s'}}>❄️</div>
        <div className="winter-snow-particle small" style={{left: '40%', animationDelay: '4s'}}>❄️</div>
        <div className="winter-snow-particle large" style={{left: '60%', animationDelay: '1s'}}>❄️</div>
        <div className="winter-snow-particle medium" style={{left: '75%', animationDelay: '3s'}}>❄️</div>
        <div className="winter-snow-particle small" style={{left: '85%', animationDelay: '5s'}}>❄️</div>
      </div>

      {/* Holiday Lighting Effects */}
      <div className="winter-holiday-lights"></div>

      <div id="main-content" className="text-center max-w-md w-full mx-4 relative z-10">
        {/* Welcome Step */}
        {authStep === 'welcome' && (
          <div className="winter-wonderland-card frosted p-8 mb-4 winter-ornamentation winter-magic-sparkle">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/30">
                <span className="text-4xl">🎄</span>
              </div>
              <h1 className="display-1 mb-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
                Welcome to Christmas Magic
              </h1>
              <p className="body-large text-emerald-100/80">
                Let's create unforgettable holiday memories together
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGuestLogin}
                className="winter-wonderland-button frosted w-full text-xl py-4 hover:scale-105 transition-all duration-300"
              >
                ✨ Start Exploring ✨
              </button>

              <button
                onClick={() => setAuthStep('parent-options')}
                className="winter-wonderland-button frosted w-full text-lg py-3 hover:scale-105 transition-all duration-300"
              >
                I'm a Parent → Create Custom Calendar
              </button>

              <button
                onClick={() => setAuthStep('child-options')}
                className="w-full py-3 px-6 rounded-2xl font-medium text-lg transition-all hover:scale-105 shadow-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-200 border border-rose-400/30 hover:border-rose-400/50 backdrop-blur-sm"
              >
                I'm a Child → Open My Calendar 🎁
              </button>
            </div>
          </div>
        )}

        {/* Parent Options Step */}
        {authStep === 'parent-options' && (
          <div className="winter-wonderland-card frosted p-8 mb-4 winter-ornamentation winter-magic-sparkle">
            <button
              onClick={() => setAuthStep('welcome')}
              className="absolute top-4 left-4 text-emerald-200/70 hover:text-emerald-100 transition-colors"
              aria-label="Go back"
            >
              ← Back
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl shadow-blue-500/30">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h2 className="headline-1 mb-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Create Family Magic
              </h2>
              <p className="body text-blue-100/80">
                Sign up to customize personalized advent calendars for your children
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="winter-wonderland-button frosted w-full text-lg py-3 hover:scale-105 transition-all duration-300"
              >
                Sign Up as Parent
              </button>

              <div className="text-center">
                <span className="text-sm text-blue-200/60">Already have an account?</span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="ml-1 text-blue-300 hover:text-blue-200 underline transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Child Options Step */}
        {authStep === 'child-options' && (
          <div className="winter-wonderland-card frosted p-8 mb-4 winter-ornamentation winter-magic-sparkle">
            <button
              onClick={() => setAuthStep('welcome')}
              className="absolute top-4 left-4 text-rose-200/70 hover:text-rose-100 transition-colors"
              aria-label="Go back"
            >
              ← Back
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500 shadow-2xl shadow-rose-500/30">
                <span className="text-2xl">🎁</span>
              </div>
              <h2 className="headline-1 mb-2 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                Your Daily Surprise Awaits!
              </h2>
              <p className="body text-rose-100/80">
                Enter your family code to discover today's magical surprise
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowChildLogin(true)}
                className="winter-wonderland-button frosted w-full text-lg py-3 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-rose-500/20 to-pink-500/20"
              >
                Open My Calendar 🎄
              </button>
            </div>
          </div>
        )}

        {/* Winter Wonderland Seasonal Message */}
        <div className="text-center mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-emerald-200/80 font-medium text-sm">
            {new Date().getMonth() === 11 && new Date().getDate() <= 25
              ? "🎄 Every day brings a new moment of holiday magic in our Winter Wonderland 🎄"
              : "❄️ Creating traditions that warm the heart forever in our magical wonderland ❄️"
            }
          </p>
          <div className="flex justify-center items-center mt-2 space-x-2">
            <span className="text-xs text-emerald-300/60">✨</span>
            <span className="text-xs text-teal-300/60">Powered by Winter Wonderland</span>
            <span className="text-xs text-cyan-300/60">✨</span>
          </div>
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
      <EmotionalBackgroundProvider>
        <AuthProvider>
          {/* Skip Link for Accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <AppRouter />
        </AuthProvider>
      </EmotionalBackgroundProvider>
    </ErrorBoundary>
  );
}

export default App;
