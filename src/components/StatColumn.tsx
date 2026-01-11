interface StatColumnProps {
  value: number;
  title: string;
  trend?: string;
}

export default function StatColumn({ value, title, trend }: StatColumnProps) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {title}
      </p>
      {trend && (
        <p className="text-xs text-green-600 dark:text-green-400">{trend}</p>
      )}
    </div>
  );
}

