'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Business } from '@/types/business';
import BusinessEditView from '@/components/BusinessEditView';

export default function BusinessEditPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    const businessRef = doc(db, 'businesses', businessId);
    const unsubscribe = onSnapshot(
      businessRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setBusiness({ id: snapshot.id, ...snapshot.data() } as Business);
        } else {
          setBusiness(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading business:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Business not found</p>
      </div>
    );
  }

  return <BusinessEditView business={business} />;
}

