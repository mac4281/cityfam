import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesListenerRef = useRef<Unsubscribe | null>(null);

  const startObservingMessages = () => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    console.log('🔵 ConversationViewModel: Starting message observer for conversation:', conversationId);

    // Remove any existing listener
    if (messagesListenerRef.current) {
      messagesListenerRef.current();
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('✅ ConversationViewModel: Received', snapshot.docs.length, 'messages');

        const messagesData: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: (data.senderId as string) || '',
            text: (data.text as string) || '',
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        setMessages(messagesData);
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ ConversationViewModel: Error in snapshot listener:', error);
        setIsLoading(false);
      }
    );

    messagesListenerRef.current = unsubscribe;
  };

  const stopObservingMessages = () => {
    console.log('🔵 ConversationViewModel: Stopping message observer');
    if (messagesListenerRef.current) {
      messagesListenerRef.current();
      messagesListenerRef.current = null;
    }
  };

  const sendMessage = async (text: string, recipientId: string) => {
    if (!user?.uid || !conversationId) return;

    try {
      const messageData = {
        senderId: user.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ ConversationViewModel: Error sending message:', error);
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      stopObservingMessages();
    };
  }, []);

  return {
    messages,
    isLoading,
    startObservingMessages,
    stopObservingMessages,
    sendMessage,
  };
}

