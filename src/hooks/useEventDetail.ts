import { useState, useEffect, useRef } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Business } from '@/types/business';
import { Comment } from '@/types/comment';
import { useAuth } from '@/contexts/AuthContext';

export function useEventDetail(eventId: string | null) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [organizerName, setOrganizerName] = useState('');
  const [organizerImageUrl, setOrganizerImageUrl] = useState<string | undefined>();
  const [isOrganizerBusiness, setIsOrganizerBusiness] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const commentsListenerRef = useRef<Unsubscribe | null>(null);

  const loadEvent = async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        const eventData: Event = {
          id: eventDoc.id,
          title: data.title || '',
          description: data.description,
          date: data.date?.toDate() || new Date(),
          time: data.time,
          location: data.location || '',
          imageUrl: data.imageUrl,
          link: data.link,
          businessId: data.businessId,
          businessName: data.businessName,
          organizerId: data.organizerId || data.organizer,
          organizerName: data.organizerName,
          attendeeCount: data.attendeeCount || 0,
          attendees: data.attendees || [],
          slug: data.slug,
        };
        setEvent(eventData);

        // Load business if businessId exists
        if (eventData.businessId) {
          const businessDoc = await getDoc(doc(db, 'businesses', eventData.businessId));
          if (businessDoc.exists()) {
            setBusiness({ id: businessDoc.id, ...businessDoc.data() } as Business);
          }
        }

        // Check attendance status
        if (user?.uid && eventData.attendees) {
          setIsAttending(eventData.attendees.includes(user.uid));
        }

        // Load organizer info
        if (eventData.organizerId) {
          // Try loading from businesses first
          const businessDoc = await getDoc(doc(db, 'businesses', eventData.organizerId));
          if (businessDoc.exists()) {
            const businessData = businessDoc.data();
            setOrganizerName(businessData.name || 'Unknown Business');
            setOrganizerImageUrl(businessData.imageUrl || businessData.profileImageUrl);
            setIsOrganizerBusiness(true);
          } else {
            // Try loading from users
            const userDoc = await getDoc(doc(db, 'users', eventData.organizerId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setOrganizerName(userData.name || 'Unknown User');
              setOrganizerImageUrl(userData.profileImageUrl);
              setIsOrganizerBusiness(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startObservingComments = () => {
    if (!eventId) return;

    // Remove any existing listener
    if (commentsListenerRef.current) {
      commentsListenerRef.current();
    }

    const commentsRef = collection(db, 'events', eventId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData: Comment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content || '',
            authorName: data.authorName || 'Anonymous',
            authorId: data.authorId || '',
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setComments(commentsData);
      },
      (error) => {
        console.error('Error in comments snapshot listener:', error);
      }
    );

    commentsListenerRef.current = unsubscribe;
  };

  const stopObservingComments = () => {
    if (commentsListenerRef.current) {
      commentsListenerRef.current();
      commentsListenerRef.current = null;
    }
  };

  const toggleAttendance = async () => {
    if (!eventId || !user?.uid) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const userRef = doc(db, 'users', user.uid);

      // Ensure user document exists
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          attending_events: [],
          created_at: serverTimestamp(),
        });
      }

      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        const eventData = eventDoc.data();
        const attendees = (eventData?.attendees as string[]) || [];
        const currentCount = (eventData?.attendeeCount as number) || 0;

        if (attendees.includes(user.uid)) {
          // Remove attendance
          transaction.update(eventRef, {
            attendeeCount: Math.max(0, currentCount - 1),
            attendees: arrayRemove(user.uid),
          });
          transaction.update(userRef, {
            attending_events: arrayRemove(eventId),
          });
          setIsAttending(false);
        } else {
          // Add attendance
          transaction.update(eventRef, {
            attendeeCount: currentCount + 1,
            attendees: arrayUnion(user.uid),
          });
          transaction.update(userRef, {
            attending_events: arrayUnion(eventId),
          });
          setIsAttending(true);
        }
      });

      // Reload event to get updated count
      await loadEvent();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!eventId || !user) return;

    try {
      const commentsRef = collection(db, 'events', eventId, 'comments');
      const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous';

      await setDoc(doc(commentsRef), {
        content: content.trim(),
        authorId: user.uid,
        authorName,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId, user]);

  useEffect(() => {
    if (event) {
      startObservingComments();
    }
    return () => {
      stopObservingComments();
    };
  }, [event?.id]);

  return {
    event,
    business,
    isAttending,
    comments,
    organizerName,
    organizerImageUrl,
    isOrganizerBusiness,
    isLoading,
    toggleAttendance,
    addComment,
    loadEvent,
  };
}

