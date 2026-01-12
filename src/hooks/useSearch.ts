import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Business } from '@/types/business';
import { Job } from '@/types/job';
import { SupportingCompany } from '@/types/supportingCompany';

export type SearchCategory = 'events' | 'businesses' | 'jobs';

export function useSearch() {
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [supportingCompanies, setSupportingCompanies] = useState<SupportingCompany[]>([]);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchEvents = async (queryText: string) => {
    if (!queryText.trim()) {
      setEvents([]);
      return;
    }

    try {
      const eventsRef = collection(db, 'events');
      const searchText = queryText.toLowerCase();
      
      // Get all active events without orderBy to avoid index requirement
      // We'll filter and sort in memory
      const q = query(
        eventsRef,
        where('isActive', '==', true),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const allEvents: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];
      
      const filteredEvents: Event[] = allEvents
        .filter((event) => {
          const title = (event.title || '').toLowerCase();
          const description = (event.description || '').toLowerCase();
          const location = (event.location || '').toLowerCase();
          return title.includes(searchText) || description.includes(searchText) || location.includes(searchText);
        })
        .sort((a, b) => {
          // Sort by createdAt (newest first)
          const aDate = a.createdAt instanceof Date ? a.createdAt : a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt instanceof Date ? b.createdAt : b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 20);

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error searching events:', error);
      setEvents([]);
    }
  };

  const searchBusinesses = async (queryText: string) => {
    if (!queryText.trim()) {
      setBusinesses([]);
      return;
    }

    try {
      const businessesRef = collection(db, 'businesses');
      const searchText = queryText.toLowerCase();
      
      // Get all active businesses and filter in memory
      const q = query(
        businessesRef,
        where('isActive', '==', true),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const allBusinesses: Business[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Business[];
      
      const filteredBusinesses: Business[] = allBusinesses
        .filter((business) => {
          const name = (business.name || '').toLowerCase();
          const description = (business.description || '').toLowerCase();
          const address = (business.address || '').toLowerCase();
          return name.includes(searchText) || description.includes(searchText) || address.includes(searchText);
        })
        .slice(0, 20);

      setBusinesses(filteredBusinesses);
    } catch (error) {
      console.error('Error searching businesses:', error);
      setBusinesses([]);
    }
  };

  const searchJobs = async (queryText: string) => {
    if (!queryText.trim()) {
      setJobs([]);
      return;
    }

    try {
      const jobsRef = collection(db, 'jobs');
      const searchText = queryText.toLowerCase();
      
      // Get all active jobs without orderBy to avoid index requirement
      // We'll filter and sort in memory
      const q = query(
        jobsRef,
        where('isActive', '==', true),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const allJobs: Job[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : new Date()),
        };
      }) as Job[];
      
      const filteredJobs: Job[] = allJobs
        .filter((job) => {
          const title = (job.title || '').toLowerCase();
          const type = (job.type || '').toLowerCase();
          const location = (job.location || '').toLowerCase();
          const description = (job.description || '').toLowerCase();
          return title.includes(searchText) || type.includes(searchText) || location.includes(searchText) || description.includes(searchText);
        })
        .sort((a, b) => {
          // Sort by createdAt (newest first)
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(0);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 20);

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    }
  };

  const loadLatestEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      // Query without orderBy to avoid index requirement - we'll sort in memory
      const q = query(
        eventsRef,
        where('isActive', '==', true),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const allEvents: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Event[];

      // Filter to only show events from yesterday onwards and sort in memory
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const filteredEvents = allEvents
        .filter((event) => {
          const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
          return eventDate >= yesterday;
        })
        .sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        })
        .slice(0, 50);

      setLatestEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading latest events:', error);
      setLatestEvents([]);
    }
  };

  const loadAllBusinesses = async () => {
    try {
      // Load from supportingCompanies since they have views tracked
      const companiesRef = collection(db, 'supportingCompanies');
      const q = query(
        companiesRef,
        where('isActive', '==', true),
        limit(100)
      );

      const snapshot = await getDocs(q);
      let companiesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          views: data.views || 0,
        } as SupportingCompany & { views: number };
      });

      // Sort by views (ascending) - lowest first
      companiesData.sort((a, b) => a.views - b.views);

      // Convert to Business format for display
      const businessesData: Business[] = companiesData.map((company) => ({
        id: company.businessId || company.id,
        name: company.name || '',
        address: company.address,
        description: company.description,
        imageUrl: company.imageUrl,
        isActive: company.isActive,
      })) as Business[];

      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error loading businesses:', error);
      setBusinesses([]);
    }
  };

  const loadAllJobs = async () => {
    try {
      // Get selected branch ID from localStorage
      const selectedBranchId = typeof window !== 'undefined' ? localStorage.getItem('selectedBranchId') : null;
      
      if (!selectedBranchId) {
        // If no branch selected, just get all active jobs
        const jobsRef = collection(db, 'jobs');
        const q = query(
          jobsRef,
          where('isActive', '==', true),
          limit(100)
        );

        const snapshot = await getDocs(q);
        const allJobs: Job[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : new Date()),
          };
        }) as Job[];

        // Sort by createdAt in memory (newest first)
        const sortedJobs = allJobs.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(0);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

        setJobs(sortedJobs);
        return;
      }

      // Use separate queries instead of OR to avoid index requirements
      // Query for jobs with matching branchId
      const branchQuery = query(
        collection(db, 'jobs'),
        where('isActive', '==', true),
        where('branchId', '==', selectedBranchId),
        limit(100)
      );

      // Query for global jobs
      const globalQuery = query(
        collection(db, 'jobs'),
        where('isActive', '==', true),
        where('isGlobal', '==', true),
        limit(100)
      );

      const [branchSnapshot, globalSnapshot] = await Promise.all([
        getDocs(branchQuery),
        getDocs(globalQuery),
      ]);

      const branchJobs: Job[] = branchSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : new Date()),
        };
      }) as Job[];

      const globalJobs: Job[] = globalSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : new Date()),
        };
      }) as Job[];

      // Combine and deduplicate
      const allJobs = [...branchJobs, ...globalJobs];
      const uniqueJobs = allJobs.filter((job, index, self) => 
        index === self.findIndex((j) => j.id === job.id)
      );

      // Sort by createdAt in memory (newest first)
      const sortedJobs = uniqueJobs.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(0);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });

      setJobs(sortedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback: try without branch filtering if that fails
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(
          jobsRef,
          where('isActive', '==', true),
          limit(100)
        );

        const snapshot = await getDocs(q);
        const allJobs: Job[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : data.createdAt ? new Date(data.createdAt) : new Date()),
          };
        }) as Job[];

        // Sort by createdAt in memory (newest first)
        const sortedJobs = allJobs.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(0);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

        setJobs(sortedJobs);
      } catch (fallbackError) {
        console.error('Error in fallback job loading:', fallbackError);
        setJobs([]);
      }
    }
  };

  const loadSupportingCompanies = async () => {
    try {
      const companiesRef = collection(db, 'supportingCompanies');
      const q = query(
        companiesRef,
        where('isActive', '==', true),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const companiesData: SupportingCompany[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated?.toDate() || new Date(),
      })) as SupportingCompany[];

      setSupportingCompanies(companiesData);
    } catch (error) {
      console.error('Error loading supporting companies:', error);
      setSupportingCompanies([]);
    }
  };

  const performSearch = async (queryText: string, category: SearchCategory) => {
    if (!queryText.trim()) {
      setEvents([]);
      setBusinesses([]);
      setJobs([]);
      return;
    }

    setIsLoading(true);
    try {
      if (category === 'events') {
        await searchEvents(queryText);
      } else if (category === 'businesses') {
        await searchBusinesses(queryText);
      } else if (category === 'jobs') {
        await searchJobs(queryText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    businesses,
    jobs,
    supportingCompanies,
    latestEvents,
    isLoading,
    searchEvents,
    searchBusinesses,
    searchJobs,
    performSearch,
    loadLatestEvents,
    loadSupportingCompanies,
    loadAllBusinesses,
    loadAllJobs,
  };
}

