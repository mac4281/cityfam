'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useJobDetail } from '@/hooks/useJobDetail';

interface JobDetailViewProps {
  jobId: string;
}

export default function JobDetailView({ jobId }: JobDetailViewProps) {
  const router = useRouter();
  const { job, business, isLoading } = useJobDetail(jobId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Job not found</p>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Detect if a string is a URL
  const isUrl = (str: string | undefined): boolean => {
    if (!str) return false;
    const trimmed = str.trim();
    // Check if it starts with http:// or https://
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return true;
    }
    // Check if it starts with www.
    if (trimmed.startsWith('www.')) {
      return true;
    }
    // Check if it contains a domain pattern (e.g., .com, .org, .net, etc.)
    const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})(\/.*)?$/;
    if (urlPattern.test(trimmed)) {
      return true;
    }
    // Check if it's an email address (common in application links)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(trimmed)) {
      return true;
    }
    return false;
  };

  const handleApply = () => {
    if (job.applicationLink) {
      let url = job.applicationLink.trim();
      // Add https:// if it starts with www.
      if (url.startsWith('www.')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="text-gray-900 dark:text-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Job Details
            </h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Job Image */}
        {job.imageUrl && (
          <div className="relative w-full h-[200px] bg-gray-200 dark:bg-gray-800">
            <Image
              src={job.imageUrl}
              alt={job.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Job Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Title and Badges */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {job.title}
            </h2>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/80 text-white text-sm font-medium rounded">
                {job.type}
              </span>
              {job.salary && (
                <span className="px-3 py-1 bg-green-500/80 text-white text-sm font-medium rounded">
                  {job.salary}
                </span>
              )}
              {job.location && (
                <span className="px-3 py-1 bg-gray-500/80 text-white text-sm font-medium rounded">
                  {job.location}
                </span>
              )}
            </div>
          </div>

          {/* Business Link */}
          {(job.businessName || business) && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Company
              </p>
              {job.businessId ? (
                <Link
                  href={`/businesses/${job.businessId}`}
                  className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {job.businessName || business?.name || 'View Company'}
                </Link>
              ) : (
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {job.businessName || business?.name}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Posted Date */}
          {job.createdAt && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Posted {formatDate(job.createdAt)}
              </p>
            </div>
          )}

          {/* How to Apply Section */}
          {job.applicationLink && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How to Apply
              </h3>
              {isUrl(job.applicationLink) ? (
                <button
                  onClick={handleApply}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              ) : (
                <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {job.applicationLink}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

