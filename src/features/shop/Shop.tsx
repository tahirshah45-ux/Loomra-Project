import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopPage, ProductPage, CheckoutPage } from '../../pages';
import { SEO } from '../../components/SEO';
import { Product, GlobalSettings, Category, Order } from '../../types';

interface ShopProps {
  currentPage: string;
  selectedProduct: Product | null;
  products: Product[];
  cartItems: any[];
  tryOnItems: Product[];
  selectedCategory: Category;
  
  // Functions
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
  
  // Settings
  settings: GlobalSettings;
  apiHealth: any;
  lastPlacedOrderId?: string;
}

export const Shop: React.FC<ShopProps> = ({
  currentPage,
  selectedProduct,
  products,
  cartItems,
  tryOnItems,
  selectedCategory,
  setPage,
  onNavigateToProduct,
  toggleTryOnItem,
  handleAddToCart,
  updateCartQuantity,
  removeFromCart,
  setSelectedCategory,
  setOrders,
  triggerAutomation,
  setIsTryOnOpen,
  settings,
  apiHealth,
  lastPlacedOrderId,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* SHOP PAGE */}
        {currentPage === 'shop' && (
          <>
            <SEO
              data={{
                title: 'Shop All Products | Loomra Pakistan',
                description: 'Browse our full collection of minimal streetwear caps and tees. Made in Pakistan.',
                slug: '/shop',
                altText: 'Loomra Shop',
                keywords: ['shop streetwear', 'caps pakistan', 'tees pakistan'],
              }}
              settings={settings}
            />
            <ShopPage
              products={products}
              setPage={setPage}
              tryOnItems={tryOnItems}
              onToggleTryOn={toggleTryOnItem}
              onOpenTryOn={() => setIsTryOnOpen(true)}
              onNavigateToProduct={onNavigateToProduct}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </>
        )}

        {/* PRODUCT PAGE */}
        {currentPage === 'product' && selectedProduct && (
          <>
            <SEO data={selectedProduct.seo} settings={settings} />
            <ProductPage
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              setPage={setPage}
              tryOnItems={tryOnItems}
              onToggleTryOn={toggleTryOnItem}
              onOpenTryOn={() => setIsTryOnOpen(true)}
              products={products}
            />
          </>
        )}

        {/* CHECKOUT PAGE */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            setPage={setPage}
            products={products}
            cartItems={cartItems}
            setOrders={setOrders}
            triggerAutomation={triggerAutomation}
            apiHealth={apiHealth}
            setLastPlacedOrderId={(id: string) => {
              // Handle order placement
            }}
            onAddToCart={handleAddToCart}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Shop;
