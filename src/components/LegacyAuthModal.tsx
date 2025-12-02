import React, { useState } from 'react';
import { hashString, normalizeBirthdateInput } from '../lib/hashUtils';
import { setSessionToken, setStoredSessionId, setHarperSession, setGuestSession } from '../lib/cookieStorage';

interface LegacyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userType: 'child' | 'guest' | 'normal') => void;
}

const LegacyAuthModal: React.FC<LegacyAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [codeAttempt, setCodeAttempt] = useState('');
  const [birthdateAttempt, setBirthdateAttempt] = useState('');
  const [showBirthdateField, setShowBirthdateField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ACCESS_PHRASE = 'grace janin';
  const GUEST_PHRASE = 'guestmoir';
  const MOIR_GUEST_PHRASE = 'moirguest';
  const HARPER_MUM_PHRASE = 'harpermum';

  const SESSION_AUTH_ENDPOINT = '/api/session-auth';

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    setCodeAttempt(value);
    setShowBirthdateField(value === ACCESS_PHRASE);
    setError(null);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codeAttempt.trim()) {
      setError('Please enter an access code');
      return;
    }

    const codeLower = codeAttempt.trim().toLowerCase();
    const isGuestCode = codeLower === GUEST_PHRASE || codeLower === MOIR_GUEST_PHRASE;
    const isHarperMum = codeLower === HARPER_MUM_PHRASE;

    // Validate birthdate if needed
    if (showBirthdateField && !birthdateAttempt.trim()) {
      setError('Please enter your birthdate');
      return;
    }

    try {
      setLoading(true);

      let codeHash = null;
      let plainTextCode = null;
      let birthdateHash = null;

      if (isHarperMum) {
        plainTextCode = codeLower;
      } else {
        codeHash = await hashString(codeLower);
      }

      if (showBirthdateField && birthdateAttempt) {
        const normalizedBirthdate = normalizeBirthdateInput(birthdateAttempt);
        birthdateHash = await hashString(normalizedBirthdate);
      }

      const response = await fetch(SESSION_AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codeHash,
          birthdateHash,
          plainTextCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store session info
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
      if (data.sessionId) {
        setStoredSessionId(data.sessionId);
      }

      // Set user type flags
      if (data.userType === 'harper') {
        setHarperSession(true);
        setGuestSession(false);
      } else if (data.userType === 'guest') {
        setGuestSession(true);
        setHarperSession(false);
      } else {
        setHarperSession(false);
        setGuestSession(false);
      }

      // Clean URL - remove any query parameters
      window.history.replaceState(null, '', window.location.pathname);

      // Call success callback
      onSuccess(data.userType === 'harper' ? 'child' : data.userType === 'guest' ? 'guest' : 'normal');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              type="text"
              value={codeAttempt}
              onChange={handleCodeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter access code"
              required
              autoFocus
            />
          </div>

          {showBirthdateField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is your birthdate?
              </label>
              <input
                type="text"
                value={birthdateAttempt}
                onChange={(e) => {
                  setBirthdateAttempt(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DD/MM/YYYY"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LegacyAuthModal;

