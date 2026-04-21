// Build Force: 2026-04-12T0805UTC - Force new Vercel deployment
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Import extracted pages
import { PrivacyPolicy, ShippingPolicy, ReturnPolicy, TrackOrder, NFCVerifyPage, ProductPage, ShopPage, HomePage, CheckoutPage } from './pages';

// Import extracted components from Phase 2 modularization
import Shop from './features/shop/Shop';

// Import Admin components from Phase 3
import { AdminProvider } from './components/admin/AdminContext';
import { AdminPanel } from './components/admin/AdminPanel';

// Import Storefront components from Phase 4A
import AuthModals from './components/storefront/AuthModals';
import PageLayout from './components/storefront/Layout/PageLayout';

// Import Common components from Phase 4B
import CustomToastContainer from './components/common/ToastContainer';

// Import hooks from Phase 4C
import { useInitializeApp } from './hooks/useInitializeApp';
import { useStoreActions } from './hooks/useStoreActions';

import { Analytics } from '@vercel/analytics/react';
// ProductGalleryV2 removed - using inline product rendering in App.tsx instead
import { runResilienceTest } from './tests/resilienceTest';
import { GoogleGenAI } from "@google/genai";
import Cropper, { Area as CropArea, Point as CropPoint } from 'react-easy-crop';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// DEBUG: Swiper imports commented out for loop fix  
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Pagination, Zoom, Navigation } from 'swiper/modules';
// Keep type for refs but comment out Swiper CSS
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import { 
  Database,
  Search, 
  ShoppingBag, 
  Home, 
  User, 
  Menu, 
  X, 
  Truck, 
  RotateCcw,
  RefreshCcw,
  PackageCheck, 
  CreditCard,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  CheckCircle2,
  Info,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  Lock,
  Camera,
  Settings,
  Plus,
  PlusCircle,
  Trash2,
  Edit2,
  BarChart3,
  Globe,
  LayoutDashboard,
  FileText,
  ExternalLink,
  Save,
  Check,
  Package,
  Cpu,
  History,
  FileSearch,
  Filter,
  MoreVertical,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronDown,
  Bell,
  UserCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Terminal,
  Calendar,
  MessageSquare,
  Send,
  Bot,
  Hash,
  ShoppingCart,
  Users,
  Megaphone,
  Upload,
  Layers,
  MailCheck,
  MousePointer2,
  Brain,
  Sparkles,
  UserCheck,
  Circle,
  ArrowDown,
  Layout,
  Smartphone,
  Slack,
  Minus,
  ArrowUp,
  ArrowLeft,
  BadgeCheck,
  UserPlus,
  Download,
  Store,
  Shield,
  Copy,
  Activity,
  Receipt,
  Clock,
  XCircle,
  Play,
  Printer,
  Image as ImageIcon,
  BrainCircuit,
  Server,
  AlertTriangle,
  WifiOff,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';
import { useDropzone } from 'react-dropzone';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { db, auth, storage, googleProvider } from './lib/firebase';
import { isAdmin } from './lib/firebase';
import { compressImage } from './lib/imageUtils';
import { useHealthCheck, type HealthState } from './hooks/useHealthCheck';
import GeneralSettings from './components/admin/GeneralSettings';

// Import types and constants
import type {
  Page,
  Category,
  UserProfile,
  ColorVariant,
  SEOData,
  Product,
  OrderStatus,
  TimelineEvent,
  SMTPSettings,
  Order,
  LogisticsPartner,
  APIKeyConfig,
  AISettings,
  GlobalSettings,
  FlyingItem,
  AnnouncementSettings,
  HomeContentSettings,
  CartItem,
  BlogPost,
  AutomationEvent,
  AutomationActionType,
  AutomationAction,
  AutomationRule,
  AutomationLog,
  ApprovalRequest,
  TeamRole,
  TeamMember,
  OperationType,
  FirestoreErrorInfo,
} from './types';
import {
  THEME_COLORS,
  PRODUCT_COLORS,
  GLOBAL_SETTINGS,
  HOME_CONTENT_SETTINGS,
  MOCK_CUSTOMERS,
  MOCK_TEAM,
  LOGISTICS_PARTNERS,
  AI_SETTINGS,
  DEFAULT_AUTOMATION_RULES,
  generateProductSEO,
  PRODUCTS,
  BLOG_POSTS,
  MOCK_ORDER_STATUSES,
  MOCK_ORDERS,
  ALLOWED_ADMINS,
  STATUS_MESSAGES,
} from './constants';
import { 
  collection, 
  doc, 
  getDocs, 
  serverTimestamp,
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  limit,
  writeBatch,
  getDoc
} from 'firebase/firestore';

import { cn } from '@/lib/utils';

// Helper function: Check if product has valid image data
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

// Helper function: Get product image - PRIORITY: colors[].images only
const getProductImage = (product: Product | any): string => {
  // Use colors[0].images[0] as primary (NO legacy fallback)
  const colorImagesArray = product?.colors?.[0]?.images?.[0];
  return colorImagesArray || '';
};

// Helper function: Get only colors that have at least one image AND are active (for displaying color dots)
const getAvailableColors = (product: Product | any): ColorVariant[] => {
  const colors = product?.colors || [];
  return colors.filter((c: ColorVariant) => {
    const isActive = c.isActive !== undefined ? c.isActive : true;
    return isActive && c.images && c.images.length > 0;
  });
};

// Helper function: Check if product has any active variants
const hasActiveVariants = (product: Product | any): boolean => {
  const colors = product?.colors || [];
  // Require colors array to have variants (no legacy fallback)
  if (colors.length === 0) return false;
  // Check for any active or true (or not explicitly inactive)
  return colors.some((c: ColorVariant) => c.isActive !== false);
};

// Helper function: Get only active color variants (for filtering in UI)
const getActiveColors = (product: Product | any): ColorVariant[] => {
  if (!product) return [];
  const colors = product?.colors || [];
  return colors.filter((c: ColorVariant) => {
    // Check isActive field, default to active if not specified
    const isActive = c?.isActive !== undefined ? c.isActive : true;
    return isActive;
  });
};

// Helper function: Normalize product colors to use the 3 predefined colors
// This ensures backward compatibility with legacy data
const normalizeProductColors = (product: Product | any): ColorVariant[] => {
  const existingColors = product?.colors || [];
  const normalized: ColorVariant[] = PRODUCT_COLORS.map(pc => {
    // Try to find matching color in existing colors
    const existing = existingColors.find((c: ColorVariant) => 
      c.name?.toLowerCase() === pc.name.toLowerCase() ||
      c.name === 'Default' // Legacy "Default" maps to Black
    );
    if (existing) {
      // Preserve existing isActive or default to true
      return { 
        ...pc, 
        images: existing.images || [],
        isActive: existing.isActive !== undefined ? existing.isActive : true
      };
    }
    return { ...pc, images: [], isActive: true };
  });
  return normalized;
};
// --- Helper Functions ---

// Generate status-based WhatsApp message
const LoomraAIAssistant = ({ isOpen, setIsOpen, apiHealth }: { isOpen: boolean, setIsOpen: (o: boolean) => void, apiHealth: { supportAi: number } }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hi! I'm Loomra Support. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOfflineMode = apiHealth.supportAi < 20;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    if (isOfflineMode) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: "AI is resting, please leave a message. Our team will get back to you soon." }]);
        setIsTyping(false);
        // Simulate queuing to outbox table
        console.log("Message queued to outbox:", userMessage);
      }, 1500);
      return;
    }

    try {
      // Check multiple sources for API key: env, aiSettings, or Firestore
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Fallback to aiSettings if env key is not available
      if (!apiKey && aiSettings?.apiKey) {
        apiKey = aiSettings.apiKey;
        console.log("Using API key from aiSettings");
      }
      
      if (!apiKey) {
        console.error("ERROR: No Gemini API key found. Check VITE_GEMINI_API_KEY in .env or Firestore system_configs collection.");
        setMessages(prev => [...prev, { role: 'model', text: "AI configuration missing. Please contact support." }]);
        setIsTyping(false);
        return;
      }

      console.log("Initializing GoogleGenerativeAI with API key:", apiKey.substring(0, 10) + "...");
      const genAI = new GoogleGenAI({ apiKey });
      const systemInstruction = `
        You are Loomra Support.
        Loomra is a modern streetwear brand based in Pakistan that sells caps and tees.
        Your job is to assist customers with:
        - Product questions
        - Order queries
        - Delivery information
        - Return policy
        - Affiliate program
        - General brand inquiries

        BRAND TONE:
        - Keep responses short, clear, and helpful
        - Maintain a modern and professional tone
        - Do not use cheap, pushy, or salesy language
        - Keep communication clean and confident

        IMPORTANT INFORMATION:
        Delivery:
        - Nationwide delivery across Pakistan
        - Delivery time: 1–3 business days
        - Lahore: next-day delivery is often possible

        Payment:
        - Cash on Delivery available

        Policy:
        - 15-day easy return policy
        - Customers can open parcel before payment

        Brand:
        - Loomra focuses on minimal streetwear
        - Products include caps and tees
        - Proudly made in Pakistan

        Always stay aligned with Loomra brand voice.
      `;

      const response = await genAI.models.generateContent({ 
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: systemInstruction
        },
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      // Extract text from response properly
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          response?.text || 
                          "I'm sorry, I couldn't process that.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      
      // Handle specific error types
      let errorMessage = "Sorry, I'm having some trouble connecting. Please try again later.";
      
      if (error?.message?.includes('403') || error?.message?.includes('permission')) {
        errorMessage = "AI access denied. Please contact support.";
      } else if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        errorMessage = "AI is busy right now. Please try again in a moment.";
      } else if (error?.message?.includes('400') || error?.message?.includes('invalid')) {
        errorMessage = "Invalid request. Please try a different question.";
      } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        errorMessage = "Connection issue. Please check your internet and try again.";
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100] bg-black text-white shadow-2xl hover:bg-brand-red transition-all flex items-center justify-center group",
          isOpen ? "px-6 py-4 space-x-3 rounded-full" : "w-16 h-16 rounded-full"
        )}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />}
        {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Close</span>}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-6 md:bottom-24 md:right-8 z-[100] w-[350px] md:w-[400px] h-[500px] bg-white border border-black shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Loomra Support</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isOfflineMode ? "bg-amber-500" : "bg-green-500 animate-pulse")} />
                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", isOfflineMode ? "text-amber-500" : "text-green-500")}>
                      {isOfflineMode ? "Offline Message Mode" : "Online Now"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-brand-red transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-black text-white' : 'bg-white border border-black/10 text-black'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-black/10 p-4 space-x-1 flex">
                    <div className="w-1 h-1 bg-black rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-black/5 bg-white">
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-black transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-black text-white p-3 hover:bg-brand-red transition-all disabled:opacity-50"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Admin Authentication ---
const AdminLoginPage = ({ team }: { team: TeamMember[] }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const cleanEmail = email.toLowerCase().trim();
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error("Login Error:", err);
      // User-friendly error messages
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please check or sign up.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid login details. Please check your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login with Admin Whitelist Check
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Strict whitelist check - only allow specific admin email
      if (!ALLOWED_ADMINS.includes(user.email || '')) {
        await signOut(auth);
        setError('Access Denied: You are not an authorized admin.');
        alert("Unauthorized: Access Denied.");
        return;
      }
      
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      // Log FULL error object including internalResponse
      console.error("Google Login Error - Full Object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      console.log(error);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google login.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple clicks and check cooldown
    if (isResetting || resendCooldown > 0) {
      return;
    }
    
    setIsResetting(true);
    setResetMessage('');
    setResetError('');

    try {
      // Normalize email to lowercase before sending
      const cleanEmail = resetEmail.toLowerCase().trim();
      
      // Configure action code settings for proper domain handling
      const actionCodeSettings = {
        url: `${window.location.origin}/?page=5492526`,
        handleCodeInApp: true,
      };
      
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      setResetMessage('Password reset email sent! Check your inbox.');
      
      // Start 60-second cooldown
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage('');
        setResetEmail('');
      }, 3000);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setResetError('Too many requests. Please wait before trying again.');
      } else {
        setResetError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111111] border border-[#00ffd5]/30 p-12 shadow-[0_0_40px_rgba(0,255,213,0.15)] rounded-2xl"
      >
        {showResetForm ? (
          <>
            <div className="text-center mb-12">
              <button 
                onClick={() => setShowResetForm(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black mb-4"
              >
                ← Back to Login
              </button>
              <h1 className="text-3xl font-display mb-4 tracking-tighter">RESET PASSWORD</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3">Email Address</label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-black/5 border border-black/10 px-6 py-4 text-xs focus:outline-none focus:border-brand-red lowercase font-bold tracking-widest transition-all"
                  placeholder="enter email"
                  required
                />
              </div>

              {resetMessage && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold uppercase tracking-widest text-green-600 text-center"
                >
                  {resetMessage}
                </motion.p>
              )}

              {resetError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-red text-center"
                >
                  {resetError}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={isResetting || resendCooldown > 0}
                className="w-full py-5 bg-black text-white font-display text-sm uppercase tracking-widest hover:bg-brand-red transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResetting ? <RefreshCcw className="animate-spin" size={16} /> : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-display mb-4 tracking-tighter text-white">ADMIN DASHBOARD</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00ffd5]/60">Secure Access Only</p>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold uppercase tracking-widest text-[#ff3366] text-center mb-6"
              >
                {error}
              </motion.p>
            )}

            {/* Google Login Only - Whitelisted */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-5 bg-[#00ffd5] text-black font-display text-sm uppercase tracking-widest hover:bg-[#00ccaa] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-xl shadow-[0_0_20px_rgba(0,255,213,0.4)] hover:shadow-[0_0_30px_rgba(0,255,213,0.6)]"
            >
              {isLoading ? (
                <RefreshCcw className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00ffd5]/40 text-center mt-6">
              Only authorized admins allowed
            </p>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-[#00ffd5]/10 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-[#00ffd5]/20">
            Loomra eCommerce Engine v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
};

const CropModal = ({ image, onCrop, onCancel, aspect = 1 }: { image: string, onCrop: (croppedImage: string) => void, onCancel: () => void, aspect?: number }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const onCropComplete = React.useCallback((_croppedArea: CropArea, croppedPixelsArg: CropArea) => {
    setCroppedAreaPixels(croppedPixelsArg);
  }, []);

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCrop(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#1c1b1b]">Crop Image</h3>
            <p className="text-[10px] text-[#5e3f3a] font-bold uppercase tracking-widest mt-1">Adjust your image for the perfect fit</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative h-[400px] bg-neutral-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Zoom Level</label>
              <span className="text-[10px] font-bold text-[#b30400]">{Math.round(zoom * 100)}%</span>
            </div>
            <input 
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#b30400]"
            />
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl bg-[#f6f3f2] text-[#5e3f3a] text-xs font-bold uppercase tracking-widest hover:bg-[#f0edec] transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCrop}
              className="flex-1 py-4 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-red shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Apply Crop
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const uploadToStorage = async (file: File | Blob, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// URL-based Image Input (replaces FileUploader for Logo/Product images)
const ImageUrlInput = ({ value, onChange, placeholder = "Paste image URL here..." }: { value: string, onChange: (url: string) => void, placeholder?: string }) => {
  const [url, setUrl] = useState(value || '');
  const [previewError, setPreviewError] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setPreviewError(false);
    onChange(newUrl);
  };

  // Check if URL is valid image URL
  const isValidImageUrl = (urlString: string) => {
    if (!urlString) return false;
    return urlString.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || 
           urlString.includes('imgbb.com') || 
           urlString.includes('imgur.com') ||
           urlString.includes('cloudinary') ||
           urlString.startsWith('https://');
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
      />
      {url && !previewError && isValidImageUrl(url) && (
        <div className="relative">
          <img 
            src={url} 
            alt="Preview" 
            className="max-h-[100px] rounded-lg border border-neutral-200 object-contain bg-neutral-50"
            onError={() => setPreviewError(true)}
          />
          <button
            type="button"
            onClick={() => { setUrl(''); onChange(''); }}
            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
      {previewError && (
        <p className="text-xs text-red-500">Invalid image URL - cannot preview</p>
      )}
    </div>
  );
};
const FileUploader = ({ onUpload, type = 'image', compact = false, crop = false, aspect = 1 }: { onUpload: (url: string) => void, type?: 'image' | 'video', compact?: boolean, crop?: boolean, aspect?: number }) => {
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    let file = acceptedFiles[0];

    setIsUploading(true);
    toast.info("Upload Started...");
    
    // Escape hatch: 15-second timeout
    const timeoutId = setTimeout(() => {
      console.warn("Upload timeout - forcing reset");
      setIsUploading(false);
      toast.error("Upload timed out. Please try again.");
    }, 15000);
    
    try {
      // Compress if it's an image
      if (type === 'image') {
        const compressedFile = await compressImage(file);
        // Sanitize filename and explicitly convert to File with WebP
        const sanitizedName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        file = new File([compressedFile], sanitizedName, { type: 'image/webp' });
      }

      if (crop && type === 'image') {
        clearTimeout(timeoutId);
        const reader = new FileReader();
        reader.onload = () => {
          setTempImage(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        // Sanitize storage path
        const sanitizedFileName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const path = `${type}s/${Date.now()}_${sanitizedFileName}`;
        const storageRef = ref(storage, path);
        
        await uploadBytes(storageRef, file)
          .then(() => {
            clearTimeout(timeoutId);
            setIsUploading(false);
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            console.error("UploadBytes error:", err);
            setIsUploading(false);
            throw err;
          });
        
        const url = await getDownloadURL(storageRef);
        onUpload(url);
        toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      setIsUploading(false);
    }
  }, [onUpload, crop, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: type === 'image' ? { 'image/*': [] } : { 'video/*': [] },
    multiple: false,
    disabled: isUploading
  });

  return (
    <>
      <div 
        {...getRootProps()} 
        className={cn(
          "w-full h-full flex items-center justify-center transition-all cursor-pointer",
          !compact && "border-2 border-dashed rounded-2xl p-8 text-center",
          !compact && (isDragActive ? "border-[#b30400] bg-red-50" : "border-neutral-200 hover:border-[#b30400]/50 bg-[#f6f3f2]"),
          compact && "hover:bg-black/5",
          isUploading && "opacity-50 cursor-wait"
        )}
      >
        <input {...getInputProps()} />
        <div className={cn("flex flex-col items-center gap-3", compact && "gap-1")}>
          <div className={cn(
            "bg-white rounded-full shadow-sm text-[#b30400]",
            compact ? "p-2" : "p-4"
          )}>
            {isUploading ? (
              <RefreshCcw size={compact ? 16 : 24} className="animate-spin" />
            ) : (
              type === 'image' ? <Camera size={compact ? 16 : 24} /> : <Zap size={compact ? 16 : 24} />
            )}
          </div>
          {!compact && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1c1b1b]">
                {isUploading ? "Uploading..." : (isDragActive ? "Drop it here!" : `Upload ${type === 'image' ? 'Image' : 'Video'}`)}
              </p>
              <p className="text-[10px] text-[#5e3f3a] mt-1 font-medium uppercase tracking-tighter">
                {isUploading ? "Please wait while we process your file" : "Drag & drop or click to browse"}
              </p>
            </div>
          )}
          {compact && !isUploading && (
            <p className="text-[8px] font-bold uppercase tracking-tighter text-neutral-400">Add {type}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {tempImage && (
          <CropModal 
            image={tempImage} 
            aspect={aspect}
            onCrop={async (croppedBase64) => {
              setTempImage(null);
              setIsUploading(true);
              try {
                // Convert base64 to blob
                const response = await fetch(croppedBase64);
                const blob = await response.blob();
                
                // Compress the cropped image too
                const fileToUpload = await compressImage(new File([blob], `cropped_${Date.now()}.png`, { type: 'image/png' }));
                
                const path = `images/cropped_${Date.now()}.png`;
                const url = await uploadToStorage(fileToUpload, path);
                onUpload(url);
                toast.success("Image cropped and uploaded successfully!");
              } catch (error) {
                console.error("Crop upload error:", error);
                toast.error("Failed to upload cropped image.");
              } finally {
                setIsUploading(false);
              }
            }}
            onCancel={() => setTempImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const TeamManagement = ({ team, setTeam, handleDeleteRequest, setConfirmModal }: { 
  team: TeamMember[], 
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>, 
  handleDeleteRequest: (type: 'Order' | 'TeamMember', id: string) => void,
  setConfirmModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>>
}) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'Editor',
    permissions: [],
    status: 'Active',
    profilePicture: ''
  });

  const roles: TeamRole[] = ['Admin', 'Manager', 'Support', 'Editor'];
  const permissionOptions = [
    { id: 'products', label: 'Manage Products' },
    { id: 'orders', label: 'Manage Orders' },
    { id: 'customers', label: 'Manage Customers' },
    { id: 'analytics', label: 'View Analytics' },
    { id: 'settings', label: 'System Settings' },
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    const member: TeamMember = {
      id: `T-${Date.now()}`,
      name: newMember.name!,
      email: newMember.email!,
      password: newMember.password || '',
      role: newMember.role as TeamRole,
      permissions: newMember.permissions || [],
      status: newMember.status as 'Active' | 'Inactive',
      profilePicture: newMember.profilePicture || `https://i.pravatar.cc/150?u=${Date.now()}`,
      lastActive: 'Never'
    };
    setTeam([...team, member]);
    setIsAddingMember(false);
    setNewMember({ name: '', email: '', password: '', role: 'Editor', permissions: [], status: 'Active', profilePicture: '' });
    setShowPassword(false);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setTeam(team.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
    setShowPassword(false);
  };

  const handleDeleteMember = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Team Member',
      message: 'Are you sure you want to remove this team member? This action will require administrative approval.',
      onConfirm: () => handleDeleteRequest('TeamMember', id)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingMember) {
          setEditingMember({ ...editingMember, profilePicture: reader.result as string });
        } else {
          setNewMember({ ...newMember, profilePicture: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'Owner': return 'bg-black text-white';
      case 'Admin': return 'bg-red-100 text-red-600 border-red-200';
      case 'Manager': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Support': return 'bg-green-100 text-green-600 border-green-200';
      case 'Editor': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent | React.TouchEvent, memberId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMenuId(activeMenuId === memberId ? null : memberId);
  };

  const closeMenu = () => setActiveMenuId(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#1c1b1b]">Team Members</h3>
          <p className="text-xs text-[#5e3f3a] font-bold uppercase tracking-widest mt-1">Manage access and permissions</p>
        </div>
        <button 
          onClick={() => setIsAddingMember(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-red transition-all shadow-lg shadow-black/10"
        >
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={menuRef}>
        {team.map((member) => (
          <div key={member.id} className="relative bg-white rounded-2xl shadow-sm p-4 mx-4 md:mx-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0">
                <img src={member.profilePicture || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1c1b1b] truncate">{member.name}</p>
                <p className="text-[10px] text-[#5e3f3a] font-medium truncate">{member.email}</p>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => toggleMenu(e, member.id)}
                  onTouchEnd={(e) => toggleMenu(e, member.id)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-600 rounded-lg transition-all active:bg-neutral-100"
                  aria-label="Member actions"
                  aria-expanded={activeMenuId === member.id}
                >
                  <MoreHorizontal size={18} />
                </button>
                {activeMenuId === member.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50 w-40 p-1 space-y-1"
                  >
                    <button 
                      onClick={() => { setEditingMember(member); closeMenu(); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      Edit Permissions
                    </button>
                    <button 
                      onClick={() => { handleDeleteMember(member.id); closeMenu(); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove Member
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                getRoleColor(member.role)
              )}>
                {member.role}
              </span>
              {member.permissions.map(p => (
                <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[8px] font-medium">
                  {p}
                </span>
              ))}
              {member.permissions.length === 0 && (
                <span className="text-[9px] text-neutral-400 italic">No permissions</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                member.status === 'Active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-neutral-300"
              )} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e3f3a]">
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddingMember || editingMember) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingMember(false); setEditingMember(null); setShowPassword(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1c1b1b]">
                    {editingMember ? 'Edit Team Member' : 'Add New Member'}
                  </h3>
                  <p className="text-sm text-[#5e3f3a] mt-1">Define roles and access levels</p>
                </div>
                <button onClick={() => { setIsAddingMember(false); setEditingMember(null); setShowPassword(false); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Profile Picture</label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                        <FileUploader 
                          onUpload={(url) => {
                            if (editingMember) {
                              setEditingMember({ ...editingMember, profilePicture: url });
                            } else {
                              setNewMember({ ...newMember, profilePicture: url });
                            }
                          }} 
                          compact={true} 
                          crop={true} 
                          aspect={1} 
                        />
                        {(editingMember?.profilePicture || newMember.profilePicture) && (
                          <img src={editingMember?.profilePicture || newMember.profilePicture} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Preview" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">Upload a professional headshot. PNG supported. Max 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Full Name</label>
                    <input 
                      type="text" 
                      value={editingMember ? editingMember.name : newMember.name}
                      onChange={e => editingMember ? setEditingMember({...editingMember, name: e.target.value}) : setNewMember({...newMember, name: e.target.value})}
                      className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Email Address</label>
                    <input 
                      type="email" 
                      value={editingMember ? editingMember.email : newMember.email}
                      onChange={e => editingMember ? setEditingMember({...editingMember, email: e.target.value}) : setNewMember({...newMember, email: e.target.value})}
                      className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
                      placeholder="john@loomra.pk"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Username</label>
                    <input 
                      type="text" 
                      value={editingMember ? editingMember.username : newMember.username}
                      onChange={e => editingMember ? setEditingMember({...editingMember, username: e.target.value}) : setNewMember({...newMember, username: e.target.value})}
                      className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
                      placeholder="johndoe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">
                      {editingMember ? 'Reset Password' : 'Create Password'}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={editingMember ? (editingMember.password || '') : (newMember.password || '')}
                        onChange={e => editingMember ? setEditingMember({...editingMember, password: e.target.value}) : setNewMember({...newMember, password: e.target.value})}
                        className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Role</label>
                    <select 
                      value={editingMember ? editingMember.role : newMember.role}
                      onChange={e => editingMember ? setEditingMember({...editingMember, role: e.target.value as TeamRole}) : setNewMember({...newMember, role: e.target.value as TeamRole})}
                      className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none appearance-none"
                    >
                      {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Permissions</label>
                    <div className="grid grid-cols-1 gap-3">
                      {permissionOptions.map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                          <input 
                            type="checkbox"
                            checked={editingMember ? editingMember.permissions.includes(opt.id) : newMember.permissions?.includes(opt.id)}
                            onChange={e => {
                              const currentPermissions = editingMember ? editingMember.permissions : (newMember.permissions || []);
                              const newPermissions = e.target.checked 
                                ? [...currentPermissions, opt.id]
                                : currentPermissions.filter(p => p !== opt.id);
                              
                              if (editingMember) {
                                setEditingMember({ ...editingMember, permissions: newPermissions });
                              } else {
                                setNewMember({ ...newMember, permissions: newPermissions });
                              }
                            }}
                            className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black" 
                          />
                          <span className="text-xs font-bold text-[#1c1b1b]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-[#1c1b1b]">Account Status</p>
                        <p className="text-[10px] text-[#5e3f3a] font-bold uppercase tracking-widest mt-1">Active / Inactive</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (editingMember) {
                            setEditingMember({ ...editingMember, status: editingMember.status === 'Active' ? 'Inactive' : 'Active' });
                          } else {
                            setNewMember({ ...newMember, status: newMember.status === 'Active' ? 'Inactive' : 'Active' });
                          }
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all",
                          (editingMember ? editingMember.status === 'Active' : newMember.status === 'Active') ? "bg-green-500" : "bg-neutral-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          (editingMember ? editingMember.status === 'Active' : newMember.status === 'Active') ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <button 
                  onClick={() => { setIsAddingMember(false); setEditingMember(null); setShowPassword(false); }}
                  className="flex-1 py-4 rounded-2xl bg-[#f6f3f2] text-[#5e3f3a] text-xs font-bold uppercase tracking-widest hover:bg-[#f0edec] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingMember ? handleUpdateMember : handleAddMember}
                  className="flex-1 py-4 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-red transition-all shadow-xl shadow-black/10"
                >
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Member Modal */}
      <AnimatePresence>
        {viewingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#1c1b1b]">Member Details</h3>
                  <button 
                    onClick={() => setViewingMember(null)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-neutral-100 overflow-hidden border-2 border-neutral-200 mb-4">
                    <img 
                      src={viewingMember.profilePicture || `https://i.pravatar.cc/150?u=${viewingMember.id}`} 
                      alt={viewingMember.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#1c1b1b]">{viewingMember.name}</h4>
                  <p className="text-sm text-[#5e3f3a]">{viewingMember.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-neutral-50 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5e3f3a]">Role</span>
                    <span className="text-xs font-bold text-[#1c1b1b]">{viewingMember.role}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-neutral-50 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5e3f3a]">Status</span>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      viewingMember.status === 'Active' ? "text-green-600" : "text-neutral-400"
                    )}>{viewingMember.status}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-neutral-50 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5e3f3a]">Last Active</span>
                    <span className="text-xs font-bold text-[#1c1b1b]">{viewingMember.lastActive}</span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5e3f3a] block mb-3">Permissions</span>
                    <div className="flex flex-wrap gap-2">
                      {viewingMember.permissions.length > 0 ? (
                        viewingMember.permissions.map(p => (
                          <span key={p} className="px-3 py-1 bg-neutral-200 text-neutral-600 rounded-full text-[10px] font-bold">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">No specific permissions</span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setViewingMember(null); setEditingMember(viewingMember); }}
                  className="w-full mt-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-brand-red transition-all"
                >
                  Edit Member
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NewsOverlay = ({ settings, onClose }: { settings: AnnouncementSettings, onClose: () => void }) => {
  if (!settings.enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-all"
        >
          <X size={24} />
        </button>

        {/* Media Section */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-black relative">
          {settings.mediaType === 'video' ? (
            <video 
              src={settings.mediaUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <img 
              src={settings.mediaUrl} 
              alt="Announcement" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
          <span className="text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Announcement</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-6 font-headline">
            {settings.heading}
          </h2>
          <p className="text-[#5e3f3a] text-sm leading-relaxed mb-10 font-medium">
            {settings.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => { window.location.href = settings.ctaLink; onClose(); }}
              className="px-8 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-red transition-all shadow-xl shadow-black/10"
            >
              {settings.ctaText}
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-neutral-100 text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MarketingSettings = ({ settings, setSettings }: { settings: AnnouncementSettings, setSettings: React.Dispatch<React.SetStateAction<AnnouncementSettings>> }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      setSettings({ ...settings, mediaUrl: url, mediaType: isVideo ? 'video' : 'image' });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
          <div>
            <h4 className="text-sm font-bold text-[#1c1b1b]">Enable Announcement Overlay</h4>
            <p className="text-[10px] text-[#5e3f3a] font-bold uppercase tracking-widest mt-1">Show a popup to all visitors</p>
          </div>
          <button 
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={cn(
              "w-12 h-6 rounded-full relative transition-all",
              settings.enabled ? "bg-brand-red" : "bg-neutral-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              settings.enabled ? "right-1" : "left-1"
            )} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Heading</label>
            <input 
              type="text" 
              value={settings.heading || ''}
              onChange={e => setSettings({ ...settings, heading: e.target.value })}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Description</label>
            <textarea 
              value={settings.description || ''}
              onChange={e => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">CTA Button Text</label>
              <input 
                type="text" 
                value={settings.ctaText || ''}
                onChange={e => setSettings({ ...settings, ctaText: e.target.value })}
                className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">CTA Link</label>
              <input 
                type="text" 
                value={settings.ctaLink || ''}
                onChange={e => setSettings({ ...settings, ctaLink: e.target.value })}
                className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Media URL (Image/GIF/Video)</label>
            <input 
              type="text" 
              value={settings.mediaUrl || ''}
              onChange={e => setSettings({ ...settings, mediaUrl: e.target.value, mediaType: e.target.value.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image' })}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
              placeholder="Enter media URL (e.g., https://example.com/image.gif)"
            />
            <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Supports: JPG, PNG, GIF, MP4, WebM</p>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Live Preview (Desktop View)</label>
        <div className="relative aspect-video bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl flex items-center justify-center p-4">
          {/* Scaled down version of the actual overlay */}
          <div className="w-full h-full scale-[0.4] origin-center bg-white rounded-[2.5rem] overflow-hidden flex shadow-2xl">
            <div className="w-1/2 bg-black relative">
              {settings.mediaType === 'video' ? (
                <video src={settings.mediaUrl} autoPlay loop muted className="w-full h-full object-cover opacity-80" />
              ) : (
                <img src={settings.mediaUrl} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="w-1/2 p-12 flex flex-col justify-center">
              <span className="text-brand-red text-xs font-bold uppercase tracking-widest mb-4">Announcement</span>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none mb-6">{settings.heading}</h2>
              <p className="text-sm text-neutral-500 mb-8">{settings.description}</p>
              <div className="flex gap-4">
                <div className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl">{settings.ctaText}</div>
              </div>
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-[8px] text-white font-bold uppercase tracking-widest">Admin Preview Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const { health, checkHealth } = useHealthCheck();
  const [apiHealth, setApiHealth] = useState(health);

  useEffect(() => {
    setApiHealth(health);
  }, [health]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'automation' | 'logistics' | 'ai-assistant' | 'seo' | 'team' | 'settings' | 'ai-settings' | 'smtp' | 'media-library' | 'profile' | 'home-management'>('dashboard');
  const [settingsTab, setSettingsTab] = useState<'general' | 'seo' | 'automation' | 'team' | 'marketing'>('general');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  // Logo crop state - only used in settings tab for logo upload
  const [logoCropImage, setLogoCropImage] = useState<string | null>(null);

  // Initialize app with Firebase listeners and data fetching
  useInitializeApp({
    apiHealth,
    setApiHealth,
    setAiSettings,
    setSettings,
    setOrders,
    setIsSyncing,
    setUser,
    setIsAuthLoading,
    setIsAdminAuthenticated,
    setTeam,
    setProducts,
    setPage,
    setVerifyId,
    setShowAnnouncement,
    setAnnouncementSettings,
    setHomeContentSettings,
    setSmtpSettings,
    setAutomationRules
  });

  // Initialize store actions (business logic functions)
  const {
    handleAddToCart,
    updateCartQuantity,
    removeFromCart,
    toggleTryOnItem,
    navigateToProduct,
    handleSaveMasterSettings,
    triggerAutomation,
    updateOrderStatus
  } = useStoreActions({
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
  });

  useEffect(() => {
    setIsFirebaseConnected(apiHealth.status !== 'red');
  }, [apiHealth.status]);

  useEffect(() => {
    setApiHealth({
      mainGateway: health.mainGateway,
      supportAi: health.supportAi,
      database: health.database,
      status: health.status,
      isConfigMissing: health.isConfigMissing
    });

    if (health.status === 'red' && !health.isConfigMissing) {
      toast.error("DATABASE UNREACHABLE: Triggering Local-First Fallback");
    } else if (health.status === 'yellow') {
      toast.warning("HIGH TRAFFIC: Read-Only Mode Enabled");
    }
  }, [health]);

  // Persist page to localStorage - initialize from URL params for deep-linking support
  const [page, setPage] = useState<Page>(() => {
    // First check URL query params for ?page=xxx
    const params = new URLSearchParams(window.location.search);
    const urlPage = params.get('page');
    console.log("Current Page State: initializing from URL:", urlPage);
    if (urlPage && ['home', 'shop', 'about', 'track', 'affiliate', 'product', 'checkout', 'success', '5492526', 'blog', 'nfc-verify', 'privacy', 'shipping', 'return', 'verify', 'account'].includes(urlPage)) {
      console.log("URL Parameter:", urlPage, "accepted");
      return urlPage as Page;
    }
    // Then check sessionStorage (for SPA navigation)
    const saved = sessionStorage.getItem('loomra_current_page');
    console.log("SessionStorage page:", saved);
    return (saved as Page) || 'home';
  });

  // Save page to sessionStorage when it changes - useLayoutEffect for synchronous URL update
  React.useLayoutEffect(() => {
    sessionStorage.setItem('loomra_current_page', page);
    // Update URL without reload to reflect current page
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.replaceState({}, '', url.toString());
    console.log("Page state changed to:", page, "| URL updated to:", url.toString());
  }, [page]);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const orderUpdateRef = useRef<Record<string, OrderStatus>>({});
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isCartPulsing, setIsCartPulsing] = useState(false);
  const [isStorefrontSidebarOpen, setIsStorefrontSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('loomra_products_cache');
    if (!saved) {
      console.log("No cached products, loading default PRODUCTS");
      localStorage.setItem('loomra_products_cache', JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    const parsed = JSON.parse(saved);
    console.log("Products loaded from localStorage:", parsed.length, "| First product img:", parsed[0]?.img);
    return parsed;
  });

  // Firestore subscriptions
  // Persist page to localStorage - initialize from URL params for deep-linking support
  // Persist page to localStorage - initialize from URL params for deep-linking support

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('loomra_orders_cache');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('loomra_orders_cache', JSON.stringify(orders));
  }, [orders]);
  const [settings, setSettings] = useState<GlobalSettings>(GLOBAL_SETTINGS);
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: 'smtp.loomra.pk',
    port: 587,
    email: 'info@loomra.pk',
    password: '••••••••',
    enabled: true
  });
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>(LOGISTICS_PARTNERS);
  const [aiSettings, setAiSettings] = useState<AISettings>(AI_SETTINGS);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(DEFAULT_AUTOMATION_RULES);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [tryOnItems, setTryOnItems] = useState<Product[]>([]);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<TeamMember | { role: 'Owner', name: string } | null>(null);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings>({
    enabled: true,
    heading: 'DROP 004: THE MONOLITH',
    description: 'Our most ambitious collection yet. Precision engineered for the modern nomad. Limited quantities available.',
    mediaUrl: 'https://cdn.pixabay.com/video/2023/10/21/185935-876935246_large.mp4',
    mediaType: 'video',
    ctaText: 'Shop the Drop',
    ctaLink: '/shop'
  });
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [homeContentSettings, setHomeContentSettings] = useState<HomeContentSettings>(HOME_CONTENT_SETTINGS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('loomra_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('loomra_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('loomra_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('loomra_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Cart persistence: Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('loomra_cart_items');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
          console.log('[Cart] Loaded from localStorage:', parsedCart.length, 'items');
        }
      } catch (e) {
        console.error('[Cart] Error parsing saved cart:', e);
      }
    }
  }, []);

  // Cart persistence: Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('loomra_cart_items', JSON.stringify(cartItems));
    console.log('[Cart] Saved to localStorage:', cartItems.length, 'items');
  }, [cartItems]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const id = path.split('/verify/')[1];
      if (id) {
        setVerifyId(id);
        setPage('verify');
      }
    }

    const savedSettings = localStorage.getItem('loomra_master_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.announcementSettings) setAnnouncementSettings(parsed.announcementSettings);
        if (parsed.aiSettings) setAiSettings(parsed.aiSettings);
        if (parsed.smtpSettings) setSmtpSettings(parsed.smtpSettings);
        if (parsed.automationRules) setAutomationRules(parsed.automationRules);
        if (parsed.homeContentSettings) setHomeContentSettings(parsed.homeContentSettings);
      } catch (e) {
        console.error("Failed to load settings from localStorage", e);
      }
    }
    
    // Check if we should show the announcement modal
    const hasSeenAnnouncement = sessionStorage.getItem('loomra_announcement_seen');
    if (!hasSeenAnnouncement) {
      setShowAnnouncement(true);
    }
  }, []);

  // URL Sync Logic
  useEffect(() => {
    let path = '/';
    if (page === 'shop') {
      path = selectedCategory === 'ALL' ? '/shop' : `/shop/${selectedCategory.toLowerCase()}`;
    } else if (page === 'product' && selectedProduct) {
      path = selectedProduct.seo?.slug || '/';
    } else if (page !== 'home') {
      path = `/${page}`;
    }
    window.history.replaceState({}, '', path);
  }, [page, selectedCategory, selectedProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const confirmId = params.get('confirm-order') || params.get('id');
    const isConfirm = window.location.pathname.includes('confirm-order');
    const isCancel = window.location.pathname.includes('cancel-order');

    if ((isConfirm || isCancel) && confirmId) {
      const status = isConfirm ? 'Confirmed' : 'Cancelled';
      const order = orders.find(o => o.id === confirmId);
      
      if (order && order.status !== status) {
        const updatedOrders = orders.map(o => {
          if (o.id === confirmId) {
            return {
              ...o,
              status: status as OrderStatus,
              confirmed: isConfirm,
              timeline: [
                ...o.timeline,
                {
                  status: status as OrderStatus,
                  date: new Date().toISOString(),
                  description: isConfirm ? 'Order confirmed by customer via link' : 'Order cancelled by customer via link'
                }
              ]
            };
          }
          return o;
        });
        setOrders(updatedOrders);
        const updatedOrder = updatedOrders.find(o => o.id === confirmId);
        if (updatedOrder) {
          triggerAutomation(isConfirm ? 'Order Confirmed' : 'Order Cancelled', updatedOrder);
        }
        toast.success(`Order ${confirmId} has been ${status.toLowerCase()} successfully.`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname.split('/')[0] || '/');
      }
    }
  }, [orders]);

  // Debug: Log auth state
  console.log('DEBUG: isAuthLoading =', isAuthLoading, 'user =', user?.email);

  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          color: '#10b981',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.2em'
        }}>
          LOOMRA
        </div>
        <div style={{
          color: '#666',
          fontSize: '12px',
          fontFamily: 'system-ui, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.3em'
        }}>
          Loading...
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Wrap in try-catch to prevent silent crashes
  try {
    // Announcement Bar Component
    const announcementBar = page === 'home' && settings.announcementBarEnabled ? (
      <div className="bg-brand-red text-white text-center overflow-hidden border-b border-black" style={{ padding: 0, margin: 0 }}>
        <motion.p
          animate={{ x: [1000, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="text-[9px] font-bold uppercase tracking-[0.4em] whitespace-nowrap"
        >
          {settings.announcementBarText}
        </motion.p>
      </div>
    ) : null;

    return (
      <HelmetProvider>
        <PageLayout
          page={page}
          settings={settings}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          users={users}
          setUsers={setUsers}
          orders={orders}
          setPage={setPage}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartItems={cartItems}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          products={products}
          handleAddToCart={handleAddToCart}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          cartCount={cartItems.length}
          isCartPulsing={isCartPulsing}
          announcementBar={announcementBar}
          flyingItems={flyingItems}
        >
          {/* Announcement Overlay */}
          <AnimatePresence>
            {page === 'home' && showAnnouncement && announcementSettings.enabled && (
              <NewsOverlay
                settings={announcementSettings}
                onClose={() => setShowAnnouncement(false)}
              />
            )}
          </AnimatePresence>

          {/* Checkout Header */}
          {page === 'checkout' && <CheckoutHeader setPage={setPage} />}

          {/* Storefront Sidebar */}
          <StorefrontSidebar
            isOpen={isStorefrontSidebarOpen}
            onClose={() => setIsStorefrontSidebarOpen(false)}
            setPage={setPage}
            setSelectedCategory={setSelectedCategory}
            settings={settings}
          />

          {/* Recently Purchased Toast */}
          <RecentlyPurchasedToast products={products} />

          {/* AI Assistant */}
          <LoomraAIAssistant isOpen={isChatOpen} setIsOpen={setIsChatOpen} apiHealth={apiHealth} />

          {/* Try-On Room Button */}
          <AnimatePresence>
            {tryOnItems.length > 0 && page !== '5492526' && (
              <motion.button
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                onClick={() => setIsTryOnOpen(true)}
                className="fixed bottom-40 right-6 md:bottom-24 md:right-8 z-[45] bg-black text-white p-4 rounded-full shadow-2xl hover:bg-brand-red transition-all flex items-center space-x-2 border border-white/20"
              >
                <div className="relative">
                  <Camera size={24} />
                  <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-black">
                    {tryOnItems.length}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest pr-2 hidden md:block">Try-On Room</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Virtual Try-On Modal */}
          <VirtualTryOnModal
            isOpen={isTryOnOpen}
            onClose={() => setIsTryOnOpen(false)}
            selectedProducts={tryOnItems}
            onRemoveProduct={(id) => setTryOnItems(prev => prev.filter(p => p.id !== id))}
          />

          {/* Page Content */}
          {page === 'account' && (
            <AuthModals
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              users={users}
              setUsers={setUsers}
              orders={orders}
              setPage={setPage}
            />
          )}

          {page === 'home' && (
            <HomePage
              setPage={setPage}
              homeContentSettings={homeContentSettings}
              products={products}
              onNavigateToProduct={navigateToProduct}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}

          {(page === 'shop' || page === 'product' || page === 'checkout') && (
            <Shop
              currentPage={page}
              selectedProduct={selectedProduct}
              products={products}
              cartItems={cartItems}
              tryOnItems={tryOnItems}
              selectedCategory={selectedCategory}
              setPage={setPage}
              onNavigateToProduct={navigateToProduct}
              toggleTryOnItem={toggleTryOnItem}
              handleAddToCart={handleAddToCart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              setSelectedCategory={setSelectedCategory}
              setOrders={setOrders}
              triggerAutomation={triggerAutomation}
              setIsTryOnOpen={setIsTryOnOpen}
              settings={settings}
              apiHealth={apiHealth}
              lastPlacedOrderId={lastPlacedOrderId}
            />
          )}

          {page === '5492526' && (
            isAuthLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-white">
                <RefreshCcw className="animate-spin text-brand-red" size={48} />
              </div>
            ) : (isAdminAuthenticated || user) && isAdmin(user) ? (
              <AdminProvider>
                <AdminPanel
                  setPage={setPage}
                  setIsAdminAuthenticated={setIsAdminAuthenticated}
                />
              </AdminProvider>
            ) : (
              <AdminLoginPage team={team} />
            )
          )}

          {page === 'track' && <TrackOrder />}
          {page === 'nfc-verify' && <NFCVerifyPage setPage={setPage} products={products} />}
          {page === 'verify' && verifyId && <AuthenticityCertificate id={verifyId} products={products} setPage={setPage} />}
          {page === 'affiliate' && <Affiliate />}
          {page === 'about' && <AboutPage />}
          {page === 'checkout' && <CheckoutPage setPage={setPage} products={products} cartItems={cartItems} setOrders={setOrders} triggerAutomation={triggerAutomation} apiHealth={apiHealth} setLastPlacedOrderId={setLastPlacedOrderId} onAddToCart={handleAddToCart} />}
          {page === 'success' && <SuccessPage setPage={setPage} orderId={lastPlacedOrderId} />}
          {page === 'privacy' && <PrivacyPolicy setPage={setPage} />}
          {page === 'shipping' && <ShippingPolicy setPage={setPage} />}
          {page === 'return' && <ReturnPolicy setPage={setPage} />}
        </PageLayout>

        {/* Global Components Outside Layout */}
        {/* Vercel Analytics */}
        <Analytics />

        {/* WhatsApp Floating Button */}
        <AnimatePresence>
          {settings.whatsappEnabled && page !== '5492526' && (
            <motion.a
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Loomra, I want to inquire about my order')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[45] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center border border-white/20"
            >
              <MessageCircle size={28} />
            </motion.a>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav */}
        {page !== 'product' && page !== 'checkout' && page !== '5492526' && (
          <StickyBottomNav
            setPage={setPage}
            currentPage={page}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={cartItems.length}
            isCartOpen={isCartOpen}
          />
        )}

        {/* Toast Notifications */}
        <CustomToastContainer />
      </HelmetProvider>
    );
  } catch (err) {
    console.error('App render error:', err);
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ff0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '50px',
        textAlign: 'center'
      }}>
        APP RENDER ERROR - Check Console
      </div>
    );
  }
}
