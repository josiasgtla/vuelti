import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Pedido, ShowToastFn, EstatusPedido } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package, MapPin, Phone, Check, Clock, Send, Store } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface OrderRecordsProps {
  showToast: ShowToastFn;
}

export function OrderRecords({ showToast }: OrderRecordsProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'entregado'>('todos');

  const fetchPedidos = useCallback(async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, negocios:nombre')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }
    setPedidos((data ?? []) as Pedido[]);
  }, []);

  useEffect(() => {
    fetchPedidos().finally(() => setLoading(false));

    const channel = supabase
      .channel('admin-pedidos-records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => fetchPedidos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPedidos]);

  const toggleStatus = async (pedido: Pedido) => {
    const newStatus: EstatusPedido = pedido.estatus === 'pendiente' ? 'entregado' : 'pendiente';
    const { error } = await supabase.from('pedidos').update({ estatus: newStatus }).eq('id', pedido.id);
    if (error) {
      showToast('Error al actualizar el pedido', 'error');
    } else {
      showToast(`Pedido marcado como ${newStatus}`, 'success');
      fetchPedidos();
    }
  };

  const filtered = filter === 'todos' ? pedidos : pedidos.filter((p) => p.estatus === filter);
  const pendingCount = pedidos.filter((p) => p.estatus === 'pendiente').length;
  const deliveredCount = pedidos.filter((p) => p.estatus === 'entregado').length;
  const totalRevenue = pedidos.reduce((sum, p) => sum + (p.total ?? 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="text-orange-500" />
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-10 w-10 text-navy-300" />}
        title="No hay pedidos registrados"
        subtitle="Los pedidos aparecerán aquí cuando los clientes compren."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">
        Pedidos <span className="text-navy-200/30">({pedidos.length})</span>
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Pendientes" value={pendingCount} color="orange" />
        <StatCard label="Entregados" value={deliveredCount} color="green" />
        <StatCard label="Total" value={formatCurrency(totalRevenue)} color="blue" small />
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {(['todos', 'pendiente', 'entregado'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all active:scale-95',
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-navy-700/40 text-navy-200/40 hover:bg-navy-600/40'
            )}
          >
            {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Entregados'}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-2.5">
        {filtered.map((pedido) => {
          const isPending = pedido.estatus === 'pendiente';
          const isMandadito = pedido.tipo === 'mandadito';
          return (
            <div
              key={pedido.id}
              className={cn(
                'rounded-xl border p-3.5 transition-colors',
                isPending
                  ? 'border-navy-600/40 bg-navy-700/30'
                  : 'border-green-600/20 bg-green-500/5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isMandadito ? (
                      <Send className="h-3.5 w-3.5 text-orange-500/60" />
                    ) : (
                      <Store className="h-3.5 w-3.5 text-orange-500/60" />
                    )}
                    <h3 className="truncate text-sm font-semibold text-white">
                      {pedido.cliente_nombre || 'Cliente'}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-navy-200/30">{formatDate(pedido.created_at)}</p>
                </div>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                    isPending
                      ? 'bg-orange-500/15 text-orange-400'
                      : 'bg-green-500/15 text-green-400'
                  )}
                >
                  {isPending ? <Clock className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                  {isPending ? 'Pendiente' : 'Entregado'}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {isMandadito && pedido.descripcion && (
                  <p className="text-xs text-navy-100/60">{pedido.descripcion}</p>
                )}
                {pedido.cliente_telefono && (
                  <div className="flex items-center gap-1.5 text-xs text-navy-200/40">
                    <Phone className="h-3 w-3" />
                    <span>{pedido.cliente_telefono}</span>
                  </div>
                )}
                {pedido.total != null && pedido.total > 0 && (
                  <p className="text-xs font-semibold text-orange-500">
                    Total: {formatCurrency(pedido.total)}
                  </p>
                )}
              </div>

              <button
                onClick={() => toggleStatus(pedido)}
                className={cn(
                  'mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all active:scale-95',
                  isPending
                    ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                    : 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25'
                )}
              >
                {isPending ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {isPending ? 'Marcar entregado' : 'Reabrir'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, small }: { label: string; value: number | string; color: 'orange' | 'green' | 'blue'; small?: boolean }) {
  const colors = {
    orange: 'border-orange-600/20 bg-orange-500/5 text-orange-400',
    green: 'border-green-600/20 bg-green-500/5 text-green-400',
    blue: 'border-blue-600/20 bg-blue-500/5 text-blue-400',
  };
  return (
    <div className={cn('rounded-xl border p-2.5 text-center', colors[color])}>
      <p className={cn('font-bold', small ? 'text-sm' : 'text-xl')}>{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wider opacity-60">{label}</p>
    </div>
  );
}
