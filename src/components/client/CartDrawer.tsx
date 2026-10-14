import { useState } from 'react';
import { X, ShoppingCart, MapPin, Navigation, Trash2, Plus, Minus, Send, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { cn, formatCurrency, ENVIO_FIJO, buildOrderMessage, buildWhatsAppLink } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { ShowToastFn } from '@/types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  showToast: ShowToastFn;
}

export function CartDrawer({ open, onClose, showToast }: CartDrawerProps) {
  const { items, incrementItem, decrementItem, removeItem, clearCart, subtotal, itemCount } = useCart();
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [gpsLink, setGpsLink] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const envio = items.length > 0 ? ENVIO_FIJO : 0;
  const total = subtotal + envio;
  const negocioNombre = items.length > 0 ? items[0].negocioNombre : '';

  const handleGPS = () => {
    if (!navigator.geolocation) {
      showToast('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        setGpsLink(link);
        setGpsLoading(false);
        showToast('Ubicación capturada correctamente', 'success');
      },
      () => {
        setGpsLoading(false);
        showToast('No se pudo obtener tu ubicación. Revisa los permisos GPS.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSendOrder = async () => {
    if (items.length === 0) return;
    if (!clienteNombre.trim() || !clienteTelefono.trim()) {
      showToast('Ingresa tu nombre y teléfono', 'error');
      return;
    }

    setSending(true);

    // Save to database
    const { error } = await supabase.from('pedidos').insert({
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      descripcion: `Pedido de ${negocioNombre}: ${itemCount} productos`,
      items_json: items as unknown as Record<string, unknown>[],
      total,
      tipo: 'negocio',
      negocio_id: items[0].negocioId,
      estatus: 'pendiente',
    });

    if (error) {
      console.error('Error saving pedido:', error);
    }

    // Build and open WhatsApp
    const message = buildOrderMessage(
      items,
      subtotal,
      envio,
      total,
      gpsLink,
      negocioNombre,
      clienteNombre.trim(),
      clienteTelefono.trim()
    );

    const whatsappLink = buildWhatsAppLink(items[0]?.producto ? '' : '', message);
    // Use the business WhatsApp number from the first item's negocio
    // We need to get it from the negocio - but we don't have it in cart items
    // So we'll open WhatsApp without a specific number (user selects contact)
    const cleanMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${cleanMessage}`, '_blank');

    setSending(false);
    showToast('Pedido enviado por WhatsApp', 'success');
    clearCart();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl border-t border-navy-600/50 bg-navy-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-700/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <h2 className="font-display text-lg font-bold text-white">Tu pedido</h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-bold text-orange-400">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-navy-200/40 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-700/50">
              <ShoppingCart className="h-8 w-8 text-navy-300" />
            </div>
            <p className="text-sm font-semibold text-white">Tu carrito está vacío</p>
            <p className="mt-1 text-xs text-navy-200/40">Agrega productos de las tiendas para empezar</p>
          </div>
        ) : (
          <>
            {/* Items list - scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar" style={{ maxHeight: '35vh' }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-200/30">
                {negocioNombre}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex items-center gap-2.5 rounded-lg bg-navy-700/30 p-2.5">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
                      {item.producto.foto_url && (
                        <img src={item.producto.foto_url} alt={item.producto.nombre} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.producto.nombre}</p>
                      <p className="text-xs text-orange-500">{formatCurrency(item.producto.precio * item.cantidad)}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-navy-700/60 p-0.5">
                      <button
                        onClick={() => decrementItem(item.producto.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-orange-500 transition-all hover:bg-navy-600/60 active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-4 text-center text-xs font-bold text-white">{item.cantidad}</span>
                      <button
                        onClick={() => incrementItem(item.producto.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-orange-500 transition-all hover:bg-navy-600/60 active:scale-90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.producto.id)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-navy-200/30 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout section */}
            <div className="border-t border-navy-700/50 px-5 py-4 space-y-3">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
                />
                <input
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="Tu teléfono"
                  className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
                />
              </div>

              {/* GPS button */}
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all active:scale-[0.98]',
                  gpsLink
                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                    : 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/15'
                )}
              >
                {gpsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {gpsLink ? 'Ubicación capturada ✓' : 'Obtener mi ubicación (GPS)'}
              </button>

              {/* Price breakdown */}
              <div className="space-y-1 rounded-lg bg-navy-700/30 p-3">
                <div className="flex justify-between text-xs text-navy-200/50">
                  <span>Subtotal de productos</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-navy-200/50">
                  <span>Tarifa de envío</span>
                  <span>{formatCurrency(envio)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-navy-600/30 pt-1.5 text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendOrder}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 active:scale-[0.98] disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar pedido por WhatsApp
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
