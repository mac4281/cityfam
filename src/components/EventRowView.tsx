'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { Business } from '@/types/business';

interface EventRowViewProps {
  event: Event;
  business: Business;
  isPro: boolean;
  onDelete: () => void;
}

export default function EventRowView({
  event,
  business,
  isPro,
  onDelete,
}: EventRowViewProps) {
  const router = useRouter();
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);

  const handleClick = () => {
    if (isPro && event.id) {
      router.push(`/events/${event.id}/edit`);
    } else {
      setShowSubscriptionAlert(true);
    }
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(event.date)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {event.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Subscription Alert */}
      {showSubscriptionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Add Your Business
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                To edit events, please add your business on CityFam.com.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscriptionAlert(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.open('https://cityfam.com', '_blank');
                    setShowSubscriptionAlert(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Visit CityFam.com
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

