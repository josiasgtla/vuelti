import { useState, useEffect, useRef } from 'react';
import { Bike, ShoppingCart, MapPin, UtensilsCrossed, Cookie, Pill, ShoppingBasket, Send, ChevronRight } from 'lucide-react';
import type { Negocio, CategoriaNegocio } from '@/types';
import { useCart } from '@/lib/cart';
import { cn, CATEGORIAS } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

interface HomeHeaderProps {
  onCartClick: () => void;
}

export function HomeHeader({ onCartClick }: HomeHeaderProps) {
  const { itemCount, lastAddedAt } = useCart();
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount, lastAddedAt]);

  useEffect(() => {
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-navy-700/40 bg-navy-900/95 backdrop-blur-lg"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Logo size="sm" />

        <button
          onClick={onCartClick}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700/50 text-navy-100 transition-all hover:bg-navy-600/50 active:scale-90"
          aria-label="Carrito de compras"
        >
          <ShoppingCart
            className={cn('h-5 w-5 transition-colors', bounce && 'animate-cart-bounce text-orange-500')}
          />
          {itemCount > 0 && (
            <span
              key={itemCount}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-lg animate-count-up"
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

interface CategoryFilterProps {
  selected: CategoriaNegocio | 'todas';
  onSelect: (cat: CategoriaNegocio | 'todas') => void;
}

const ICONS: Record<string, typeof UtensilsCrossed> = {
  UtensilsCrossed,
  Cookie,
  Pill,
  ShoppingBasket,
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const cats: { id: CategoriaNegocio | 'todas'; label: string; icon: string }[] = [
    { id: 'todas', label: 'Todas', icon: 'All' },
    ...CATEGORIAS,
  ];

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {cats.map((cat) => {
        const Icon = cat.icon === 'All' ? ShoppingBasket : ICONS[cat.icon];
        const active = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95',
              active
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-navy-700/40 text-navy-200/50 hover:bg-navy-600/40'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

interface MandaditoCardProps {
  onClick: () => void;
}

export function MandaditoCard({ onClick }: MandaditoCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-navy-800/30 p-4 text-left ring-1 ring-orange-500/20 transition-all hover:ring-orange-500/40 active:scale-[0.98]"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition-all group-hover:scale-150" />
      <div className="relative flex items-center gap-3.5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
          <Send className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-white">Mandadito Express</h3>
          <p className="text-xs text-navy-200/50">¿Deseas mandar algo? Pídelo aquí</p>
        </div>
        <ChevronRight className="h-5 w-5 text-orange-500/50 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

interface BusinessCardProps {
  negocio: Negocio;
  onClick: () => void;
}

const CATEGORIA_STYLES: Record<CategoriaNegocio, { bg: string; text: string; label: string }> = {
  comida: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Comida' },
  antojos: { bg: 'bg-pink-500/15', text: 'text-pink-400', label: 'Antojos' },
  farmacia: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Farmacia' },
  abarrotes: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Abarrotes' },
};

export function BusinessCard({ negocio, onClick }: BusinessCardProps) {
  const catStyle = CATEGORIA_STYLES[negocio.categoria];

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-navy-600/40 bg-navy-700/30 p-3 text-left transition-all hover:border-navy-500/50 hover:bg-navy-700/50 active:scale-[0.98]"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-navy-700 ring-1 ring-navy-600/50">
        {negocio.logo_url ? (
          <img src={negocio.logo_url} alt={negocio.nombre} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-navy-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-sm font-bold text-white">{negocio.nombre}</h3>
          <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', catStyle.bg, catStyle.text)}>
            {catStyle.label}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-navy-200/40">
          <MapPin className="h-3 w-3 flex-shrink-0 text-orange-500/50" />
          <span className="truncate">{negocio.direccion}</span>
        </div>
        <p className="mt-0.5 text-xs text-navy-200/30">{negocio.horario}</p>
      </div>

      <ChevronRight className="h-4 w-4 flex-shrink-0 text-navy-300/30 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500/50" />
    </button>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-navy-200/40">{subtitle}</p>}
    </div>
  );
}
