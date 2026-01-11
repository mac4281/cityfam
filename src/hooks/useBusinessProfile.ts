import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';
import { useAuth } from '@/contexts/AuthContext';

export function useBusinessProfile() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [globalStats, setGlobalStats] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinesses = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const businessesRef = collection(db, 'businesses');
      const q = query(businessesRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const businessesData: Business[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Business[];
      
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const statsRef = doc(db, 'analytics', 'global');
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        setGlobalStats({
          users: data.users || 0,
          events: data.events || 0,
          eventAttendees: data.eventAttendees || 0,
          businesses: data.businesses || 0,
          jobs: data.jobs || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchGlobalStats();
  }, [user]);

  const totalImpressions = 
    (globalStats.users || 0) +
    (globalStats.events || 0) +
    (globalStats.eventAttendees || 0) +
    (globalStats.businesses || 0) +
    (globalStats.jobs || 0);

  return {
    businesses,
    globalStats,
    totalImpressions,
    isLoading,
    fetchBusinesses,
    fetchGlobalStats,
  };
}

