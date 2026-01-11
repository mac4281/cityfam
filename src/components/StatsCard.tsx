import { ReactNode } from 'react';
import StatRow from './StatRow';

interface StatsCardProps {
  title: string;
  children: ReactNode;
}

export default function StatsCard({ title, children }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
        {title}
      </h3>
      {children}
    </div>
  );
}

