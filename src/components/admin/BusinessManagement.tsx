import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Negocio, Producto, CategoriaNegocio, ShowToastFn } from '@/types';
import { Plus, Trash2, X, Edit2, ChevronDown, ChevronUp, UtensilsCrossed, Package, Phone, MapPin, Clock, Link2, Store } from 'lucide-react';
import { cn, formatCurrency, CATEGORIAS } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface BusinessManagementProps {
  showToast: ShowToastFn;
}

export function BusinessManagement({ showToast }: BusinessManagementProps) {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchNegocios = useCallback(async () => {
    const { data, error } = await supabase
      .from('negocios')
      .select('*, productos(*)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error:', error);
      return;
    }
    setNegocios((data ?? []) as Negocio[]);
  }, []);

  useEffect(() => {
    fetchNegocios().finally(() => setLoading(false));

    const channel = supabase
      .channel('admin-negocios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negocios' }, () => fetchNegocios())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => fetchNegocios())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNegocios]);

  const handleDelete = async (negocio: Negocio) => {
    if (!confirm(`¿Eliminar "${negocio.nombre}" y todos sus productos? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('negocios').delete().eq('id', negocio.id);
    if (error) {
      showToast('Error al eliminar el negocio', 'error');
    } else {
      showToast(`${negocio.nombre} eliminado`, 'success');
      fetchNegocios();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">
          Negocios <span className="text-navy-200/30">({negocios.length})</span>
        </h2>
        <button
          onClick={() => { setEditingNegocio(null); setShowForm(true); }}
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
      ) : negocios.length === 0 ? (
        <EmptyState
          icon={<Store className="h-10 w-10 text-navy-300" />}
          title="No hay negocios registrados"
          subtitle="Agrega el primer negocio local."
        />
      ) : (
        <div className="space-y-2.5">
          {negocios.map((negocio) => (
            <BusinessRow
              key={negocio.id}
              negocio={negocio}
              expanded={expandedId === negocio.id}
              onToggle={() => setExpandedId(expandedId === negocio.id ? null : negocio.id)}
              onEdit={() => { setEditingNegocio(negocio); setShowForm(true); }}
              onDelete={() => handleDelete(negocio)}
              showToast={showToast}
              onRefresh={fetchNegocios}
            />
          ))}
        </div>
      )}

      {showForm && (
        <BusinessForm
          negocio={editingNegocio}
          onClose={() => { setShowForm(false); setEditingNegocio(null); }}
          showToast={showToast}
          onRefresh={fetchNegocios}
        />
      )}
    </div>
  );
}

function BusinessRow({
  negocio,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  showToast,
  onRefresh,
}: {
  negocio: Negocio;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showToast: ShowToastFn;
  onRefresh: () => void;
}) {
  const productos = negocio.productos ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-navy-600/40 bg-navy-700/30">
      <div className="flex items-center gap-3 p-3.5">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-navy-700">
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
          <p className="text-xs text-navy-200/40">{productos.length} productos</p>
          <span className={cn(
            'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
            negocio.categoria === 'comida' && 'bg-orange-500/15 text-orange-400',
            negocio.categoria === 'antojos' && 'bg-pink-500/15 text-pink-400',
            negocio.categoria === 'farmacia' && 'bg-green-500/15 text-green-400',
            negocio.categoria === 'abarrotes' && 'bg-blue-500/15 text-blue-400',
          )}>
            {negocio.categoria}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-lg bg-navy-700/50 p-2 text-navy-200/50 transition-colors hover:text-white"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-navy-600/30 px-3.5 pb-3.5 pt-3 animate-fade-in">
          <div className="mb-3 space-y-1 text-xs text-navy-200/40">
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {negocio.direccion}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {negocio.horario}</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {negocio.whatsapp}</div>
          </div>

          {/* Products list */}
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-200/30">Productos</p>
            <div className="space-y-1">
              {productos.length === 0 ? (
                <p className="text-xs text-navy-200/20">Sin productos</p>
              ) : (
                productos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-navy-700/30 px-2.5 py-1.5 text-xs">
                    <span className="truncate text-white">{p.nombre}</span>
                    <span className="ml-2 flex-shrink-0 font-semibold text-orange-500">{formatCurrency(p.precio)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500/15 py-2 text-xs font-bold text-blue-400 transition-all hover:bg-blue-500/25 active:scale-95"
            >
              <Edit2 className="h-3 w-3" />
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/25 active:scale-95"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BusinessForm({
  negocio,
  onClose,
  showToast,
  onRefresh,
}: {
  negocio: Negocio | null;
  onClose: () => void;
  showToast: ShowToastFn;
  onRefresh: () => void;
}) {
  const isEditing = !!negocio;
  const [nombre, setNombre] = useState(negocio?.nombre ?? '');
  const [logoUrl, setLogoUrl] = useState(negocio?.logo_url ?? '');
  const [categoria, setCategoria] = useState<CategoriaNegocio>(negocio?.categoria ?? 'comida');
  const [direccion, setDireccion] = useState(negocio?.direccion ?? '');
  const [horario, setHorario] = useState(negocio?.horario ?? '');
  const [whatsapp, setWhatsapp] = useState(negocio?.whatsapp ?? '');
  const [saving, setSaving] = useState(false);

  // Products editing
  const [productos, setProductos] = useState<Producto[]>(negocio?.productos ?? []);
  const [newProdNombre, setNewProdNombre] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrecio, setNewProdPrecio] = useState('');
  const [newProdFoto, setNewProdFoto] = useState('');

  const addProducto = () => {
    if (!newProdNombre.trim() || !newProdPrecio) return;
    const precio = parseFloat(newProdPrecio);
    if (isNaN(precio) || precio < 0) return;
    setProductos((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      negocio_id: negocio?.id ?? '',
      nombre: newProdNombre.trim(),
      descripcion: newProdDesc.trim(),
      precio,
      foto_url: newProdFoto.trim(),
      created_at: new Date().toISOString(),
    }]);
    setNewProdNombre('');
    setNewProdDesc('');
    setNewProdPrecio('');
    setNewProdFoto('');
  };

  const removeProducto = (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !direccion.trim() || !whatsapp.trim()) {
      showToast('Nombre, dirección y WhatsApp son obligatorios', 'error');
      return;
    }

    setSaving(true);

    try {
      let negocioId = negocio?.id;

      if (isEditing && negocioId) {
        const { error } = await supabase
          .from('negocios')
          .update({
            nombre: nombre.trim(),
            logo_url: logoUrl.trim(),
            categoria,
            direccion: direccion.trim(),
            horario: horario.trim(),
            whatsapp: whatsapp.trim(),
          })
          .eq('id', negocioId);

        if (error) throw error;

        // Delete existing products and re-insert
        await supabase.from('productos').delete().eq('negocio_id', negocioId);
      } else {
        const { data, error } = await supabase
          .from('negocios')
          .insert({
            nombre: nombre.trim(),
            logo_url: logoUrl.trim(),
            categoria,
            direccion: direccion.trim(),
            horario: horario.trim(),
            whatsapp: whatsapp.trim(),
            pago_status: 'pendiente',
          })
          .select()
          .single();

        if (error) throw error;
        negocioId = (data as Negocio).id;
      }

      // Insert products
      if (productos.length > 0 && negocioId) {
        const prodsToInsert = productos
          .filter((p) => !p.id.startsWith('temp-') || p.id.startsWith('temp-'))
          .map((p) => ({
            negocio_id: negocioId,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            foto_url: p.foto_url,
          }));

        const { error: prodError } = await supabase.from('productos').insert(prodsToInsert);
        if (prodError) throw prodError;
      }

      showToast(isEditing ? 'Negocio actualizado' : 'Negocio registrado', 'success');
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Error saving negocio:', err);
      showToast('Error al guardar el negocio', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-navy-600/50 bg-navy-900 p-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">{isEditing ? 'Editar negocio' : 'Nuevo negocio'}</h3>
          <button onClick={onClose} className="text-navy-200/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField icon={<Store className="h-4 w-4" />} label="Nombre *">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del negocio" className="form-input" />
          </FormField>

          <FormField icon={<Link2 className="h-4 w-4" />} label="URL del logo/foto">
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="form-input" />
          </FormField>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/40">Categoría *</label>
            <div className="flex gap-1.5">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-xs font-semibold transition-all active:scale-95',
                    categoria === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-navy-700/40 text-navy-200/40 hover:bg-navy-600/40'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <FormField icon={<MapPin className="h-4 w-4" />} label="Dirección *">
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección del negocio" className="form-input" />
          </FormField>

          <FormField icon={<Clock className="h-4 w-4" />} label="Horario">
            <input value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej: Lun-Sáb 8:00-22:00" className="form-input" />
          </FormField>

          <FormField icon={<Phone className="h-4 w-4" />} label="WhatsApp *">
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="522711234567" className="form-input" />
          </FormField>

          {/* Products section */}
          <div className="pt-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-200/40">
              Productos del menú ({productos.length})
            </p>

            {productos.length > 0 && (
              <div className="mb-2 space-y-1">
                {productos.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-lg bg-navy-700/30 px-2.5 py-2">
                    <Package className="h-3.5 w-3.5 flex-shrink-0 text-orange-500/50" />
                    <span className="min-w-0 flex-1 truncate text-xs text-white">{p.nombre}</span>
                    <span className="flex-shrink-0 text-xs font-semibold text-orange-500">{formatCurrency(p.precio)}</span>
                    <button type="button" onClick={() => removeProducto(p.id)} className="flex-shrink-0 text-navy-200/30 hover:text-red-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-navy-600/30 bg-navy-700/20 p-3">
              <input
                value={newProdNombre}
                onChange={(e) => setNewProdNombre(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
              />
              <input
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Descripción (opcional)"
                className="w-full rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={newProdPrecio}
                  onChange={(e) => setNewProdPrecio(e.target.value)}
                  placeholder="Precio $"
                  type="number"
                  step="0.01"
                  className="w-28 rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
                />
                <input
                  value={newProdFoto}
                  onChange={(e) => setNewProdFoto(e.target.value)}
                  placeholder="URL foto (opcional)"
                  className="flex-1 rounded-lg border border-navy-600/40 bg-navy-700/30 px-3 py-2 text-sm text-white placeholder:text-navy-200/20 focus:border-orange-500/40 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addProducto}
                disabled={!newProdNombre.trim() || !newProdPrecio}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-navy-600/40 py-2 text-xs font-bold text-orange-400 transition-all hover:bg-navy-600/60 active:scale-95 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar producto
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? <Spinner size="sm" className="text-white" /> : isEditing ? 'Guardar cambios' : 'Registrar negocio'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-200/40">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300">{icon}</span>
        {children}
      </div>
    </div>
  );
}
