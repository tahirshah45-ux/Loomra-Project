import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { Product, CartItem, FlyingItem, GlobalSettings, AnnouncementSettings, HomeContentSettings, AISettings, SMTPSettings, AutomationRule, Order, OrderStatus, AutomationEvent, AutomationLog, TimelineEvent } from '../types';
import { doc, setDoc, updateDoc, writeBatch, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseStoreActionsProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setFlyingItems: React.Dispatch<React.SetStateAction<FlyingItem[]>>;
  setIsCartPulsing: React.Dispatch<React.SetStateAction<boolean>>;
  tryOnItems: Product[];
  setTryOnItems: React.Dispatch<React.SetStateAction<Product[]>>;
  setPage: (page: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  settings: GlobalSettings;
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  announcementSettings: AnnouncementSettings;
  setAnnouncementSettings: React.Dispatch<React.SetStateAction<AnnouncementSettings>>;
  homeContentSettings: HomeContentSettings;
  setHomeContentSettings: React.Dispatch<React.SetStateAction<HomeContentSettings>>;
  aiSettings: AISettings;
  setAiSettings: React.Dispatch<React.SetStateAction<AISettings>>;
  smtpSettings: SMTPSettings;
  setSmtpSettings: React.Dispatch<React.SetStateAction<SMTPSettings>>;
  automationRules: AutomationRule[];
  setAutomationRules: React.Dispatch<React.SetStateAction<AutomationRule[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  selectedOrder: Order | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  setAutomationLogs: React.Dispatch<React.SetStateAction<AutomationLog[]>>;
  apiHealth: { status: string, isConfigMissing: boolean };
  orderUpdateRef: React.MutableRefObject<Record<string, OrderStatus>>;
}

export const useStoreActions = ({
  cartItems,
  setCartItems,
  setFlyingItems,
  setIsCartPulsing,
  tryOnItems,
  setTryOnItems,
  setPage,
  setSelectedProduct,
  settings,
  setSettings,
  announcementSettings,
  setAnnouncementSettings,
  homeContentSettings,
  setHomeContentSettings,
  aiSettings,
  setAiSettings,
  smtpSettings,
  setSmtpSettings,
  automationRules,
  setAutomationRules,
  orders,
  setOrders,
  selectedOrder,
  setSelectedOrder,
  setAutomationLogs,
  apiHealth,
  orderUpdateRef
}: UseStoreActionsProps) => {

  const handleAddToCart = useCallback((product: Product, size: string, color: string, event?: React.MouseEvent) => {
    // FIX: Check sizeStock first, fall back to total stock if sizeStock is all zeros
    const sizeStockValue = product.sizeStock[size as keyof typeof product.sizeStock] || 0;
    const totalSizeStock = Object.values(product.sizeStock).reduce((sum, val) => sum + (val || 0), 0);
    // If sizeStock has no values but total stock exists, allow adding to cart
    const effectiveStock = totalSizeStock === 0 && (product.stock || 0) > 0 ? (product.stock || 0) : sizeStockValue;

    if (effectiveStock <= 0) {
      toast.error('SORRY, THIS SIZE IS OUT OF STOCK');
      return;
    }

    // Animation logic
    if (event) {
      const newItem: FlyingItem = {
        id: Date.now(),
        x: event.clientX,
        y: event.clientY,
        img: product.img
      };
      setFlyingItems(prev => [...prev, newItem]);

      // Remove item after animation
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
        setIsCartPulsing(true);
        setTimeout(() => setIsCartPulsing(false), 500);
      }, 1000);
    }

    // FIX: Create a stable cart item key based on productId, size, and color
    // This key is used to detect duplicates and merge them into a single line item
    const cartItemKey = `${product.id}-${size}-${color}`;

    // Check if the same product (same ID, size, and color) already exists in cart
    const existingItemIndex = cartItems.findIndex(
      item => `${item.productId}-${item.size}-${item.color}` === cartItemKey
    );

    if (existingItemIndex >= 0) {
      // Item exists - increment quantity instead of adding duplicate
      setCartItems(prev => prev.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success('ADDED TO BAG (Quantity updated)', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      // New item - add to cart with stable ID based on productId, size, color
      const newItem: CartItem = {
        id: cartItemKey, // Stable ID: "productId-size-color"
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size,
        color,
        img: product.img
      };
      setCartItems(prev => [...prev, newItem]);
      toast.success('ADDED TO BAG', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [cartItems, setCartItems, setFlyingItems, setIsCartPulsing]);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  }, [setCartItems]);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.info('REMOVED FROM BAG');
  }, [setCartItems]);

  const toggleTryOnItem = useCallback((product: Product) => {
    setTryOnItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  }, [setTryOnItems]);

  const navigateToProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setPage('product');
    window.scrollTo(0, 0);
  }, [setSelectedProduct, setPage]);

  const handleSaveMasterSettings = useCallback(async (data: {
    settings?: GlobalSettings,
    announcementSettings?: AnnouncementSettings,
    homeContentSettings?: HomeContentSettings,
    aiSettings?: AISettings,
    smtpSettings?: SMTPSettings,
    automationRules?: AutomationRule[]
  }) => {
    // Update local states first
    if (data.settings) setSettings(data.settings);
    if (data.announcementSettings) setAnnouncementSettings(data.announcementSettings);
    if (data.homeContentSettings) setHomeContentSettings(data.homeContentSettings);
    if (data.aiSettings) setAiSettings(data.aiSettings);
    if (data.smtpSettings) setSmtpSettings(data.smtpSettings);
    if (data.automationRules) setAutomationRules(data.automationRules);

    // Persist to localStorage
    const currentSettings = {
      settings: data.settings || settings,
      announcementSettings: data.announcementSettings || announcementSettings,
      homeContentSettings: data.homeContentSettings || homeContentSettings,
      aiSettings: data.aiSettings || aiSettings,
      smtpSettings: data.smtpSettings || smtpSettings,
      automationRules: data.automationRules || automationRules
    };

    localStorage.setItem('loomra_master_settings', JSON.stringify(currentSettings));

    // Sync with Firestore
    const firebaseApiKey = data.settings?.firebaseApiKey;
    const firebaseProjectId = data.settings?.firebaseProjectId;

    // Now try to sync
    try {
      // Sync AI Settings (Gemini API Key)
      if (data.aiSettings) {
        const geminiKey = data.aiSettings.apiKey;
        if (geminiKey) {
          await setDoc(doc(db, 'system_configs', 'GEMINI_API_KEY'), {
            key_name: 'GEMINI_API_KEY',
            value: geminiKey,
            updated_at: new Date().toISOString()
          });
        }
      }

      // Sync Firebase Config
      if (firebaseApiKey && firebaseProjectId) {
        await setDoc(doc(db, 'system_configs', 'VITE_FIREBASE_API_KEY'), {
          key_name: 'VITE_FIREBASE_API_KEY',
          value: firebaseApiKey,
          updated_at: new Date().toISOString()
        });
        await setDoc(doc(db, 'system_configs', 'VITE_FIREBASE_PROJECT_ID'), {
          key_name: 'VITE_FIREBASE_PROJECT_ID',
          value: firebaseProjectId,
          updated_at: new Date().toISOString()
        });
      }

      // Sync Organization Logo
      if (data.settings?.organizationLogo) {
        await setDoc(doc(db, 'system_configs', 'ORGANIZATION_LOGO'), {
          key_name: 'ORGANIZATION_LOGO',
          value: data.settings.organizationLogo,
          updated_at: new Date().toISOString()
        });
      }

      // Sync Marketing Hero Images
      if (data.homeContentSettings) {
        const heroImages = data.homeContentSettings.heroImages;
        const batch = writeBatch(db);

        // Delete existing
        const marketingSnapshot = await getDocs(collection(db, 'marketing_hero'));
        marketingSnapshot.forEach((d) => {
          batch.delete(d.ref);
        });

        // Insert new
        console.log("SENDING TO FIRESTORE (marketing_hero):", heroImages);
        heroImages.forEach((url, index) => {
          const newDocRef = doc(collection(db, 'marketing_hero'));
          batch.set(newDocRef, {
            image_url: url,
            display_order: index,
            is_active: true,
            created_at: new Date().toISOString()
          });
        });

        await batch.commit()
          .catch((error) => console.error("FIRESTORE ERROR (marketing_hero):", error));
      }

      toast.success('Settings saved and synced to cloud!');
    } catch (error) {
      console.error('Settings sync error:', error);
      toast.error('Settings saved locally, but sync to cloud failed.');
    }
  }, [settings, announcementSettings, homeContentSettings, aiSettings, smtpSettings, automationRules, setSettings, setAnnouncementSettings, setHomeContentSettings, setAiSettings, setSmtpSettings, setAutomationRules]);

  const triggerAutomation = useCallback((event: AutomationEvent, order: Order) => {
    const rules = automationRules.filter(r => r.enabled && r.event === event);

    rules.forEach(rule => {
      rule.actions.forEach(action => {
        // Log the action
        const log: AutomationLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          orderId: order.id,
          ruleId: rule.id,
          timestamp: new Date().toISOString(),
          action: action.type
        };
        setAutomationLogs(prev => [log, ...prev]);

        // Execute action
        switch (action.type) {
          case 'Send Email':
            console.log(`[Automation] Sending ${action.value} email to ${order.customerName} for order ${order.id}`);
            // In a real app, this would call an API with smtpSettings
            break;
          case 'Update Status':
            if (action.value) {
              updateOrderStatus(order.id, action.value as OrderStatus, `Automation: ${rule.name}`, true);
            }
            break;
          case 'Add Note':
            if (action.value) {
              setOrders(prev => prev.map(o =>
                o.id === order.id
                  ? { ...o, notes: o.notes ? `${o.notes}\n${action.value}` : action.value }
                  : o
              ));
            }
            break;
          case 'Show WhatsApp Button':
            console.log(`[Automation] WhatsApp Button triggered for order ${order.id}`);
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, showWhatsAppButton: true } : o));
            if (selectedOrder?.id === order.id) {
              setSelectedOrder(prev => prev ? { ...prev, showWhatsAppButton: true } : null);
            }
            break;
        }
      });
    });
  }, [automationRules, setAutomationLogs, setOrders, selectedOrder, setSelectedOrder]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus, description?: string, silent: boolean = false) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder || currentOrder.status === newStatus) return;

    // Prevent duplicate toasts for the same status update
    if (orderUpdateRef.current[orderId] === newStatus) return;
    orderUpdateRef.current[orderId] = newStatus;

    try {
      const newTimelineEvent: TimelineEvent = {
        status: newStatus,
        date: new Date().toISOString(),
        description: description || `Order status updated to ${newStatus}`
      };

      const updatedTimeline = [...currentOrder.timeline, newTimelineEvent];
      const fulfillmentStatus = newStatus === 'Delivered' ? 'Fulfilled' : currentOrder.fulfillmentStatus;

      if (apiHealth.status !== 'red') {
        await updateDoc(doc(db, 'orders', orderId), {
          status: newStatus,
          timeline: updatedTimeline,
          fulfillment_status: fulfillmentStatus
        });
      }

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = {
            ...o,
            status: newStatus,
            timeline: updatedTimeline,
            fulfillmentStatus
          };

          // Trigger automation for the new status
          const eventMap: Record<OrderStatus, AutomationEvent | null> = {
            'Pending': null,
            'Confirmed': 'Order Confirmed',
            'Cancelled': 'Order Cancelled',
            'Packed': 'Order Packed',
            'Shipped': 'Order Shipped',
            'Delivered': 'Order Delivered',
            'Returned': null
          };
          const event = eventMap[newStatus];
          if (event) {
            setTimeout(() => triggerAutomation(event, updatedOrder), 0);
          }

          return updatedOrder;
        }
        return o;
      }));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          status: newStatus,
          timeline: updatedTimeline,
          fulfillmentStatus
        } : null);
      }

      if (!silent) {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Update Order Status Error:", err);
      if (!silent) {
        toast.error("Failed to update order status.");
      }
    }
  }, [orders, orderUpdateRef, apiHealth.status, setOrders, selectedOrder, setSelectedOrder, triggerAutomation]);

  return {
    handleAddToCart,
    updateCartQuantity,
    removeFromCart,
    toggleTryOnItem,
    navigateToProduct,
    handleSaveMasterSettings,
    triggerAutomation,
    updateOrderStatus
  };
};