/**
 * Shop Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React from 'react';
import { Product, CartItem, Category, Order, GlobalSettings } from '../types';

interface ShopPageProps {
  currentPage: string;
  selectedProduct: Product | null;
  products: Product[];
  cartItems: CartItem[];
  tryOnItems: Product[];
  selectedCategory: Category;
  setPage: (page: string) => void;
  onNavigateToProduct: (product: Product) => void;
  toggleTryOnItem: (product: Product) => void;
  handleAddToCart: (product: Product, quantity: number, selectedColor?: any, selectedSize?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  setSelectedCategory: (category: Category) => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  triggerAutomation: (event: any, order: Order) => void;
  setIsTryOnOpen: (open: boolean) => void;
  settings: GlobalSettings;
  apiHealth: any;
  lastPlacedOrderId?: string;
}

// Note: The actual Shop component is imported from '../features/shop/Shop'
// This file provides the default export for the pages/index.ts barrel export
export default function ShopPage(props: ShopPageProps) {
  return null;
}
