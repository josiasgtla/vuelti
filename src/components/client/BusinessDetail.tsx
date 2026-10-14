import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, Clock, Plus, Minus, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Negocio, Producto } from '@/types';
import { useCart } from '@/lib/cart';
import { cn, formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

interface BusinessDetailProps {
  negocio: Negocio;
  onBack: () => void;
}

export function BusinessDetail({ negocio, onBack }: BusinessDetailProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, incrementItem, decrementItem } = useCart();

  const fetchProductos = useCallback(async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('negocio_id', negocio.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching productos:', error);
      return;
    }
    setProductos((data ?? []) as Producto[]);
  }, [negocio.id]);

  useEffect(() => {
    fetchProductos().finally(() => setLoading(false));

    const channel = supabase
      .channel(`productos-${negocio.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos', filter: `negocio_id=eq.${negocio.id}` }, () => {
        fetchProductos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProductos, negocio.id]);

  const getCartQuantity = (productoId: string) => {
    const item = items.find((i) => i.producto.id === productoId);
    return item?.cantidad ?? 0;
  };

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      {/* Header with business cover */}
      <div className="relative">
        <div className="h-44 w-full overflow-hidden bg-navy-800">
          {negocio.logo_url && (
            <img src={negocio.logo_url} alt={negocio.nombre} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy-950/30 to-navy-950" />
        </div>

        <button
          onClick={onBack}
          className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/60 text-white backdrop-blur-md transition-all hover:bg-navy-950/80 active:scale-90"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Business info */}
      <div className="mx-auto max-w-md px-4">
        <div className="-mt-8 relative">
          <div className="rounded-2xl border border-navy-600/40 bg-navy-800/80 p-4 backdrop-blur-sm">
            <h1 className="font-display text-xl font-bold text-white">{negocio.nombre}</h1>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-navy-200/50">
                <MapPin className="h-3.5 w-3.5 text-orange-500/60" />
                <span>{negocio.direccion}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-navy-200/50">
                <Clock className="h-3.5 w-3.5 text-orange-500/60" />
                <span>{negocio.horario}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-5">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Menú</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="text-orange-500" />
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Package className="h-10 w-10 text-navy-300" />
              <p className="mt-3 text-sm text-navy-200/30">Este negocio aún no tiene productos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {productos.map((producto) => {
                const qty = getCartQuantity(producto.id);
                return (
                  <div
                    key={producto.id}
                    className="flex gap-3 rounded-xl border border-navy-600/40 bg-navy-700/30 p-3 transition-colors hover:border-navy-500/40"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
                      {producto.foto_url && (
                        <img src={producto.foto_url} alt={producto.nombre} className="h-full w-full object-cover" loading="lazy" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-white">{producto.nombre}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-navy-200/40">{producto.descripcion}</p>
                      <p className="mt-1 text-sm font-bold text-orange-500">{formatCurrency(producto.precio)}</p>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end justify-between">
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(producto, negocio.id, negocio.nombre)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-90"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-lg bg-navy-700/60 p-0.5">
                          <button
                            onClick={() => decrementItem(producto.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-orange-500 transition-all hover:bg-navy-600/60 active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-bold text-white animate-pop-in" key={qty}>
                            {qty}
                          </span>
                          <button
                            onClick={() => addItem(producto, negocio.id, negocio.nombre)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-orange-500 transition-all hover:bg-navy-600/60 active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
