import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return <Loader2 className={`${sizes[size]} animate-spin ${className}`} />;
}

interface FullPageLoaderProps {
  label?: string;
}

export function FullPageLoader({ label = 'Cargando...' }: FullPageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size="lg" className="text-orange-500" />
      <p className="mt-4 text-sm text-navy-100/60 font-medium">{label}</p>
    </div>
  );
}
