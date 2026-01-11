'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostCardViewProps {
  post: Post;
}

export default function PostCardView({ post }: PostCardViewProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    // Initialize like state based on current user
    if (user && post.likes) {
      setHasLiked(post.likes.includes(user.uid));
    }
    setLocalLikeCount(post.likeCount);
  }, [user, post.likes, post.likeCount]);

  const trackView = async () => {
    if (hasTrackedView || !user || !post.id) return;

    const postRef = doc(db, 'posts', post.id);

    try {
      await updateDoc(postRef, {
        viewCount: increment(1),
        views: arrayUnion(user.uid),
      });
      setHasTrackedView(true);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || !post.id) return;

    const postRef = doc(db, 'posts', post.id);

    try {
      if (hasLiked) {
        // Unlike
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likes: arrayRemove(user.uid),
        });
        setLocalLikeCount((prev) => prev - 1);
      } else {
        // Like
        await updateDoc(postRef, {
          likeCount: increment(1),
          likes: arrayUnion(user.uid),
        });
        setLocalLikeCount((prev) => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleLikeClick = () => {
    if (isSignedIn) {
      toggleLike();
    } else {
      setShowLoginAlert(true);
    }
  };

  useEffect(() => {
    trackView();
  }, []);

  return (
    <>
      <Link
        href={post.id ? `/posts/${post.id}` : '#'}
        className="block w-full h-[280px] relative rounded-xl overflow-hidden group"
      >
        {/* Base layer with image */}
        <div className="absolute inset-0">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.content}
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
          )}

          {/* Multiple gradient overlays */}
          {/* Left gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-[150px] bg-gradient-to-r from-black/20 to-transparent" />
          
          {/* Right gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-[150px] bg-gradient-to-l from-black/20 to-transparent" />
          
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/20 to-transparent" />
          
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content layer */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top row with author info and like button */}
          <div className="flex items-center justify-between">
            {/* Author info with profile image */}
            <div className="flex items-center gap-2">
              {post.authorProfileImageUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={post.authorProfileImageUrl}
                    alt={post.authorName}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
              <span className="text-base font-semibold text-white">
                {post.authorName}
              </span>
            </div>

            {/* Like button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLikeClick();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {hasLiked ? (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span className="text-sm text-white font-medium">
                {localLikeCount}
              </span>
            </button>
          </div>

          {/* Bottom row with text, views, and comment button */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-white line-clamp-2 flex-1">
              {post.content}
            </p>
            <span className="text-xs text-white px-3 py-1.5 whitespace-nowrap">
              {post.viewCount} views
            </span>
            <div className="flex items-center gap-1 text-xs text-white px-3 py-1.5 whitespace-nowrap">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Login Alert Modal */}
      {showLoginAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please sign in to like posts
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginAlert(false);
                    router.push('/login?showPostMessage=true');
                  }}
                  className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLoginAlert(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

