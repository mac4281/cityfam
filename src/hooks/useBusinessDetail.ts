import { useState, useEffect } from 'react';
import { doc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';
import { Event } from '@/types/event';
import { Job } from '@/types/job';

export function useBusinessDetail(businessId: string | null) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    // Load business
    const businessRef = doc(db, 'businesses', businessId);
    const unsubscribeBusiness = onSnapshot(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        setBusiness({ id: snapshot.id, ...snapshot.data() } as Business);
      }
      setIsLoading(false);
    });

    // Load events
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

    // Load jobs
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, where('businessId', '==', businessId));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData: Job[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
      setJobs(jobsData);
    });

    return () => {
      unsubscribeBusiness();
      unsubscribeEvents();
      unsubscribeJobs();
    };
  }, [businessId]);

  return {
    business,
    events,
    jobs,
    isLoading,
  };
}

