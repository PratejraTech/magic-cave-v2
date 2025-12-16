import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { validateVoucherCode } from '../lib/vouchers/generator';

export default function VoucherRedeem() {
  const [voucherCode, setVoucherCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('validating');
    setErrorMessage('');

    // Validate format
    if (!validateVoucherCode(voucherCode)) {
      setStatus('error');
      setErrorMessage('Invalid voucher format. Please check your code and try again.');
      return;
    }

    try {
      // In production, make API call to validate and redeem voucher
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation - in production, check against database
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to redeem voucher. Please try again or contact support.');
    }
  };

  const formatVoucherInput = (value: string) => {
    // Auto-format as user types: XMAS-XXXX-XXXX-XXXX
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleaned.startsWith('XMAS')) {
      const remaining = cleaned.substring(4);
      const parts = ['XMAS'];

      for (let i = 0; i < remaining.length; i += 4) {
        parts.push(remaining.substring(i, i + 4));
      }

      return parts.join('-').substring(0, 19); // XMAS-XXXX-XXXX-XXXX
    }

    return cleaned.substring(0, 4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-full mb-4"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Gift className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 font-display">
            Redeem Gift Voucher
          </h1>
          <p className="text-slate-600">
            Enter your voucher code to unlock your magical advent calendar
          </p>
        </div>

        {status === 'success' ? (
          // Success State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Voucher Redeemed!</h2>
            <p className="text-slate-600 mb-6">
              Your account has been credited. Start creating your magical calendars now!
            </p>
            <button
              onClick={() => window.location.href = '/parent'}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voucher Code Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Voucher Code
              </label>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(formatVoucherInput(e.target.value))}
                placeholder="XMAS-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-wider border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={status === 'validating'}
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter the code exactly as it appears on your gift voucher
              </p>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <motion.div
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'validating' || voucherCode.length < 19}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'validating' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Validating...
                </span>
              ) : (
                'Redeem Voucher'
              )}
            </button>

            {/* Info Box */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">📝 Where to find your code:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Check your email receipt</li>
                <li>• Look on your physical gift card</li>
                <li>• Contact the person who gifted you</li>
              </ul>
            </div>
          </form>
        )}

        {/* Support Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Having trouble?{' '}
          <a href="mailto:support@magicavecalendars.com" className="text-emerald-600 hover:underline">
            Contact Support
          </a>
        </p>
      </motion.div>
    </div>
  );
}
