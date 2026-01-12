'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Business } from '@/types/business';

interface BusinessSearchItemProps {
  business: Business;
}

export default function BusinessSearchItem({ business }: BusinessSearchItemProps) {
  return (
    <Link
      href={business.id ? `/businesses/${business.id}` : '#'}
      className="block w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
    >
      <div className="flex">
        {/* Image Section - Max 1/3 width */}
        <div className="relative w-1/3 min-w-[120px] max-w-[180px] h-[120px] flex-shrink-0">
          {business.imageUrl ? (
            <Image
              src={business.imageUrl}
              alt={business.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 120px, 180px"
            />
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section - Remaining 2/3 width */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex flex-col gap-2">
            {/* Business Name Badge */}
            <div className="px-2 py-1.5 bg-blue-500/80 rounded-[5px] text-white w-fit">
              <p className="text-[10px] font-bold leading-tight line-clamp-2">
                {business.name}
              </p>
            </div>

            {/* Address */}
            {business.address && (
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                {business.address}
              </p>
            )}

            {/* Description */}
            {business.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-tight">
                {business.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

