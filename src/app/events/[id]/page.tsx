'use client';

import { useParams } from 'next/navigation';
import EventDetailView from '@/components/EventDetailView';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  if (!eventId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Event not found</p>
      </div>
    );
  }

  return <EventDetailView eventId={eventId} />;
}

