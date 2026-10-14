import { Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type View = 'client' | 'admin';

interface BottomNavProps {
  current: View;
  onChange: (view: View) => void;
}

export function BottomNav({ current, onChange }: BottomNavProps) {
  const tabs: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'client', label: 'Inicio', icon: Home },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-700/50 bg-navy-900/95 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 py-2 transition-all duration-200',
                active ? 'text-orange-500' : 'text-navy-200/40 hover:text-navy-100'
              )}
            >
              {active && (
                <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-orange-500" />
              )}
              <Icon className="h-5 w-5 transition-transform duration-200" style={active ? { transform: 'scale(1.1)' } : undefined} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
