/**
 * Loomra Constants
 * All constant values, theme colors, configurations, and mock data
 */

import type {
  Product,
  BlogPost,
  Order,
  TeamMember,
  LogisticsPartner,
  AISettings,
  AutomationRule,
  GlobalSettings,
  HomeContentSettings,
  ColorVariant,
  SEOData
} from '../types';

// --- Theme Colors & Styling ---
export const THEME_COLORS = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#FF0000', // brand-red
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  gray: {
    50: '#F9FAFB',
    500: '#6B7280',
    600: '#4B5563',
  }
};

// --- Product Colors ---
export const PRODUCT_COLORS: ColorVariant[] = [
  { name: 'Black', hex: '#000000', images: [], isActive: true },
  { name: 'White', hex: '#FFFFFF', images: [], isActive: true },
  { name: 'Red', hex: '#FF0000', images: [], isActive: true }
];

// --- Global Settings ---
export const GLOBAL_SETTINGS: GlobalSettings = {
  siteTitle: "Loomra — Modern Streetwear Essentials in Pakistan",
  siteDescription: "Shop minimal caps and tees designed for everyday comfort. Proudly made in Pakistan. Cash on delivery available.",
  organizationName: "Loomra",
  organizationLogo: "",
  domain: "loomra.pk",
  whatsappNumber: "+923001234567",
  whatsappEnabled: true,
  supportEmail: "support@loomra.pk",
  defaultShippingCost: 200,
  codEnabled: true,
  nfcEnabled: true,
  autoGenerateSeo: true,
  schemaMarkupEnabled: true,
  announcementBarText: "FREE SHIPPING ON ALL ORDERS OVER RS. 3000 — CASH ON DELIVERY AVAILABLE NATIONWIDE — OPEN PARCEL POLICY — SHOP NOW — PROUDLY MADE IN PAKISTAN",
  announcementBarEnabled: true,
  firebaseApiKey: "",
  firebaseProjectId: ""
};

// --- Home Content Settings ---
export const HOME_CONTENT_SETTINGS: HomeContentSettings = {
  heroImages: [],
  heroVideo: '',
  heroType: 'carousel',
  capsCategoryImage: '',
  teesCategoryImage: ''
};

// --- Mock Data ---
export const MOCK_CUSTOMERS = [
  { id: 'C-1', name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '0300-1234567', totalOrders: 5, totalSpent: 12500, lastOrder: '2024-03-25', status: 'Active' },
  { id: 'C-2', name: 'Sara Malik', email: 'sara@example.com', phone: '0321-7654321', totalOrders: 2, totalSpent: 4500, lastOrder: '2024-03-28', status: 'Active' },
  { id: 'C-3', name: 'Zain Raza', email: 'zain@example.com', phone: '0333-9876543', totalOrders: 1, totalSpent: 1850, lastOrder: '2024-03-15', status: 'Inactive' },
  { id: 'C-4', name: 'Bilal Ahmed', email: 'bilal@example.com', phone: '0345-1112223', totalOrders: 8, totalSpent: 22000, lastOrder: '2024-03-29', status: 'Active' },
];

export const MOCK_TEAM: TeamMember[] = [
  { 
    id: 'T-1', 
    name: 'Tahir Shah', 
    role: 'Owner', 
    email: 'tahirshah45@gmail.com', 
    status: 'Active', 
    lastActive: 'Just now',
    permissions: ['all'],
    profilePicture: 'https://i.pravatar.cc/150?u=T-1'
  },
  { 
    id: 'T-2', 
    name: 'Ali Ahmed', 
    role: 'Manager', 
    email: 'ali@loomra.pk', 
    status: 'Active', 
    lastActive: '5 mins ago',
    permissions: ['products', 'orders'],
    profilePicture: 'https://i.pravatar.cc/150?u=T-2'
  },
  { 
    id: 'T-3', 
    name: 'Fatima Noor', 
    role: 'Support', 
    email: 'fatima@loomra.pk', 
    status: 'Inactive', 
    lastActive: '2 hours ago',
    permissions: ['orders'],
    profilePicture: 'https://i.pravatar.cc/150?u=T-3'
  },
];

export const LOGISTICS_PARTNERS: LogisticsPartner[] = [
  { id: '1', name: 'PostEx', apiKey: 'px_test_123', apiUrl: 'https://api.postex.pk/v1', status: 'Active' },
  { id: '2', name: 'Trax', apiKey: 'trax_test_456', apiUrl: 'https://api.trax.pk/v1', status: 'Inactive' },
  { id: '3', name: 'Leopards', apiKey: 'leo_test_789', apiUrl: 'https://api.leopards.pk/v1', status: 'Active' }
];

