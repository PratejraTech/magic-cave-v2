/**
 * Application Routes Configuration
 * Defines all routes and navigation structure
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const EnhancedLandingPage = lazy(() => import('../pages/EnhancedLandingPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const ParentDashboard = lazy(() => import('../components/ParentDashboard'));
const ChildCalendarView = lazy(() => import('../components/ChildCalendarView'));
const PaymentSuccess = lazy(() => import('../pages/payment/PaymentSuccess'));
const PaymentCancel = lazy(() => import('../pages/payment/PaymentCancel'));
const VoucherRedeem = lazy(() => import('../pages/VoucherRedeem'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

/**
 * Main Router Component
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<EnhancedLandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Payment Routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Voucher Routes */}
        <Route path="/redeem" element={<VoucherRedeem />} />
        <Route path="/voucher/redeem" element={<Navigate to="/redeem" replace />} />

        {/* Parent Dashboard Routes */}
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/dashboard" element={<Navigate to="/parent" replace />} />

        {/* Child Calendar Routes */}
        <Route path="/child" element={<ChildCalendarView />} />
        <Route path="/child/calendar" element={<Navigate to="/child" replace />} />

        {/* Legacy Routes - Redirect to new URLs */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Navigate to="/auth" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
