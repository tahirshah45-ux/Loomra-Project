import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from '../../layout/Navigation';
import Footer from '../../layout/Footer';
import CartDrawer from '../CartDrawer';
import AuthModals from '../AuthModals';
import type { Settings, UserProfile, Order, Product, CartItem } from '../../types';

interface PageLayoutProps {
  children: React.ReactNode;
  page: string;
  settings: Settings;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  orders: Order[];
  setPage: (page: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  updateCartQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  products: Product[];
  handleAddToCart: (product: Product, size?: string, color?: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  cartCount: number;
  isCartPulsing: boolean;
  announcementBar?: React.ReactNode;
  flyingItems?: any[];
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  page,
  settings,
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  orders,
  setPage,
  isCartOpen,
  setIsCartOpen,
  cartItems,
  updateCartQuantity,
  removeFromCart,
  products,
  handleAddToCart,
  isAuthModalOpen,
  setIsAuthModalOpen,
  cartCount,
  isCartPulsing,
  announcementBar,
  flyingItems = []
}) => {
  return (
    <div className="min-h-screen bg-white font-body text-black selection:bg-black selection:text-white max-w-[100vw] overflow-x-hidden">
      {/* Announcement Bar */}
      {announcementBar}

      {/* Navigation */}
      {page !== '5492526' && page !== 'checkout' && (
        <Navigation
          setPage={setPage}
          onOpenSidebar={() => {}} // This will be handled by parent
          settings={settings}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartCount}
          currentPage={page}
          isCartPulsing={isCartPulsing}
        />
      )}

      {/* Flying Items Animation Layer */}
      <AnimatePresence>
        {flyingItems.map(item => (
          <motion.div
            key={item.id}
            initial={{
              position: 'fixed',
              left: item.x - 25,
              top: item.y - 25,
              width: 50,
              height: 50,
              zIndex: 9999,
              opacity: 1,
              scale: 1,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
            animate={{
              left: window.innerWidth - 60,
              top: 30,
              opacity: 0,
              scale: 0.2,
              rotate: 360
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              ease: [0.23, 1, 0.32, 1], // Bouncy curve
            }}
          >
            <img src={item.img} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setPage('checkout');
        }}
        products={products}
        onAddToCart={handleAddToCart}
      />

      {/* Auth Modals */}
      <AuthModals
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        setUsers={setUsers}
        orders={orders}
        setPage={setPage}
      />

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {page !== '5492526' && page !== 'checkout' && (
        <Footer setPage={setPage} setIsChatOpen={() => {}} settings={settings} />
      )}
    </div>
  );
};

export default PageLayout;