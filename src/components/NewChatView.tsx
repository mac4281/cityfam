'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserRow from './UserRow';
import ChatSearchBar from './ChatSearchBar';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useChat } from '@/hooks/useChat';

interface NewChatViewProps {
  onClose: () => void;
}

export default function NewChatView({ onClose }: NewChatViewProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { users, isLoading, searchUsers } = useUserSearch();
  const { startConversation } = useChat();

  const handleSearchChange = async (value: string) => {
    setSearchText(value);
    if (value.trim()) {
      await searchUsers(value);
    }
  };

  const handleUserSelect = async (user: { id: string; name: string; profileImageUrl?: string }) => {
    try {
      const conversationId = await startConversation(user);
      if (conversationId) {
        onClose();
        router.push(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
        >
          Cancel
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          New Chat
        </h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      <div className="p-4">
        <ChatSearchBar
          text={searchText}
          onChange={handleSearchChange}
          placeholder="Search users"
        />
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 && searchText ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <p>No users found</p>
          </div>
        ) : (
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
          </div>
        )}
      </div>
    </div>
  );
}

