import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Branch } from '@/types/branch';

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'branches'));
      const branchesData: Branch[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          city: (data.city as string) || '',
          state: (data.state as string) || '',
          latitude: (data.latitude as number) || 0,
          longitude: (data.longitude as number) || 0,
        };
      });
      setBranches(branchesData);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      setError(err.message || 'Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    isLoading,
    error,
    refetch: fetchBranches,
  };
}

