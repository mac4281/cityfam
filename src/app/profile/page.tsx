'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authManager } from '@/lib/authManager';
import ReceiptsSection from '@/components/ReceiptsSection';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState<string>('');

  // Load branch name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchName = localStorage.getItem('selectedBranchName');
      if (storedBranchName) {
        setCurrentBranchName(storedBranchName);
      }
    }
  }, []);

  // Listen for branch changes
  useEffect(() => {
    const handleBranchChanged = (e: CustomEvent) => {
      const branchName = e.detail?.branchName;
      if (branchName) {
        setCurrentBranchName(branchName);
      }
    };

    const handleRefreshContent = () => {
      if (typeof window !== 'undefined') {
        const storedBranchName = localStorage.getItem('selectedBranchName');
        if (storedBranchName) {
          setCurrentBranchName(storedBranchName);
        }
      }
    };

    window.addEventListener('branchChanged' as any, handleBranchChanged as EventListener);
    window.addEventListener('RefreshContent' as any, handleRefreshContent as EventListener);

    return () => {
      window.removeEventListener('branchChanged' as any, handleBranchChanged as EventListener);
      window.removeEventListener('RefreshContent' as any, handleRefreshContent as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await authManager.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-4 py-6 space-y-6">
          {isSignedIn && user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.displayName || user.email || 'User'}
                  </p>
                  {user.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                  {currentBranchName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {currentBranchName}
                    </p>
                  )}
                </div>
              </div>

              {/* Settings/Options */}
              <div className="space-y-2">
                <ReceiptsSection userId={user.uid} />
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">Edit Profile</span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 font-medium">Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please sign in to view your profile
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign Out
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

