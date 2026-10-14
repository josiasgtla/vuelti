import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import type { ShowToastFn } from '@/types';

const ADMIN_EMAIL = 'Josiaszafnat29@gmail.com';
const ADMIN_PASSWORD = 'Jos200829';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
  showToast: ShowToastFn;
}

export function AdminLogin({ onBack, onLogin, showToast }: AdminLoginProps) {
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-5"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        onClick={onBack}
        className="absolute left-4 top-4 flex items-center gap-1 text-sm text-navy-200/40 transition-colors hover:text-white"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Panel de Administrador</h1>
          <p className="mt-1.5 text-sm text-navy-200/40">Inicia sesión para gestionar repartidores y pedidos</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Iniciar sesión'}
          </button>
        </form>
      </div>
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
