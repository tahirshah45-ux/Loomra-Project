import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-toastify';
import { FirebaseUser, GlobalSettings, AISettings, Order, Product, AnnouncementSettings, HomeContentSettings, SMTPSettings, AutomationRule } from '../App';

interface UseInitializeAppProps {
  apiHealth: { status: string, isConfigMissing: boolean };
  setApiHealth: React.Dispatch<React.SetStateAction<{ status: string, isConfigMissing: boolean }>>;
  setAiSettings: React.Dispatch<React.SetStateAction<AISettings>>;
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
  setIsAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAdminAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setTeam: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setPage: (page: string) => void;
  setVerifyId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowAnnouncement: React.Dispatch<React.SetStateAction<boolean>>;
  setAnnouncementSettings: React.Dispatch<React.SetStateAction<AnnouncementSettings>>;
  setHomeContentSettings: React.Dispatch<React.SetStateAction<HomeContentSettings>>;
  setSmtpSettings: React.Dispatch<React.SetStateAction<SMTPSettings>>;
  setAutomationRules: React.Dispatch<React.SetStateAction<AutomationRule[]>>;
}

export const useInitializeApp = ({
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
}: UseInitializeAppProps) => {

  // Health check synchronization
  useEffect(() => {
    setApiHealth({
      mainGateway: apiHealth.mainGateway,
      supportAi: apiHealth.supportAi,
      database: apiHealth.database,
      status: apiHealth.status,
      isConfigMissing: apiHealth.isConfigMissing
    });

    if (apiHealth.status === 'red' && !apiHealth.isConfigMissing) {
      toast.error("DATABASE UNREACHABLE: Triggering Local-First Fallback");
    } else if (apiHealth.status === 'yellow') {
      toast.warning("HIGH TRAFFIC: Read-Only Mode Enabled");
    }
  }, [apiHealth]);

  // Recovery Flow: Re-validate AI Training Instructions
  useEffect(() => {
    const revalidateAiConfig = async () => {
      if (apiHealth.status === 'green' && !apiHealth.isConfigMissing && user) {
        try {
          const configRef = collection(db, 'support_config');
          const q = query(configRef, limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            if (data && data.training_instructions) {
              setAiSettings(prev => ({
                ...prev,
                systemInstruction: data.training_instructions
              }));
              console.log("AI Training Instructions Re-validated from Firestore.");
            }
          }
        } catch (err) {
          console.error("AI Config Re-validation Error:", err);
        }
      }
    };
    revalidateAiConfig();
  }, [apiHealth.status, apiHealth.isConfigMissing, user]);

  // Config Fetching Logic
  useEffect(() => {
    const fetchConfigs = async () => {
      if (apiHealth.status !== 'red' && user) {
        try {
          const querySnapshot = await getDocs(collection(db, 'system_configs'));
          const data = querySnapshot.docs.map(doc => doc.data());
          if (data) {
            const geminiKey = data.find(c => c.key_name === 'GEMINI_API_KEY')?.value;
            const firebaseApiKey = data.find(c => c.key_name === 'VITE_FIREBASE_API_KEY')?.value;
            const firebaseProjectId = data.find(c => c.key_name === 'VITE_FIREBASE_PROJECT_ID')?.value;
            const organizationLogo = data.find(c => c.key_name === 'ORGANIZATION_LOGO')?.value;

            if (geminiKey && !geminiKey.includes('DUMMY')) {
              setAiSettings(prev => ({
                ...prev,
                apiKey: geminiKey,
                apiKeys: [{ key: geminiKey, status: 'Active' }]
              }));
            }

            if (firebaseApiKey && firebaseProjectId && !firebaseApiKey.includes('DUMMY')) {
              setSettings(prev => ({
                ...prev,
                firebaseApiKey,
                firebaseProjectId,
                organizationLogo: organizationLogo || prev.organizationLogo
              }));
            } else if (organizationLogo) {
              setSettings(prev => ({
                ...prev,
                organizationLogo
              }));
            }
          }
        } catch (err) {
          console.error("Config Fetching Error:", err);
        }
      }
    };
    fetchConfigs();
  }, [apiHealth.status, user]);

  // IndexedDB Sync Logic for Offline Orders
  useEffect(() => {
    if (apiHealth.status === 'green' && !apiHealth.isConfigMissing) {
      const syncOrders = async () => {
        setIsSyncing(true);
        try {
          const request = indexedDB.open('LoomraOfflineDB', 1);
          request.onsuccess = (event: any) => {
            const idb = event.target.result;
            const transaction = idb.transaction(['orders'], 'readwrite');
            const store = transaction.objectStore('orders');
            const getAll = store.getAll();
            getAll.onsuccess = async () => {
              const offlineOrders = getAll.result;
              if (offlineOrders.length > 0) {
                console.log(`Flushing ${offlineOrders.length} local orders to Firestore...`);

                // Flush to Firestore orders collection
                for (const order of offlineOrders) {
                  try {
                    await setDoc(doc(db, 'orders', order.id), {
                      ...order,
                      created_at: serverTimestamp()
                    });
                    store.delete(order.id);
                  } catch (error) {
                    console.error("Firestore Sync Error for order:", order.id, error);
                  }
                }

                setOrders(prev => {
                  const existingIds = new Set(prev.map(o => o.id));
                  const uniqueOffline = offlineOrders.filter((o: Order) => !existingIds.has(o.id));
                  return [...uniqueOffline, ...prev];
                });

                toast.success(`Background Sync: ${offlineOrders.length} orders processed!`);
              }
              setIsSyncing(false);
            };
            getAll.onerror = () => setIsSyncing(false);
          };
          request.onerror = () => setIsSyncing(false);
        } catch (e) {
          console.error("IndexedDB Sync Error:", e);
          setIsSyncing(false);
        }
      };
      syncOrders();
    }
  }, [apiHealth.status, apiHealth.isConfigMissing]);

  // Auth State Listener
  useEffect(() => {
    // Set a timeout to prevent indefinite loading state
    const loadingTimeout = setTimeout(() => {
      console.warn("Auth loading timeout - forcing auth check complete");
      setIsAuthLoading(false);
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      clearTimeout(loadingTimeout);
      setUser(u);
      if (u) {
        setIsAdminAuthenticated(true);
        const isAdmin = u.email === "tahirshah45@gmail.com";
        const adminData = {
          id: u.uid,
          name: u.displayName || u.email?.split('@')[0] || 'Admin',
          email: u.email || '',
          role: isAdmin ? 'super_admin' : 'admin',
          avatar: u.photoURL || '',
          permissions: isAdmin ? ['all'] : ['read'],
          lastLogin: new Date().toISOString()
        };
        setTeam([adminData]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // URL Parameter Handling and Settings Loading
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
};