'use client';

import Image from 'next/image';
import Link from 'next/link';

interface OrganizerViewProps {
  organizerId: string;
  organizerName?: string;
  organizerImageUrl?: string;
  isBusiness?: boolean;
}

export default function OrganizerView({
  organizerId,
  organizerName,
  organizerImageUrl,
  isBusiness = false,
}: OrganizerViewProps) {
  const href = isBusiness ? `/businesses/${organizerId}` : `/users/${organizerId}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      {organizerImageUrl ? (
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={organizerImageUrl}
            alt={organizerName || 'Organizer'}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-gray-400"
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
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">Organized by</p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
          {organizerName || 'Unknown'}
        </p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400 flex-shrink-0"
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
  );
}

