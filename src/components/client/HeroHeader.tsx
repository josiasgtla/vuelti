import { Bike, MapPin, Check } from 'lucide-react';

interface HeroHeaderProps {
  availableCount: number;
}

export function HeroHeader({ availableCount }: HeroHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-5 pb-6 pt-4 shadow-xl"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-navy-400/5 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Bike className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold leading-none text-white">Vuelti</h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-orange-400/80">Mandaditos & Envíos</p>
          </div>
        </div>

        {availableCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="text-xs font-semibold text-green-400">{availableCount} disponibles</span>
          </div>
        )}
      </div>

      <div className="relative mt-5">
        <h2 className="font-display text-lg font-semibold leading-tight text-white">
          Mandaditos y envíos rápidos
        </h2>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-navy-100/50">
          <MapPin className="h-3.5 w-3.5 text-orange-500/70" />
          <span>Tihuatlán, Veracruz</span>
        </div>
      </div>

      <div className="relative mt-4 flex gap-2">
        <FeaturePill text="Rápido" />
        <FeaturePill text="Seguro" />
        <FeaturePill text="En tiempo real" />
      </div>
    </header>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-navy-600/50 bg-navy-700/30 px-3 py-1 text-[11px] font-medium text-navy-100/70">
      <Check className="h-3 w-3 text-orange-500" />
      {text}
    </span>
  );
}
