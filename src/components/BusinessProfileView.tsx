'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SupportingCompanyListItem from './SupportingCompanyListItem';
import StatsCard from './StatsCard';
import StatRow from './StatRow';
import { useSupportingCompanies } from '@/hooks/useSupportingCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { authManager } from '@/lib/authManager';

interface BusinessProfileViewProps {
  isPro?: boolean; // Subscription status
}

export default function BusinessProfileView({ isPro = false }: BusinessProfileViewProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const { supportingCompanies, isLoading } = useSupportingCompanies();
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [globalStats, setGlobalStats] = useState<{ [key: string]: number }>({});

  // Fetch global stats (if needed)
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const statsRef = doc(db, 'analytics', 'global');
        const statsSnap = await getDoc(statsRef);
        
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          setGlobalStats({
            users: data.users || 0,
            events: data.events || 0,
            eventAttendees: data.eventAttendees || 0,
            businesses: data.businesses || 0,
            jobs: data.jobs || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching global stats:', error);
      }
    };

    fetchGlobalStats();
  }, []);

  const totalImpressions = 
    (globalStats.users || 0) +
    (globalStats.events || 0) +
    (globalStats.eventAttendees || 0) +
    (globalStats.businesses || 0) +
    (globalStats.jobs || 0);

  const handleSignOut = async () => {
    try {
      await authManager.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sign Out Button - Only show if signed in, positioned in top right via absolute */}
      {isSignedIn && (
        <div className="absolute top-20 right-4 z-20 md:top-20">
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors bg-white dark:bg-black rounded-lg border border-red-200 dark:border-red-800"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        {/* Pro Status Section */}
        {isSignedIn && !isPro && (
          <button
            onClick={() => router.push('/business/checkout')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Add your business</span>
          </button>
        )}

        {/* Add Business Button or Login Prompt */}
        {isSignedIn ? (
          isPro ? (
            <button
              onClick={() => setShowAddBusiness(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Add A Business</span>
            </button>
          ) : null
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Log in to manage your businesses!
            </p>
            <Link
              href="/login"
              className="block w-full px-4 py-3 text-center text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Log in
            </Link>
          </div>
        )}

        {/* Supporting Companies List */}
        {isSignedIn && supportingCompanies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Businesses
            </h2>
            <div className="space-y-4">
              {supportingCompanies.map((company) => (
                <SupportingCompanyListItem
                  key={company.id}
                  company={company}
                  isPro={isPro}
                />
              ))}
            </div>
          </div>
        )}

        {/* Global Stats Card */}
        <StatsCard title="The CityFam App Stats">
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 mb-4">
              <svg
                className="w-12 h-12 text-blue-500 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Impressions from real Cityfam members!
              </p>
            </div>

            <div className="space-y-0">
              <StatRow title="Total Users" value={globalStats.users || 0} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <StatRow title="Events Created" value={globalStats.events || 0} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <StatRow
                title="Event Attendees"
                value={globalStats.eventAttendees || 0}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <StatRow
                title="Businesses Added"
                value={globalStats.businesses || 0}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <StatRow
                title="Job Listings Posted"
                value={globalStats.jobs || 0}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <StatRow title="Total Impressions" value={totalImpressions} />
            </div>
          </div>
        </StatsCard>
      </div>

      {/* Add Business Modal - This would be a separate component */}
      {showAddBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Add Business
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Business form would go here (BusinessFormView component)
            </p>
            <button
              onClick={() => setShowAddBusiness(false)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

