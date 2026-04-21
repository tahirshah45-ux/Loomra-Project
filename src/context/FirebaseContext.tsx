/**
 * Firebase Context - shared Firebase connections across all pages
 * This avoids re-initializing Firebase in each page component
 */
import { createContext, useContext, ReactNode } from 'react';
import { db, auth, storage, googleProvider, isAdmin, ADMIN_EMAIL } from '../lib/firebase';
import type { Product, Order, GlobalSettings } from '../App';

// Types for the context
export interface FirebaseContextType {
  db: typeof db;
  auth: typeof auth;
  storage: typeof storage;
  googleProvider: typeof googleProvider;
  isAdmin: typeof isAdmin;
  ADMIN_EMAIL: string;
}

// Create context with default values
const FirebaseContext = createContext<FirebaseContextType | null>(null);

// Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const value: FirebaseContextType = {
    db,
    auth,
    storage,
    googleProvider,
    isAdmin,
    ADMIN_EMAIL,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to use Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Re-export for convenience
export { db, auth, storage, googleProvider, isAdmin, ADMIN_EMAIL };
export default FirebaseContext;