'use client';

import { useEffect, useState } from 'react';
import HomeBranchSelectorView from './HomeBranchSelectorView';

interface BranchSelectorViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentBranchName?: string;
  onSelect?: (branchId: string, branchName: string) => void;
}

export default function BranchSelectorView({
  isOpen = true,
  onClose,
  currentBranchName = '',
  onSelect,
}: BranchSelectorViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  if (!isOpen) return null;

  const handleSelect = (branchId: string, branchName: string) => {
    if (onSelect) {
      onSelect(branchId, branchName);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
      <div className={`h-full w-full ${!isMobile ? 'max-w-[50vw]' : ''}`}>
        <HomeBranchSelectorView
          currentBranchName={currentBranchName}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

// Keep the old modal structure as fallback if needed
export function BranchSelectorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Select Branch
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Placeholder for branch list - will be updated when we have the Swift BranchSelectorView code */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Branch selector functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

