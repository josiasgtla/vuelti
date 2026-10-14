import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Pedido, Repartidor, ShowToastFn, EstatusPedido } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package, MapPin, Phone, Check, Clock, ChevronDown } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface OrderManagementProps {
  pedidos: Pedido[];
  repartidores: Repartidor[];
  loading: boolean;
  showToast: ShowToastFn;
  onRefresh: () => void;
}

export function OrderManagement({ pedidos, repartidores, loading, showToast, onRefresh }: OrderManagementProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">
        Pedidos <span className="text-navy-200/30">({pedidos.length})</span>
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="text-orange-500" />
        </div>
      ) : pedidos.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10 text-navy-300" />}
          title="No hay pedidos registrados"
          subtitle="Los pedidos aparecerán aquí cuando los registres."
        />
      ) : (
        <div className="space-y-2.5">
          {pedidos.map((pedido) => (
            <OrderRow
              key={pedido.id}
              pedido={pedido}
              repartidores={repartidores}
              showToast={showToast}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  pedido,
  repartidores,
  showToast,
  onRefresh,
}: {
  pedido: Pedido;
  repartidores: Repartidor[];
  showToast: ShowToastFn;
  onRefresh: () => void;
}) {
  const [toggling, setToggling] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const isPending = pedido.estatus === 'pendiente';
  const assignedDriver = repartidores.find((r) => r.id === pedido.repartidor_id);

  const toggleStatus = async () => {
    setToggling(true);
    const newStatus: EstatusPedido = isPending ? 'entregado' : 'pendiente';
    const { error } = await supabase.from('pedidos').update({ estatus: newStatus }).eq('id', pedido.id);
    setToggling(false);
    if (error) {
      showToast('Error al actualizar el pedido', 'error');
    } else {
      showToast(`Pedido marcado como ${newStatus}`, 'success');
      onRefresh();
    }
  };

  const assignDriver = async (driverId: string) => {
    setAssigning(true);
    const { error } = await supabase
      .from('pedidos')
      .update({ repartidor_id: driverId || null })
      .eq('id', pedido.id);
    setAssigning(false);
    if (error) {
      showToast('Error al asignar repartidor', 'error');
    } else {
      showToast('Repartidor asignado', 'success');
      onRefresh();
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 transition-colors',
        isPending
          ? 'border-navy-600/40 bg-navy-700/30'
          : 'border-green-600/20 bg-green-500/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{pedido.cliente_nombre || 'Cliente sin nombre'}</h3>
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

      <div className="mt-2.5 space-y-1.5">
        {pedido.descripcion && (
          <p className="text-xs text-navy-100/60">{pedido.descripcion}</p>
        )}
        {pedido.origen && (
          <div className="flex items-center gap-1.5 text-xs text-navy-200/40">
            <MapPin className="h-3 w-3 flex-shrink-0 text-orange-500/50" />
            <span className="truncate">De: {pedido.origen}</span>
          </div>
        )}
        {pedido.destino && (
          <div className="flex items-center gap-1.5 text-xs text-navy-200/40">
            <MapPin className="h-3 w-3 flex-shrink-0 text-orange-500/70" />
            <span className="truncate">A: {pedido.destino}</span>
          </div>
        )}
        {pedido.cliente_telefono && (
          <div className="flex items-center gap-1.5 text-xs text-navy-200/40">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{pedido.cliente_telefono}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={pedido.repartidor_id ?? ''}
            onChange={(e) => assignDriver(e.target.value)}
            disabled={assigning}
            className="w-full appearance-none rounded-lg border border-navy-600/40 bg-navy-700/40 py-2 pl-3 pr-8 text-xs font-medium text-white transition-colors focus:border-orange-500/50 focus:outline-none disabled:opacity-50"
          >
            <option value="">Sin asignar</option>
            {repartidores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} ({r.estatus === 'disponible' ? 'Disponible' : 'Ocupado'})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-300" />
        </div>

        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={cn(
            'rounded-lg px-3 py-2 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50',
            isPending
              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
              : 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25'
          )}
        >
          {toggling ? '...' : isPending ? 'Marcar entregado' : 'Reabrir'}
        </button>
      </div>

      {assignedDriver && (
        <p className="mt-2 text-[11px] text-navy-200/30">
          Asignado a: <span className="font-medium text-navy-100/60">{assignedDriver.nombre}</span>
        </p>
      )}
    </div>
  );
}
