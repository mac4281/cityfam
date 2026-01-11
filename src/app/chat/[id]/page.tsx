'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversation } from '@/types/conversation';
import ConversationView from '@/components/ConversationView';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId || !user) return;

      try {
        const docRef = doc(db, 'conversations', conversationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const participants = (data.participants as string[]) || [];
          const otherUserId = participants.find((id) => id !== user.uid) || '';

          setConversation({
            id: docSnap.id,
            otherUserId,
            otherUserName: (data.otherUserName as string) || 'Unknown',
            otherUserImageUrl: data.otherUserImageUrl as string | undefined,
            lastMessage: data.lastMessage as string | undefined,
            lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || undefined,
            unreadCount: (data.unreadCount as number) || 0,
          });
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, user]);

  if (isLoading || !conversation) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <ConversationView conversation={conversation} />;
}

