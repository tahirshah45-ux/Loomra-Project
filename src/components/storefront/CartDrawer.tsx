import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import type { CartItem, Product, ColorVariant } from '../../types';

// Helper functions needed by CartDrawer
const hasValidImage = (product: Product | any): boolean => {
  const imgValue = product?.img;
  const imageUrlValue = (product as any)?.imageUrl;
  const mainImageValue = (product as any)?.mainImage;
  const colorImages = (product as any)?.colors;

  // Check main image fields
  if (imgValue && typeof imgValue === 'string' && imgValue.trim() !== '') return true;
  if (imageUrlValue && typeof imageUrlValue === 'string' && imageUrlValue.trim() !== '') return true;
  if (mainImageValue && typeof mainImageValue === 'string' && mainImageValue.trim() !== '') return true;

  // Check color variant images
  if (colorImages && Array.isArray(colorImages)) {
    for (const color of colorImages) {
      if (color?.images && Array.isArray(color.images) && color.images.length > 0) {
        const firstImage = color.images[0];
        if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
          return true;
        }
      }
    }
  }

  return false;
};

const getProductImage = (product: Product | any): string => {
  // Use colors[0].images[0] as primary (NO legacy fallback)
  const colorImagesArray = product?.colors?.[0]?.images?.[0];
  return colorImagesArray || '';
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  products: Product[];
  onAddToCart?: (product: Product, size: string, color: string, event?: React.MouseEvent) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  products,
  onAddToCart
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // ============================================================
  // COMPLETE YOUR LOOK - RECOMMENDATION ENGINE
  // ============================================================
  //
  // Business Rules (in order of execution):
  // 1. CATEGORY FLIP: If bag has Cap → recommend Tee, if Tee → recommend Cap
  // 2. COLOR PRIORITY:
  //    - Bag WHITE → recommend BLACK (priority), then RED (fallback)
  //    - Bag BLACK → recommend WHITE (priority), then RED (fallback)
  //    - Bag RED → recommend BLACK (priority), then WHITE (fallback)
  // 3. INVENTORY CHECK: Only recommend if variant stock > 0
  // 4. OWNERSHIP FILTER: Never recommend if already in bag (same product + color)
  //
  // Decision Tree:
  //   Get first item in bag → Determine target category →
  //   Get color priority list → Check each color in priority order:
  //     → Is variant in stock? (if no, next color)
  //     → Is already owned? (if yes, next color)
  //     → Return recommendation
  //   If no colors work, return null
  // ============================================================

  const getRecommendation = (bagItems: CartItem[], productList: Product[]): { product: Product; color: string } | null => {
    if (bagItems.length === 0) return null;

    // Get the primary item in the bag to base recommendation on
    const primaryItem = bagItems[0];

    // Find the source product to determine category
    const sourceProduct = productList.find(p => String(p.id) === String(primaryItem.productId));
    if (!sourceProduct) return null;

    // Step 1: CATEGORY FLIP
    const currentCategory = sourceProduct.category?.toUpperCase() || '';
    const isCap = currentCategory.includes('CAP');
    const targetCategory = isCap ? 'TEE' : 'CAP';

    // Step 2: COLOR PRIORITY (based on what's in the bag)
    const bagColor = primaryItem.color?.toLowerCase() || '';

    // Color priority map: bagColor → [priority1, priority2, fallback]
    const colorPriorityMap: Record<string, string[]> = {
      'white': ['black', 'red'],
      'black': ['white', 'red'],
      'red': ['black', 'white']
    };

    const priorityColors = colorPriorityMap[bagColor] || ['black', 'white', 'red'];

    // Get all products of the target category
    const targetProducts = productList.filter(p => {
      const cat = p.category?.toUpperCase() || '';
      return targetCategory === 'TEE' ? cat.includes('TEE') : cat.includes('CAP');
    });

    // Step 3 & 4: Check each priority color for validity (inventory + ownership)
    for (const targetColor of priorityColors) {
      for (const product of targetProducts) {
        // Find the color variant
        const variant = product.colors?.find((c: ColorVariant) =>
          c.name?.toLowerCase().includes(targetColor)
        );

        if (!variant) continue;

        // Step 3: INVENTORY CHECK - must have stock
        const hasStock = (product.stock || 0) > 0 ||
                         (product.sizeStock && Object.values(product.sizeStock).some((s: number) => (s || 0) > 0));
        if (!hasStock) continue;

        // Step 4: OWNERSHIP FILTER - check if user already has this product + color
        const alreadyOwned = bagItems.some(item =>
          String(item.productId) === String(product.id) &&
          item.color?.toLowerCase().includes(targetColor)
        );
        if (alreadyOwned) continue;

        // Found valid recommendation!
        return { product, color: variant.name || targetColor };
      }
    }

    // No valid recommendation found
    return null;
  };

  // Legacy compatibility wrapper
  const getRecommendedProduct = (): Product | null => {
    const recommendation = getRecommendation(items, products);
    return recommendation?.product || null;
  };

  // Get full recommendation with color
  const recommendation = getRecommendation(items, products);
  const recommendedProduct = recommendation?.product || null;
  const recommendedColor = recommendation?.color || 'Default';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingBag size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Your Bag ({items.length})</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-black/20" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-black/40">Your bag is empty</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-24 h-32 bg-black/5 rounded-2xl overflow-hidden flex-shrink-0 border border-black/5">
                        {item.img ? (
                        <img
                          src={item.img}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={item.name}
                          crossOrigin="anonymous"
                        />
                        ) : null}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-black uppercase tracking-tight leading-tight">{item.name}</h3>
                            <button onClick={() => onRemove(item.id)} className="text-black/20 hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">
                            {item.size} / {item.color}
                          </p>
                          <p className="text-sm font-black text-red-600">Rs. {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-black/10 rounded-full px-3 py-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:text-red-600 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:text-red-600 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Dynamic Recommendation Section - "Complete Your Look" */}
                  {recommendedProduct && (
                  <div className="pt-8 border-t border-black/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-6">Complete Your Look</h4>
                    <div
                      className="bg-black/5 p-4 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-black/10 transition-all"
                      onClick={() => {
                        if (onAddToCart) {
                          onAddToCart(recommendedProduct, 'M', recommendedColor);
                        }
                      }}
                    >
                      <div className="w-16 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                        {hasValidImage(recommendedProduct) && (
                        <img
                          src={getProductImage(recommendedProduct)}
                          className="w-full h-full object-cover"
                          alt={recommendedProduct.name}
                          crossOrigin="anonymous"
                        />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{recommendedProduct.name}</p>
                        <p className="text-[11px] font-black text-red-600">Rs. {recommendedProduct.price.toLocaleString()}</p>
                      </div>
                      <button
                        className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) {
                            onAddToCart(recommendedProduct, 'M', recommendedColor);
                          }
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-black/5 bg-neutral-50 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/40">
                    <span>Subtotal</span>
                    <span className="text-black">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/40">
                    <span>Shipping</span>
                    <span className="text-green-600">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-black/5">
                    <span className="text-sm font-black uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-red-600">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-[0.98]"
                >
                  Secure Checkout
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-black/20 uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  <span>Encrypted & Secure Payment</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;