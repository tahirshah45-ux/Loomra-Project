/**
 * Shop Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category } from '../types';
import { getProductImage, hasValidImage } from '@/lib/imageUtils';

interface ShopPageProps {
  products: Product[];
  setPage: (page: string) => void;
  tryOnItems: Product[];
  onToggleTryOn: (product: Product) => void;
  onOpenTryOn: () => void;
  onNavigateToProduct: (product: Product) => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

export default function ShopPage({
  products,
  setPage,
  tryOnItems,
  onToggleTryOn,
  onOpenTryOn,
  onNavigateToProduct,
  selectedCategory,
  setSelectedCategory
}: ShopPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'newest'>('newest');

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [products, selectedCategory, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const isInTryOn = (productId: string | number) => {
    return tryOnItems.some(item => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            {selectedCategory === 'ALL' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            {sortedProducts.length} Products
          </p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-200 text-sm uppercase placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 text-sm uppercase focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
          {(['ALL', 'CAPS', 'TEES'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  {/* Product Card */}
                  <button
                    onClick={() => onNavigateToProduct(product)}
                    className="w-full text-left"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                      {hasValidImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase">
                          No Image
                        </div>
                      )}
                      
                      {/* Sale Badge */}
                      {product.oldPrice && (
                        <div className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-bold px-2 py-1 uppercase">
                          Sale
                        </div>
                      )}
                      
                      {/* Try-On Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTryOn(product);
                          if (!isInTryOn(product.id)) {
                            onOpenTryOn();
                          }
                        }}
                        className={`absolute top-2 right-2 p-2 transition-all ${
                          isInTryOn(product.id)
                            ? 'bg-black text-white'
                            : 'bg-white/90 text-black opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </button>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-sm font-bold uppercase truncate mb-1 group-hover:text-brand-red transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            PKR {product.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {product.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 uppercase text-sm tracking-wide">
                No products found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
