import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Post } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [rsvpdEvents, setRsvpdEvents] = useState<Event[]>([]);
  const [staffEvents, setStaffEvents] = useState<Event[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [homeBranchName, setHomeBranchName] = useState<string>('Not Set');
  const [homeBranchId, setHomeBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user events (events created by user)
  const fetchUserEvents = async () => {
    if (!user?.uid) return;

    try {
      const eventsRef = collection(db, 'events');
      // Query for both organizerId and organizer (for backwards compatibility)
      const q1 = query(eventsRef, where('organizerId', '==', user.uid), where('isActive', '==', true));
      const q2 = query(eventsRef, where('organizer', '==', user.uid), where('isActive', '==', true));
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      // Combine and deduplicate
      const allDocs = [...snapshot1.docs, ...snapshot2.docs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex((d) => d.id === doc.id)
      );
      const snapshot = { docs: uniqueDocs } as any;
      
      const eventsData: Event[] = snapshot.docs.map((doc) => ({
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

  // Fetch RSVP'd events (events user is attending)
  const fetchRSVPdEvents = async () => {
    if (!user?.uid) return;

    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      
      const allEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      // Filter events where user is in attendees array
      const rsvpd = allEvents.filter((event) => {
        const attendees = event.attendees || [];
        return attendees.includes(user.uid) && event.isActive;
      });

      // Sort by date descending
      rsvpd.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
        const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
        return dateB.getTime() - dateA.getTime();
      });

      setRsvpdEvents(rsvpd);
    } catch (error) {
      console.error('Error fetching RSVPd events:', error);
    }
  };

  // Fetch staff events (events user is working)
  const fetchStaffEvents = async () => {
    if (!user?.uid) return;

    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      
      const allEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      // Filter events where user is in staffMembers array
      const staff = allEvents.filter((event) => {
        const staffMembers = (event as any).staffMembers || [];
        return staffMembers.includes(user.uid) && event.isActive;
      });

      // Sort by date descending
      staff.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
        const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
        return dateB.getTime() - dateA.getTime();
      });

      setStaffEvents(staff);
    } catch (error) {
      console.error('Error fetching staff events:', error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (!user?.uid) return;

    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('authorId', '==', user.uid), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Post[];

      // Sort by date descending
      postsData.sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
        const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });

      setUserPosts(postsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // Load user profile data
  const loadProfile = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name || '');
        setProfileImageUrl(userData.profileImageUrl || undefined);
        setHomeBranchName(userData.homeBranchName || 'Not Set');
        setHomeBranchId(userData.homeBranchId || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile
  const saveProfile = async (name: string, imageUrl?: string) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = { name };
      if (imageUrl) {
        updateData.profileImageUrl = imageUrl;
      }
      await updateDoc(userRef, updateData);
      setUserName(name);
      if (imageUrl) {
        setProfileImageUrl(imageUrl);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  // Save home branch
  const saveHomeBranch = async (branchId: string, branchName: string) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const oldHomeBranchId = userDoc.data()?.homeBranchId;

      // Decrement old branch member count
      if (oldHomeBranchId) {
        try {
          const oldBranchRef = doc(db, 'branches', oldHomeBranchId);
          const oldBranchDoc = await getDoc(oldBranchRef);
          if (oldBranchDoc.exists()) {
            const currentCount = oldBranchDoc.data()?.memberCount || 0;
            await updateDoc(oldBranchRef, {
              memberCount: Math.max(0, currentCount - 1),
            });
          }
        } catch (error) {
          console.error('Error decrementing old branch count:', error);
        }
      }

      // Increment new branch member count
      try {
        const newBranchRef = doc(db, 'branches', branchId);
        const newBranchDoc = await getDoc(newBranchRef);
        if (newBranchDoc.exists()) {
          const currentCount = newBranchDoc.data()?.memberCount || 0;
          await updateDoc(newBranchRef, {
            memberCount: currentCount + 1,
          });
        }
      } catch (error) {
        console.error('Error incrementing new branch count:', error);
      }

      // Update user document
      await updateDoc(userRef, {
        homeBranchId: branchId,
        homeBranchName: branchName,
      });

      setHomeBranchId(branchId);
      setHomeBranchName(branchName);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('homeBranchId', branchId);
        localStorage.setItem('homeBranchName', branchName);
      }
    } catch (error) {
      console.error('Error saving home branch:', error);
      throw error;
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  // Load all data
  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([
      loadProfile(),
      fetchUserEvents(),
      fetchRSVPdEvents(),
      fetchStaffEvents(),
      fetchUserPosts(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadAll();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return {
    userEvents,
    rsvpdEvents,
    staffEvents,
    userPosts,
    userName,
    profileImageUrl,
    homeBranchName,
    homeBranchId,
    isLoading,
    saveProfile,
    saveHomeBranch,
    deletePost,
    loadAll,
  };
}

