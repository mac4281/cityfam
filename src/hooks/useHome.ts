import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Post } from '@/types/post';

export type SortOption = 'latest' | 'trending';

export function useHome(selectedBranchId: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastPostDocumentRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const hasMorePostsRef = useRef(true);
  const currentBranchIdRef = useRef<string | null>(null);

  const loadLatestEvents = async () => {
    if (!selectedBranchId) return;

    // Use separate queries instead of OR to avoid index requirements
    // This matches the Swift implementation behavior without needing composite indexes
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTimestamp = Timestamp.fromDate(yesterday);

      const branchQuery = query(
        collection(db, 'events'),
        where('branchId', '==', selectedBranchId),
        where('isActive', '==', true),
        where('date', '>=', yesterdayTimestamp),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const globalQuery = query(
        collection(db, 'events'),
        where('isGlobal', '==', true),
        where('isActive', '==', true),
        where('date', '>=', yesterdayTimestamp),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const [branchSnapshot, globalSnapshot] = await Promise.all([
        getDocs(branchQuery),
        getDocs(globalQuery),
      ]);

      const branchEvents: Event[] = branchSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      const globalEvents: Event[] = globalSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      // Combine and deduplicate
      const allEvents = [...branchEvents, ...globalEvents];
      const uniqueEvents = allEvents.filter(
        (event, index, self) => index === self.findIndex((e) => e.id === event.id)
      );

      // Sort by createdAt descending
      uniqueEvents.sort((a, b) => {
        const createdAtA = (a as any).createdAt ? ((a as any).createdAt instanceof Date ? (a as any).createdAt : (a as any).createdAt.toDate()) : new Date(0);
        const createdAtB = (b as any).createdAt ? ((b as any).createdAt instanceof Date ? (b as any).createdAt : (b as any).createdAt.toDate()) : new Date(0);
        return createdAtB.getTime() - createdAtA.getTime();
      });

      setEvents(uniqueEvents.slice(0, 20));
    } catch (error) {
      console.error('Error loading latest events:', error);
      setEvents([]);
    }
  };

  const loadTrendingEvents = async () => {
    if (!selectedBranchId) return;

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('branchId', '==', selectedBranchId),
        where('isActive', '==', true),
        where('date', '>=', Timestamp.fromDate(yesterday)),
        orderBy('date', 'desc'),
        orderBy('attendeeCount', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const eventsData: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      setEvents(eventsData);
    } catch (error: any) {
      console.error('Error loading trending events:', error);
      // Fallback without attendeeCount sort
      try {
        const q = query(
          collection(db, 'events'),
          where('branchId', '==', selectedBranchId),
          where('isActive', '==', true),
          where('date', '>=', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))),
          orderBy('date', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const eventsData: Event[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        })) as Event[];
        setEvents(eventsData);
      } catch (fallbackError) {
        console.error('Error in fallback trending events:', fallbackError);
      }
    }
  };

  const loadPosts = async (forceRefresh = false) => {
    if (!selectedBranchId || isLoading) return;

    setIsLoading(true);

    // Reset if branch changed
    if (currentBranchIdRef.current !== selectedBranchId) {
      currentBranchIdRef.current = selectedBranchId;
      lastPostDocumentRef.current = null;
      hasMorePostsRef.current = true;
      if (forceRefresh) {
        setPosts([]);
      }
    }

    try {
      let q = query(
        collection(db, 'posts'),
        where('branchId', '==', selectedBranchId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      // Add pagination if not refreshing
      // Note: Firestore requires startAfter to be used with the same query
      // For now, we'll just load the first 10 posts

      const snapshot = await getDocs(q);
      lastPostDocumentRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
      hasMorePostsRef.current = snapshot.docs.length === 10;

      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Post[];

      if (forceRefresh) {
        setPosts(postsData);
      } else {
        setPosts((prev) => [...prev, ...postsData]);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      setErrorMessage(error.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContent = async (sortBy: SortOption) => {
    if (!selectedBranchId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (sortBy === 'latest') {
        await loadLatestEvents();
      } else {
        await loadTrendingEvents();
      }
      await loadPosts(true);
    } catch (error: any) {
      console.error('Error loading content:', error);
      setErrorMessage(error.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    await loadPosts(true);
  };

  useEffect(() => {
    if (selectedBranchId) {
      loadContent('latest');
    }
  }, [selectedBranchId]);

  return {
    events,
    posts,
    isLoading,
    errorMessage,
    loadContent,
    fetchRecentPosts,
    loadPosts,
  };
}

