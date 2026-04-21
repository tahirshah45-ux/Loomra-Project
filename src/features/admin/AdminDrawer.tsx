import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const AdminDrawer = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  icon: Icon 
}: AdminDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
          />
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[151] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-[#b30400]">
                    {Icon}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#1c1b1b]">{title}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Admin Panel</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-neutral-50 rounded-2xl transition-all group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
