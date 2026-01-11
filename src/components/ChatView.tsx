'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChatSearchBar from './ChatSearchBar';
import ConversationRow from './ConversationRow';
import UserRow from './UserRow';
import NewChatView from './NewChatView';
import { useChat } from '@/hooks/useChat';
import { useUserSearch } from '@/hooks/useUserSearch';

function ChatViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const { conversations, isLoading, startObservingConversations, stopObservingConversations, startConversation } =
    useChat();
  const { users, searchUsers } = useUserSearch();

  // Handle StartChat event from query params
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    const userImageUrl = searchParams.get('userImageUrl');

    if (userId && userName) {
      const handleStartChat = async () => {
        try {
          const conversationId = await startConversation({
            id: userId,
            name: userName,
            profileImageUrl: userImageUrl || undefined,
          });
          if (conversationId) {
            // Navigate to the conversation and clear query params
            router.replace(`/chat/${conversationId}`);
          }
        } catch (error) {
          console.error('Error starting conversation:', error);
        }
      };
      handleStartChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // The useChat hook automatically starts observing when user is available
  // No need to manually call startObservingConversations here

  useEffect(() => {
    if (searchText.trim()) {
      setIsSearching(true);
      searchUsers(searchText);
    } else {
      setIsSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleUserSelect = async (user: { id: string; name: string; profileImageUrl?: string }) => {
    try {
      const conversationId = await startConversation(user);
      if (conversationId) {
        setSearchText('');
        setIsSearching(false);
        router.push(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* Header - New Chat Button */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowNewChat(true)}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
            aria-label="New chat"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <ChatSearchBar
            text={searchText}
            onChange={setSearchText}
            placeholder="Search users"
          />
        </div>

        {/* Content */}
        {isSearching ? (
          /* Search Results */
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="w-full text-left"
              >
                <UserRow user={user} />
              </button>
            ))}
            {users.length === 0 && searchText && (
              <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <p>No users found</p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <svg
              className="w-16 h-16 mb-4"
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
            <p className="text-lg font-semibold">No conversations yet</p>
          </div>
        ) : (
          /* Conversations List */
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="block"
              >
                <ConversationRow conversation={conversation} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <NewChatView onClose={() => setShowNewChat(false)} />
        </div>
      )}
    </>
  );
}

export default function ChatView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ChatViewContent />
    </Suspense>
  );
}

