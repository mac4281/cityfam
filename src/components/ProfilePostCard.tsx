'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';

interface ProfilePostCardProps {
  post: Post;
  onDelete: () => void;
}

export default function ProfilePostCard({ post, onDelete }: ProfilePostCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="w-full h-[280px] rounded-xl overflow-hidden shadow-lg relative">
      <Link
        href={post.id ? `/posts/${post.id}` : '#'}
        className="block w-full h-full relative group"
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
          {/* Top row with author info and delete button */}
          <div className="flex items-center justify-between">
            {/* Author info */}
            <div className="flex items-center gap-3">
              {/* Profile image placeholder */}
              <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                {post.authorProfileImageUrl ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={post.authorProfileImageUrl}
                      alt={post.authorName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-base font-semibold text-white">
                {post.authorName}
              </span>
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="flex-shrink-0 p-2 bg-red-500/80 hover:bg-red-600/90 rounded-full transition-colors z-10"
              aria-label="Delete post"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          {/* Bottom row with content and stats */}
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
    </div>
  );
}

