/**
 * Home Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, HomeContentSettings } from '../types';

interface HomePageProps {
  setPage: (p: string) => void;
  homeContentSettings: HomeContentSettings;
  products: Product[];
  onNavigateToProduct: (product: Product) => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

export default function HomePage({
  setPage,
  homeContentSettings,
  products,
  onNavigateToProduct,
  selectedCategory,
  setSelectedCategory
}: HomePageProps) {
  // Get featured products (first 4)
  const featuredProducts = products.slice(0, 4);
  
  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background - Hero Image/Carousel */}
            {homeContentSettings.heroType === 'video' && homeContentSettings.heroVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src={homeContentSettings.heroVideo}
              />
            ) : (
              <div className="absolute inset-0 bg-black">
                {homeContentSettings.heroImages?.[0] ? (
                  <img
                    src={homeContentSettings.heroImages[0]}
                    alt="Hero"
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white mb-4">
                        LOOMRA
                      </h1>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-white/60">
                        Minimal Streetwear from Pakistan
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
            
            {/* Hero Content */}
            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-red mb-4">
                  New Collection
                </h2>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-8">
                  The Origin
                </h1>
                <button
                  onClick={() => setPage('shop')}
                  className="px-10 py-4 bg-white text-black font-display text-xs uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all"
                >
                  Shop Now
                </button>
              </motion.div>
            </div>
          </section>

          {/* Category Quick Links */}
          <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Caps Category */}
                <button
                  onClick={() => {
                    setSelectedCategory('CAPS');
                    setPage('shop');
                  }}
                  className="relative aspect-[4/5] overflow-hidden group"
                >
                  <img
                    src={homeContentSettings.capsCategoryImage || 'https://picsum.photos/photo-1588850561407-ed78c282e9b5?auto=format&fit=crop&q=80&w=800'}
                    alt="Caps"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-8 left-8 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 block">
                      Category
                    </span>
                    <span className="text-3xl font-black uppercase text-white">
                      Caps
                    </span>
                  </div>
                </button>

                {/* Tees Category */}
                <button
                  onClick={() => {
                    setSelectedCategory('TEES');
                    setPage('shop');
                  }}
                  className="relative aspect-[4/5] overflow-hidden group"
                >
                  <img
                    src={homeContentSettings.teesCategoryImage || 'https://picsum.photos/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'}
                    alt="Tees"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-8 left-8 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2 block">
                      Category
                    </span>
                    <span className="text-3xl font-black uppercase text-white">
                      Tees
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Featured Products Preview */}
          <section className="py-20 px-6 bg-black">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-red mb-2">
                    Featured
                  </h2>
                  <h3 className="text-4xl font-black uppercase text-white">
                    New Arrivals
                  </h3>
                </div>
                <button
                  onClick={() => setPage('shop')}
                  className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product: Product, index: number) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onNavigateToProduct(product)}
                    className="text-left group"
                  >
                    <div className="aspect-[3/4] bg-white/5 overflow-hidden mb-4">
                      <img
                        src={product.img || product.images?.[0] || 'https://picsum.photos/400/500'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="text-sm font-bold uppercase text-white truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-white/60">
                      PKR {product.price.toLocaleString()}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
