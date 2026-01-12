'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SupportingCompany } from '@/types/supportingCompany';
import BusinessStatsView from './BusinessStatsView';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SupportingCompanyListItemProps {
  company: SupportingCompany;
  isPro?: boolean;
}

export default function SupportingCompanyListItem({
  company,
  isPro = false,
}: SupportingCompanyListItemProps) {
  const [showStats, setShowStats] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCancelSubscription = async () => {
    if (!company.stripeSubscriptionId || !user) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: company.stripeSubscriptionId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      // Refresh the page to update the subscription status
      router.refresh();
      setShowCancelConfirm(false);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      alert(`Error canceling subscription: ${error.message}`);
    } finally {
      setIsCanceling(false);
    }
  };

  const isSubscriptionActive = company.subscriptionStatus === 'active';

  return (
    <>
      <div className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-lg">
        {/* Background Image */}
        {company.imageUrl && !imageError ? (
          <div className="absolute inset-0">
            <Image
              src={company.imageUrl}
              alt={company.name}
              fill
              className="object-cover"
              sizes="100vw"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top row with stats button, admin button, and subscription tier */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(true)}
                className="p-2 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
                aria-label="View stats"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </button>
              {company.businessId && (
                <Link
                  href={`/businesses/${company.businessId}/admin`}
                  className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                  aria-label="Admin settings"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
              )}
            </div>
            <div
              className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                company.subscriptionTier === 'all' ? 'bg-purple-500' : 'bg-blue-500'
              }`}
            >
              {company.subscriptionTier === 'all' ? 'ALL BRANCHES' : 'SINGLE BRANCH'}
            </div>
          </div>

          {/* Bottom content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  href={company.businessId ? `/business/${company.businessId}` : '#'}
                  className="text-xl font-bold text-white line-clamp-1 hover:underline"
                >
                  {company.name}
                </Link>
                {company.description && (
                  <p className="text-sm text-white/80 line-clamp-2 mb-2">
                    {company.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-white/80">
                  <span>{company.views} views</span>
                  <span>{company.linkClicks} clicks</span>
                  <span>{company.likes} likes</span>
                </div>
                {isSubscriptionActive && company.stripeSubscriptionId && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="mt-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats View Modal */}
      {showStats && company.businessId && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <BusinessStatsView
            businessId={company.businessId}
            onClose={() => setShowStats(false)}
          />
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Cancel Subscription
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription for {company.name}? This will
              immediately cancel your subscription and you will lose access to premium features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCanceling}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
