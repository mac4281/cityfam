'use client';

import Image from 'next/image';
import { AppUser } from '@/types/user';

interface AttendeeViewProps {
  user: AppUser;
  isStaff: boolean;
  isCheckedIn?: boolean;
  onClick?: () => void;
}

export default function AttendeeView({
  user,
  isStaff,
  isCheckedIn = false,
  onClick,
}: AttendeeViewProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-[70px]"
    >
      <div className="relative">
        {user.profileImageUrl ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={user.profileImageUrl}
              alt={user.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
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
        {isStaff && (
          <div className="absolute -top-1 -right-1">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
        {isCheckedIn && (
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-900 dark:text-gray-100 line-clamp-1 text-center">
        {user.name}
      </p>
    </button>
  );
}

