import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cancel Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30"></div>
            <XCircle className="w-24 h-24 text-red-500 relative" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Cancel Message */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-4 font-display">
            Payment Cancelled
          </h1>
          <p className="text-xl text-slate-600">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </motion.div>

        {/* Explanation */}
        <motion.div
          className="bg-slate-50 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-4 font-display">What happened?</h2>
          <p className="text-slate-600 mb-4">
            The payment process was interrupted or cancelled. This could happen if:
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>You clicked the back button or closed the payment window</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>Your payment session timed out</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>There was an issue with your payment method</span>
            </li>
          </ul>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4 font-display">
            Still want to create magical memories?
          </h3>
          <div className="space-y-3 text-slate-600">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎄</span>
              <span>25 days of Christmas magic</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💝</span>
              <span>One-time payment, lifetime access</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <span>Secure payment processing</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            to="/#pricing"
            className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold text-center hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Try Again
          </Link>
          <Link
            to="/"
            className="flex-1 px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-full font-semibold text-center hover:bg-slate-50 transition-all duration-300"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* Support */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
            <HelpCircle className="w-5 h-5" />
            <span className="font-semibold">Need assistance?</span>
          </div>
          <p className="text-sm text-slate-500">
            Contact our support team at{' '}
            <a href="mailto:support@magicavecalendars.com" className="text-emerald-600 hover:underline">
              support@magicavecalendars.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
