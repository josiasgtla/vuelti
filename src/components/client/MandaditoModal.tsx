import { useState } from 'react';
import { X, Send, Navigation, Loader2, Store, Bike } from 'lucide-react';
import { cn, formatCurrency, ENVIO_FIJO, buildMandaditoMessage, MODALIDAD_LABELS } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { ShowToastFn, ModalidadPedido } from '@/types';

interface MandaditoModalProps {
  open: boolean;
  onClose: () => void;
  showToast: ShowToastFn;
}

export function MandaditoModal({ open, onClose, showToast }: MandaditoModalProps) {
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalidad, setModalidad] = useState<ModalidadPedido>('domicilio');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [gpsLink, setGpsLink] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      showToast('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLink(`https://maps.google.com/?q=${latitude},${longitude}`);
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

  const handleSend = async () => {
    if (!clienteNombre.trim() || !clienteTelefono.trim()) {
      showToast('Ingresa tu nombre y teléfono', 'error');
      return;
    }
    if (!descripcion.trim()) {
      showToast('Describe qué necesitas que enviemos', 'error');
      return;
    }

    setSending(true);

    const direccionFinal = direccionEntrega.trim() || (gpsLink ?? '');

    const { error } = await supabase.from('pedidos').insert({
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      descripcion: descripcion.trim(),
      total: ENVIO_FIJO,
      tipo: 'mandadito',
      estatus: 'pendiente',
      modalidad,
      direccion_entrega: direccionFinal,
    });

    if (error) {
      console.error('Error saving mandadito:', error);
    }

    const message = buildMandaditoMessage(
      descripcion.trim(),
      clienteNombre.trim(),
      clienteTelefono.trim(),
      gpsLink,
      modalidad,
      direccionFinal
    );

    const cleanMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${cleanMessage}`, '_blank');

    setSending(false);
    showToast('Mandadito enviado por WhatsApp', 'success');
    setClienteNombre('');
    setClienteTelefono('');
    setDescripcion('');
    setDireccionEntrega('');
    setGpsLink(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-navy-600/50 bg-navy-900 p-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Mandadito Express</h2>
              <p className="text-xs text-navy-200/40">¿Deseas mandar algo? Pídelo aquí</p>
            </div>
          </div>
          <button onClick={onClose} className="text-navy-200/40 transition-colors hover:text-white active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Tu nombre"
              className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2.5 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
            />
            <input
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              placeholder="Tu teléfono"
              className="rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2.5 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
            />
          </div>

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿Qué necesitas que enviemos? Ej: Recoger un paquete en..."
            rows={3}
            className="w-full resize-none rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2.5 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none transition-all"
          />

          {/* Delivery method selection */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-200/40">¿Cómo lo quieres?</p>
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

          <div className="flex items-center justify-between rounded-lg bg-navy-700/30 p-3 text-sm">
            <span className="text-navy-200/50">Tarifa de servicio</span>
            <span className="font-bold text-orange-500">{formatCurrency(ENVIO_FIJO)}</span>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar por WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
