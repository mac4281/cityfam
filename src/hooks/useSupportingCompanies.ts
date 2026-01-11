import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SupportingCompany } from '@/types/supportingCompany';
import { useAuth } from '@/contexts/AuthContext';

export function useSupportingCompanies() {
  const { user } = useAuth();
  const [supportingCompanies, setSupportingCompanies] = useState<SupportingCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupportingCompanies = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const supportingCompaniesRef = collection(db, 'supportingCompanies');
      const q = query(supportingCompaniesRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const companiesData: SupportingCompany[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated?.toDate() || new Date(),
      })) as SupportingCompany[];
      
      setSupportingCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching supporting companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Set up real-time listener for supporting companies
    const supportingCompaniesRef = collection(db, 'supportingCompanies');
    const q = query(supportingCompaniesRef, where('ownerId', '==', user.uid));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const companiesData: SupportingCompany[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dateCreated: doc.data().dateCreated?.toDate() || new Date(),
        })) as SupportingCompany[];
        
        setSupportingCompanies(companiesData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error in supporting companies listener:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    supportingCompanies,
    isLoading,
    fetchSupportingCompanies,
  };
}

