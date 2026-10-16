import { useState } from 'react';
import { X, ShoppingCart, MapPin, Navigation, Trash2, Plus, Minus, Send, Loader2, Store, Bike } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { cn, formatCurrency, ENVIO_FIJO, buildOrderMessage, MODALIDAD_LABELS, buildStoreWhatsAppLink } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { ShowToastFn, ModalidadPedido, Negocio } from '@/types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  showToast: ShowToastFn;
}

export function CartDrawer({ open, onClose, showToast }: CartDrawerProps) {
  const { items, incrementItem, decrementItem, removeItem, clearCart, subtotal, itemCount } = useCart();
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [modalidad, setModalidad] = useState<ModalidadPedido | null>(null);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [gpsLink, setGpsLink] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const envio = items.length > 0 && modalidad === 'domicilio' ? ENVIO_FIJO : 0;
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
    if (!modalidad) {
      showToast('Selecciona cómo quieres recibir tu pedido', 'error');
      return;
    }
    if (modalidad === 'domicilio' && !direccionEntrega.trim() && !gpsLink) {
      showToast('Ingresa tu dirección de entrega o captura tu ubicación GPS', 'error');
      return;
    }

    setSending(true);

    const direccionFinal = direccionEntrega.trim() || (gpsLink ?? '');

    const { error } = await supabase.from('pedidos').insert({
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      descripcion: `Pedido de ${negocioNombre}: ${itemCount} productos`,
      items_json: items as unknown as Record<string, unknown>[],
      total,
      tipo: 'negocio',
      negocio_id: items[0].negocioId,
      estatus: 'pendiente',
      modalidad,
      direccion_entrega: modalidad === 'domicilio' ? direccionFinal : '',
    });

    if (error) {
      console.error('Error saving pedido:', error);
    }

    const message = buildOrderMessage(
      items,
      subtotal,
      envio,
      total,
      gpsLink,
      negocioNombre,
      clienteNombre.trim(),
      clienteTelefono.trim(),
      modalidad,
      direccionFinal
    );

    const cleanMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${cleanMessage}`, '_blank');

    setSending(false);
    showToast('Pedido enviado por WhatsApp', 'success');
    clearCart();
    setClienteNombre('');
    setClienteTelefono('');
    setModalidad(null);
    setDireccionEntrega('');
    setGpsLink(null);
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
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-bold text-orange-400 animate-pulse">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-navy-200/40 transition-colors hover:text-white active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-6 text-center animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-700/50">
              <ShoppingCart className="h-8 w-8 text-navy-300" />
            </div>
            <p className="text-sm font-semibold text-white">Tu carrito está vacío</p>
            <p className="mt-1 text-xs text-navy-200/40">Agrega productos de las tiendas para empezar</p>
          </div>
        ) : (
          <>
            {/* Items list - scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar" style={{ maxHeight: '30vh' }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-200/30">
                {negocioNombre}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex items-center gap-2.5 rounded-lg bg-navy-700/30 p-2.5 transition-all hover:bg-navy-700/50">
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
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-navy-200/30 transition-colors hover:text-red-400 active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout section */}
            <div className="border-t border-navy-700/50 px-5 py-4 space-y-3 overflow-y-auto no-scrollbar" style={{ maxHeight: '52vh' }}>
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
                />
                <input
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="Tu teléfono"
                  className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
                />
              </div>

              {/* Delivery method selection */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-200/40">¿Cómo quieres recibirlo?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModalidad('recoger')}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all duration-200 active:scale-95',
                      modalidad === 'recoger'
                        ? 'border-orange-500/50 bg-orange-500/15 text-orange-400 shadow-lg shadow-orange-500/10 hover:scale-[1.02]'
                        : 'border-navy-600/40 bg-navy-700/30 text-navy-200/50 hover:border-navy-500/40 hover:scale-[1.02]'
                    )}
                  >
                    <Store className="h-4 w-4" />
                    Pasar a recoger
                  </button>
                  <button
                    onClick={() => setModalidad('domicilio')}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all duration-200 active:scale-95',
                      modalidad === 'domicilio'
                        ? 'border-orange-500/50 bg-orange-500/15 text-orange-400 shadow-lg shadow-orange-500/10 hover:scale-[1.02]'
                        : 'border-navy-600/40 bg-navy-700/30 text-navy-200/50 hover:border-navy-500/40 hover:scale-[1.02]'
                    )}
                  >
                    <Bike className="h-4 w-4" />
                    A domicilio
                  </button>
                </div>
              </div>

              {/* Delivery address - only when domicilio is selected */}
              {modalidad === 'domicilio' && (
                <div className="animate-slide-up space-y-2">
                  <input
                    value={direccionEntrega}
                    onChange={(e) => setDireccionEntrega(e.target.value)}
                    placeholder="Dirección de entrega (calle, número, colonia)"
                    className="w-full rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2.5 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleGPS}
                    disabled={gpsLoading}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95',
                      gpsLink
                        ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:scale-[1.02]'
                        : 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 hover:scale-[1.02]'
                    )}
                  >
                    {gpsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    {gpsLink ? 'Ubicación capturada ✓' : 'O capturar mi ubicación (GPS)'}
                  </button>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-1 rounded-lg bg-navy-700/30 p-3">
                <div className="flex justify-between text-xs text-navy-200/50">
                  <span>Subtotal de productos</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {modalidad === 'domicilio' && (
                  <div className="flex justify-between text-xs text-navy-200/50">
                    <span>Tarifa de envío</span>
                    <span>{formatCurrency(envio)}</span>
                  </div>
                )}
                <div className="mt-1 flex justify-between border-t border-navy-600/30 pt-1.5 text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendOrder}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
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
