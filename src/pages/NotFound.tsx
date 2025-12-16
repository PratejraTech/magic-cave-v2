/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Gift } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Illustration */}
        <motion.div
          className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-red-400 to-amber-400 mb-8"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          404
        </motion.div>

        {/* Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 font-display">
          Page Not Found
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Oops! Looks like this page got lost in the snow. ❄️
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Where would you like to go?
          </h2>
          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              to="/parent"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-700 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300"
            >
              <Gift className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
          <Link to="/#pricing" className="hover:text-emerald-700 transition-colors">
            View Pricing
          </Link>
          <span>·</span>
          <Link to="/auth" className="hover:text-emerald-700 transition-colors">
            Sign In
          </Link>
          <span>·</span>
          <Link to="/redeem" className="hover:text-emerald-700 transition-colors">
            Redeem Voucher
          </Link>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-slate-500">
          Need help?{' '}
          <a
            href="mailto:support@magicavecalendars.com"
            className="text-emerald-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </motion.div>
    </div>
  );
}
