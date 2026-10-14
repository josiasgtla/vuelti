import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Negocio, PagoStatus, ShowToastFn } from '@/types';
import { Check, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Store, DollarSign } from 'lucide-react';

interface PaymentTrackingProps {
  showToast: ShowToastFn;
}

export function PaymentTracking({ showToast }: PaymentTrackingProps) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchNegocios = useCallback(async () => {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error:', error);
      return;
    }
    setNegocios((data ?? []) as Negocio[]);
  }, []);

  useEffect(() => {
    fetchNegocios().finally(() => setLoading(false));

    const channel = supabase
      .channel('admin-pagos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negocios' }, () => fetchNegocios())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNegocios]);

  const togglePago = async (negocio: Negocio) => {
    setTogglingId(negocio.id);
    const newStatus: PagoStatus = negocio.pago_status === 'pagado' ? 'pendiente' : 'pagado';
    const { error } = await supabase
      .from('negocios')
      .update({ pago_status: newStatus })
      .eq('id', negocio.id);

    setTogglingId(null);
    if (error) {
      showToast('Error al actualizar el pago', 'error');
    } else {
      showToast(`${negocio.nombre}: ${newStatus === 'pagado' ? 'Pagado' : 'Pendiente'}`, 'success');
      fetchNegocios();
    }
  };

  const pagados = negocios.filter((n) => n.pago_status === 'pagado').length;
  const pendientes = negocios.filter((n) => n.pago_status === 'pendiente').length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="text-orange-500" />
      </div>
    );
  }

  if (negocios.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="h-10 w-10 text-navy-300" />}
        title="No hay negocios registrados"
        subtitle="Registra negocios para llevar el control de pagos."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">Pagos Semanales</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-green-600/20 bg-green-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{pagados}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400/60">Pagados</p>
        </div>
        <div className="rounded-xl border border-orange-600/20 bg-orange-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{pendientes}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400/60">Pendientes</p>
        </div>
      </div>

      {/* Business payment list */}
      <div className="space-y-2">
        {negocios.map((negocio) => {
          const isPagado = negocio.pago_status === 'pagado';
          const isToggling = togglingId === negocio.id;
          return (
            <div
              key={negocio.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                isPagado
                  ? 'border-green-600/20 bg-green-500/5'
                  : 'border-navy-600/40 bg-navy-700/30'
              )}
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
                {negocio.logo_url ? (
                  <img src={negocio.logo_url} alt={negocio.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Store className="h-5 w-5 text-navy-400" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-white">{negocio.nombre}</h3>
                <p className="text-xs text-navy-200/30">Membresía semanal</p>
              </div>

              <button
                onClick={() => togglePago(negocio)}
                disabled={isToggling}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95',
                  isPagado
                    ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                    : 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25'
                )}
              >
                {isToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isPagado ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {isPagado ? 'Pagado' : 'Pendiente'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
