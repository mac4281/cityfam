'use client';

import Link from 'next/link';
import { Event } from '@/types/event';
import { SortOption } from '@/hooks/useHome';

interface EventsSectionViewProps {
  events: Event[];
  isLoading: boolean;
  selectedSort: SortOption;
}

export default function EventsSectionView({
  events,
  isLoading,
  selectedSort,
}: EventsSectionViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {selectedSort === 'latest' ? 'Latest Events' : 'Trending Events'}
        </h2>
        <Link
          href="/search?category=events"
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          <span>See all events</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-4">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px] h-[150px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </>
          ) : events.length === 0 ? (
            <div className="flex-shrink-0 w-[280px] h-[150px] bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No events available
              </p>
            </div>
          ) : (
            events.map((event) => (
              <Link
                key={event.id || `event-${event.title}`}
                href={event.id ? `/events/${event.id}` : '#'}
                className="flex-shrink-0 w-[280px]"
              >
                <div className="relative h-[150px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">
                      {event.title}
                    </h3>
                    {event.date && (
                      <p className="text-white/80 text-xs mt-1">
                        {typeof event.date === 'string'
                          ? new Date(event.date).toLocaleDateString()
                          : event.date.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

