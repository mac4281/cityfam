'use client';

import { Branch } from '@/types/branch';

interface BranchRowProps {
  branch: Branch;
  isSelected: boolean;
  onSelect: () => void;
}

export default function BranchRow({ branch, isSelected, onSelect }: BranchRowProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {branch.city}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{branch.state}</p>
        </div>
        {isSelected && (
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

