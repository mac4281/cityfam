import { useState, useEffect } from 'react';
import { doc, collection, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentMonthId, formatMonthYear } from '@/utils/dateUtils';

export function useBusinessStats(businessId: string | null) {
  const [currentMonthStats, setCurrentMonthStats] = useState<{ [key: string]: number }>({});
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (monthId?: string) => {
    if (!businessId) return;

    const month = monthId || getCurrentMonthId();
    try {
      const docRef = doc(db, 'analytics', businessId, 'months', month);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const stats: { [key: string]: number } = {};
        Object.keys(data).forEach((key) => {
          stats[key] = typeof data[key] === 'number' ? data[key] : 0;
        });
        setCurrentMonthStats(stats);
      } else {
        setCurrentMonthStats({});
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMonths = async () => {
    if (!businessId) return;

    try {
      const monthsRef = collection(db, 'analytics', businessId, 'months');
      // Get all documents and sort in memory to avoid index requirement
      const snapshot = await getDocs(monthsRef);

      const months = snapshot.docs.map((doc) => doc.id).sort((a, b) => b.localeCompare(a));
      setAvailableMonths(months);
    } catch (error) {
      console.error('Error fetching available months:', error);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchStats();
      fetchAvailableMonths();
    }
  }, [businessId]);

  const totalMonthlyClicks = [
    'businessViews',
    'jobViews',
    'dealViews',
    'eventViews',
    'photoView',
    'jobCardViews',
    'dealCardViews',
    'eventCardViews',
    'businessCardViews',
    'businessSearch',
    'jobSearch',
    'dealSearch',
    'eventSearch',
    'jobShares',
    'eventShares',
    'dealShares',
    'businessShares',
  ].reduce((sum, key) => sum + (currentMonthStats[key] || 0), 0);

  return {
    currentMonthStats,
    availableMonths,
    totalMonthlyClicks,
    isLoading,
    fetchStats,
    fetchAvailableMonths,
  };
}

