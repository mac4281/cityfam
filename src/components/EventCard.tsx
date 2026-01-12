'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  showStar?: boolean;
  href?: string;
  onClick?: () => void;
}

export default function EventCard({ event, showStar = false, href, onClick }: EventCardProps) {
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

  const cardContent = (
    <div className="relative h-[150px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
      {event.imageUrl ? (
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          sizes="280px"
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
      {showStar && (
        <div className="absolute top-2 right-2">
          <div className="p-2 bg-white rounded-full shadow-lg">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2">
          {event.title}
        </h3>
        {event.date && (
          <p className="text-white/80 text-xs mt-1">
            {formatDate(event.date)}
          </p>
        )}
      </div>
    </div>
  );

  const defaultHref = event.id ? `/events/${event.id}` : '#';
  const finalHref = href || defaultHref;

  if (onClick) {
    return (
      <div onClick={onClick} className="flex-shrink-0 w-[280px] block cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={finalHref} className="flex-shrink-0 w-[280px] block">
      {cardContent}
    </Link>
  );
}

