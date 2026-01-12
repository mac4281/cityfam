'use client';

import { useParams } from 'next/navigation';
import JobDetailView from '@/components/JobDetailView';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  if (!jobId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Job not found</p>
      </div>
    );
  }

  return <JobDetailView jobId={jobId} />;
}

