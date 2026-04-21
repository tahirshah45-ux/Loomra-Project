/**
 * Firebase Connection Diagnostic Script
 * Run this in browser console or as a test component to verify Firestore connection
 */

import { db } from './lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function testFirestoreConnection(): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log('%c🔥 Firebase Connection Test', 'font-size: 16px; font-weight: bold; color: #ff6b6b;');
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`📍 Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`🔗 Auth Domain: ${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}`);
  console.log('─'.repeat(50));

  try {
    // Test 1: Read products collection
    console.log('📦 Test 1: Reading products collection...');
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    console.log(`   ✅ SUCCESS: Read ${productsSnapshot.size} products`);
    
    if (productsSnapshot.size > 0) {
      const firstProduct = productsSnapshot.docs[0].data();
      console.log(`   📝 Sample product: ${firstProduct.name || 'unnamed'}`);
      console.log(`   🆔 ID: ${productsSnapshot.docs[0].id}`);
    }

    // Test 2: Read settings collection
    console.log('⚙️ Test 2: Reading settings document...');
    const settingsRef = doc(db, 'settings', 'general');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      console.log(`   ✅ SUCCESS: Settings found`);
      const settingsData = settingsSnap.data();
      console.log(`   🏪 Brand: ${settingsData.brandInfo?.brandName || 'N/A'}`);
    } else {
      console.log(`   ⚠️ WARNING: Settings document not found (may not exist yet)`);
    }

    // Test 3: Check network connectivity
    console.log('🌐 Test 3: Network connectivity...');
    console.log(`   ✅ Firestore SDK connected successfully`);

    console.log('─'.repeat(50));
    console.log('%c🎉 ALL TESTS PASSED', 'color: #51cf66; font-weight: bold;');
    console.log('%c   Firebase connection is working correctly!', 'color: #51cf66;');

  } catch (error: any) {
    console.error('─'.repeat(50));
    console.log('%c❌ CONNECTION FAILED', 'color: #ff6b6b; font-weight: bold;');
    
    // Parse specific error codes
    if (error.code) {
      console.log(`   🔴 Error Code: ${error.code}`);
    }
    
    if (error.message) {
      console.log(`   🔴 Message: ${error.message}`);
    }
    
    // Common error causes
    const errorPatterns: Record<string, string> = {
      'permission-denied': '🔐 Firestore rules are blocking access. Check security rules.',
      'network-error': '🌐 Network issue. Check firewall/VPN or internet connection.',
      'not-found': '🔍 Collection/document doesn\'t exist in Firestore yet.',
      'invalid-argument': '⚠️ Invalid configuration. Check Firebase config values.',
      'unavailable': '🚫 Firestore service unavailable. Check Firebase console.',
      'unauthenticated': '👤 Authentication required. User must be logged in.'
    };
    
    for (const [pattern, solution] of Object.entries(errorPatterns)) {
      if (error.message?.includes(pattern) || error.code?.includes(pattern)) {
        console.log(`   💡 ${solution}`);
      }
    }
  }
}

// Run immediately if in browser
if (typeof window !== 'undefined') {
  // Expose globally for browser console testing
  (window as any).testFirestoreConnection = testFirestoreConnection;
  console.log('%c🔧 Run testFirestoreConnection() in console to test Firestore', 'color: #748ffc;');
}

export default testFirestoreConnection;