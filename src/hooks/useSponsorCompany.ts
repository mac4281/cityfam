import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SupportingCompany } from '@/types/supportingCompany';
import { getCurrentMonthId } from '@/utils/dateUtils';

export function useSponsorCompany() {
  const [sponsorCompany, setSponsorCompany] = useState<SupportingCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSponsorCompany = async () => {
      try {
        const supportingCompaniesRef = collection(db, 'supportingCompanies');
        const q = query(
          supportingCompaniesRef,
          where('isActive', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setSponsorCompany(null);
          setIsLoading(false);
          return;
        }

        const companiesData: SupportingCompany[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dateCreated: doc.data().dateCreated?.toDate() || new Date(),
          views: doc.data().views || 0,
        })) as SupportingCompany[];

        // Find the company with the least views
        const companyWithLeastViews = companiesData.reduce((prev, current) => {
          return (prev.views || 0) < (current.views || 0) ? prev : current;
        });

        setSponsorCompany(companyWithLeastViews);
      } catch (error) {
        console.error('Error fetching sponsor company:', error);
        setSponsorCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsorCompany();
  }, []);

  const incrementViews = async () => {
    if (!sponsorCompany?.id || !sponsorCompany?.businessId) return;

    try {
      // Increment views in supportingCompanies document
      const companyRef = doc(db, 'supportingCompanies', sponsorCompany.id);
      await updateDoc(companyRef, {
        views: increment(1),
      });

      // Track analytics: businessCardViews
      const monthId = getCurrentMonthId();
      const businessId = sponsorCompany.businessId;

      // Update monthly stats for this business (use setDoc with merge, similar to iOS setData with merge)
      const monthlyStatsRef = doc(db, 'analytics', businessId, 'months', monthId);
      await setDoc(
        monthlyStatsRef,
        {
          businessCardViews: increment(1),
        },
        { merge: true }
      );

      // Update global stats (use setDoc with merge, similar to iOS setData with merge)
      const globalStatsRef = doc(db, 'analytics', 'global');
      await setDoc(
        globalStatsRef,
        {
          businessCardViews: increment(1),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  return {
    sponsorCompany,
    isLoading,
    incrementViews,
  };
}

