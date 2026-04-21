/**
 * Admin Panel Types
 * Type definitions specific to the AdminPanel component and its functionality
 */

// Re-export core types from main types file
export type {
  Product,
  Order,
  OrderStatus,
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
  APIKeyConfig,
  ColorVariant,
  SEOData,
  CartItem,
  TimelineEvent,
  AutomationEvent,
  AutomationActionType,
  AutomationAction,
  FlyingItem
} from '../../types';

// --- Admin Panel Specific Types ---

// Tab navigation types
export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'automation'
  | 'logistics'
  | 'ai-assistant'
  | 'seo'
  | 'team'
  | 'settings'
  | 'ai-settings'
  | 'smtp'
  | 'media-library'
  | 'profile'
  | 'home-management';

export type SettingsTab = 'general' | 'seo' | 'automation' | 'team' | 'marketing';

// Media library types
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  sku?: string;
}

// Customer types (for admin)
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
}

// Admin profile types
export interface AdminProfile {
  name: string;
  email: string;
  profilePicture: string;
  password: string;
}

// Order filter types
export interface OrderFilter {
  city: string;
  status: OrderStatus | 'All' | 'Unconfirmed';
  payment: string;
}

// AI Message types
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Confirmation modal types
export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// Product form state types
export interface ProductFormState {
  isAddingProduct: boolean;
  editingProduct: Product | null;
  newProduct: Partial<Product>;
  activeColorTab: 'Black' | 'White' | 'Red';
  isGeneratingAI: boolean;
}

// Order management state types
export interface OrderManagementState {
  orderSearch: string;
  orderFilter: OrderFilter;
  selectedOrders: string[];
  selectedOrder: Order | null;
}

// Logistics state types
export interface LogisticsState {
  isAddingPartner: boolean;
  editingPartner: LogisticsPartner | null;
  newPartner: Partial<LogisticsPartner>;
  isSavingPartner: boolean;
}

// AI Assistant state types
export interface AIAssistantState {
  aiMessages: AIMessage[];
  currentAiInput: string;
  isAiTyping: boolean;
  aiAnalysisResult: string | null;
  isAnalyzing: boolean;
}

// Settings state types
export interface SettingsState {
  isSavingSmtp: boolean;
  isSavingAi: boolean;
  isSavingSeo: boolean;
  isSavingMaster: boolean;
}

// UI state types
export interface UIState {
  isSidebarOpen: boolean;
  isProfileDropdownOpen: boolean;
  isNotificationOpen: boolean;
  isSupportOpen: boolean;
  hasNewNotification: boolean;
  showDeleteModal: { show: boolean; productId: string | number | 'bulk' | null };
  selectedProducts: (string | number)[];
  isPrintingLabel: Product | null;
  logoCropImage: string | null;
}

// Bulk operations types
export interface BulkOperation {
  type: 'delete' | 'update_status' | 'export';
  targetIds: (string | number)[];
}

// Analytics data types
export interface SalesData {
  name: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

// API Health types
export interface APIHealth {
  mainGateway: number;
  supportAi: number;
  database: number;
  status: 'green' | 'yellow' | 'red';
  isConfigMissing: boolean;
}

// Admin Context types
export interface AdminContextType {
  // Core data
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: GlobalSettings;
  logisticsPartners: LogisticsPartner[];
  aiSettings: AISettings;
  smtpSettings: SMTPSettings;
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  announcementSettings: AnnouncementSettings;
  homeContentSettings: HomeContentSettings;
  team: TeamMember[];
  approvalRequests: ApprovalRequest[];
  mediaLibrary: MediaItem[];
  notifications: Notification[];
  adminProfile: AdminProfile;

  // Navigation
  activeTab: AdminTab;
  settingsTab: SettingsTab;

  // UI State
  ui: UIState;

  // Form States
  productForm: ProductFormState;
  orderManagement: OrderManagementState;
  logistics: LogisticsState;
  aiAssistant: AIAssistantState;
  settingsState: SettingsState;

  // Analytics
  salesData: SalesData[];
  categoryData: CategoryData[];

  // API Health
  apiHealth: APIHealth;
  isSyncing?: boolean;

  // Current admin
  currentAdmin: TeamMember | { role: 'Owner'; name: string } | null;

  // Actions
  setActiveTab: (tab: AdminTab) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string | number) => void;
  setOrderSearch: (search: string) => void;
  setOrderFilter: (filter: OrderFilter) => void;
  setSelectedOrders: (selectedOrders: string[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, description?: string, silent?: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => void;
  addLogisticsPartner: (partner: LogisticsPartner) => void;
  updateLogisticsPartner: (partner: LogisticsPartner) => void;
  deleteLogisticsPartner: (partnerId: string) => void;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateSMTPSettings: (settings: Partial<SMTPSettings>) => void;
  addAutomationRule: (rule: AutomationRule) => void;
  updateAutomationRule: (rule: AutomationRule) => void;
  deleteAutomationRule: (ruleId: string) => void;
  updateAnnouncementSettings: (settings: Partial<AnnouncementSettings>) => void;
  updateHomeContentSettings: (settings: Partial<HomeContentSettings>) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;
  addApprovalRequest: (request: ApprovalRequest) => void;
  updateApprovalRequest: (request: ApprovalRequest) => void;
  triggerAutomation: (event: AutomationEvent, order: Order) => void;
  saveMasterSettings: (data: {
    settings?: GlobalSettings;
    announcementSettings?: AnnouncementSettings;
    homeContentSettings?: HomeContentSettings;
    aiSettings?: AISettings;
    smtpSettings?: SMTPSettings;
    automationRules?: AutomationRule[];
  }) => Promise<APIHealth | null | undefined>;
  runResilienceTest: () => Promise<void>;
  testGeminiConnection: () => Promise<void>;
  generateAIProductData: (productName: string) => Promise<void>;
  handlePrint: () => void;
  handleDeleteRequest: (targetType: 'Order' | 'TeamMember', targetId: string) => Promise<void>;
}

// Props for AdminPanel component
export interface AdminPanelProps {
  setPage: (p: string) => void;
  setIsAdminAuthenticated: (a: boolean) => void;
}