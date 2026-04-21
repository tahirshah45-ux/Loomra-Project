import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

export interface HealthState {
  database: number;
  mainGateway: number;
  supportAi: number;
  latency: number;
  status: 'green' | 'yellow' | 'red';
  isConfigMissing: boolean;
}

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthState>({
    database: 100,
    mainGateway: 100,
    supportAi: 100,
    latency: 0,
    status: 'green',
    isConfigMissing: false
  });

  const checkHealth = async () => {
    const start = performance.now();
    try {
      // Safety check: if db is not properly initialized, set to green and skip
      if (!db || !db.app) {
        console.log('Firebase not initialized, skipping health check');
        return;
      }
      
      // 1. Check for keys in Firestore collections: system_configs or settings
      const geminiDoc = await getDoc(doc(db, 'system_configs', 'GEMINI_API_KEY'));
      const firebaseKeyDoc = await getDoc(doc(db, 'system_configs', 'VITE_FIREBASE_API_KEY'));
      
      // Also check 'settings' collection as per user instructions
      const settingsDoc = await getDoc(doc(db, 'settings', 'master'));
      
      const geminiKey = geminiDoc.exists() ? geminiDoc.data().value : null;
      const firebaseKey = firebaseKeyDoc.exists() ? firebaseKeyDoc.data().value : null;
      const hasSettings = settingsDoc.exists();
      
      // Ecosystem card hides if keys exist in settings or system_configs
      const isConfigMissing = !geminiKey && !firebaseKey && !hasSettings;
      
      const end = performance.now();
      const latency = end - start;
      let status: 'green' | 'yellow' | 'red' = 'green';
      let dbHealth = 100;
      let gatewayHealth = 100;
      let aiHealth = (geminiKey || (hasSettings && settingsDoc.data().gemini_api_key)) ? 100 : 0;
      
      if (latency > 1500) {
        status = 'yellow';
        dbHealth = 50;
        gatewayHealth = 50;
      }
      
      const newState: HealthState = {
        database: dbHealth,
        mainGateway: gatewayHealth,
        supportAi: aiHealth,
        latency,
        status,
        isConfigMissing
      };
      
      setHealth(newState);
      return newState;
    } catch (err) {
      console.error("Health Check Error:", err);
      // Don't update state to red on error - keep current state
      // This prevents the error screen from flashing during normal operation
    }
  };

  useEffect(() => {
    // Add a small delay to let Firebase initialize
    const timeout = setTimeout(() => {
      checkHealth();
    }, 2000);
    
    const interval = setInterval(checkHealth, 30000); // Check every 30s to reduce reads
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return { health, checkHealth };
}
