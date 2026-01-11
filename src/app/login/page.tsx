'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { authManager } from '@/lib/authManager';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const needsReauth = searchParams.get('needsReauth') === 'true';
  const showPostMessage = searchParams.get('showPostMessage') === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await authManager.signUp(name, email, password);
      } else {
        await authManager.signIn(email, password);
      }
      // Redirect on success
      router.push('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 py-8">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="splash" />
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live Local ★ Connect Global
            </p>
            {showPostMessage && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Please login to post
              </p>
            )}
          </div>

          {/* Name field (only for sign up) */}
          {isSignUp && (
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                autoCapitalize="none"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                required={isSignUp}
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              required
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {/* Toggle sign up/sign in */}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
            }}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mt-6"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {/* Forgot password link */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

