import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Play } from 'lucide-react';
import { Product } from '../types';
import { hasValidImage, getProductImage } from '../lib/imageUtils';

const NFCVerifyPage = ({ setPage, products }: { setPage: (p: string) => void, products: Product[] }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthentic, setIsAuthentic] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Simulate NFC verification
    const timer = setTimeout(() => {
      setIsVerifying(false);
      setIsAuthentic(true);
      // Pick a random product for simulation
      setProduct(products[0]);
    }, 2500);
    return () => clearTimeout(timer);
  }, [products]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Editorial Video / Image */}
      <div className="absolute inset-0 opacity-40 grayscale pointer-events-none">
        <img
          src="https://picsum.photos/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover"
          alt="Editorial Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-8"
            >
              <div className="w-32 h-32 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Verifying NFC Tag</h2>
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/40 animate-pulse">Establishing Secure Blockchain Connection...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="authentic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,0,0,0.4)]">
                  <ShieldCheck size={48} className="text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-red mb-2">Loomra Authenticity Protocol</span>
                <h2 className="text-6xl font-black tracking-tighter uppercase">Verified Authentic</h2>
              </div>

              {product && hasValidImage(product) && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 text-left">
                  <div className="w-40 h-48 bg-black/20 overflow-hidden rounded-2xl flex-shrink-0">
                    <img
                      src={getProductImage(product)}
                      className="w-full h-full object-cover"
                      alt={product.name}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black tracking-tight uppercase mb-2">{product.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Serial: LMR-NFC-88291-PK</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">Drop</p>
                        <p className="text-xs font-bold uppercase text-black">THE ORIGIN</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">Origin</p>
                        <p className="text-xs font-bold uppercase">Pakistan</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Exclusive Editorial Content</h4>
                <div className="aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 group relative cursor-pointer">
                  <img
                    src="https://picsum.photos/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    alt="Editorial Video"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl group-hover:bg-brand-red group-hover:text-white transition-all">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Behind the Scenes</p>
                    <p className="text-sm font-black uppercase tracking-tight">The Making of Archive 01</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPage('home')}
                className="px-12 py-5 bg-white text-black font-display text-xs uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-2xl"
              >
                Enter Loomra Store
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 vertical-text hidden md:block">
        AUTHENTICITY GUARANTEED
      </div>
      <div className="absolute bottom-10 right-10 text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 vertical-text hidden md:block">
        LOOMRA PAKISTAN
      </div>
    </div>
  );
};

export default NFCVerifyPage;