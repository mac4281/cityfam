'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import BranchRow from './BranchRow';
import { useBranches } from '@/hooks/useBranches';
import { Branch } from '@/types/branch';

interface HomeBranchSelectorViewProps {
  currentBranchName: string;
  onSelect: (branchId: string, branchName: string) => void;
  onClose?: () => void;
}

export default function HomeBranchSelectorView({
  currentBranchName,
  onSelect,
  onClose,
}: HomeBranchSelectorViewProps) {
  const router = useRouter();
  const { branches, isLoading } = useBranches();
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!searchText.trim()) {
      return branches;
    }
    const searchLower = searchText.toLowerCase();
    return branches.filter(
      (branch) =>
        branch.city.toLowerCase().includes(searchLower) ||
        branch.state.toLowerCase().includes(searchLower)
    );
  }, [branches, searchText]);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedBranch) {
      onSelect(selectedBranch.id || '', `${selectedBranch.city}, ${selectedBranch.state}`);
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <>
      <div className="h-screen bg-white dark:bg-black flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
            aria-label="Close branch selector"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="hidden sm:inline">Close</span>
          </button>
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Your Branch</h1>
          </div>
          <div className="w-20" /> {/* Spacer to balance the Close button */}
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search branches"
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Branch List - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <p>No branches found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredBranches.map((branch) => (
                <BranchRow
                  key={branch.id || `${branch.city}-${branch.state}`}
                  branch={branch}
                  isSelected={branch.city === currentBranchName}
                  onSelect={() => handleBranchSelect(branch)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Alert */}
      {showConfirmation && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Confirm Branch Selection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set {selectedBranch.city}, {selectedBranch.state} as your home branch?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedBranch(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

