'use client';

import { useParams } from 'next/navigation';
import PostDetailView from '@/components/PostDetailView';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  if (!postId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  return <PostDetailView postId={postId} />;
}

