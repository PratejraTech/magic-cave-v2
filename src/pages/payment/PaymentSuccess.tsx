import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Gift, Mail, Calendar } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // In production, fetch order details from your backend
    // For now, we'll use a mock response
    const fetchOrderDetails = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setOrderDetails({
          email: 'customer@example.com',
          tier: 'Premium',
          calendars: 3,
          amount: 49,
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <CheckCircle className="w-24 h-24 text-emerald-600 relative" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-4 font-display">
            Payment Successful! 🎄
          </h1>
          <p className="text-xl text-slate-600">
            Thank you for your purchase! Your magical Christmas adventure begins now.
          </p>
        </motion.div>

        {/* Order Details */}
        {orderDetails && (
          <motion.div
            className="bg-emerald-50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Plan:</span>
                <span className="font-semibold text-slate-800">{orderDetails.tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Calendars Included:</span>
                <span className="font-semibold text-slate-800">{orderDetails.calendars}</span>
              </div>
              <div className="flex items-center justify-between border-t border-emerald-200 pt-4">
                <span className="text-slate-600">Total Paid:</span>
                <span className="font-bold text-2xl text-emerald-700">${orderDetails.amount}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4 font-display">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-emerald-600 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Check your email</p>
                <p className="text-slate-600 text-sm">
                  We've sent your receipt and getting started guide to {orderDetails?.email || 'your email'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-emerald-600 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Create your first calendar</p>
                <p className="text-slate-600 text-sm">
                  Head to your dashboard to start customizing your magical advent calendar
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Gift className="w-6 h-6 text-emerald-600 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Add your personal touches</p>
                <p className="text-slate-600 text-sm">
                  Upload photos, write messages, and create unforgettable memories
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            to="/parent"
            className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold text-center hover:shadow-lg transition-all duration-300"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="flex-1 px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-full font-semibold text-center hover:bg-emerald-50 transition-all duration-300"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* Support */}
        <motion.p
          className="text-center text-sm text-slate-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Need help? <a href="mailto:support@magicavecalendars.com" className="text-emerald-600 hover:underline">Contact Support</a>
        </motion.p>
      </motion.div>
    </div>
  );
}
