'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import BranchSelectorView from './BranchSelectorView';

export type LogoSize = 'navigation' | 'splash';

interface LogoProps {
  size?: LogoSize;
  currentBranchName?: string;
  onBranchSelect?: (branchId: string, branchName: string) => void;
  onBranchSelectorOpen?: () => void;
}

const sizeHeights = {
  navigation: 30,
  splash: 100,
};

export default function Logo({
  size = 'navigation',
  currentBranchName = '',
  onBranchSelect,
  onBranchSelectorOpen,
}: LogoProps) {
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode - default to false during SSR
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';
  const isDark = currentTheme === 'dark';

  const handleBranchSelectorOpen = () => {
    // Don't open branch selector if we're already inside a branch selector view
    // (i.e., if onBranchSelectorOpen and onBranchSelect are both undefined, we're likely in the selector itself)
    if (onBranchSelectorOpen === undefined && onBranchSelect === undefined) {
      // This is being rendered inside a branch selector, don't open another one
      return;
    }
    // Notify parent that branch selector is opening
    if (onBranchSelectorOpen) {
      onBranchSelectorOpen();
    }
    // Open the branch selector modal
    setShowBranchSelector(true);
  };

  const handleBranchSelectorClose = () => {
    setShowBranchSelector(false);
    // Notify parent that branch selector was closed
    if (onBranchSelectorOpen) {
      // This is a hack - we'll use a callback prop pattern or event
      // For now, just close it
    }
  };

  const handleBranchSelect = (branchId: string, branchName: string) => {
    // Dispatch custom event to notify parent views of branch change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('RefreshContent'));
      window.dispatchEvent(
        new CustomEvent('branchChanged', {
          detail: { branchId, branchName },
        })
      );
    }
    if (onBranchSelect) {
      onBranchSelect(branchId, branchName);
    }
    setShowBranchSelector(false);
  };

  // Fallback logo if images don't exist yet
  const logoImageSrc = isDark ? '/CityFamLogoWhite.png' : '/CityFamLogoBlack.png';

  return (
    <>
      <button
        onClick={handleBranchSelectorOpen}
        className="focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 rounded"
        aria-label="Select branch"
      >
        <div
          className="relative flex items-center"
          style={{ height: `${sizeHeights[size]}px` }}
        >
          <Image
            src={logoImageSrc}
            alt="CityFam Logo"
            width={sizeHeights[size] * 3} // Approximate width based on height
            height={sizeHeights[size]}
            className="h-auto w-auto object-contain"
            style={{ height: `${sizeHeights[size]}px`, maxWidth: 'none' }}
            priority={size === 'splash'}
          />
        </div>
      </button>

      {showBranchSelector && (
        <BranchSelectorView
          isOpen={showBranchSelector}
          currentBranchName={currentBranchName}
          onSelect={handleBranchSelect}
          onClose={() => {
            handleBranchSelectorClose();
            // Dispatch event to notify parent
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('branchSelectorClosed'));
            }
          }}
        />
      )}
    </>
  );
}
