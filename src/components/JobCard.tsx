'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const jobHref = job.id ? `/jobs/${job.id}` : '#';

  return (
    <Link
      href={jobHref}
      className="block w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
    >
      <div className="flex">
        {/* Image Section - Max 1/3 width */}
        <div className="relative w-1/3 min-w-[120px] max-w-[180px] h-[120px] flex-shrink-0">
          {job.imageUrl ? (
            <Image
              src={job.imageUrl}
              alt={job.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 120px, 180px"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section - Remaining 2/3 width */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex flex-col gap-2">
            {/* Job Title Badge */}
            <div className="px-2 py-1.5 bg-purple-500/80 rounded-[5px] text-white w-fit">
              <p className="text-[10px] font-bold leading-tight line-clamp-2">
                {job.title}
              </p>
            </div>

            {/* Job Type, Location, Salary */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-900 dark:text-gray-100 leading-tight">
              <span className="font-medium">{job.type}</span>
              {job.location && (
                <>
                  <span>•</span>
                  <span>{job.location}</span>
                </>
              )}
              {job.salary && (
                <>
                  <span>•</span>
                  <span className="text-green-600 dark:text-green-400">{job.salary}</span>
                </>
              )}
            </div>

            {/* Business Name */}
            {job.businessName && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                {job.businessName}
              </p>
            )}

            {/* Description */}
            {job.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-tight mt-1">
                {job.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

