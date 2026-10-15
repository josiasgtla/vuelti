import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Negocio, CategoriaNegocio } from '@/types';
import { HomeHeader, CategoryFilter, MandaditoCard, BusinessCard, SectionTitle } from './HomeParts';
import { FullPageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Store, Bike, MapPin } from 'lucide-react';

const HERO_IMAGE = 'https://images.pexels.com/photos/687824/pexels-photo-687824.jpeg?auto=compress&cs=tinysrgb&h=400&w=940&fit=crop';

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
        {/* Hero banner with food image */}
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-navy-600/30 animate-stagger-in" style={{ animationDelay: '0ms' }}>
          <div className="relative h-32 w-full overflow-hidden">
            <img src={HERO_IMAGE} alt="Comida deliciosa" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 backdrop-blur-sm animate-gentle-bounce">
                <MapPin className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-navy-200/60">Entregando en</p>
                <p className="text-sm font-bold text-white">Tihuatlán, Veracruz</p>
              </div>
            </div>
          </div>
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 backdrop-blur-sm">
            <Bike className="h-4 w-4 text-orange-400 animate-gentle-bounce" style={{ animationDelay: '0.3s' }} />
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
              {filtered.map((negocio, idx) => (
                <div
                  key={negocio.id}
                  className="animate-stagger-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <BusinessCard
                    negocio={negocio}
                    onClick={() => onBusinessClick(negocio)}
                  />
                </div>
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