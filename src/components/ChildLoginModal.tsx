import React, { useState } from 'react';
import { analytics } from '../lib/analytics';

interface ChildLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (child: any, calendar: any) => void;
}

const ChildLoginModal: React.FC<ChildLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [familyUuid, setFamilyUuid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyUuid || !password) {
      setError('Please enter both family code and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/child-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyUuid: familyUuid.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Log child login event
      analytics.logLogin('child');

      onSuccess(data.child, data.calendar);
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message || 'Login failed' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFamilyUuid('');
    setPassword('');
    setError(null);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="text-6xl mb-4">🎄</div>
          <p className="text-gray-600">
            Enter your family code and password to continue your adventure!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Code
            </label>
            <input
              type="text"
              value={familyUuid}
              onChange={(e) => setFamilyUuid(e.target.value)}
              placeholder="Enter your family code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the special code your parent gave you
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? 'Opening Calendar...' : 'Open My Calendar! 🎄'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Ask your parent for your family code and password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChildLoginModal;