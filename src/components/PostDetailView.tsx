'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePostDetail } from '@/hooks/usePostDetail';
import { useAuth } from '@/contexts/AuthContext';
import GroupMessageView from './GroupMessageView';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostDetailViewProps {
  postId: string;
}

export default function PostDetailView({ postId }: PostDetailViewProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const { post, isLoading } = usePostDetail(postId);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (post) {
      setLocalLikeCount(post.likeCount);
      if (user && post.likes) {
        setHasLiked(post.likes.includes(user.uid));
      }
    }
  }, [post, user]);

  // Track view on mount
  useEffect(() => {
    if (post?.id && user && !hasTrackedView) {
      const trackView = async () => {
        try {
          const postRef = doc(db, 'posts', post.id!);
          await updateDoc(postRef, {
            viewCount: increment(1),
            views: arrayUnion(user.uid),
          });
          setHasTrackedView(true);
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      };
      trackView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, user]);

  const toggleLike = async () => {
    if (!user || !post?.id) return;

    const postRef = doc(db, 'posts', post.id);

    try {
      if (hasLiked) {
        // Unlike
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likes: arrayRemove(user.uid),
        });
        setLocalLikeCount((prev) => prev - 1);
        setHasLiked(false);
      } else {
        // Like
        await updateDoc(postRef, {
          likeCount: increment(1),
          likes: arrayUnion(user.uid),
        });
        setLocalLikeCount((prev) => prev + 1);
        setHasLiked(true);
      }
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (showComments) {
    return (
      <GroupMessageView
        groupId={postId}
        groupType="post"
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header - Back Button */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Go back"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="relative w-full h-[400px] bg-gray-200 dark:bg-gray-800">
            <Image
              src={post.imageUrl}
              alt={post.content}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            {post.authorProfileImageUrl ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={post.authorProfileImageUrl}
                  alt={post.authorName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {post.authorName}
              </h3>
              {post.createdAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Post Text */}
          <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              {hasLiked ? (
                <svg
                  className="w-6 h-6 text-red-500"
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
                  className="w-6 h-6"
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
              <span className="text-sm font-medium">{localLikeCount}</span>
            </button>

            {/* Comments Button */}
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </button>

            {/* Views */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 ml-auto">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="text-sm">{post.viewCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

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