// --- AI Settings ---
export const AI_SETTINGS: AISettings = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  apiKeys: [{ key: import.meta.env.VITE_GEMINI_API_KEY || '', status: 'Active' }],
  model: 'gemini-3-flash-preview',
  enabled: true
};

// --- Automation Rules ---
export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Order Created Workflow',
    event: 'Order Created',
    actions: [
      { type: 'Send Email', value: 'Order Confirmation' },
      { type: 'Show WhatsApp Button' }
    ],
    enabled: true
  },
  {
    id: 'rule-2',
    name: 'Auto-Confirm Logic',
    event: 'Order Confirmed',
    actions: [
      { type: 'Update Status', value: 'Confirmed' }
    ],
    enabled: true
  },
  {
    id: 'rule-3',
    name: 'Shipping Notification',
    event: 'Order Shipped',
    actions: [
      { type: 'Send Email', value: 'Shipping Details' }
    ],
    enabled: true
  },
  {
    id: 'rule-4',
    name: 'Delivery Confirmation',
    event: 'Order Delivered',
    actions: [
      { type: 'Send Email', value: 'Delivery Confirmation' }
    ],
    enabled: true
  }
];

// --- SEO Generation Utility ---
export const generateProductSEO = (name: string, category: string, description: string): SEOData => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-pakistan';
  return {
    title: `Buy ${name} in Pakistan | Loomra`,
    description: `Shop the Loomra ${name}. ${description.slice(0, 100)}. Cash on delivery available across Pakistan.`,
    slug: `/products/${slug}`,
    altText: `Loomra ${name} – minimal streetwear ${category.toLowerCase()} in Pakistan`,
    keywords: [
      `loomra ${category.toLowerCase()}`,
      `${name.toLowerCase()} pakistan`,
      `streetwear ${category.toLowerCase()} pakistan`,
      `buy ${category.toLowerCase()} online pakistan`
    ]
  };
};

// --- Products ---
export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'SIGNATURE TRUCKER CAP', 
    price: 1850, 
    oldPrice: 2450, 
    category: 'CAPS', 
    img: 'https://picsum.photos/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1000',
    images: ['https://picsum.photos/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1000'],
    description: 'Designed for everyday comfort with a clean modern street style.',
    colors: [
      {
        name: 'Midnight Black',
        hex: '#000000',
        images: [
          'https://picsum.photos/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=1000'
        ]
      }
    ],
    seo: generateProductSEO('SIGNATURE TRUCKER CAP', 'CAPS', 'Designed for everyday comfort with a clean modern street style.'),
    stock: 45,
    sizeStock: {
      S: 10,
      M: 15,
      L: 20,
      XL: 0
    },
    sku: 'LR-CAP-001',
    status: 'Active',
    seoScore: 85,
    tags: ['streetwear', 'caps', 'trucker']
  },
  { 
    id: 2, 
    name: 'ESSENTIAL OVERSIZED TEE', 
    price: 2250, 
    oldPrice: 2950, 
    category: 'TEES', 
    img: 'https://picsum.photos/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000',
    images: ['https://picsum.photos/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000'],
    description: 'A premium heavy-weight cotton tee with a relaxed fit.',
    colors: [
      {
        name: 'Pure White',
        hex: '#FFFFFF',
        images: [
          'https://picsum.photos/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1000'
        ]
      }
    ],
    seo: generateProductSEO('ESSENTIAL OVERSIZED TEE', 'TEES', 'A premium heavy-weight cotton tee with a relaxed fit.'),
    stock: 32,
    sizeStock: {
      S: 5,
      M: 0,
      L: 12,
      XL: 15
    },
    sku: 'LR-TEE-001',
    status: 'Active',
    seoScore: 92,
    tags: ['streetwear', 'tees', 'oversized']
  },
  { 
    id: 3, 
    name: 'LOOMRA MONO CAP', 
    price: 1650, 
    oldPrice: 2150, 
    category: 'CAPS', 
    img: 'https://picsum.photos/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80&w=1000',
    images: ['https://picsum.photos/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80&w=1000'],
    description: 'Minimalist mono-tone cap for a sleek urban look.',
    colors: [
      {
        name: 'Slate Grey',
        hex: '#708090',
        images: [
          'https://picsum.photos/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=1000'
        ]
      }
    ],
    seo: generateProductSEO('LOOMRA MONO CAP', 'CAPS', 'Minimalist mono-tone cap for a sleek urban look.'),
    stock: 18,
    sizeStock: {
      S: 0,
      M: 8,
      L: 10,
      XL: 0
    },
    sku: 'LR-CAP-002',
    status: 'Active',
    seoScore: 78,
    tags: ['streetwear', 'caps', 'minimalist']
  },
  { 
    id: 4, 
    name: 'URBAN GRAPHIC TEE', 
    price: 2450, 
    oldPrice: 3250, 
    category: 'TEES', 
    img: 'https://picsum.photos/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000',
    images: ['https://picsum.photos/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000'],
    description: 'Bold graphic print tee made from premium Pakistani cotton.',
    colors: [
      {
        name: 'Olive Drab',
        hex: '#6B8E23',
        images: [
          'https://picsum.photos/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1000',
          'https://picsum.photos/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000'
        ]
      }
    ],
    seo: generateProductSEO('URBAN GRAPHIC TEE', 'TEES', 'Bold graphic print tee made from premium Pakistani cotton.'),
    stock: 25,
    sizeStock: {
      S: 10,
      M: 10,
      L: 5,
      XL: 0
    },
    sku: 'LR-TEE-002',
    status: 'Active',
    seoScore: 88,
    tags: ['streetwear', 'tees', 'graphic']
  },
];

