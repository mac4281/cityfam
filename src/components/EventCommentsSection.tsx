'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/comment';
import CommentBubble from './CommentBubble';

interface EventCommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EventCommentsSection({
  comments,
  onAddComment,
  isLoading = false,
}: EventCommentsSectionProps) {
  const { user, isSignedIn } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [comments]);

  const handleSubmit = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(trimmedComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isCommentEmpty = newComment.trim().length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="flex flex-col gap-0.5 p-4">
          {comments.map((comment) => (
            <div key={comment.id} id={comment.id}>
              <CommentBubble
                comment={comment}
                isCurrentUser={comment.authorId === user?.uid}
              />
            </div>
          ))}
          {/* Bottom anchor for scrolling */}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* Comment Input (only shown if user is signed in) */}
      {isSignedIn && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 py-3 px-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a comment..."
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSubmit}
              disabled={isCommentEmpty || isSubmitting}
              className="flex-shrink-0 p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send comment"
            >
              <svg
                className={`w-8 h-8 ${
                  isCommentEmpty
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-blue-500 dark:text-blue-400'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

