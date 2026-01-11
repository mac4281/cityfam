import { useState, useEffect, useRef } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  setDoc,
  serverTimestamp,
  Unsubscribe,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Event } from '@/types/event';
import { AppUser } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export function useEventEdit(eventId: string | null) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AppUser[]>([]);
  const [checkedInAttendees, setCheckedInAttendees] = useState<string[]>([]);
  const [staffMembers, setStaffMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

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
          organizerId: data.organizerId || data.organizer,
          attendeeCount: data.attendeeCount || 0,
          attendees: data.attendees || [],
          slug: data.slug,
        };
        setEvent(eventData);
        setStaffMembers(data.staffMembers || []);
        setCheckedInAttendees(data.checkedInAttendees || []);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendees = async () => {
    if (!event?.attendees || event.attendees.length === 0) {
      setAttendees([]);
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const userDocs = await Promise.all(
        event.attendees.map((userId) => getDoc(doc(usersRef, userId)))
      );

      const attendeesData: AppUser[] = userDocs
        .filter((doc) => doc.exists())
        .map((doc) => ({
          id: doc.id,
          name: (doc.data().name as string) || 'Unknown',
          email: doc.data().email as string | undefined,
          profileImageUrl: doc.data().profileImageUrl as string | undefined,
        }));

      setAttendees(attendeesData);
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const updateEvent = async (
    title: string,
    description: string,
    date: Date,
    location: string
  ): Promise<boolean> => {
    if (!eventId) return false;

    try {
      await updateDoc(doc(db, 'events', eventId), {
        title,
        description,
        date,
        location,
      });
      await loadEvent();
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const updateEventImage = async (imageFile: File): Promise<boolean> => {
    if (!eventId) return false;

    try {
      const imageRef = ref(storage, `event_images/${eventId}_${Date.now()}.jpg`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await updateDoc(doc(db, 'events', eventId), {
        imageUrl,
      });
      await loadEvent();
      return true;
    } catch (error) {
      console.error('Error updating event image:', error);
      return false;
    }
  };

  const deleteEvent = async (): Promise<boolean> => {
    if (!eventId) return false;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  const markAttendance = async (userId: string): Promise<boolean> => {
    if (!eventId) return false;

    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        checkedInAttendees: arrayUnion(userId),
      });
      await loadEvent();
      setErrorMessage(null);
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      setErrorMessage('Failed to mark attendance');
      return false;
    }
  };

  const toggleStaffStatus = async (attendee: AppUser): Promise<void> => {
    if (!eventId) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const isStaff = staffMembers.includes(attendee.id);

      if (isStaff) {
        await updateDoc(eventRef, {
          staffMembers: arrayRemove(attendee.id),
        });
      } else {
        await updateDoc(eventRef, {
          staffMembers: arrayUnion(attendee.id),
        });
      }
      await loadEvent();
    } catch (error) {
      console.error('Error toggling staff status:', error);
    }
  };

  const removeAttendee = async (attendee: AppUser): Promise<void> => {
    if (!eventId) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const userRef = doc(db, 'users', attendee.id);

      await updateDoc(eventRef, {
        attendees: arrayRemove([attendee.id]),
        attendeeCount: (event?.attendeeCount || 1) - 1,
      });

      await updateDoc(userRef, {
        attending_events: arrayRemove([eventId]),
      });

      await loadEvent();
      await loadAttendees();
    } catch (error) {
      console.error('Error removing attendee:', error);
    }
  };

  const isStaffMember = (userId: string): boolean => {
    return staffMembers.includes(userId);
  };

  const isEventAdmin = (): boolean => {
    return user?.uid === event?.organizerId;
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (event) {
      loadAttendees();
    }
  }, [event?.attendees]);

  return {
    event,
    attendees,
    checkedInAttendees,
    staffMembers,
    isLoading,
    errorMessage,
    scannedCode,
    setScannedCode,
    loadEvent,
    loadAttendees,
    updateEvent,
    updateEventImage,
    deleteEvent,
    markAttendance,
    toggleStaffStatus,
    removeAttendee,
    isStaffMember,
    isEventAdmin,
  };
}

