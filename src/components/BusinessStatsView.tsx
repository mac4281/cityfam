'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from './StatsCard';
import StatRow from './StatRow';
import StatColumn from './StatColumn';
import MonthlyStatsSheet from './MonthlyStatsSheet';
import { useBusinessStats } from '@/hooks/useBusinessStats';
import { getCurrentMonthYear } from '@/utils/dateUtils';
import { formatMonthYear } from '@/utils/dateUtils';

interface BusinessStatsViewProps {
  businessId: string;
  onClose?: () => void;
}

export default function BusinessStatsView({
  businessId,
  onClose,
}: BusinessStatsViewProps) {
  const router = useRouter();
  const {
    currentMonthStats,
    availableMonths,
    totalMonthlyClicks,
    isLoading,
    fetchAvailableMonths,
  } = useBusinessStats(businessId);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMonthlyStats, setShowMonthlyStats] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-white dark:bg-black flex flex-col md:max-w-[50vw] md:mx-auto md:w-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
          >
            Close
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Monthly Analytics
          </h2>
          <div className="w-16" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
          {/* Overview Card */}
          <StatsCard title="Monthly Impressions">
            <div className="flex gap-5">
              <StatColumn value={totalMonthlyClicks} title={getCurrentMonthYear()} />
            </div>
          </StatsCard>

          {/* Contact Actions Card */}
          <StatsCard title="Contact Actions">
            <div className="space-y-3">
              <StatRow title="Phone Calls" value={currentMonthStats.phoneNumber || 0} />
              <StatRow title="Emails" value={currentMonthStats.email || 0} />
              <StatRow title="Website Visits" value={currentMonthStats.website || 0} />
              <StatRow title="Map Link Clicks" value={currentMonthStats.maps || 0} />
            </div>
          </StatsCard>

          {/* Social Media Card */}
          <StatsCard title="Social Media">
            <div className="space-y-3">
              <StatRow title="Facebook" value={currentMonthStats.facebook || 0} />
              <StatRow title="Instagram" value={currentMonthStats.instagram || 0} />
              <StatRow title="Twitter" value={currentMonthStats.twitter || 0} />
              <StatRow title="LinkedIn" value={currentMonthStats.linkedin || 0} />
            </div>
          </StatsCard>

          {/* Content Engagement Card */}
          <StatsCard title="Content Engagement">
            <div className="space-y-3">
              <StatRow title="Event RSVPs" value={currentMonthStats.eventRSVP || 0} />
              <StatRow title="Deal Saves" value={currentMonthStats.dealSaves || 0} />
              <StatRow title="Job Link Clicks" value={currentMonthStats.jobLinks || 0} />
              <StatRow title="Job Shares" value={currentMonthStats.jobShares || 0} />
              <StatRow title="Event Shares" value={currentMonthStats.eventShares || 0} />
              <StatRow title="Deal Shares" value={currentMonthStats.dealShares || 0} />
              <StatRow
                title="Business Shares"
                value={currentMonthStats.businessShares || 0}
              />
            </div>
          </StatsCard>

          {/* Content Impressions Card */}
          <StatsCard title="Content Impressions">
            <div className="space-y-3">
              {/* Business Views */}
              <StatRow
                title="Business Detail Views"
                value={currentMonthStats.businessViews || 0}
              />
              <StatRow
                title="Business Search Views"
                value={currentMonthStats.businessSearch || 0}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Event Views */}
              <StatRow title="Event Detail Views" value={currentMonthStats.eventViews || 0} />
              <StatRow
                title="Home Screen Event Views"
                value={currentMonthStats.eventCardViews || 0}
              />
              <StatRow title="Event Search Views" value={currentMonthStats.eventSearch || 0} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Deal Views */}
              <StatRow title="Deal Detail Views" value={currentMonthStats.dealViews || 0} />
              <StatRow
                title="Home Screen Deal Views"
                value={currentMonthStats.dealCardViews || 0}
              />
              <StatRow title="Deal Search Views" value={currentMonthStats.dealSearch || 0} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Job Views */}
              <StatRow title="Job Detail Views" value={currentMonthStats.jobViews || 0} />
              <StatRow
                title="Home Screen Job Views"
                value={currentMonthStats.jobCardViews || 0}
              />
              <StatRow title="Job Search Views" value={currentMonthStats.jobSearch || 0} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Photo Views */}
              <StatRow title="Photo Views" value={currentMonthStats.photoView || 0} />
            </div>
          </StatsCard>

          {/* Past Months Section */}
          {availableMonths.length > 0 && (
            <StatsCard title="Past Months">
              <div className="space-y-3">
                {availableMonths.map((month, index) => (
                  <div key={month}>
                    <button
                      onClick={() => {
                        setSelectedMonth(month);
                        setShowMonthlyStats(true);
                      }}
                      className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors"
                    >
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {formatMonthYear(month)}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    {index < availableMonths.length - 1 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    )}
                  </div>
                ))}
              </div>
            </StatsCard>
          )}
        </div>
      </div>

      {/* Monthly Stats Sheet Modal */}
      {showMonthlyStats && selectedMonth && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          <MonthlyStatsSheet
            businessId={businessId}
            month={selectedMonth}
            onClose={() => {
              setShowMonthlyStats(false);
              setSelectedMonth(null);
            }}
          />
        </div>
      )}
    </>
  );
}

