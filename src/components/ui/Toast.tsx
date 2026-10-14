import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [counter, setCounter] = useState(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCounter((c) => {
      const id = c + 1;
      setToasts((prev) => [...prev, { id, message, type }]);
      return id;
    });
  }, []);

  return { toasts, show, dismiss };
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-3 space-y-2 pointer-events-none"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-green-600', ring: 'ring-green-400/30' },
    error: { icon: XCircle, bg: 'bg-red-600', ring: 'ring-red-400/30' },
    info: { icon: Info, bg: 'bg-navy-600', ring: 'ring-navy-400/30' },
  };
  const { icon: Icon, bg, ring } = config[toast.type];

  return (
    <div
      className={`${bg} ${ring} pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-2 animate-slide-in-right`}
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-white" />
      <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
