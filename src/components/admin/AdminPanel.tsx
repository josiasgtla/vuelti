import { useState } from 'react';
import type { ShowToastFn } from '@/types';
import { Logo } from '@/components/ui/Logo';
import { LogOut, Store, DollarSign, Package, Users } from 'lucide-react';
import { BusinessManagement } from './BusinessManagement';
import { PaymentTracking } from './PaymentTracking';
import { OrderRecords } from './OrderRecords';
import { DriverManagement } from './DriverManagement';
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  onLogout: () => void;
  showToast: ShowToastFn;
}

type Tab = 'negocios' | 'pagos' | 'pedidos' | 'repartidores';

export function AdminPanel({ onLogout, showToast }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('negocios');

  const tabs: { id: Tab; label: string; icon: typeof Store }[] = [
    { id: 'negocios', label: 'Negocios', icon: Store },
    { id: 'pagos', label: 'Pagos', icon: DollarSign },
    { id: 'pedidos', label: 'Pedidos', icon: Package },
    { id: 'repartidores', label: 'Repartidores', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      <header
        className="sticky top-0 z-40 border-b border-navy-700/50 bg-navy-900/95 backdrop-blur-lg"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-navy-200/50 transition-colors hover:bg-red-500/15 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>

        <div className="no-scrollbar mx-auto flex max-w-md gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
                  active
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-navy-200/40 hover:text-navy-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5">
        {tab === 'negocios' && <BusinessManagement showToast={showToast} />}
        {tab === 'pagos' && <PaymentTracking showToast={showToast} />}
        {tab === 'pedidos' && <OrderRecords showToast={showToast} />}
        {tab === 'repartidores' && <DriverManagement showToast={showToast} />}
      </div>
    </div>
  );
}
