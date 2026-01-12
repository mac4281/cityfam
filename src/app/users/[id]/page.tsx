'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUserProfile } from '@/hooks/useUserProfile';
import EventCard from '@/components/EventCard';
import ProfilePostCard from '@/components/ProfilePostCard';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const {
    userEvents,
    userPosts,
    userName,
    profileImageUrl,
    isLoading,
  } = useUserProfile(userId);

  if (!userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="px-4 py-6 space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {profileImageUrl ? (
              <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                <Image
                  src={profileImageUrl}
                  alt={userName || 'User'}
                  width={120}
                  height={120}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                <svg
                  className="w-16 h-16 text-gray-400"
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
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {userName || 'User'}
          </h1>
        </div>

        {/* Events Section */}
        {userEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Events
            </h2>
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-4">
                {userEvents.map((event) => (
                  <EventCard key={event.id || `event-${event.title}`} event={event} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        {userPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Posts
            </h2>
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id || `post-${post.content}`} className="w-full h-[280px] rounded-xl overflow-hidden shadow-lg relative">
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
                      <div className="absolute left-0 top-0 bottom-0 w-[150px] bg-gradient-to-r from-black/20 to-transparent" />
                      <div className="absolute right-0 top-0 bottom-0 w-[150px] bg-gradient-to-l from-black/20 to-transparent" />
                      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content layer */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      {/* Top row with author info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
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
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userEvents.length === 0 && userPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              This user hasn't created any events or posts yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

