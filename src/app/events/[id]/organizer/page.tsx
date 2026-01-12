'use client';

import { useParams } from 'next/navigation';
import OrganizerManagementView from '@/components/OrganizerManagementView';

export default function OrganizerPage() {
  const params = useParams();
  const eventId = params.id as string;

  if (!eventId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Event not found</p>
      </div>
    );
  }

  return <OrganizerManagementView eventId={eventId} />;
}

