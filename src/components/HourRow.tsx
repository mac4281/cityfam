import { BusinessHours } from '@/types/business';

interface HourRowProps {
  day: string;
  hours: BusinessHours;
}

export default function HourRow({ day, hours }: HourRowProps) {
  return (
    <div className="flex items-center">
      <p className="w-24 text-sm text-gray-900 dark:text-gray-100">{day}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {hours.isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
      </p>
    </div>
  );
}

