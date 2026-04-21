/**
 * Product Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ColorVariant } from '../types';
import { getProductImage, hasValidImage } from '@/lib/imageUtils';

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedColor?: any, selectedSize?: string) => void;
  setPage: (page: string) => void;
  tryOnItems: Product[];
  onToggleTryOn: (product: Product) => void;
  onOpenTryOn: () => void;
  products: Product[];
}

export default function ProductPage({
  product,
  onAddToCart,
  setPage,
  tryOnItems,
  onToggleTryOn,
  onOpenTryOn,
  products
}: ProductPageProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAdded, setShowAdded] = useState(false);

  const selectedColor = product.colors?.[selectedColorIndex];

  // Get available images based on selected color
  const productImages = useMemo(() => {
    const images: string[] = [];
    if (product.img) images.push(product.img);
    if (product.images) images.push(...product.images.filter(Boolean));
    if (selectedColor?.images) images.push(...selectedColor.images.filter(Boolean));
    return images.length > 0 ? images : ['https://picsum.photos/800/1000'];
  }, [product, selectedColor]);

  const currentImage = productImages[selectedImageIndex] || productImages[0];

  // Check if product is in try-on
  const isInTryOn = tryOnItems.some(item => item.id === product.id);

  // Handle add to cart
  const handleAddToCartClick = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart(product, quantity, selectedColor, selectedSize);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4">
        <button
          onClick={() => setPage('shop')}
          className="flex items-center gap-2 text-sm uppercase tracking-wide hover:text-brand-red transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-6 py-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[3/4] bg-gray-100 overflow-hidden"
            >
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Sale Badge */}
              {product.oldPrice && (
                <div className="absolute top-4 left-4 bg-brand-red text-white text-xs font-bold px-3 py-1 uppercase">
                  Sale
                </div>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 bg-gray-100 overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    PKR {product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Color: {selectedColor?.name || 'Select'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColorIndex(index)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColorIndex === index
                          ? 'border-black scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizeStock && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Size: {selectedSize || 'Select'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(Object.keys(product.sizeStock) as Array<keyof typeof product.sizeStock>).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={product.sizeStock[size] === 0}
                      className={`w-12 h-12 border-2 font-bold text-sm uppercase transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : product.sizeStock[size] === 0
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wide block mb-3">
                Quantity
              </span>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-10 flex items-center justify-center border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCartClick}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                showAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-brand-red'
              }`}
            >
              {showAdded ? 'Added to Cart!' : 'Add to Cart'}
            </motion.button>

            {/* Try-On Button */}
            <button
              onClick={() => {
                onToggleTryOn(product);
                if (!isInTryOn) {
                  onOpenTryOn();
                }
              }}
              className={`w-full py-4 text-sm font-bold uppercase tracking-widest border-2 transition-colors ${
                isInTryOn
                  ? 'border-black bg-black text-white'
                  : 'border-black hover:bg-black hover:text-white'
              }`}
            >
              {isInTryOn ? 'In Try-On Room' : 'Add to Try-On Room'}
            </button>

            {/* Product Details */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wide mb-4">
                Product Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">SKU</span>
                  <span className="font-mono">{product.sku}</span>
                </div>
                {product.stock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Availability</span>
                    <span>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="px-6 py-12 border-t border-gray-100">
          <h2 className="text-xl font-black uppercase mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 4)
              .map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => {
                    // Navigate to related product
                    window.location.reload();
                  }}
                  className="text-left group"
                >
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2">
                    {hasValidImage(relatedProduct) ? (
                      <img
                        src={getProductImage(relatedProduct)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold uppercase truncate group-hover:text-brand-red transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm">PKR {relatedProduct.price.toLocaleString()}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
