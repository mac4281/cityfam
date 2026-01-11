'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Logo from '@/components/Logo';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async () => {
    if (!email.trim()) {
      setAlertMessage('Please enter your email address.');
      setIsSuccess(false);
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAlertMessage('Password reset link has been sent to your email.');
      setIsSuccess(true);
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to send password reset email.');
      setIsSuccess(false);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      resetPassword();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Logo size="navigation" />
        </div>

        <div className="flex-1 flex flex-col px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6 mt-8">
            Reset Password
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8 px-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Email"
                autoCapitalize="none"
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <button
              onClick={resetPassword}
              disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {isSuccess ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {alertMessage}
              </p>
              <button
                onClick={() => {
                  setShowAlert(false);
                  if (isSuccess) {
                    router.back();
                  }
                }}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

