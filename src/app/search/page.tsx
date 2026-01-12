'use client';

import { useState, useEffect } from 'react';
import { useSearch, SearchCategory } from '@/hooks/useSearch';
import SearchEventCard from '@/components/SearchEventCard';
import BusinessSearchItem from '@/components/BusinessSearchItem';
import JobCard from '@/components/JobCard';
import SponsorShowcase from '@/components/SponsorShowcase';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('events');
  const {
    events,
    businesses,
    jobs,
    latestEvents,
    isLoading,
    performSearch,
    loadLatestEvents,
    loadAllBusinesses,
    loadAllJobs,
  } = useSearch();

  // Load latest events on mount (default view)
  useEffect(() => {
    loadLatestEvents();
  }, []);

  // Load appropriate list when category changes (if no search query)
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (searchCategory === 'events') {
        loadLatestEvents();
      } else if (searchCategory === 'businesses') {
        loadAllBusinesses();
      } else if (searchCategory === 'jobs') {
        loadAllJobs();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCategory]);

  // Perform search when query or category changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, searchCategory);
    } else {
      // Clear results when search is empty
      performSearch('', searchCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, businesses, jobs..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { id: 'events', label: 'Events' },
            { id: 'businesses', label: 'Businesses' },
            { id: 'jobs', label: 'Jobs' },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSearchCategory(category.id as SearchCategory)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                searchCategory === category.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Sponsor Showcase */}
        <SponsorShowcase />

        {/* Search Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery.trim() ? 'Searching...' : 'Loading...'}
              </p>
            </div>
          ) : (
            <>
              {/* Events View */}
              {searchCategory === 'events' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {searchQuery.trim() ? `Events (${events.length})` : 'Latest Events'}
                  </h3>
                  {searchQuery.trim() ? (
                    events.length > 0 ? (
                      <div className="space-y-4">
                        {events.map((event) => (
                          <SearchEventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No events found matching "{searchQuery}"
                      </p>
                    )
                  ) : (
                    latestEvents.length > 0 ? (
                      <div className="space-y-4">
                        {latestEvents.map((event) => (
                          <SearchEventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No events available
                      </p>
                    )
                  )}
                </div>
              )}

                  {/* Businesses View */}
                  {searchCategory === 'businesses' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {searchQuery.trim() ? `Businesses (${businesses.length})` : 'Businesses'}
                      </h3>
                      {searchQuery.trim() ? (
                        businesses.length > 0 ? (
                          <div className="space-y-4">
                            {businesses.map((business) => (
                              <BusinessSearchItem key={business.id} business={business} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No businesses found matching "{searchQuery}"
                          </p>
                        )
                      ) : (
                        businesses.length > 0 ? (
                          <div className="space-y-4">
                            {businesses.map((business) => (
                              <BusinessSearchItem key={business.id} business={business} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No businesses available
                          </p>
                        )
                      )}
                    </div>
                  )}

                  {/* Jobs View */}
                  {searchCategory === 'jobs' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {searchQuery.trim() ? `Jobs (${jobs.length})` : 'Latest Jobs'}
                      </h3>
                      {searchQuery.trim() ? (
                        jobs.length > 0 ? (
                          <div className="space-y-4">
                            {jobs.map((job) => (
                              <JobCard key={job.id} job={job} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No jobs found matching "{searchQuery}"
                          </p>
                        )
                      ) : (
                        jobs.length > 0 ? (
                          <div className="space-y-4">
                            {jobs.map((job) => (
                              <JobCard key={job.id} job={job} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No jobs available
                          </p>
                        )
                      )}
                    </div>
                  )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

