import { PackageX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-navy-700/50 ring-1 ring-navy-600">
        {icon ?? <PackageX className="h-10 w-10 text-navy-300" />}
      </div>
      <h3 className="text-lg font-display font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-navy-200/50 max-w-xs">{subtitle}</p>}
    </div>
  );
}
