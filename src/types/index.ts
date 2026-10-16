export type EstatusRepartidor = 'disponible' | 'ocupado';
export type EstatusPedido = 'pendiente' | 'preparacion' | 'listo' | 'camino' | 'entregado';
export type CategoriaNegocio = 'comida' | 'antojos' | 'farmacia' | 'abarrotes';
export type PagoStatus = 'pagado' | 'pendiente';
export type TipoPedido = 'negocio' | 'mandadito';
export type ModalidadPedido = 'recoger' | 'domicilio';

export interface Repartidor {
  id: string;
  nombre: string;
  foto_url: string;
  moto: string;
  telefono: string;
  estatus: EstatusRepartidor;
  created_at: string;
}

export interface Producto {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto_url: string;
  created_at: string;
}

export interface Negocio {
  id: string;
  nombre: string;
  logo_url: string;
  categoria: CategoriaNegocio;
  direccion: string;
  horario: string;
  whatsapp: string;
  pago_status: PagoStatus;
  created_at: string;
  productos?: Producto[];
  pin: string | null;
  tiene_repartidor_propio: boolean;
}

export interface CartItem {
  producto: Producto;
  negocioId: string;
  negocioNombre: string;
  cantidad: number;
}

export interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  origen: string;
  destino: string;
  descripcion: string;
  repartidor_id: string | null;
  estatus: EstatusPedido;
  created_at: string;
  negocio_id: string | null;
  items_json: CartItem[] | null;
  total: number;
  tipo: TipoPedido;
  modalidad: ModalidadPedido;
  direccion_entrega: string;
  repartidores?: Pick<Repartidor, 'id' | 'nombre'>;
  negocios?: Pick<Negocio, 'id' | 'nombre'>;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ShowToastFn = (message: string, type?: 'success' | 'error' | 'info') => void;
