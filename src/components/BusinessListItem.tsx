'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Business } from '@/types/business';
import { useAuth } from '@/contexts/AuthContext';
import BusinessStatsView from './BusinessStatsView';

interface BusinessListItemProps {
  business: Business;
  isPro?: boolean;
}

export default function BusinessListItem({ business, isPro = false }: BusinessListItemProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOwner = business.ownerId === user?.uid;

  const verificationStatusColor = business.verificationApproved
    ? 'green'
    : business.verificationRequested
    ? 'orange'
    : 'blue';

  const verificationStatusText = business.verificationApproved
    ? 'Verified'
    : business.verificationRequested
    ? 'Pending Verification'
    : 'Request Verification';

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-lg">
      {/* Background Image */}
      {business.imageUrl && !imageError ? (
        <div className="absolute inset-0">
          <Image
            src={business.imageUrl}
            alt={business.name}
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
        {/* Top row with stats button and pro status */}
        <div className="flex items-center justify-between">
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
          {isPro && (
            <div className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
              PRO
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={business.id ? `/businesses/${business.id}` : '#'}
                  className="text-xl font-bold text-white line-clamp-1 hover:underline"
                >
                  {business.name}
                </Link>
                {business.verificationApproved && (
                  <svg
                    className="w-5 h-5 text-green-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {business.description && (
                <p className="text-sm text-white/80 line-clamp-2 mb-2">
                  {business.description}
                </p>
              )}
              {business.rating !== undefined && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-4 h-4 ${
                        index < Math.floor(business.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-white/40'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-white/80 ml-1">
                    ({business.numberOfRatings || 0})
                  </span>
                </div>
              )}
            </div>
            {isOwner && (
              <Link
                href={business.id ? `/businesses/${business.id}/admin` : '#'}
                className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors flex-shrink-0"
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
        </div>
      </div>

      {/* Stats View Modal */}
      {showStats && business.id && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <BusinessStatsView
            businessId={business.id}
            onClose={() => setShowStats(false)}
          />
        </div>
      )}
    </div>
  );
}

