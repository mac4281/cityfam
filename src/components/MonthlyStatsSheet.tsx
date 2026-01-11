'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StatsCard from './StatsCard';
import StatRow from './StatRow';
import StatColumn from './StatColumn';
import { formatMonthYear } from '@/utils/dateUtils';

interface MonthlyStatsSheetProps {
  businessId: string;
  month: string;
  onClose: () => void;
}

export default function MonthlyStatsSheet({
  businessId,
  month,
  onClose,
}: MonthlyStatsSheetProps) {
  const [monthlyStats, setMonthlyStats] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'analytics', businessId, 'months', month);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const stats: { [key: string]: number } = {};
          Object.keys(data).forEach((key) => {
            stats[key] = typeof data[key] === 'number' ? data[key] : 0;
          });
          setMonthlyStats(stats);
        } else {
          setMonthlyStats({});
        }
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [month, businessId]);

  const totalMonthlyClicks = [
    'businessViews',
    'jobViews',
    'dealViews',
    'eventViews',
    'photoView',
    'jobCardViews',
    'dealCardViews',
    'eventCardViews',
    'businessCardViews',
    'businessSearch',
    'jobSearch',
    'dealSearch',
    'eventSearch',
    'jobShares',
    'eventShares',
    'dealShares',
    'businessShares',
  ].reduce((sum, key) => sum + (monthlyStats[key] || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="w-16" /> {/* Spacer */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatMonthYear(month)}
        </h2>
        <button
          onClick={onClose}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Done
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Card */}
        <StatsCard title="Monthly Impressions">
          <div className="flex gap-5">
            <StatColumn value={totalMonthlyClicks} title={formatMonthYear(month)} />
          </div>
        </StatsCard>

        {/* Contact Actions Card */}
        <StatsCard title="Contact Actions">
          <div className="space-y-3">
            <StatRow title="Phone Calls" value={monthlyStats.phoneNumber || 0} />
            <StatRow title="Emails" value={monthlyStats.email || 0} />
            <StatRow title="Website Visits" value={monthlyStats.website || 0} />
            <StatRow title="Map Link Clicks" value={monthlyStats.maps || 0} />
          </div>
        </StatsCard>

        {/* Social Media Card */}
        <StatsCard title="Social Media">
          <div className="space-y-3">
            <StatRow title="Facebook" value={monthlyStats.facebook || 0} />
            <StatRow title="Instagram" value={monthlyStats.instagram || 0} />
            <StatRow title="Twitter" value={monthlyStats.twitter || 0} />
            <StatRow title="LinkedIn" value={monthlyStats.linkedin || 0} />
          </div>
        </StatsCard>

        {/* Content Engagement Card */}
        <StatsCard title="Content Engagement">
          <div className="space-y-3">
            <StatRow title="Event RSVPs" value={monthlyStats.eventRSVP || 0} />
            <StatRow title="Deal Saves" value={monthlyStats.dealSaves || 0} />
            <StatRow title="Job Link Clicks" value={monthlyStats.jobLinks || 0} />
            <StatRow title="Job Shares" value={monthlyStats.jobShares || 0} />
            <StatRow title="Event Shares" value={monthlyStats.eventShares || 0} />
            <StatRow title="Deal Shares" value={monthlyStats.dealShares || 0} />
            <StatRow title="Business Shares" value={monthlyStats.businessShares || 0} />
          </div>
        </StatsCard>

        {/* Content Impressions Card */}
        <StatsCard title="Content Impressions">
          <div className="space-y-3">
            {/* Business Views */}
            <StatRow
              title="Business Detail Views"
              value={monthlyStats.businessViews || 0}
            />
            <StatRow
              title="Business Search Views"
              value={monthlyStats.businessSearch || 0}
            />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Event Views */}
            <StatRow title="Event Detail Views" value={monthlyStats.eventViews || 0} />
            <StatRow
              title="Home Screen Event Views"
              value={monthlyStats.eventCardViews || 0}
            />
            <StatRow title="Event Search Views" value={monthlyStats.eventSearch || 0} />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Deal Views */}
            <StatRow title="Deal Detail Views" value={monthlyStats.dealViews || 0} />
            <StatRow
              title="Home Screen Deal Views"
              value={monthlyStats.dealCardViews || 0}
            />
            <StatRow title="Deal Search Views" value={monthlyStats.dealSearch || 0} />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Job Views */}
            <StatRow title="Job Detail Views" value={monthlyStats.jobViews || 0} />
            <StatRow
              title="Home Screen Job Views"
              value={monthlyStats.jobCardViews || 0}
            />
            <StatRow title="Job Search Views" value={monthlyStats.jobSearch || 0} />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Photo Views */}
            <StatRow title="Photo Views" value={monthlyStats.photoView || 0} />
          </div>
        </StatsCard>
      </div>
    </div>
  );
}

