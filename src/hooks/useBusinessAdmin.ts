import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Job } from '@/types/job';
import { Business } from '@/types/business';

export function useBusinessAdmin(businessId: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    // Listen to events
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, where('organizer', '==', businessId));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];
      setEvents(eventsData);
    });

    // Listen to jobs
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, where('businessId', '==', businessId));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData: Job[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
      setJobs(jobsData);
    });

    // Fetch business
    const businessRef = doc(db, 'businesses', businessId);
    const unsubscribeBusiness = onSnapshot(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        setBusiness({ id: snapshot.id, ...snapshot.data() } as Business);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeJobs();
      unsubscribeBusiness();
    };
  }, [businessId]);

  const deleteEvent = async (event: Event) => {
    if (!event.id) return;
    try {
      await deleteDoc(doc(db, 'events', event.id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const deleteJob = async (job: Job) => {
    if (!job.id) return;
    try {
      await deleteDoc(doc(db, 'jobs', job.id));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  const deleteBusiness = async (business: Business) => {
    if (!business.id) return;
    try {
      // Delete all events first
      for (const event of events) {
        if (event.id) {
          await deleteDoc(doc(db, 'events', event.id));
        }
      }
      // Delete all jobs
      for (const job of jobs) {
        if (job.id) {
          await deleteDoc(doc(db, 'jobs', job.id));
        }
      }
      // Delete business
      await deleteDoc(doc(db, 'businesses', business.id));
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  };

  const refreshBusiness = async () => {
    // The listener will automatically update
    // This is just a placeholder for the callback
  };

  return {
    events,
    jobs,
    business,
    isLoading,
    deleteEvent,
    deleteJob,
    deleteBusiness,
    refreshBusiness,
  };
}

