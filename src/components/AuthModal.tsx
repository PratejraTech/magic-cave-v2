import React, { useState } from 'react';
import { authService, AuthUtils } from '../lib/auth';
import TemplateSelector from './TemplateSelector';
import { Button } from './ui/WonderButton';
import { analytics } from '../lib/analytics';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import type { Child } from '../types/calendar';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, child?: Child) => void;
}

interface ChildProfile {
  name: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  interests: { [key: string]: boolean };
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'facebook'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [childProfile, setChildProfile] = useState<ChildProfile>({
    name: '',
    birthdate: '',
    gender: 'unspecified',
    interests: {}
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterName('');
    setChildProfile({
      name: '',
      birthdate: '',
      gender: 'unspecified',
      interests: {}
    });
    setSelectedTemplate(null);
    setError(null);
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      setError(null);

      // Log login event
      analytics.logLogin('parent', provider);

      await authService.signInWithOAuth(provider);
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      setError(err instanceof Error ? err.message || 'OAuth login failed' : 'OAuth login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.signInWithEmail(loginEmail, loginPassword);

      // Log login event
      analytics.logLogin('parent', 'email_magic_link');

      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message || 'Login failed' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!registerEmail || !registerPassword || !registerName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!childProfile.name || !childProfile.birthdate || !childProfile.gender) {
      setError('Please complete the child profile');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a calendar theme');
      return;
    }

    // Validate birthdate
    const birthdateValidation = AuthUtils.isValidBirthdate(childProfile.birthdate);
    if (!birthdateValidation.valid) {
      setError(birthdateValidation.error || 'Invalid birthdate');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call our API endpoint for registration
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
          childProfile,
          selectedTemplate
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error message
        console.error('Failed to parse response JSON:', parseError);
        throw new Error(`Server error (${response.status}): ${response.statusText || 'Unknown error'}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `Registration failed (${response.status})`);
      }

      // Success - the API should have created the user in Supabase Auth
      // Now sign them in
      const { user } = await authService.signInWithEmail(registerEmail, registerPassword);

      // Log signup event
      analytics.logSignup('email_magic_link');

      onSuccess(user, data.child);
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateChildInterest = (interest: string, value: boolean) => {
    setChildProfile(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.4
        }}
        className="winter-wonderland-card frosted p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto winter-ornamentation"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Auth Method Selection */}
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setAuthMethod('email')}
               className={`flex-1 py-2 px-4 rounded-2xl transition-all duration-200 min-h-[48px] ${
                 authMethod === 'email'
                   ? 'bg-blue-500 text-white shadow-lg'
                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
               }`}
             >
              Email
            </motion.button>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setAuthMethod('google')}
               className={`flex-1 py-2 px-4 rounded-2xl transition-all duration-200 min-h-[48px] ${
                 authMethod === 'google'
                   ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthMethod('facebook')}
              className={`flex-1 py-2 px-4 rounded-xl transition-all duration-200 ${
                authMethod === 'facebook'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Facebook
            </motion.button>
          </div>
        </div>

        {authMethod === 'email' ? (
          <>
            {mode === 'login' ? (
              /* Login Form */
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Parent Info */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Parent Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Child Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Child Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Name *
                      </label>
                      <input
                        type="text"
                        value={childProfile.name}
                        onChange={(e) => setChildProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthdate *
                      </label>
                      <input
                        type="date"
                        value={childProfile.birthdate}
                        onChange={(e) => setChildProfile(prev => ({ ...prev, birthdate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={childProfile.gender}
                        onChange={(e) => setChildProfile(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' | 'unspecified' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="unspecified">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interests (optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['butterflies', 'dogs', 'cats', 'horses', 'swings', 'books', 'art', 'music'].map(interest => (
                          <label key={interest} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={childProfile.interests[interest] || false}
                              onChange={(e) => updateChildInterest(interest, e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">{interest}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="border-t pt-4 mt-4">
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                  />
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </>
        ) : (
          /* OAuth Login */
          <div className="space-y-4">
            <Button
              fullWidth
              size="lg"
              onClick={() => handleOAuthLogin(authMethod as 'google' | 'facebook')}
              loading={loading}
              variant="primary"
            >
              {loading ? 'Connecting…' : `Continue with ${authMethod === 'google' ? 'Google' : 'Facebook'}`}
            </Button>
          </div>
        )}

        {/* Mode Switch */}
        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-700 font-medium"
                onClick={() => handleModeSwitch('register')}
              >
                Sign up
              </Button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-700 font-medium"
                onClick={() => handleModeSwitch('login')}
              >
                Sign in
              </Button>
            </p>
          )}
        </div>
        </motion.div>
      </motion.div>
    );
};

export default AuthModal;
