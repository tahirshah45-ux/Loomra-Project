import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import {
  AdminContextType,
  Product,
  Order,
  Customer,
  GlobalSettings,
  LogisticsPartner,
  AISettings,
  SMTPSettings,
  AutomationRule,
  AutomationLog,
  AnnouncementSettings,
  HomeContentSettings,
  TeamMember,
  ApprovalRequest,
  MediaItem,
  Notification,
  AdminProfile,
  AdminTab,
  SettingsTab,
  UIState,
  ProductFormState,
  OrderManagementState,
  LogisticsState,
  AIAssistantState,
  SettingsState,
  SalesData,
  CategoryData,
  APIHealth,
  ConfirmModalState,
  OrderStatus,
  AutomationEvent
} from './types/admin.types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-toastify';

// Mock data for initial state
const MOCK_CUSTOMERS = [
  { id: '1', name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+923001234567', totalOrders: 5, totalSpent: 15000, lastOrderDate: '2024-01-15', status: 'Active' as const },
  { id: '2', name: 'Sara Ahmed', email: 'sara@example.com', phone: '+923001234568', totalOrders: 3, totalSpent: 9500, lastOrderDate: '2024-01-10', status: 'Active' as const },
];

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [settings, setSettings] = useState<GlobalSettings>({
    siteTitle: '',
    siteDescription: '',
    organizationName: '',
    organizationLogo: '',
    domain: '',
    whatsappNumber: '',
    whatsappEnabled: false,
    supportEmail: '',
    defaultShippingCost: 0,
    codEnabled: false,
    nfcEnabled: false,
    autoGenerateSeo: false,
    schemaMarkupEnabled: false,
    announcementBarText: '',
    announcementBarEnabled: false,
    firebaseApiKey: '',
    firebaseProjectId: ''
  });
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    apiKey: '',
    apiKeys: [],
    model: '',
    enabled: false
  });
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    email: '',
    password: '',
    enabled: false
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings>({
    enabled: false,
    heading: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image',
    ctaText: '',
    ctaLink: ''
  });
  const [homeContentSettings, setHomeContentSettings] = useState<HomeContentSettings>({
    heroImages: [],
    heroVideo: '',
    heroType: 'carousel',
    capsCategoryImage: '',
    teesCategoryImage: ''
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'New Order #8821', time: '2 mins ago', unread: true },
    { id: 2, title: 'New Order #8820', time: '15 mins ago', unread: true },
    { id: 3, title: 'Stock Alert: Monolith Cap', time: '1 hour ago', unread: false },
  ]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: 'Tahir Shah',
    email: 'tahirshah45@gmail.com',
    profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgG8EOUwqWCwcAxr6NT0G7PntLTbkWCivsh4Th5Xmub4ppfewCAo1X2euWq5iEMOdzGQjcSYwt5itfO3OXrL_SmtVlhZOYYSAtDKUPHklqLqCGoSKAEL9Dd28xRZmiIYgWvMC0K0vxQVQQPuiWTL2I3s-WjmQnOZGDtjC2t3YruWpONfvam8F3UOKpCRYnN_RHUDw3bxr4epsgKBO2LzMNP_d1AcIzOAB0GV8JnjO7ULdD2jeucPI2cptHNwV0QdCsw1Tzy6xiSNWf',
    password: '••••••••'
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');

  // UI state
  const [ui, setUI] = useState<UIState>({
    isSidebarOpen: false,
    isProfileDropdownOpen: false,
    isNotificationOpen: false,
    isSupportOpen: false,
    hasNewNotification: true,
    showDeleteModal: { show: false, productId: null },
    selectedProducts: [],
    isPrintingLabel: null,
    logoCropImage: null
  });

  // Form states
  const [productForm, setProductForm] = useState<ProductFormState>({
    isAddingProduct: false,
    editingProduct: null,
    newProduct: {
      name: '',
      category: 'CAPS',
      price: 0,
      description: '',
      img: '',
      images: [],
      colors: [],
      stock: 0,
      sizeStock: { S: 0, M: 0, L: 0, XL: 0 },
      sku: '',
      status: 'Active',
      tags: []
    },
    activeColorTab: 'Black',
    isGeneratingAI: false
  });

  const [orderManagement, setOrderManagement] = useState<OrderManagementState>({
    orderSearch: '',
    orderFilter: { city: 'All', status: 'All', payment: 'All' },
    selectedOrders: [],
    selectedOrder: null
  });

  const orderUpdateRef = useRef<Record<string, OrderStatus>>({});

  const [logistics, setLogistics] = useState<LogisticsState>({
    isAddingPartner: false,
    editingPartner: null,
    newPartner: {
      name: '',
      apiKey: '',
      apiUrl: '',
      status: 'Active'
    },
    isSavingPartner: false
  });

  const [aiAssistant, setAIAssistant] = useState<AIAssistantState>({
    aiMessages: [
      { role: 'assistant', content: "Hello Tahir! I've analyzed your store's performance for the last 24 hours. Sales are up by 15% compared to yesterday. Your 'Monolith Cap' is currently the most viewed item. How can I help you optimize your business today?" }
    ],
    currentAiInput: '',
    isAiTyping: false,
    aiAnalysisResult: null,
    isAnalyzing: false
  });

  const [settingsState, setSettingsState] = useState<SettingsState>({
    isSavingSmtp: false,
    isSavingAi: false,
    isSavingSeo: false,
    isSavingMaster: false
  });

  // Analytics data
  const [salesData] = useState<SalesData[]>([
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 18 },
    { name: 'Wed', sales: 2000, orders: 12 },
    { name: 'Thu', sales: 2780, orders: 19 },
    { name: 'Fri', sales: 1890, orders: 15 },
    { name: 'Sat', sales: 2390, orders: 21 },
    { name: 'Sun', sales: 3490, orders: 28 },
  ]);

  const [categoryData] = useState<CategoryData[]>([
    { name: 'Caps', value: 400 },
    { name: 'TEES', value: 300 },
    { name: 'Hoodies', value: 300 },
    { name: 'Accessories', value: 200 },
  ]);

  // API Health
  const [apiHealth, setApiHealth] = useState<APIHealth>({
    mainGateway: 0,
    supportAi: 0,
    database: 0,
    status: 'red',
    isConfigMissing: true
  });

  const [isSyncing, setIsSyncing] = useState<boolean | undefined>(false);

  // Current admin
  const [currentAdmin, setCurrentAdmin] = useState<TeamMember | { role: 'Owner'; name: string } | null>({
    role: 'Owner',
    name: 'Tahir Shah'
  });

  // Action handlers
  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const deleteProduct = (productId: string | number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const setOrderSearch = (search: string) => {
    setOrderManagement(prev => ({ ...prev, orderSearch: search }));
  };

  const setOrderFilter = (filter: OrderFilter) => {
    setOrderManagement(prev => ({ ...prev, orderFilter: filter }));
  };

  const setSelectedOrders = (selectedOrders: string[]) => {
    setOrderManagement(prev => ({ ...prev, selectedOrders }));
  };

  const setSelectedOrder = (selectedOrder: Order | null) => {
    setOrderManagement(prev => ({ ...prev, selectedOrder }));
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, description?: string, silent: boolean = false) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder || currentOrder.status === newStatus) return;

    if (orderUpdateRef.current[orderId] === newStatus) return;
    orderUpdateRef.current[orderId] = newStatus;

    try {
      const newTimelineEvent = {
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

          const eventMap: Record<OrderStatus, AutomationEvent | null> = {
            Pending: null,
            Confirmed: 'Order Confirmed',
            Cancelled: 'Order Cancelled',
            Packed: 'Order Packed',
            Shipped: 'Order Shipped',
            Delivered: 'Order Delivered',
            Returned: null
          };

          const event = eventMap[newStatus];
          if (event) {
            setTimeout(() => triggerAutomation(event, updatedOrder), 0);
          }

          return updatedOrder;
        }
        return o;
      }));

      if (orderManagement.selectedOrder?.id === orderId) {
        setOrderManagement(prev => ({
          ...prev,
          selectedOrder: prev.selectedOrder ? {
            ...prev.selectedOrder,
            status: newStatus,
            timeline: updatedTimeline,
            fulfillmentStatus
          } : null
        }));
      }

      if (!silent) {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Update Order Status Error:', err);
      if (!silent) {
        toast.error('Failed to update order status.');
      }
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const addLogisticsPartner = (partner: LogisticsPartner) => {
    setLogisticsPartners(prev => [...prev, partner]);
  };

  const updateLogisticsPartner = (partner: LogisticsPartner) => {
    setLogisticsPartners(prev => prev.map(p => p.id === partner.id ? partner : p));
  };

  const deleteLogisticsPartner = (partnerId: string) => {
    setLogisticsPartners(prev => prev.filter(p => p.id !== partnerId));
  };

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateAISettings = (newSettings: Partial<AISettings>) => {
    setAiSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateSMTPSettings = (newSettings: Partial<SMTPSettings>) => {
    setSmtpSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addAutomationRule = (rule: AutomationRule) => {
    setAutomationRules(prev => [...prev, rule]);
  };

  const updateAutomationRule = (rule: AutomationRule) => {
    setAutomationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };

  const deleteAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const updateAnnouncementSettings = (newSettings: Partial<AnnouncementSettings>) => {
    setAnnouncementSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateHomeContentSettings = (newSettings: Partial<HomeContentSettings>) => {
    setHomeContentSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addTeamMember = (member: TeamMember) => {
    setTeam(prev => [...prev, member]);
  };

  const updateTeamMember = (member: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === member.id ? member : m));
  };

  const deleteTeamMember = (memberId: string) => {
    setTeam(prev => prev.filter(m => m.id !== memberId));
  };

  const addApprovalRequest = (request: ApprovalRequest) => {
    setApprovalRequests(prev => [...prev, request]);
  };

  const updateApprovalRequest = (request: ApprovalRequest) => {
    setApprovalRequests(prev => prev.map(r => r.id === request.id ? request : r));
  };

  const triggerAutomation = (event: AutomationEvent, order: Order) => {
    const rules = automationRules.filter(r => r.enabled && r.event === event);

    rules.forEach(rule => {
      rule.actions.forEach(action => {
        const log = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          orderId: order.id,
          ruleId: rule.id,
          timestamp: new Date().toISOString(),
          action: action.type
        };

        setAutomationLogs(prev => [log, ...prev]);

        switch (action.type) {
          case 'Send Email':
            console.log(`[Automation] Sending ${action.value} email to ${order.customerName} for order ${order.id}`);
            break;
          case 'Update Status':
            if (action.value) {
              updateOrderStatus(order.id, action.value as OrderStatus, `Automation: ${rule.name}`, true);
            }
            break;
          case 'Add Note':
            if (action.value) {
              setOrders(prev => prev.map(o =>
                o.id === order.id ? { ...o, notes: o.notes ? `${o.notes}\n${action.value}` : action.value } : o
              ));
            }
            break;
          case 'Show WhatsApp Button':
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, showWhatsAppButton: true } : o));
            if (orderManagement.selectedOrder?.id === order.id) {
              setOrderManagement(prev => ({
                ...prev,
                selectedOrder: prev.selectedOrder ? { ...prev.selectedOrder, showWhatsAppButton: true } : null
              }));
            }
            break;
        }
      });
    });
  };

  const saveMasterSettings = async (data: {
    settings?: GlobalSettings;
    announcementSettings?: AnnouncementSettings;
    homeContentSettings?: HomeContentSettings;
    aiSettings?: AISettings;
    smtpSettings?: SMTPSettings;
    automationRules?: AutomationRule[];
  }) => {
    // Implementation will be moved from App.tsx
    console.log('Save master settings:', data);
    return null;
  };

  const runResilienceTest = async () => {
    // Implementation will be moved from App.tsx
    console.log('Run resilience test');
  };

  const testGeminiConnection = async () => {
    // Implementation will be moved from App.tsx
    console.log('Test Gemini connection');
  };

  const generateAIProductData = async (productName: string) => {
    // Implementation will be moved from App.tsx
    console.log('Generate AI product data for:', productName);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteRequest = async (targetType: 'Order' | 'TeamMember', targetId: string) => {
    // Implementation will be moved from App.tsx
    console.log('Handle delete request:', targetType, targetId);
  };

  const value: AdminContextType = {
    // Core data
    products,
    orders,
    customers,
    settings,
    logisticsPartners,
    aiSettings,
    smtpSettings,
    automationRules,
    automationLogs,
    announcementSettings,
    homeContentSettings,
    team,
    approvalRequests,
    mediaLibrary,
    notifications,
    adminProfile,

    // Navigation
    activeTab,
    settingsTab,

    // UI State
    ui,

    // Form States
    productForm,
    orderManagement,
    logistics,
    aiAssistant,
    settingsState,

    // Analytics
    salesData,
    categoryData,

    // API Health
    apiHealth,
    isSyncing,

    // Current admin
    currentAdmin,

    // Actions
    setActiveTab,
    setSettingsTab,
    addProduct,
    updateProduct,
    deleteProduct,
    setOrderSearch,
    setOrderFilter,
    setSelectedOrders,
    setSelectedOrder,
    updateOrderStatus,
    deleteOrder,
    addLogisticsPartner,
    updateLogisticsPartner,
    deleteLogisticsPartner,
    updateSettings,
    updateAISettings,
    updateSMTPSettings,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    updateAnnouncementSettings,
    updateHomeContentSettings,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addApprovalRequest,
    updateApprovalRequest,
    triggerAutomation,
    saveMasterSettings,
    runResilienceTest,
    testGeminiConnection,
    generateAIProductData,
    handlePrint,
    handleDeleteRequest
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminState = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminState must be used within an AdminProvider');
  }
  return context;
};