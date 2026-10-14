import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Repartidor, ShowToastFn, EstatusRepartidor } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Trash2, X, Bike, Phone, User, Link2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverManagementProps {
  showToast: ShowToastFn;
}

export function DriverManagement({ showToast }: DriverManagementProps) {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchRepartidores = useCallback(async () => {
    const { data, error } = await supabase
      .from('repartidores')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error:', error);
      return;
    }
    setRepartidores((data ?? []) as Repartidor[]);
  }, []);

  useEffect(() => {
    fetchRepartidores().finally(() => setLoading(false));

    const channel = supabase
      .channel('admin-repartidores-mgmt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repartidores' }, () => fetchRepartidores())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRepartidores]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">
          Repartidores <span className="text-navy-200/30">({repartidores.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="text-orange-500" />
        </div>
      ) : repartidores.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-navy-300" />}
          title="No hay repartidores registrados"
          subtitle="Agrega repartidores para asignar pedidos."
        />
      ) : (
        <div className="space-y-2.5">
          {repartidores.map((r) => (
            <DriverRow key={r.id} repartidor={r} showToast={showToast} onRefresh={fetchRepartidores} />
          ))}
        </div>
      )}

      {showForm && (
        <AddDriverForm
          onClose={() => setShowForm(false)}
          showToast={showToast}
          onRefresh={fetchRepartidores}
        />
      )}
    </div>
  );
}

function DriverRow({
  repartidor,
  showToast,
  onRefresh,
}: {
  repartidor: Repartidor;
  showToast: ShowToastFn;
  onRefresh: () => void;
}) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAvailable = repartidor.estatus === 'disponible';

  const toggleStatus = async () => {
    setToggling(true);
    const newStatus: EstatusRepartidor = isAvailable ? 'ocupado' : 'disponible';
    const { error } = await supabase
      .from('repartidores')
      .update({ estatus: newStatus })
      .eq('id', repartidor.id);

    setToggling(false);
    if (error) {
      showToast('Error al cambiar el estatus', 'error');
    } else {
      showToast(`${repartidor.nombre} ahora está ${newStatus === 'disponible' ? 'disponible' : 'ocupado'}`, 'success');
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${repartidor.nombre}? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from('repartidores').delete().eq('id', repartidor.id);
    setDeleting(false);
    if (error) {
      showToast('Error al eliminar el repartidor', 'error');
    } else {
      showToast(`${repartidor.nombre} eliminado`, 'success');
      onRefresh();
    }
  };

  return (
    <div className="rounded-xl border border-navy-600/40 bg-navy-700/30 p-3.5">
      <div className="flex items-center gap-3">
        <Avatar src={repartidor.foto_url} alt={repartidor.nombre} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{repartidor.nombre}</h3>
          <p className="truncate text-xs text-navy-200/40">{repartidor.moto}</p>
          <div className="mt-1">
            <StatusBadge status={repartidor.estatus} size="sm" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={toggleStatus}
            disabled={toggling}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50',
              isAvailable
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
            )}
          >
            {toggling ? '...' : isAvailable ? 'Poner ocupado' : 'Poner disponible'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-1 rounded-lg bg-navy-700/50 px-2.5 py-1.5 text-[11px] font-semibold text-navy-200/40 transition-all hover:bg-red-500/15 hover:text-red-400 active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            {deleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDriverForm({
  onClose,
  showToast,
  onRefresh,
}: {
  onClose: () => void;
  showToast: ShowToastFn;
  onRefresh: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [moto, setMoto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !moto.trim() || !telefono.trim()) {
      showToast('Nombre, moto y teléfono son obligatorios', 'error');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('repartidores').insert({
      nombre: nombre.trim(),
      foto_url: fotoUrl.trim(),
      moto: moto.trim(),
      telefono: telefono.trim(),
      estatus: 'disponible',
    });

    setSaving(false);
    if (error) {
      showToast('Error al registrar el repartidor', 'error');
      return;
    }

    showToast(`${nombre} registrado correctamente`, 'success');
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-navy-600/50 bg-navy-900 p-5 animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Nuevo repartidor</h3>
          <button onClick={onClose} className="text-navy-200/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField icon={<User className="h-4 w-4" />} label="Nombre *">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del repartidor"
              className="form-input"
            />
          </FormField>

          <FormField icon={<Bike className="h-4 w-4" />} label="Moto *">
            <input
              value={moto}
              onChange={(e) => setMoto(e.target.value)}
              placeholder="Ej: Honda Wave 125"
              className="form-input"
            />
          </FormField>

          <FormField icon={<Phone className="h-4 w-4" />} label="WhatsApp *">
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="522711234567"
              className="form-input"
            />
          </FormField>

          <FormField icon={<Link2 className="h-4 w-4" />} label="URL de foto">
            <input
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="https://..."
              className="form-input"
            />
          </FormField>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? <Spinner size="sm" className="text-white" /> : 'Registrar repartidor'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/40">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300">{icon}</span>
        {children}
      </div>
    </div>
  );
}
