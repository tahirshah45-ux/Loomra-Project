/**
 * MIGRATION SCRIPT: system_config/main
 * 
 * Migrates flat document structure to nested hierarchy.
 * Run this once in the browser console or as a standalone script.
 * 
 * @param db - Firestore database instance
 * @param dryRun - If true, logs changes without applying (for testing)
 */
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SystemConfig {
  // Flat fields (existing)
  organizationName?: string;
  supportEmail?: string;
  domain?: string;
  currency?: string;
  shippingFee?: number;
  organizationLogo?: string;
  faviconUrl?: string;
  heroTitle?: string;
  heroImageUrls?: string[];
  promoVideoUrl?: string;
  announcementBarEnabled?: boolean;
  announcementBarText?: string;
  announcementSettings?: any;
  
  // New nested structure
  brandInfo?: {
    brandName?: string;
    contactEmail?: string;
    currency?: string;
    shippingFee?: number;
    updatedAt?: any;
  };
  assets?: {
    logoUrl?: string;
    faviconUrl?: string;
  };
  homePage?: {
    heroTitle?: string;
    heroImageUrls?: string[];
    promoVideoUrl?: string;
  };
  
  // Other fields (preserve at root)
  [key: string]: any;
}

export async function migrateSystemConfig(dryRun: boolean = true): Promise<void> {
  const configRef = doc(db, 'system_configs', 'main');
  
  console.log('🔄 Starting migration of system_config/main...');
  console.log(`📋 Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  
  try {
    // 1. Get existing document
    const docSnap = await getDoc(configRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Document system_configs/main does not exist!');
      return;
    }
    
    const existingData = docSnap.data() as SystemConfig;
    console.log('📄 Current document data:', JSON.stringify(existingData, null, 2));
    
    // 2. Build migration mapping
    const migrationData: Partial<SystemConfig> = {};
    
    // Map to brandInfo
    migrationData.brandInfo = {
      brandName: existingData.organizationName || existingData.brandInfo?.brandName,
      contactEmail: existingData.supportEmail || existingData.brandInfo?.contactEmail,
      currency: existingData.currency || existingData.brandInfo?.currency,
      shippingFee: existingData.shippingFee ?? existingData.brandInfo?.shippingFee,
      updatedAt: new Date().toISOString(),
    };
    
    // Map to assets
    migrationData.assets = {
      logoUrl: existingData.organizationLogo || existingData.assets?.logoUrl,
      faviconUrl: existingData.faviconUrl || existingData.assets?.faviconUrl,
    };
    
    // Map to homePage
    migrationData.homePage = {
      heroTitle: existingData.heroTitle || existingData.homePage?.heroTitle,
      heroImageUrls: existingData.heroImageUrls || existingData.homePage?.heroImageUrls || [],
      promoVideoUrl: existingData.promoVideoUrl || existingData.homePage?.promoVideoUrl,
    };
    
    console.log('📦 Migration data:', JSON.stringify(migrationData, null, 2));
    
    if (dryRun) {
      console.log('⚠️ DRY RUN: No changes applied. Set dryRun=false to execute.');
      return;
    }
    
    // 3. Apply migration using updateDoc (preserves other fields)
    await updateDoc(configRef, {
      'brandInfo.brandName': migrationData.brandInfo!.brandName,
      'brandInfo.contactEmail': migrationData.brandInfo!.contactEmail,
      'brandInfo.currency': migrationData.brandInfo!.currency,
      'brandInfo.shippingFee': migrationData.brandInfo!.shippingFee,
      'brandInfo.updatedAt': migrationData.brandInfo!.updatedAt,
      'assets.logoUrl': migrationData.assets!.logoUrl,
      'assets.faviconUrl': migrationData.assets!.faviconUrl,
      'homePage.heroTitle': migrationData.homePage!.heroTitle,
      'homePage.heroImageUrls': migrationData.homePage!.heroImageUrls,
      'homePage.promoVideoUrl': migrationData.homePage!.promoVideoUrl,
    });
    
    console.log('✅ Migration completed successfully!');
    
    // 4. Verify migration
    const updatedDoc = await getDoc(configRef);
    console.log('📄 Updated document:', JSON.stringify(updatedDoc.data(), null, 2));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Rollback migration (restore flat structure)
 * WARNING: This will overwrite the nested structure!
 */
export async function rollbackMigration(): Promise<void> {
  const configRef = doc(db, 'system_configs', 'main');
  
  console.log('🔄 Rolling back migration...');
  
  try {
    const docSnap = await getDoc(configRef);
    const data = docSnap.data() as SystemConfig;
    
    const flatData: any = {
      organizationName: data.brandInfo?.brandName,
      supportEmail: data.brandInfo?.contactEmail,
      currency: data.brandInfo?.currency,
      shippingFee: data.brandInfo?.shippingFee,
      organizationLogo: data.assets?.logoUrl,
      faviconUrl: data.assets?.faviconUrl,
      heroTitle: data.homePage?.heroTitle,
      heroImageUrls: data.homePage?.heroImageUrls,
      promoVideoUrl: data.homePage?.promoVideoUrl,
    };
    
    await setDoc(configRef, flatData, { merge: true });
    console.log('✅ Rollback complete!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  }
}

// Export for use in browser console
// window.migrateSystemConfig = migrateSystemConfig;