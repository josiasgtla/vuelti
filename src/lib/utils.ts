import type { CategoriaNegocio, CartItem, ModalidadPedido, EstatusPedido } from '@/types';

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length >= 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function buildStoreWhatsAppLink(whatsapp: string, message: string): string {
  const cleaned = whatsapp.replace(/[^0-9]/g, '');
  if (!cleaned.startsWith('52')) {
    return `https://wa.me/52${cleaned}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function buildDriverWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned.startsWith('52')) {
    return `https://wa.me/52${cleaned}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return 'Ayer';
  if (diffDay < 7) return `Hace ${diffDay} días`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export const CATEGORIAS: { id: CategoriaNegocio; label: string; icon: string }[] = [
  { id: 'comida', label: 'Comida', icon: 'UtensilsCrossed' },
  { id: 'antojos', label: 'Antojos', icon: 'Cookie' },
  { id: 'farmacia', label: 'Farmacia', icon: 'Pill' },
  { id: 'abarrotes', label: 'Abarrotes', icon: 'ShoppingBasket' },
];

export const ENVIO_FIJO = 35;

export const ESTATUS_LABELS: Record<EstatusPedido, string> = {
  pendiente: 'Pendiente',
  preparacion: 'En preparación',
  listo: 'Pedido listo',
  camino: 'En camino',
  entregado: 'Entregado',
};

export const ESTATUS_COLORS: Record<EstatusPedido, string> = {
  pendiente: 'bg-orange-500/15 text-orange-400',
  preparacion: 'bg-blue-500/15 text-blue-400',
  listo: 'bg-purple-500/15 text-purple-400',
  camino: 'bg-cyan-500/15 text-cyan-400',
  entregado: 'bg-green-500/15 text-green-400',
};

export const MODALIDAD_LABELS: Record<ModalidadPedido, string> = {
  recoger: 'Pasar a recoger',
  domicilio: 'Envío a domicilio',
};

export function buildOrderMessage(
  items: CartItem[],
  subtotal: number,
  envio: number,
  total: number,
  gpsLink: string | null,
  negocioNombre: string,
  clienteNombre: string,
  clienteTelefono: string,
  modalidad: ModalidadPedido,
  direccionEntrega: string
): string {
  let msg = `*Nuevo Pedido - Vuelti*\n`;
  msg += `Negocio: ${negocioNombre}\n`;
  msg += `Cliente: ${clienteNombre}\n`;
  msg += `Teléfono: ${clienteTelefono}\n`;
  msg += `Modalidad: ${MODALIDAD_LABELS[modalidad]}\n`;
  if (modalidad === 'domicilio' && direccionEntrega) {
    msg += `Dirección de entrega: ${direccionEntrega}\n`;
  }
  msg += `\n*Productos:*\n`;

  items.forEach((item) => {
    msg += `• ${item.cantidad}x ${item.producto.nombre} - ${formatCurrency(item.producto.precio * item.cantidad)}\n`;
  });

  msg += `\nSubtotal: ${formatCurrency(subtotal)}\n`;
  if (modalidad === 'domicilio') {
    msg += `Envío: ${formatCurrency(envio)}\n`;
  }
  msg += `*Total: ${formatCurrency(total)}*\n`;

  if (gpsLink) {
    msg += `\nUbicación del cliente:\n${gpsLink}`;
  }

  return msg;
}

export function buildMandaditoMessage(
  descripcion: string,
  clienteNombre: string,
  clienteTelefono: string,
  gpsLink: string | null,
  direccionEntrega: string
): string {
  let msg = `*Mandadito Express - Vuelti*\n`;
  msg += `Cliente: ${clienteNombre}\n`;
  msg += `Teléfono: ${clienteTelefono}\n`;
  msg += `Descripción: ${descripcion}\n`;
  if (direccionEntrega) {
    msg += `Dirección de entrega: ${direccionEntrega}\n`;
  }

  if (gpsLink) {
    msg += `\nMi ubicación:\n${gpsLink}`;
  }

  return msg;
}
