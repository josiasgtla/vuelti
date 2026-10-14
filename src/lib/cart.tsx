import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Producto } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (producto: Producto, negocioId: string, negocioNombre: string) => void;
  removeItem: (productoId: string) => void;
  incrementItem: (productoId: string) => void;
  decrementItem: (productoId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  lastAddedAt: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAddedAt, setLastAddedAt] = useState(0);

  const addItem = useCallback((producto: Producto, negocioId: string, negocioNombre: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id);
      if (existing) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, negocioId, negocioNombre, cantidad: 1 }];
    });
    setLastAddedAt(Date.now());
  }, []);

  const removeItem = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  }, []);

  const incrementItem = useCallback((productoId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad + 1 } : i))
    );
  }, []);

  const decrementItem = useCallback((productoId: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
  const subtotal = items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, incrementItem, decrementItem, clearCart, itemCount, subtotal, lastAddedAt }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
