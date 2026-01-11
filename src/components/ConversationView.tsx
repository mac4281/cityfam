'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types/conversation';
import MessageBubble from './MessageBubble';
import { useConversationMessages } from '@/hooks/useConversationMessages';

interface ConversationViewProps {
  conversation: Conversation;
}

export default function ConversationView({ conversation }: ConversationViewProps) {
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, startObservingMessages, stopObservingMessages, sendMessage } =
    useConversationMessages(conversation.id);

  useEffect(() => {
    startObservingMessages();
    return () => {
      stopObservingMessages();
    };
  }, [conversation.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedText = messageText.trim();
    if (!trimmedText || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage(trimmedText, conversation.otherUserId);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isMessageEmpty = messageText.trim().length === 0;

  return (
    <div className="flex flex-col h-screen md:h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {conversation.otherUserName}
        </h2>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Messages - scrollable area with padding for input */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 pb-20 md:pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mb-4"
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
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {messages.map((message) => (
              <div key={message.id}>
                <MessageBubble message={message} />
              </div>
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Bar - fixed at bottom, above mobile tabs */}
      <div className="fixed bottom-16 md:static flex-shrink-0 left-0 right-0 md:left-auto md:right-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-40 md:z-auto">
        <div className="flex items-center gap-2 p-4">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={isMessageEmpty || isSubmitting}
            className="flex-shrink-0 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Send message"
          >
            <svg
              className={`w-6 h-6 ${
                isMessageEmpty
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-blue-500 dark:text-blue-400'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

