interface InfoRowProps {
  title: string;
  value: string;
}

export default function InfoRow({ title, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 py-0.5">
      <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-base text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

