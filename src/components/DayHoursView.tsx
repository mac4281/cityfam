'use client';

interface DayHoursViewProps {
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  onOpenTimeChange: (value: string) => void;
  onCloseTimeChange: (value: string) => void;
  onIsClosedChange: (value: boolean) => void;
}

export default function DayHoursView({
  dayName,
  openTime,
  closeTime,
  isClosed,
  onOpenTimeChange,
  onCloseTimeChange,
  onIsClosedChange,
}: DayHoursViewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {dayName}
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isClosed}
            onChange={(e) => onIsClosedChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
        </label>
      </div>
      {!isClosed && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Open
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => onOpenTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Close
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => onCloseTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}

