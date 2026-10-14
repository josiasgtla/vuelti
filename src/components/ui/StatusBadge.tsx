import type { EstatusRepartidor } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: EstatusRepartidor;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isAvailable = status === 'disponible';
  const pulseClass = size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2';
  const textClass = size === 'md' ? 'text-xs' : 'text-[10px]';
  const padClass = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        padClass,
        textClass,
        isAvailable
          ? 'bg-green-500/15 text-green-400'
          : 'bg-red-500/15 text-red-400'
      )}
    >
      <span className="relative flex">
        <span className={cn(pulseClass, 'rounded-full', isAvailable ? 'bg-green-400' : 'bg-red-400')} />
        {isAvailable && (
          <span className={cn(pulseClass, 'absolute rounded-full bg-green-400 animate-ping opacity-75')} />
        )}
      </span>
      {isAvailable ? 'Disponible' : 'Ocupado'}
    </span>
  );
}
