'use client';

import Image from 'next/image';
import { Conversation } from '@/types/conversation';

interface ConversationRowProps {
  conversation: Conversation;
}

export default function ConversationRow({ conversation }: ConversationRowProps) {
  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return '';
    
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      {/* Profile Image */}
      {conversation.otherUserImageUrl ? (
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={conversation.otherUserImageUrl}
            alt={conversation.otherUserName}
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

      {/* Conversation Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {conversation.otherUserName}
          </h3>
          {conversation.lastMessageTimestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              {formatTimestamp(conversation.lastMessageTimestamp)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.lastMessage}
          </p>
        )}
      </div>
    </div>
  );
}