// --- Blog ---
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Best caps in Pakistan: A Guide",
    content: "When it comes to streetwear in Pakistan, a good cap is essential...",
    date: "2024-03-25",
    img: "https://picsum.photos/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=1000",
    seo: {
      title: "Best caps in Pakistan | Loomra Blog",
      description: "Discover the best caps in Pakistan for your streetwear look.",
      slug: "/blog/best-caps-pakistan",
      altText: "Best caps in Pakistan",
      keywords: ["best caps pakistan", "streetwear caps", "loomra blog"]
    }
  }
];

// --- Mock Orders ---
export const MOCK_ORDER_STATUSES: Record<string, string> = {
  'LR-1234': 'Pending',
  'LR-5678': 'Packed',
  'LR-9012': 'Shipped',
  'LR-3456': 'Delivered',
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'LR-1234',
    customerName: 'Ahmed Khan',
    phone: '0300-1234567',
    address: 'House 123, Street 5, DHA Phase 6',
    city: 'Karachi',
    products: [
      { productId: 1, name: 'SIGNATURE BLACK CAP', quantity: 1, price: 1850 }
    ],
    totalAmount: 1850,
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    fulfillmentStatus: 'Unfulfilled',
    status: 'Pending',
    date: '2024-03-28T10:30:00Z',
    notes: 'Please deliver after 5 PM',
    confirmed: true,
    timeline: [
      { status: 'Pending', date: '2024-03-28T10:30:00Z', description: 'Order created by customer' }
    ]
  },
  {
    id: 'LR-5678',
    customerName: 'Sara Ali',
    phone: '0321-7654321',
    address: 'Apartment 4B, Gulberg III',
    city: 'Lahore',
    products: [
      { productId: 2, name: 'ESSENTIAL OVERSIZED TEE', quantity: 2, price: 2850 }
    ],
    totalAmount: 5700,
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    fulfillmentStatus: 'Unfulfilled',
    status: 'Packed',
    date: '2024-03-27T14:20:00Z',
    confirmed: true,
    timeline: [
      { status: 'Pending', date: '2024-03-27T14:20:00Z', description: 'Order created by customer' },
      { status: 'Packed', date: '2024-03-27T16:45:00Z', description: 'Order packed and ready for shipping' }
    ]
  }
];

// --- Allowed Admins ---
export const ALLOWED_ADMINS = ['tahirshah45@gmail.com'];

// --- Status Messages ---
export const STATUS_MESSAGES: Record<string, string> = {
  'Pending': `Assalam-o-Alaikum, LOOMRA par aapka order confirm ho gaya hai. Kya aap isay verify karna chahte hain?`,
  'New': `Assalam-o-Alaikum, LOOMRA par aapka order confirm ho gaya hai. Kya aap isay verify karna chahte hain?`,
  'Confirmed': `LOOMRA: Aapka order confirm ho chuka hai aur processing mein hai.`,
  'Packed': `Khushkhabri! Aapka LOOMRA order pack ho gaya hai aur dispatch ke liye tayyar hai.`,
  'Shipped': `Khushkhabri! Aapka LOOMRA order pack ho gaya hai aur dispatch ke liye tayyar hai.`,
  'Delivered': `Aapka LOOMRA order deliver ho chuka hai. Thank you for shopping with us!`,
  'Cancelled': `Humein afsos hai ke aapka LOOMRA order cancel kar diya gaya hai.`,
};
