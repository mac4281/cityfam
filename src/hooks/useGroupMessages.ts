import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment } from '@/types/comment';
import { useAuth } from '@/contexts/AuthContext';

export type GroupType = 'event' | 'post';

const getCollectionPath = (groupType: GroupType): string => {
  switch (groupType) {
    case 'event':
      return 'events';
    case 'post':
      return 'posts';
    default:
      return 'posts';
  }
};

export function useGroupMessages(groupId: string | null, groupType: GroupType) {
  const [messages, setMessages] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<Unsubscribe | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!groupId) {
      setIsLoading(false);
      return;
    }

    console.log(`🔵 Starting message observer for ${groupType} ${groupId}`);

    const collectionPath = getCollectionPath(groupType);
    const commentsRef = collection(db, collectionPath, groupId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments: Comment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content || '',
            authorName: data.authorName || 'Anonymous',
            authorId: data.authorId || '',
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setMessages(comments);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error:', err.message);
        setError(err.message);
        setIsLoading(false);
      }
    );

    listenerRef.current = unsubscribe;

    return () => {
      console.log(`🛑 Stopping message observer for ${groupType} ${groupId}`);
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [groupId, groupType]);

  const sendMessage = async (content: string): Promise<void> => {
    if (!groupId || !user || !content.trim()) {
      return;
    }

    const collectionPath = getCollectionPath(groupType);
    const parentRef = doc(db, collectionPath, groupId);
    const commentsRef = collection(db, collectionPath, groupId, 'comments');
    const commentRef = doc(commentsRef);

    const commentData = {
      content: content.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    try {
      await runTransaction(db, async (transaction) => {
        // Add the comment
        transaction.set(commentRef, commentData);

        // Increment the comment count on the parent document
        transaction.update(parentRef, {
          commentCount: increment(1),
        });
      });

      console.log('✅ Successfully added comment and updated count');
    } catch (error: any) {
      console.error('❌ Error sending message:', error.message);
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}

