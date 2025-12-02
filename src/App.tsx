import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ParentDashboard from './components/ParentDashboard';
import ChildCalendarView from './components/ChildCalendarView';

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

// Auth Page Component (Legacy authentication for backward compatibility)
const AuthPage: React.FC = () => {

  // For now, redirect to the legacy VillageScene for authentication
  // TODO: Implement proper auth page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication</h1>
        <p className="text-gray-600 mb-4">Please use the legacy authentication system.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go to Legacy Auth
        </button>
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
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/child/calendar"
          element={
            <ProtectedRoute allowedUserTypes={['child']}>
              <ChildCalendarView />
            </ProtectedRoute>
          }
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
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
