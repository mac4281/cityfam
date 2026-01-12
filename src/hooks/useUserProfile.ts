import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Post } from '@/types/post';

export function useUserProfile(userId: string | null) {
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user events (events created by user)
  const fetchUserEvents = async () => {
    if (!userId) return;

    try {
      const eventsRef = collection(db, 'events');
      // Query for both organizerId and organizer (for backwards compatibility)
      const q1 = query(eventsRef, where('organizerId', '==', userId), where('isActive', '==', true));
      const q2 = query(eventsRef, where('organizer', '==', userId), where('isActive', '==', true));
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      // Combine and deduplicate
      const allDocs = [...snapshot1.docs, ...snapshot2.docs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex((d) => d.id === doc.id)
      );
      
      const eventsData: Event[] = uniqueDocs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      // Sort by date descending
      eventsData.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
        const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
        return dateB.getTime() - dateA.getTime();
      });

      setUserEvents(eventsData);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (!userId) return;

    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('authorId', '==', userId), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Post[];

      // Sort by date descending
      postsData.sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : (a.createdAt instanceof Date ? a.createdAt : new Date(0));
        const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : (b.createdAt instanceof Date ? b.createdAt : new Date(0));
        return dateB.getTime() - dateA.getTime();
      });

      setUserPosts(postsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // Load user profile data
  const loadProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name || '');
        setProfileImageUrl(userData.profileImageUrl || undefined);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data
  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([
      loadProfile(),
      fetchUserEvents(),
      fetchUserPosts(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadAll();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    userEvents,
    userPosts,
    userName,
    profileImageUrl,
    isLoading,
  };
}

