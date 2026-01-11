import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversation } from '@/types/conversation';
import { useAuth } from '@/contexts/AuthContext';

export function useChat() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const conversationsListenerRef = useRef<Unsubscribe | null>(null);

  const startObservingConversations = () => {
    if (!user?.uid) {
      console.log('⚠️ ChatViewModel: No user ID available, skipping observer setup');
      setIsLoading(false);
      return;
    }

    console.log('🔵 ChatViewModel: Starting conversation observer for user:', user.uid);

    // Remove any existing listener
    if (conversationsListenerRef.current) {
      conversationsListenerRef.current();
      conversationsListenerRef.current = null;
    }

    try {
      const conversationsRef = collection(db, 'conversations');
      // Query conversations where the user is a participant
      // Note: We'll sort in memory since orderBy with timestamp might require an index
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('✅ ChatViewModel: Received snapshot with', snapshot.docs.length, 'documents');

          const conversationsData: Conversation[] = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const participants = (data.participants as string[]) || [];
              const otherUserId = participants.find((id) => id !== user.uid) || '';

              return {
                id: doc.id,
                otherUserId,
                otherUserName: (data.otherUserName as string) || 'Unknown',
                otherUserImageUrl: data.otherUserImageUrl as string | undefined,
                lastMessage: data.lastMessage as string | undefined,
                lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || undefined,
                unreadCount: (data.unreadCount as number) || 0,
              };
            })
            .sort((a, b) => {
              // Sort by lastMessageTimestamp descending, or by createdAt if no timestamp
              const aTime = a.lastMessageTimestamp?.getTime() || 0;
              const bTime = b.lastMessageTimestamp?.getTime() || 0;
              return bTime - aTime;
            });

          console.log('✅ ChatViewModel: Processed', conversationsData.length, 'conversations');
          setConversations(conversationsData);
          setIsLoading(false);
        },
        (error) => {
          console.error('❌ ChatViewModel: Snapshot error:', error);
          setIsLoading(false);
        }
      );

      conversationsListenerRef.current = unsubscribe;
    } catch (error) {
      console.error('❌ ChatViewModel: Error setting up listener:', error);
      setIsLoading(false);
    }
  };

  const stopObservingConversations = () => {
    console.log('🔵 ChatViewModel: Stopping conversation observer');
    if (conversationsListenerRef.current) {
      conversationsListenerRef.current();
      conversationsListenerRef.current = null;
    }
  };

  const startConversation = async (otherUser: { id: string; name: string; profileImageUrl?: string }): Promise<string | null> => {
    if (!user?.uid) {
      console.error('❌ ChatViewModel: No current user ID available');
      return null;
    }

    console.log('🔵 ChatViewModel: Starting conversation with user:', otherUser.id);

    // Check if conversation already exists (check local state first, then Firestore)
    const existingConversation = conversations.find(
      (conv) => conv.otherUserId === otherUser.id
    );

    if (existingConversation) {
      console.log('ℹ️ ChatViewModel: Conversation already exists in local state');
      return existingConversation.id;
    }

    // Also check Firestore directly in case local state is stale
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      
      const existingConv = snapshot.docs.find((doc) => {
        const data = doc.data();
        const participants = (data.participants as string[]) || [];
        return participants.includes(otherUser.id);
      });

      if (existingConv) {
        console.log('ℹ️ ChatViewModel: Conversation already exists in Firestore');
        return existingConv.id;
      }
    } catch (error) {
      console.error('❌ ChatViewModel: Error checking for existing conversation:', error);
      // Continue to create new conversation even if check fails
    }

    try {
      const conversationData = {
        participants: [user.uid, otherUser.id],
        otherUserName: otherUser.name || 'Unknown User',
        otherUserImageUrl: otherUser.profileImageUrl || '',
        lastMessageTimestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      console.log('🔵 ChatViewModel: Creating new conversation document');
      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      console.log('✅ ChatViewModel: New conversation created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ ChatViewModel: Error creating conversation:', error);
      return null;
    }
  };

  // Start observing when user is available and auth is loaded
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (user?.uid) {
      console.log('🔵 useChat: User is authenticated, starting observer');
      startObservingConversations();
    } else {
      console.log('⚠️ useChat: No user found after auth loaded');
      setIsLoading(false);
      setConversations([]);
    }

    return () => {
      stopObservingConversations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading]);

  return {
    conversations,
    isLoading,
    startObservingConversations,
    stopObservingConversations,
    startConversation,
  };
}

