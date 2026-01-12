'use client';

import { useParams } from 'next/navigation';
import BusinessDetailView from '@/components/BusinessDetailView';

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params.id as string;

  if (!businessId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Business not found</p>
      </div>
    );
  }

  return <BusinessDetailView businessId={businessId} />;
}

