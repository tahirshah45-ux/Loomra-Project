import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Layout,
  Globe,
  BarChart3,
  Bot,
  Settings,
  Menu,
  X,
  Search,
  ShieldCheck,
  Bell,
  HelpCircle,
  ChevronDown,
  UserCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminPanelProps } from './types/admin.types';
import { useAdminState } from './AdminContext';
import ProductsTab from './tabs/ProductsTab';
import DashboardTab from './tabs/DashboardTab';
import OrdersTab from './tabs/OrdersTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  setPage,
  setIsAdminAuthenticated
}) => {
  const {
    activeTab,
    setActiveTab,
    ui,
    setUI,
    orderManagement,
    setOrderSearch,
    adminProfile,
    notifications,
    apiHealth
  } = useAdminState();

  const setIsSidebarOpen = (open: boolean) => {
    setUI(prev => ({ ...prev, isSidebarOpen: open }));
  };

  const setIsNotificationOpen = (open: boolean) => {
    setUI(prev => ({ ...prev, isNotificationOpen: open }));
  };

  const setIsSupportOpen = (open: boolean) => {
    setUI(prev => ({ ...prev, isSupportOpen: open }));
  };

  const setIsProfileDropdownOpen = (open: boolean) => {
    setUI(prev => ({ ...prev, isProfileDropdownOpen: open }));
  };

  const setHasNewNotification = (has: boolean) => {
    setUI(prev => ({ ...prev, hasNewNotification: has }));
  };

  const { isSidebarOpen, isNotificationOpen, isSupportOpen, isProfileDropdownOpen, hasNewNotification } = ui;

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-body antialiased flex">
      {/* SideNavBar Shell */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "bg-neutral-950 font-['Inter'] antialiased tracking-tight h-screen w-64 fixed left-0 top-0 overflow-y-auto shadow-2xl z-[100] flex flex-col p-4 md:translate-x-0",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="mb-10 px-4 pt-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tighter text-white">Admin Dashboard</h1>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Premium Admin</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {[
                { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { id: 'products', icon: <ShoppingBag size={20} />, label: 'Products' },
                { id: 'orders', icon: <Truck size={20} />, label: 'Orders' },
                { id: 'home-management', icon: <Layout size={20} />, label: 'Home Content' },
                { id: 'logistics', icon: <Globe size={20} />, label: 'Logistics' },
                { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
                { id: 'ai-assistant', icon: <Bot size={20} />, label: 'AI Assistant' },
                { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive ? "bg-[#b30400] text-white font-semibold scale-[0.98]" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto pt-6 border-t border-neutral-900 px-4 pb-4 space-y-4">
              {(apiHealth.mainGateway < 20 || apiHealth.database < 20) && (
                <div className="bg-red-950/50 border border-red-900/50 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Red Alert: Failover Active</span>
                </div>
              )}
              <button
                onClick={() => {/* signOut(auth) */}}
                className="flex items-center gap-3 text-neutral-400 hover:text-brand-red transition-colors w-full"
              >
                <X size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* TopNavBar Shell */}
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 flex flex-col justify-center px-4 md:px-8">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="relative w-full max-w-xl group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              className="w-full bg-[#f6f3f2] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              placeholder="Search orders, products, or customers..."
              type="text"
              value={orderManagement.orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage('nfc-verify')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-brand-red transition-all"
          >
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">NFC Simulator</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsSupportOpen(false);
                setIsProfileDropdownOpen(false);
                setHasNewNotification(false);
              }}
              className="hover:bg-neutral-50 rounded-full p-2 transition-all relative"
            >
              <Bell size={20} className="text-neutral-500" />
              {hasNewNotification && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>

          {/* Support Trigger */}
          <button
            onClick={() => {
              setIsSupportOpen(!isSupportOpen);
              setIsNotificationOpen(false);
              setIsProfileDropdownOpen(false);
            }}
            className="hover:bg-neutral-50 rounded-full p-2 transition-all"
          >
            <HelpCircle size={20} className="text-neutral-500" />
          </button>

          <div className="h-8 w-[1px] bg-neutral-100 mx-2"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotificationOpen(false);
                setIsSupportOpen(false);
              }}
              className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1b1b] leading-none">{adminProfile.name}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-1">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-neutral-100 border-2 border-white shadow-sm overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={adminProfile.profilePicture}
                  referrerPolicy="no-referrer"
                  alt="Admin"
                />
              </div>
              <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", isProfileDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                  >
                    <div className="p-3 border-b border-neutral-50 mb-1">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Account</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-all text-sm font-medium"
                    >
                      <UserCircle size={18} className="text-neutral-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-all text-sm font-medium"
                    >
                      <Settings size={18} className="text-neutral-400" />
                      Settings
                    </button>
                    <div className="h-[1px] bg-neutral-50 my-1"></div>
                    <button
                      onClick={() => {/* signOut(auth) */}}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-all text-sm font-bold"
                    >
                      <X size={18} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </header>

      {/* Main Content Canvas */}
      <main className="w-full md:ml-64 pt-16 flex-1 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">

          {/* Tab Content Placeholders */}
          {activeTab === 'dashboard' && <DashboardTab />}

          {activeTab === 'products' && <ProductsTab />}

          {activeTab === 'orders' && <OrdersTab />}

          {activeTab === 'analytics' && <AnalyticsTab />}

          {activeTab === 'settings' && <SettingsTab />}

          {/* Default fallback */}
          {!['dashboard', 'products', 'orders', 'analytics', 'settings'].includes(activeTab) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Tab: {activeTab}</h2>
              <p className="text-[#5e3f3a] mt-1">This tab content will be implemented in future phases</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};