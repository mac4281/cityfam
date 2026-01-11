'use client';

import Image from 'next/image';
import { AppUser } from '@/types/user';

interface UserRowProps {
  user: AppUser;
}

export default function UserRow({ user }: UserRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      {user.profileImageUrl ? (
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={user.profileImageUrl}
            alt={user.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
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
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
          {user.name}
        </p>
        {user.email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        )}
      </div>
    </div>
  );
}

