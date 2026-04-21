import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - MUST use environment variables, no fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Validate config before initializing - prevent crashes with missing env vars
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain;

// Debug: Log project ID to verify env vars are reaching frontend
console.log("Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET');
console.log("Firebase Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'NOT SET');
console.log("Firebase Configured:", isFirebaseConfigured);

// Initialize Firebase only if configured
let app: any = null;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    app = null;
  }
} else {
  console.warn("Firebase not configured - environment variables may be missing");
}

// Export db, auth, storage (will be null if not configured)
export { db, auth, storage };

// Admin email for access control
export const ADMIN_EMAIL = "tahirshah45@gmail.com";

// Google Auth Provider (create lazily to avoid issues when Firebase isn't configured)
export const googleProvider = new GoogleAuthProvider();

/**
 * Check if the user is an admin
 * @param user - Firebase user object
 * @returns true if user's email matches ADMIN_EMAIL
 */
export const isAdmin = (user: FirebaseUser | null): boolean => {
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
};

export default app;