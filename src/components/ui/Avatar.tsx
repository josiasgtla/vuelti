import { User } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
}

export function Avatar({ src, alt, size = 'md', ring = true }: AvatarProps) {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div className={`${sizes[size]} flex-shrink-0 overflow-hidden rounded-full bg-navy-700 ${ring ? 'ring-2 ring-navy-600' : ''}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-navy-300">
          <User className={size === 'lg' ? 'h-12 w-12' : 'h-6 w-6'} />
        </div>
      )}
    </div>
  );
}
