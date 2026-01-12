'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeView from '@/components/WelcomeView';
import EventsSectionView from '@/components/EventsSectionView';
import PostCardView from '@/components/PostCardView';
import BranchSelectorView from '@/components/BranchSelectorView';
import PostFormView from '@/components/PostFormView';
import SponsorShowcase from '@/components/SponsorShowcase';
import { useHome, SortOption } from '@/hooks/useHome';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest');
  const [showAddPost, setShowAddPost] = useState(false);
  const [showingBranchSelector, setShowingBranchSelector] = useState(false);
  const [showLoginView, setShowLoginView] = useState(false);

  const { events, posts, isLoading, loadContent, fetchRecentPosts } = useHome(
    selectedBranchId
  );

  // Load branch from localStorage on mount
  useEffect(() => {
    const storedBranchId = localStorage.getItem('selectedBranchId');
    if (storedBranchId) {
      setSelectedBranchId(storedBranchId);
    }
  }, []);

  // Listen for branch changes
  useEffect(() => {
    const handleBranchChanged = (e: CustomEvent) => {
      const branchId = e.detail?.branchId;
      if (branchId) {
        setSelectedBranchId(branchId);
      }
    };

    window.addEventListener('branchChanged' as any, handleBranchChanged as EventListener);
    return () => {
      window.removeEventListener('branchChanged' as any, handleBranchChanged as EventListener);
    };
  }, []);

  // Reload content when branch or sort changes
  useEffect(() => {
    if (selectedBranchId) {
      loadContent(selectedSort);
    }
  }, [selectedBranchId, selectedSort]);

  const handleSortChange = async (sort: SortOption) => {
    setSelectedSort(sort);
    await loadContent(sort);
  };

  const handleAddPost = () => {
    if (isSignedIn) {
      setShowAddPost(true);
    } else {
      setShowLoginView(true);
    }
  };

  const handleBranchSelect = (branchId: string, branchName: string) => {
    localStorage.setItem('selectedBranchId', branchId);
    localStorage.setItem('selectedBranchName', branchName);
    setSelectedBranchId(branchId);
    setShowingBranchSelector(false);
    loadContent(selectedSort);
  };

  if (!selectedBranchId) {
    return (
      <>
        <div className="min-h-screen bg-white dark:bg-black">
          <WelcomeView onSelectBranch={() => setShowingBranchSelector(true)} />
        </div>

        {/* Branch Selector Modal for Welcome View */}
        {showingBranchSelector && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-black">
            <BranchSelectorView
              currentBranchName=""
              onSelect={handleBranchSelect}
              onClose={() => setShowingBranchSelector(false)}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-4 py-6 space-y-6">
          {/* Welcome Section */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Live Local ★ Connect Global
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-0 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => handleSortChange('latest')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                selectedSort === 'latest'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => handleSortChange('trending')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                selectedSort === 'trending'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Trending
            </button>
          </div>

          {/* Events Section */}
          <EventsSectionView
            events={events}
            isLoading={isLoading}
            selectedSort={selectedSort}
          />

          {/* Sponsor Showcase */}
          <SponsorShowcase />

          {/* Posts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Recent Posts
              </h2>
              <button
                onClick={handleAddPost}
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                aria-label="Add post"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="hidden md:inline">Create Post</span>
              </button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[150px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                    />
                  ))}
                </>
              ) : posts.length === 0 ? (
                <div className="h-[150px] bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No posts available
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCardView key={post.id || `post-${post.content}`} post={post} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Branch Selector Modal */}
      {showingBranchSelector && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <BranchSelectorView
            currentBranchName={localStorage.getItem('selectedBranchName') || ''}
            onSelect={handleBranchSelect}
            onClose={() => setShowingBranchSelector(false)}
          />
        </div>
      )}

      {/* Add Post Modal */}
      {showAddPost && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <PostFormView
            onPostCreated={() => {
              setShowAddPost(false);
              if (selectedBranchId) {
                loadContent(selectedSort);
              }
            }}
            onClose={() => setShowAddPost(false)}
          />
        </div>
      )}

      {/* Login Modal */}
      {showLoginView && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setShowLoginView(false);
                  if (isSignedIn) {
                    setShowAddPost(true);
                  }
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* LoginView would go here */}
              <div className="p-4">
                <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                  Please login to create a post
                </p>
                <a
                  href="/login"
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
