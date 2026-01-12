'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import BranchSelectorView from './BranchSelectorView';

interface ContentViewProps {
  children: React.ReactNode;
}

type TabIndex = 0 | 1 | 2 | 3 | 4;

const tabs = [
  { id: 0, name: 'Home', path: '/', icon: 'house.fill' },
  { id: 1, name: 'Search', path: '/search', icon: 'magnifyingglass' },
  { id: 2, name: 'Chat', path: '/chat', icon: 'message.fill' },
  { id: 3, name: 'Profile', path: '/profile', icon: 'person.fill' },
  { id: 4, name: 'Business', path: '/business', icon: 'briefcase.fill' },
];

export default function ContentView({ children }: ContentViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState<string>('');

  // Pages that shouldn't show tabs/nav bar
  const hideTabsPaths = ['/login', '/forgot-password'];
  const shouldShowTabs = !hideTabsPaths.some((path) => pathname?.startsWith(path));

  // Load branch name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchName = localStorage.getItem('selectedBranchName');
      if (storedBranchName) {
        setCurrentBranchName(storedBranchName);
      }
    }
  }, []);

  // Listen for branch changes
  useEffect(() => {
    const handleBranchChanged = (e: CustomEvent) => {
      const branchName = e.detail?.branchName;
      if (branchName) {
        setCurrentBranchName(branchName);
      }
    };

    const handleRefreshContent = () => {
      // Reload branch name when content is refreshed
      if (typeof window !== 'undefined') {
        const storedBranchName = localStorage.getItem('selectedBranchName');
        if (storedBranchName) {
          setCurrentBranchName(storedBranchName);
        }
      }
    };

    window.addEventListener('branchChanged' as any, handleBranchChanged as EventListener);
    window.addEventListener('RefreshContent' as any, handleRefreshContent as EventListener);

    return () => {
      window.removeEventListener('branchChanged' as any, handleBranchChanged as EventListener);
      window.removeEventListener('RefreshContent' as any, handleRefreshContent as EventListener);
    };
  }, []);

  const handleBranchSelectorOpen = () => {
    // Notify that branch selector is opening - can be used for analytics or other purposes
    // The Logo component manages its own modal state
  };

  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBranchId', branchId);
      localStorage.setItem('selectedBranchName', branchName);
      setCurrentBranchName(branchName);
      
      // Dispatch branch changed event
      window.dispatchEvent(
        new CustomEvent('branchChanged', {
          detail: { branchId, branchName },
        })
      );
    }
  };

  // Determine active tab based on pathname
  useEffect(() => {
    const currentTab = tabs.find((tab) => {
      if (tab.path === '/') {
        return pathname === '/';
      }
      return pathname?.startsWith(tab.path);
    });
    if (currentTab) {
      setActiveTab(currentTab.id as TabIndex);
    }
  }, [pathname]);

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

  // Listen for custom events to switch tabs
  useEffect(() => {
    const handleSwitchToChat = () => {
      setActiveTab(2);
      router.push('/chat');
    };

    const handleStartChat = (e: CustomEvent) => {
      const { userId, userName, userImageUrl } = e.detail || {};
      if (userId && userName) {
        // Navigate to chat - ChatView will handle starting the conversation
        setActiveTab(2);
        router.push(`/chat?userId=${userId}&userName=${userName}&userImageUrl=${userImageUrl || ''}`);
      }
    };

    window.addEventListener('SwitchToChat' as any, handleSwitchToChat as EventListener);
    window.addEventListener('StartChat' as any, handleStartChat as EventListener);

    return () => {
      window.removeEventListener('SwitchToChat' as any, handleSwitchToChat as EventListener);
      window.removeEventListener('StartChat' as any, handleStartChat as EventListener);
    };
  }, [router]);

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id as TabIndex);
    router.push(tab.path);
  };

  const getIcon = (iconName: string, size: 'sm' | 'md' = 'md') => {
    const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
    switch (iconName) {
      case 'house.fill':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        );
      case 'magnifyingglass':
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'message.fill':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        );
      case 'person.fill':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'briefcase.fill':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // If tabs should be hidden, just render children
  if (!shouldShowTabs) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Logo with Branch Selector - Desktop (above nav) or Mobile (at top) */}
      {!isMobile && (
        <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="max-w-[50vw] mx-auto flex items-center justify-between px-4 py-3 h-[57px]">
            <Logo
              size="navigation"
              currentBranchName={currentBranchName}
              onBranchSelect={handleBranchSelect}
              onBranchSelectorOpen={handleBranchSelectorOpen}
            />
            {currentBranchName && (
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {currentBranchName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      {!isMobile && (
        <nav className="sticky top-[57px] z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="max-w-[50vw] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              <div className="flex items-center space-x-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    onClick={() => setActiveTab(tab.id as TabIndex)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    {getIcon(tab.icon, 'sm')}
                    <span>{tab.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Logo with Branch Selector - Mobile (at top) */}
      {isMobile && (
        <div className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo
              size="navigation"
              currentBranchName={currentBranchName}
              onBranchSelect={handleBranchSelect}
              onBranchSelectorOpen={handleBranchSelectorOpen}
            />
            {currentBranchName && (
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-[120px]">
                {currentBranchName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 md:pt-0">
        <div className={!isMobile ? 'max-w-[50vw] mx-auto w-full' : ''}>{children}</div>
      </main>

      {/* Mobile Tab Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 md:hidden safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                aria-label={tab.name}
              >
                <div className={activeTab === tab.id ? 'opacity-100' : 'opacity-60'}>
                  {getIcon(tab.icon, 'sm')}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

