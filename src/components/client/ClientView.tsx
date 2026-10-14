import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Negocio, CategoriaNegocio } from '@/types';
import { HomeHeader, CategoryFilter, MandaditoCard, BusinessCard, SectionTitle } from './HomeParts';
import { FullPageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Store, Bike } from 'lucide-react';

interface ClientViewProps {
  onBusinessClick: (negocio: Negocio) => void;
  onMandaditoClick: () => void;
  onCartClick: () => void;
}

export function ClientView({ onBusinessClick, onMandaditoClick, onCartClick }: ClientViewProps) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<CategoriaNegocio | 'todas'>('todas');

  const fetchNegocios = useCallback(async () => {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching negocios:', error);
      return;
    }
    setNegocios((data ?? []) as Negocio[]);
  }, []);

  useEffect(() => {
    fetchNegocios().finally(() => setLoading(false));

    const channel = supabase
      .channel('negocios-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negocios' }, () => {
        fetchNegocios();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNegocios]);

  const filtered = categoria === 'todas'
    ? negocios
    : negocios.filter((n) => n.categoria === categoria);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950">
        <FullPageLoader label="Cargando tiendas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      <HomeHeader onCartClick={onCartClick} />

      <div className="mx-auto max-w-md px-4 py-4 space-y-5">
        {/* Hero search area */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-4 ring-1 ring-navy-600/30">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <MapPin2 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-navy-200/40">Entregando en</p>
              <p className="text-sm font-bold text-white">Tihuatlán, Veracruz</p>
            </div>
          </div>
        </div>

        {/* Mandadito Express */}
        <div>
          <SectionTitle title="Servicios" subtitle="¿Qué necesitas hoy?" />
          <MandaditoCard onClick={onMandaditoClick} />
        </div>

        {/* Categories + Businesses */}
        <div>
          <SectionTitle title="Tiendas y Comercios" subtitle="Negocios locales en Tihuatlán" />
          <div className="mb-4">
            <CategoryFilter selected={categoria} onSelect={setCategoria} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Store className="h-10 w-10 text-navy-300" />}
              title="No hay negocios en esta categoría"
              subtitle="Prueba con otra categoría o vuelve más tarde."
            />
          ) : (
            <div className="space-y-2.5">
              {filtered.map((negocio) => (
                <BusinessCard
                  key={negocio.id}
                  negocio={negocio}
                  onClick={() => onBusinessClick(negocio)}
                />
              ))}
            </div>
          )}
        </div>

        <p className="pt-2 text-center text-[11px] text-navy-200/20">
          Vuelti &copy; 2026 · Tihuatlán, Veracruz
        </p>
      </div>
    </div>
  );
}

function MapPin2() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Re-export Bike for potential use
export { Bike };
