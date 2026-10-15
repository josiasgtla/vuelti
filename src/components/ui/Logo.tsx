import { Bike } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const containerSizes = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-16 w-16' };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${containerSizes[size]} flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20`}>
        <Bike className={`${iconSizes[size]} text-white animate-gentle-bounce`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-display font-extrabold tracking-tight text-white`}>
          Vuelti
        </span>
      )}
    </div>
  );
}
