import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, User, ShoppingBag } from 'lucide-react';
import type { Page, GlobalSettings } from '../../types';

interface NavigationProps {
  setPage: (p: Page) => void;
  onOpenSidebar: () => void;
  settings: GlobalSettings;
  onOpenCart: () => void;
  cartCount: number;
  currentPage: Page;
  isCartPulsing: boolean;
}

export const Header = ({ setPage, onOpenSidebar, settings, onOpenCart, cartCount, currentPage, isCartPulsing }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  const handleLogoTap = () => {
    setAdminTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setTimeout(() => setPage('5492526'), 0);
        return 0;
      }
      return next;
    });
    setPage('home');
    setTimeout(() => setAdminTapCount(0), 3000);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center px-6 h-16 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar}
            className="text-brand-red hover:opacity-70 transition-opacity scale-95 active:scale-90 transition-transform"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setPage('account')}
            className={`text-brand-red hover:opacity-70 transition-opacity scale-95 active:scale-90 transition-transform ${currentPage === 'account' ? 'text-brand-red' : ''}`}
          >
            <User size={24} strokeWidth={1.5} />
          </button>
        </div>
        <button 
          onClick={handleLogoTap}
          className="flex items-center justify-center"
        >
          {settings.organizationLogo ? (
            <img src={settings.organizationLogo} className="h-6 md:h-8 object-contain" alt={settings.organizationName} />
          ) : (
            <span className="text-2xl font-black tracking-[-0.04em] text-black dark:text-white uppercase font-display">
              {settings.organizationName}
            </span>
          )}
        </button>
        <motion.button 
          id="cart-icon-button"
          onClick={onOpenCart}
          animate={isCartPulsing ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-brand-red hover:opacity-70 transition-opacity scale-95 active:scale-90 transition-transform relative"
        >
          <ShoppingBag size={24} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

// Re-export as default for backward compatibility
export default Header;
