import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, Unsubscribe, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types/job';
import { Business } from '@/types/business';

export function useJobDetail(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const listenerRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const jobRef = doc(db, 'jobs', jobId);

    const unsubscribe = onSnapshot(
      jobRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const jobData: Job = {
            id: snapshot.id,
            title: data.title || '',
            type: data.type || '',
            location: data.location || '',
            description: data.description,
            salary: data.salary,
            applicationLink: data.applicationLink,
            imageUrl: data.imageUrl,
            businessId: data.businessId || '',
            businessName: data.businessName,
            createdAt: data.createdAt?.toDate() || new Date(),
            isActive: data.isActive !== false,
          };
          setJob(jobData);

          // Load business if businessId exists
          if (jobData.businessId) {
            try {
              const businessDoc = await getDoc(doc(db, 'businesses', jobData.businessId));
              if (businessDoc.exists()) {
                setBusiness({ id: businessDoc.id, ...businessDoc.data() } as Business);
              }
            } catch (error) {
              console.error('Error loading business:', error);
            }
          }
        } else {
          setJob(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading job:', error);
        setIsLoading(false);
      }
    );

    listenerRef.current = unsubscribe;

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [jobId]);

  return {
    job,
    business,
    isLoading,
  };
}

