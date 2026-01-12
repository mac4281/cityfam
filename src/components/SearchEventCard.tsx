'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';

interface SearchEventCardProps {
  event: Event;
}

export default function SearchEventCard({ event }: SearchEventCardProps) {
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={event.id ? `/events/${event.id}` : '#'}
      className="block w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
    >
      <div className="flex">
        {/* Image Section - Max 1/3 width */}
        <div className="relative w-1/3 min-w-[120px] max-w-[180px] h-[120px] flex-shrink-0">
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 120px, 180px"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section - Remaining 2/3 width */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex flex-col gap-2">
            {/* Title Badge */}
            <div className="px-2 py-1.5 bg-green-500/80 rounded-[5px] text-white w-fit">
              <p className="text-[10px] font-bold leading-tight line-clamp-2">
                {event.title}
              </p>
            </div>

            {/* Date and Time */}
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
              {formatDate(event.date)} - {event.time || ''}
            </p>

            {/* Attendee Count */}
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {event.attendeeCount || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">going</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

