import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { Store, ArrowLeft } from 'lucide-react';
import type { ShowToastFn, Negocio } from '@/types';

interface StoreLoginProps {
  onBack: () => void;
  onLogin: (negocio: Negocio) => void;
  showToast: ShowToastFn;
}

export function StoreLogin({ onBack, onLogin, showToast }: StoreLoginProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);

  useState(() => {
    supabase
      .from('negocios')
      .select('*')
      .order('nombre', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          showToast('Error al cargar negocios', 'error');
        } else {
          setNegocios((data ?? []) as Negocio[]);
        }
        setLoading(false);
      });
  });

  const handleEnter = () => {
    if (!selectedId) {
      showToast('Selecciona tu negocio', 'error');
      return;
    }
    setEntering(true);
    const negocio = negocios.find((n) => n.id === selectedId);
    if (negocio) {
      sessionStorage.setItem('vuelti_store_id', negocio.id);
      setTimeout(() => {
        onLogin(negocio);
      }, 300);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-5"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        onClick={onBack}
        className="absolute left-4 flex items-center gap-1 text-sm text-navy-200/40 transition-colors hover:text-white active:scale-95"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-6 flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Panel de Tienda</h1>
          <p className="mt-1.5 text-sm text-navy-200/40">Selecciona tu negocio para gestionar pedidos</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="text-orange-500" />
          </div>
        ) : negocios.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Store className="h-10 w-10 text-navy-300" />
            <p className="mt-3 text-sm text-navy-200/30">No hay negocios registrados</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto no-scrollbar">
            {negocios.map((negocio) => (
              <button
                key={negocio.id}
                onClick={() => setSelectedId(negocio.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 active:scale-95 ${
                  selectedId === negocio.id
                    ? 'border-orange-500/50 bg-orange-500/15 shadow-lg shadow-orange-500/10 hover:scale-[1.02]'
                    : 'border-navy-600/40 bg-navy-700/30 hover:border-navy-500/40 hover:scale-[1.02]'
                }`}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
                  {negocio.logo_url ? (
                    <img src={negocio.logo_url} alt={negocio.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store className="h-6 w-6 text-navy-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{negocio.nombre}</h3>
                  <p className="truncate text-xs text-navy-200/40">{negocio.direccion}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {negocios.length > 0 && (
          <button
            onClick={handleEnter}
            disabled={!selectedId || entering}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {entering ? <Spinner size="sm" className="text-white" /> : 'Entrar al panel'}
          </button>
        )}
      </div>
    </div>
  );
}
