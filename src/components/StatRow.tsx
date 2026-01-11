interface StatRowProps {
  title: string;
  value: number | string;
}

export default function StatRow({ title, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

