import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { Mail, Lock, ArrowLeft, Store, Shield, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShowToastFn, Negocio } from '@/types';

const ADMIN_EMAIL = 'Josiaszafnat29@gmail.com';
const ADMIN_PASSWORD = 'Jos200829';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
  onStoreLogin: (negocio: Negocio) => void;
  showToast: ShowToastFn;
}

type LoginRole = 'select' | 'global' | 'store';

export function AdminLogin({ onBack, onLogin, onStoreLogin, showToast }: AdminLoginProps) {
  const [role, setRole] = useState<LoginRole>('select');

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

      {role === 'select' && (
        <RoleSelect onSelect={setRole} />
      )}

      {role === 'global' && (
        <GlobalAdminLogin
          onBack={() => setRole('select')}
          onLogin={onLogin}
          showToast={showToast}
        />
      )}

      {role === 'store' && (
        <StoreAccessLogin
          onBack={() => setRole('select')}
          onStoreLogin={onStoreLogin}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function RoleSelect({ onSelect }: { onSelect: (role: LoginRole) => void }) {
  return (
    <div className="w-full max-w-sm animate-scale-in">
      <div className="mb-8 flex flex-col items-center">
        <Logo size="lg" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="mt-1.5 text-sm text-navy-200/40">Selecciona cómo quieres ingresar</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('global')}
          className="group flex w-full items-center gap-4 rounded-2xl border border-navy-600/40 bg-navy-700/30 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-orange-500/40 hover:shadow-lg active:scale-95"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-base font-bold text-white">Administrador Global</h2>
            <p className="text-xs text-navy-200/40">Gestiona negocios, repartidores y pagos</p>
          </div>
          <ChevronRight className="h-5 w-5 text-navy-300/30 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => onSelect('store')}
          className="group flex w-full items-center gap-4 rounded-2xl border border-navy-600/40 bg-navy-700/30 p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-orange-500/40 hover:shadow-lg active:scale-95"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-base font-bold text-white">Acceso a Negocio</h2>
            <p className="text-xs text-navy-200/40">Ingresa con tu PIN para gestionar pedidos</p>
          </div>
          <ChevronRight className="h-5 w-5 text-navy-300/30 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function GlobalAdminLogin({
  onBack,
  onLogin,
  showToast,
}: {
  onBack: () => void;
  onLogin: () => void;
  showToast: ShowToastFn;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Ingresa tu correo y contraseña', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('vuelti_admin', 'true');
        showToast('Bienvenido al panel de administración', 'success');
        onLogin();
      } else {
        showToast('Credenciales incorrectas. Verifica tu correo y contraseña.', 'error');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-sm animate-scale-in">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Administrador Global</h1>
        <p className="mt-1.5 text-sm text-navy-200/40">Inicia sesión para gestionar el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={<Mail className="h-4 w-4" />}
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={setEmail}
          label="Correo electrónico"
        />
        <InputField
          icon={<Lock className="h-4 w-4" />}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          label="Contraseña"
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? <Spinner size="sm" className="text-white" /> : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1.5 text-sm text-navy-200/40 transition-colors hover:text-white active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a selección de rol
        </button>
      </form>
    </div>
  );
}

function StoreAccessLogin({
  onBack,
  onStoreLogin,
  showToast,
}: {
  onBack: () => void;
  onStoreLogin: (negocio: Negocio) => void;
  showToast: ShowToastFn;
}) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null);
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchNegocios = useCallback(async () => {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      showToast('Error al cargar negocios', 'error');
    } else {
      setNegocios((data ?? []) as Negocio[]);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchNegocios();
  }, [fetchNegocios]);

  const handleVerifyPin = () => {
    if (!selectedNegocio) {
      showToast('Selecciona tu negocio', 'error');
      return;
    }
    if (!pin.trim()) {
      showToast('Ingresa tu PIN', 'error');
      return;
    }
    if (!selectedNegocio.pin) {
      showToast('Tu negocio aún no tiene un PIN configurado. Contacta al administrador.', 'error');
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      if (pin.trim() === selectedNegocio.pin) {
        sessionStorage.setItem('vuelti_store_id', selectedNegocio.id);
        showToast(`Bienvenido a ${selectedNegocio.nombre}`, 'success');
        onStoreLogin(selectedNegocio);
      } else {
        showToast('PIN incorrecto. Verifica e intenta de nuevo.', 'error');
      }
      setVerifying(false);
    }, 400);
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex justify-center py-20">
          <Spinner className="text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-scale-in">
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
          <Store className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Acceso a Negocio</h1>
        <p className="mt-1.5 text-sm text-navy-200/40">
          {selectedNegocio ? `Ingresa el PIN de ${selectedNegocio.nombre}` : 'Selecciona tu negocio'}
        </p>
      </div>

      {!selectedNegocio ? (
        <>
          <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto no-scrollbar">
            {negocios.map((negocio) => (
              <button
                key={negocio.id}
                onClick={() => setSelectedNegocio(negocio)}
                className="flex w-full items-center gap-3 rounded-xl border border-navy-600/40 bg-navy-700/30 p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:border-blue-500/40 active:scale-95"
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
                  {!negocio.pin && (
                    <p className="text-[10px] text-orange-400/60">Sin PIN configurado</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-navy-200/40 transition-colors hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a selección de rol
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-navy-600/40 bg-navy-700/30 p-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
              {selectedNegocio.logo_url ? (
                <img src={selectedNegocio.logo_url} alt={selectedNegocio.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store className="h-5 w-5 text-navy-400" />
                </div>
              )}
            </div>
            <span className="flex-1 truncate text-sm font-semibold text-white">{selectedNegocio.nombre}</span>
            <button
              onClick={() => { setSelectedNegocio(null); setPin(''); }}
              className="text-navy-200/40 transition-colors hover:text-white active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/40">
              PIN de 4 dígitos
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full rounded-xl border border-navy-600/50 bg-navy-700/30 py-3 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] text-white placeholder:text-navy-200/20 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <button
            onClick={handleVerifyPin}
            disabled={verifying || !pin.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {verifying ? <Spinner size="sm" className="text-white" /> : 'Entrar al panel'}
          </button>

          <button
            type="button"
            onClick={() => { setSelectedNegocio(null); setPin(''); }}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-navy-200/40 transition-colors hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Cambiar de negocio
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  label,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/40">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-navy-600/50 bg-navy-700/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-navy-200/20 transition-colors focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
        />
      </div>
    </div>
  );
}
