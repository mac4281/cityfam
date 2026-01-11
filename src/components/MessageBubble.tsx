'use client';

import { Message } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth();
  const isFromCurrentUser = message.senderId === user?.uid;

  return (
    <div
      className={`flex items-end gap-0 px-2 py-0.5 ${
        isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`px-3 py-2 rounded-2xl ${
          isFromCurrentUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.text}</p>
      </div>
    </div>
  );
}

