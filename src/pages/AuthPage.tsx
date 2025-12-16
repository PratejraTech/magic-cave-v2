/**
 * Authentication Page
 * Handles login and signup for both parents and children
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  // Get redirect path from query params (e.g., /auth?redirect=/parent)
  const redirectTo = searchParams.get('redirect') || '/parent';

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/'), 300);
  };

  const handleSuccess = () => {
    // After successful auth, redirect to intended destination
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/95 border-emerald-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 shadow-sm"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold font-display bg-gradient-to-r from-emerald-700 via-red-700 to-amber-600 bg-clip-text text-transparent">
                Magic Cave Calendars
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                Christmas Magic
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-3 font-display">
                Welcome Back! 🎄
              </h1>
              <p className="text-lg text-slate-600">
                Sign in to create your magical advent calendar
              </p>
            </div>

            {/* Auth Modal Component */}
            <AuthModal
              isOpen={isOpen}
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500">
        <p>© 2025 Magic Cave Calendars. Made with ❤️ for families everywhere.</p>
      </footer>
    </div>
  );
}
