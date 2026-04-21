/**
 * Product Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React from 'react';
import { Product, CartItem } from '../types';

interface ProductPageProps {
  setPage: (p: string) => void;
  product: Product | null;
  products: Product[];
  cartItems: CartItem[];
  handleAddToCart: (product: Product, quantity: number, selectedColor?: any, selectedSize?: string) => void;
  settings: any;
}

export default function ProductPage({
  setPage,
  product,
  products,
  cartItems,
  handleAddToCart,
  settings
}: ProductPageProps) {
  return null;
}
