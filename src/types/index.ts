/**
 * Loomra Types
 * All type definitions for the application
 */

// --- Page Navigation ---
export type Page = 'home' | 'shop' | 'about' | 'track' | 'affiliate' | 'product' | 'checkout' | 'success' | '5492526' | 'blog' | 'nfc-verify' | 'privacy' | 'shipping' | 'return' | 'verify' | 'account';
export type Category = 'ALL' | 'CAPS' | 'TEES';

// --- User & Authentication ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
}

export type TeamRole = 'Admin' | 'Manager' | 'Support' | 'Editor' | 'Owner';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: TeamRole;
  permissions: string[];
  status: 'Active' | 'Inactive';
  profilePicture?: string;
  lastActive?: string;
}

// --- Products ---
export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
  isActive: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  slug: string;
  altText: string;
  keywords: string[];
  image?: string; // For Open Graph image preview
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  img: string;
  images: string[];
  videoUrl?: string;
  description: string;
  colors: ColorVariant[];
  seo: SEOData;
  stock: number;
  sizeStock: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
  sku: string;
  status: 'Active' | 'Draft';
  seoScore: number;
  tags: string[];
}

export interface CartItem {
  id: string;
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  img: string;
}

// --- Orders ---
export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Packed' | 'Shipped' | 'Delivered' | 'Returned';

export interface TimelineEvent {
  status: OrderStatus;
  date: string;
  description: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  products: {
    productId: string | number;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'COD' | 'Prepaid';
  paymentStatus: 'Paid' | 'Unpaid';
  fulfillmentStatus: 'Unfulfilled' | 'Fulfilled';
  status: OrderStatus;
  date: string;
  notes?: string;
  confirmed: boolean;
  timeline: TimelineEvent[];
  trackingId?: string;
  courierName?: string;
  showWhatsAppButton?: boolean;
}

// --- Settings & Configuration ---
export interface SMTPSettings {
  host: string;
  port: number;
  email: string;
  password: string;
  enabled: boolean;
}

export interface APIKeyConfig {
  key: string;
  status: 'Active' | 'Limit Exceeded' | 'Invalid';
}

export interface AISettings {
  apiKey: string;
  apiKeys: APIKeyConfig[];
  model: string;
  enabled: boolean;
  customInstructions?: string;
  supportApiKey?: string;
}

export interface GlobalSettings {
  siteTitle: string;
  siteDescription: string;
  organizationName: string;
  organizationLogo: string;
  domain: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  supportEmail: string;
  defaultShippingCost: number;
  codEnabled: boolean;
  nfcEnabled: boolean;
  autoGenerateSeo: boolean;
  schemaMarkupEnabled: boolean;
  announcementBarText: string;
  announcementBarEnabled: boolean;
  firebaseApiKey: string;
  firebaseProjectId: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  heading: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  ctaText: string;
  ctaLink: string;
}

export interface HomeContentSettings {
  heroImages: string[];
  heroVideo: string;
  heroType: 'carousel' | 'video';
  capsCategoryImage: string;
  teesCategoryImage: string;
}

// --- Blog ---
export interface BlogPost {
  id: string | number;
  title: string;
  content: string;
  date: string;
  img: string;
  seo: SEOData;
}

// --- Automation Engine ---
export type AutomationEvent = 'Order Created' | 'Order Confirmed' | 'Order Cancelled' | 'Order Packed' | 'Order Shipped' | 'Order Delivered';
export type AutomationActionType = 'Send Email' | 'Update Status' | 'Show WhatsApp Button' | 'Add Note';

export interface AutomationAction {
  type: AutomationActionType;
  value?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  event: AutomationEvent;
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationLog {
  id: string;
  orderId: string;
  ruleId: string;
  timestamp: string;
  action: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface ProviderInfo {
  providerId: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
}

export interface FirestoreAuthInfo {
  userId: string | undefined;
  email: string | null | undefined;
  emailVerified: boolean | undefined;
  isAnonymous: boolean | undefined;
  tenantId: string | null | undefined;
  providerInfo: ProviderInfo[];
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: FirestoreAuthInfo;
}

// --- Logistics & Fulfillment ---
export interface LogisticsPartner {
  id: string;
  name: string;
  apiKey: string;
  apiUrl: string;
  status: 'Active' | 'Inactive';
}

// --- UI Components ---
export interface FlyingItem {
  id: string | number;
  x: number;
  y: number;
  img: string;
}

// --- Approvals ---
export interface ApprovalRequest {
  id: string;
  requestedBy: string;
  targetType: 'Order' | 'TeamMember';
  targetId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}
