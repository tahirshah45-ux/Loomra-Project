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

// Debug: Log project ID to verify env vars are reaching frontend
console.log("Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("Firebase Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use default database from the live Firebase project (no hard-coded database name)
export const db = getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Admin email for access control
export const ADMIN_EMAIL = "tahirshah45@gmail.com";

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