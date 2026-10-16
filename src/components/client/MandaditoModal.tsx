import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Send, Navigation, Loader2, ChevronRight, ArrowLeft, Bike, Phone, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency, ENVIO_FIJO, buildMandaditoMessage, buildDriverWhatsAppLink } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ShowToastFn, Repartidor } from '@/types';

interface MandaditoModalProps {
  open: boolean;
  onClose: () => void;
  showToast: ShowToastFn;
}

export function MandaditoModal({ open, onClose, showToast }: MandaditoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [gpsLink, setGpsLink] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step 2: driver list
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);

  const fetchDrivers = useCallback(async () => {
    setDriversLoading(true);
    const { data, error } = await supabase
      .from('repartidores')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      showToast('Error al cargar repartidores', 'error');
    } else {
      setRepartidores((data ?? []) as Repartidor[]);
    }
    setDriversLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

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

  const handleNext = async () => {
    if (!clienteNombre.trim() || !clienteTelefono.trim()) {
      showToast('Ingresa tu nombre y teléfono', 'error');
      return;
    }
    if (!descripcion.trim()) {
      showToast('Describe qué necesitas que enviemos', 'error');
      return;
    }
    if (!direccionEntrega.trim() && !gpsLink) {
      showToast('Ingresa tu dirección o captura tu ubicación GPS', 'error');
      return;
    }

    setSaving(true);

    const direccionFinal = direccionEntrega.trim() || (gpsLink ?? '');

    const { error } = await supabase.from('pedidos').insert({
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      descripcion: descripcion.trim(),
      total: ENVIO_FIJO,
      tipo: 'mandadito',
      estatus: 'pendiente',
      modalidad: 'domicilio',
      direccion_entrega: direccionFinal,
    });

    if (error) {
      console.error('Error saving mandadito:', error);
    }

    setSaving(false);
    await fetchDrivers();
    setStep(2);
  };

  const handleContactDriver = (repartidor: Repartidor) => {
    const direccionFinal = direccionEntrega.trim() || (gpsLink ?? '');
    const message = buildMandaditoMessage(
      descripcion.trim(),
      clienteNombre.trim(),
      clienteTelefono.trim(),
      gpsLink,
      direccionFinal
    );

    const url = buildDriverWhatsAppLink(repartidor.telefono, message);
    window.open(url, '_blank');
    showToast(`Abriendo WhatsApp de ${repartidor.nombre}...`, 'success');
  };

  const handleClose = () => {
    setStep(1);
    setClienteNombre('');
    setClienteTelefono('');
    setDescripcion('');
    setDireccionEntrega('');
    setGpsLink(null);
    onClose();
  };

  if (!open) return null;

  const availableDrivers = repartidores.filter((r) => r.estatus === 'disponible');

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-navy-600/50 bg-navy-900 p-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        {/* Header with step indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Mandadito Express</h2>
              <p className="text-xs text-navy-200/40">
                {step === 1 ? 'Servicio a domicilio' : 'Paso 2: Elige repartidor'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-navy-200/40 transition-colors hover:text-white active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="mb-4 flex items-center gap-2">
          <div className={cn('h-1.5 flex-1 rounded-full transition-all duration-300', step >= 1 ? 'bg-orange-500' : 'bg-navy-700')} />
          <div className={cn('h-1.5 flex-1 rounded-full transition-all duration-300', step >= 2 ? 'bg-orange-500' : 'bg-navy-700')} />
        </div>

        {/* Step 1: User info form */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fade-in">
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
              {gpsLink ? 'Ubicación capturada ✓' : 'Capturar mi ubicación (GPS)'}
            </button>

            <div className="flex items-center justify-between rounded-lg bg-navy-700/30 p-3 text-sm">
              <span className="text-navy-200/50">Tarifa de servicio a domicilio</span>
              <span className="font-bold text-orange-500">{formatCurrency(ENVIO_FIJO)}</span>
            </div>

            <button
              onClick={handleNext}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Siguiente: Ver repartidores
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Driver list */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-xs text-green-400">Tu mandadito se ha registrado. Elige un repartidor disponible para contactarlo por WhatsApp.</p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-navy-200/40 transition-colors hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a mis datos
            </button>

            {driversLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : availableDrivers.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Bike className="h-10 w-10 text-navy-300" />
                <p className="mt-3 text-sm text-navy-200/30">No hay repartidores disponibles en este momento</p>
                <p className="mt-1 text-xs text-navy-200/20">Intenta de nuevo más tarde</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar">
                {availableDrivers.map((repartidor) => (
                  <div
                    key={repartidor.id}
                    className="rounded-2xl border border-navy-600/40 bg-navy-700/30 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-navy-500/50 hover:shadow-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar src={repartidor.foto_url} alt={repartidor.nombre} size="sm" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-navy-800 bg-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display text-sm font-bold text-white">{repartidor.nombre}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-navy-200/50">
                          <Bike className="h-3 w-3 text-orange-500/70" />
                          <span className="truncate">{repartidor.moto}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-navy-200/40">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{repartidor.telefono}</span>
                        </div>
                        <div className="mt-1.5">
                          <StatusBadge status={repartidor.estatus} size="sm" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleContactDriver(repartidor)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-95"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Enviar por WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-navy-600/40 py-3 text-sm font-semibold text-navy-200/50 transition-all duration-200 hover:scale-[1.02] hover:text-white active:scale-95"
            >
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
