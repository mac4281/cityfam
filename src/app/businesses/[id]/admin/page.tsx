'use client';

import { useParams } from 'next/navigation';
import { useBusinessAdmin } from '@/hooks/useBusinessAdmin';
import BusinessAdminView from '@/components/BusinessAdminView';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportingCompanies } from '@/hooks/useSupportingCompanies';

export default function BusinessAdminPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { user } = useAuth();
  const { supportingCompanies } = useSupportingCompanies();
  const { business, isLoading } = useBusinessAdmin(businessId);

  // Check if user owns this business
  const isOwner = user && business && business.ownerId === user.uid;
  
  // Check if user has a supporting company for this business
  const supportingCompany = supportingCompanies.find(
    (sc) => sc.businessId === businessId
  );
  const isPro = supportingCompany?.subscriptionStatus === 'active';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">
            Business Not Found
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            The business you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">
            Access Denied
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            You must be the owner of this business to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return <BusinessAdminView business={business} isPro={isPro} />;
}

