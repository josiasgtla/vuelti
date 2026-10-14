import { useState } from 'react';
import { CartProvider } from '@/lib/cart';
import { ClientView } from '@/components/client/ClientView';
import { BusinessDetail } from '@/components/client/BusinessDetail';
import { CartDrawer } from '@/components/client/CartDrawer';
import { MandaditoModal } from '@/components/client/MandaditoModal';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { BottomNav } from '@/components/ui/BottomNav';
import type { View } from '@/components/ui/BottomNav';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import type { Negocio } from '@/types';

type ClientScreen = 'home' | 'business';

function App() {
  const [view, setView] = useState<View>('client');
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('vuelti_admin') === 'true');
  const { toasts, show, dismiss } = useToasts();

  // Client view state
  const [clientScreen, setClientScreen] = useState<ClientScreen>('home');
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mandaditoOpen, setMandaditoOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('vuelti_admin');
    setIsAdmin(false);
    setView('client');
    show('Sesión cerrada', 'info');
  };

  const handleBusinessClick = (negocio: Negocio) => {
    setSelectedNegocio(negocio);
    setClientScreen('business');
  };

  const handleBackToHome = () => {
    setClientScreen('home');
    setSelectedNegocio(null);
  };

  const showBottomNav = view === 'client' || (view === 'admin' && isAdmin);
  const showCartButton = view === 'client' && clientScreen === 'business';

  return (
    <CartProvider>
      <div className="min-h-screen bg-navy-950 text-white antialiased">
        <ToastContainer toasts={toasts} onDismiss={dismiss} />

        {view === 'client' && (
          <>
            {clientScreen === 'home' && (
              <ClientView
                onBusinessClick={handleBusinessClick}
                onMandaditoClick={() => setMandaditoOpen(true)}
                onCartClick={() => setCartOpen(true)}
              />
            )}
            {clientScreen === 'business' && selectedNegocio && (
              <BusinessDetail
                negocio={selectedNegocio}
                onBack={handleBackToHome}
              />
            )}
          </>
        )}

        {view === 'admin' && (
          isAdmin ? (
            <AdminPanel onLogout={handleLogout} showToast={show} />
          ) : (
            <AdminLogin
              onBack={() => setView('client')}
              onLogin={() => setIsAdmin(true)}
              showToast={show}
            />
          )
        )}

        {/* Floating cart button on business detail */}
        {showCartButton && <FloatingCartButton onClick={() => setCartOpen(true)} />}

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} showToast={show} />
        <MandaditoModal open={mandaditoOpen} onClose={() => setMandaditoOpen(false)} showToast={show} />

        {showBottomNav && <BottomNav current={view} onChange={setView} />}
      </div>
    </CartProvider>
  );
}

import { useCart } from '@/lib/cart';
import { ShoppingCart } from 'lucide-react';

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { itemCount, lastAddedAt } = useCart();

  if (itemCount === 0) return null;

  return (
    <button
      key={lastAddedAt}
      onClick={onClick}
      className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-all active:scale-95 animate-slide-up"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
    >
      <ShoppingCart className="h-4 w-4 animate-cart-bounce" />
      Ver carrito ({itemCount})
    </button>
  );
}

export default App;
