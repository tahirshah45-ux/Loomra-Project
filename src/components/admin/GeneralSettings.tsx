/**
 * GeneralSettings.tsx - Complete Admin Panel Overhaul v5
 * 
 * Features:
 * - Independent Save buttons with dirty state detection per section
 * - Logo Management with icon-only buttons and cropper
 * - Card-based API Key Management
 * - Schema: brandInfo.whatsappNumber, assets.faviconUrl
 * - Removed Edit button, Change only shows when URL exists
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Cropper, { Area, Point } from 'react-easy-crop';
import { 
  Camera, Trash2, Upload, Plus, X, Image as ImageIcon, 
  Save, Key, CheckCircle, PlusCircle
} from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

console.log("Build Verified Version 5.0 - Admin Panel Overhaul");

// ============================================
// TYPES
// ============================================
interface NestedSettings {
  brandInfo?: {
    brandName?: string;
    contactEmail?: string;
    currency?: string;
    shippingFee?: number;
    whatsappNumber?: string;
    updatedAt?: string;
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
  // Legacy flat fields
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
  whatsappNumber?: string;
  [key: string]: any;
}

interface ApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
}

interface GeneralSettingsProps {
  settings: NestedSettings;
  setSettings: (settings: NestedSettings) => void;
  handleSaveMaster: () => Promise<void>;
  isSavingMaster: boolean;
}

// ============================================
// HELPER: Create cropped PNG
// ============================================
const createCroppedImage = async (imageSrc: string, cropArea: Area): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
  
  return canvas.toDataURL('image/png');
};

// ============================================
// HELPER: Upload to ImgBB
// ============================================
const uploadToImgBB = async (base64Data: string): Promise<string> => {
  const response = await fetch(base64Data);
  const blob = await response.blob();
  const pngFile = new File([blob], "upload_" + Date.now() + ".png", { type: "image/png" });
  const formData = new FormData();
  formData.append("image", pngFile);
  
  const imgbbResponse = await fetch(
    "https://api.imgbb.com/1/upload?key=" + import.meta.env.VITE_IMGBB_API_KEY,
    { method: "POST", body: formData }
  );
  const imgbbData = await imgbbResponse.json();
  if (!imgbbData.success || !imgbbData.data?.url) throw new Error('Failed to upload to ImgBB');
  return imgbbData.data.url;
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function GeneralSettings({
  settings,
  setSettings,
  handleSaveMaster,
  isSavingMaster
}: GeneralSettingsProps) {
  console.log("DEBUG: GeneralSettings v5 rendering");

  // ============================================
  // STATE - Track ORIGINAL values for dirty detection
  // ============================================
  const [originalSettings, setOriginalSettings] = useState<NestedSettings>(settings);
  
  // Logo state
  const [logoCropImage, setLogoCropImage] = useState<string | null>(null);
  const [logoCropArea, setLogoCropArea] = useState<Area | null>(null);
  const [logoCropPosition, setLogoCropPosition] = useState<Point>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  
  // Hero images
  const [heroImages, setHeroImages] = useState<string[]>(
    settings.homePage?.heroImageUrls || settings.heroImageUrls || []
  );
  
  // Dirty states per section
  const [brandInfoDirty, setBrandInfoDirty] = useState(false);
  const [assetsDirty, setAssetsDirty] = useState(false);
  const [homePageDirty, setHomePageDirty] = useState(false);
  const [apiKeysDirty, setApiKeysDirty] = useState(false);
  
  // API Keys state
  const [geminiKeys, setGeminiKeys] = useState<ApiKey[]>([]);
  const [supportAiKeys, setSupportAiKeys] = useState<ApiKey[]>([]);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiKeyLabel, setNewApiKeyLabel] = useState('');
  const [activeKeyType, setActiveKeyType] = useState<'gemini' | 'support'>('gemini');

  // ============================================
  // EFFECT: Sync original when settings change from parent
  // ============================================
  useEffect(() => {
    setOriginalSettings(settings);
    setBrandInfoDirty(false);
    setAssetsDirty(false);
    setHomePageDirty(false);
    setApiKeysDirty(false);
  }, [settings]);

  // ============================================
  // HELPER: Check dirty state
  // ============================================
  const checkDirty = useCallback((current: NestedSettings, section: string) => {
    const original = originalSettings;
    let isDirty = false;
    
    if (section === 'brandInfo') {
      isDirty = 
        current.brandInfo?.brandName !== original.brandInfo?.brandName ||
        current.brandInfo?.contactEmail !== original.brandInfo?.contactEmail ||
        current.brandInfo?.currency !== original.brandInfo?.currency ||
        current.brandInfo?.shippingFee !== original.brandInfo?.shippingFee ||
        current.brandInfo?.whatsappNumber !== original.brandInfo?.whatsappNumber;
      setBrandInfoDirty(isDirty);
    } else if (section === 'assets') {
      isDirty = 
        current.assets?.logoUrl !== original.assets?.logoUrl ||
        current.assets?.faviconUrl !== original.assets?.faviconUrl;
      setAssetsDirty(isDirty);
    } else if (section === 'homePage') {
      isDirty = 
        current.homePage?.heroTitle !== original.homePage?.heroTitle ||
        current.homePage?.promoVideoUrl !== original.homePage?.promoVideoUrl;
      setHomePageDirty(isDirty);
    }
  }, [originalSettings]);

  // ============================================
  // HANDLER: Save Brand Info
  // ============================================
  const handleSaveBrandInfo = async () => {
    const configRef = doc(db, "system_configs", "main");
    setIsSaving(true);
    try {
      // Ensure document exists before updating
      await setDoc(configRef, { _init: true }, { merge: true });
      await updateDoc(configRef, {
        'brandInfo.brandName': settings.brandInfo?.brandName || settings.organizationName,
        'brandInfo.contactEmail': settings.brandInfo?.contactEmail || settings.supportEmail,
        'brandInfo.currency': settings.brandInfo?.currency || settings.currency,
        'brandInfo.shippingFee': settings.brandInfo?.shippingFee ?? settings.shippingFee,
        'brandInfo.whatsappNumber': settings.brandInfo?.whatsappNumber || settings.whatsappNumber,
        'brandInfo.updatedAt': new Date().toISOString()
      });
      setOriginalSettings(settings);
      setBrandInfoDirty(false);
      toast.success('Brand info saved!');
      window.alert('Brand info saved successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMsg = err?.message || err?.code || 'Unknown error';
      toast.error('Failed to save brand info: ' + errorMsg);
      window.alert('Error saving brand info: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // HANDLER: Save Assets
  // ============================================
  const handleSaveAssets = async () => {
    const configRef = doc(db, "system_configs", "main");
    setIsSaving(true);
    try {
      // Ensure document exists before updating
      await setDoc(configRef, { _init: true }, { merge: true });
      await updateDoc(configRef, {
        'assets.logoUrl': settings.assets?.logoUrl || settings.organizationLogo,
        'assets.faviconUrl': settings.assets?.faviconUrl || settings.faviconUrl
      });
      setOriginalSettings(settings);
      setAssetsDirty(false);
      toast.success('Assets saved!');
      window.alert('Assets saved successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMsg = err?.message || err?.code || 'Unknown error';
      toast.error('Failed to save assets: ' + errorMsg);
      window.alert('Error saving assets: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // HANDLER: Save Home Page
  // ============================================
  const handleSaveHomePage = async () => {
    const configRef = doc(db, "system_configs", "main");
    setIsSaving(true);
    try {
      // Ensure document exists before updating
      await setDoc(configRef, { _init: true }, { merge: true });
      await updateDoc(configRef, {
        'homePage.heroTitle': settings.homePage?.heroTitle || settings.heroTitle,
        'homePage.heroImageUrls': heroImages,
        'homePage.promoVideoUrl': settings.homePage?.promoVideoUrl || settings.promoVideoUrl
      });
      setOriginalSettings(settings);
      setHomePageDirty(false);
      toast.success('Home page settings saved!');
      window.alert('Home page settings saved successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMsg = err?.message || err?.code || 'Unknown error';
      toast.error('Failed to save home page: ' + errorMsg);
      window.alert('Error saving home page: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // HANDLER: Upload Logo
  // ============================================
  const handleLogoUpload = async (): Promise<void> => {
    if (!logoCropImage || !logoCropArea) return;
    setIsUploadingLogo(true);
    
    try {
      const croppedBase64 = await createCroppedImage(logoCropImage, logoCropArea);
      const logoUrl = await uploadToImgBB(croppedBase64);
      
      const newSettings = { 
        ...settings,
        assets: { ...settings.assets, logoUrl }
      };
      setSettings(newSettings);
      setAssetsDirty(true);
      
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo');
    } finally {
      setLogoCropImage(null);
      setLogoCropArea(null);
      setIsUploadingLogo(false);
    }
  };

  // ============================================
  // HANDLER: Add/Remove Hero Images
  // ============================================
  const handleAddHeroImage = async (): Promise<void> => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    const newImages = [...heroImages, url];
    setHeroImages(newImages);
    setHomePageDirty(true);
  };

  const handleRemoveHeroImage = async (index: number): Promise<void> => {
    const newImages = heroImages.filter((_, i) => i !== index);
    setHeroImages(newImages);
    setHomePageDirty(true);
  };

  // ============================================
  // HANDLER: API Keys
  // ============================================
  const handleAddApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      key: newApiKey,
      label: newApiKeyLabel || 'Key ' + (activeKeyType === 'gemini' ? geminiKeys.length + 1 : supportAiKeys.length + 1),
      isActive: false
    };
    
    if (activeKeyType === 'gemini') {
      const updatedKeys = [...geminiKeys, newKey];
      setGeminiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { geminiApiKeys: updatedKeys });
    } else {
      const updatedKeys = [...supportAiKeys, newKey];
      setSupportAiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { supportAiKeys: updatedKeys });
    }
    
    setNewApiKey('');
    setNewApiKeyLabel('');
    setShowAddKeyModal(false);
    toast.success('API key added!');
  };

  const handleSetActiveKey = async (keyId: string, keyType: 'gemini' | 'support') => {
    if (keyType === 'gemini') {
      const updatedKeys = geminiKeys.map(k => ({ ...k, isActive: k.id === keyId }));
      setGeminiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { geminiApiKeys: updatedKeys });
    } else {
      const updatedKeys = supportAiKeys.map(k => ({ ...k, isActive: k.id === keyId }));
      setSupportAiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { supportAiKeys: updatedKeys });
    }
    toast.success('Active key updated!');
  };

  const handleDeleteKey = async (keyId: string, keyType: 'gemini' | 'support') => {
    if (keyType === 'gemini') {
      const updatedKeys = geminiKeys.filter(k => k.id !== keyId);
      setGeminiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { geminiApiKeys: updatedKeys });
    } else {
      const updatedKeys = supportAiKeys.filter(k => k.id !== keyId);
      setSupportAiKeys(updatedKeys);
      await updateDoc(doc(db, 'system_configs', 'main'), { supportAiKeys: updatedKeys });
    }
    toast.success('API key deleted');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-8">
      {/* BRAND INFO SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight text-[#1c1b1b]">Brand Information</h3>
          <button
            onClick={handleSaveBrandInfo}
            disabled={!brandInfoDirty || isSavingMaster}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${
              brandInfoDirty 
                ? 'bg-black text-white hover:bg-[#b30400]' 
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            Save
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Brand Name</label>
            <input
              type="text"
              value={settings.brandInfo?.brandName || settings.organizationName || ''}
              onChange={(e) => {
                setSettings({ ...settings, brandInfo: { ...settings.brandInfo, brandName: e.target.value } });
                checkDirty({ ...settings, brandInfo: { ...settings.brandInfo, brandName: e.target.value } }, 'brandInfo');
              }}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Contact Email</label>
            <input
              type="email"
              value={settings.brandInfo?.contactEmail || settings.supportEmail || ''}
              onChange={(e) => {
                setSettings({ ...settings, brandInfo: { ...settings.brandInfo, contactEmail: e.target.value } });
                checkDirty({ ...settings, brandInfo: { ...settings.brandInfo, contactEmail: e.target.value } }, 'brandInfo');
              }}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Currency</label>
            <select
              value={settings.brandInfo?.currency || settings.currency || 'USD'}
              onChange={(e) => {
                setSettings({ ...settings, brandInfo: { ...settings.brandInfo, currency: e.target.value } });
                checkDirty({ ...settings, brandInfo: { ...settings.brandInfo, currency: e.target.value } }, 'brandInfo');
              }}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="PKR">PKR (₨)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Shipping Fee</label>
            <input
              type="number"
              value={settings.brandInfo?.shippingFee ?? settings.shippingFee ?? 0}
              onChange={(e) => {
                setSettings({ ...settings, brandInfo: { ...settings.brandInfo, shippingFee: parseFloat(e.target.value) } });
                checkDirty({ ...settings, brandInfo: { ...settings.brandInfo, shippingFee: parseFloat(e.target.value) } }, 'brandInfo');
              }}
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">WhatsApp Number</label>
            <input
              type="text"
              value={settings.brandInfo?.whatsappNumber || settings.whatsappNumber || ''}
              onChange={(e) => {
                setSettings({ ...settings, brandInfo: { ...settings.brandInfo, whatsappNumber: e.target.value } });
                checkDirty({ ...settings, brandInfo: { ...settings.brandInfo, whatsappNumber: e.target.value } }, 'brandInfo');
              }}
              placeholder="+1234567890"
              className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ASSETS SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight text-[#1c1b1b]">Assets</h3>
          <button
            onClick={handleSaveAssets}
            disabled={!assetsDirty || isSavingMaster}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${
              assetsDirty 
                ? 'bg-black text-white hover:bg-[#b30400]' 
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            Save
          </button>
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a] mb-4 block">Logo (assets.logoUrl)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="relative border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:border-[#b30400] transition-colors">
                {settings.assets?.logoUrl || settings.organizationLogo ? (
                  <div className="space-y-4">
                    <img src={settings.assets?.logoUrl || settings.organizationLogo} alt="Logo" className="max-h-32 mx-auto object-contain" />
                    <div className="flex justify-center gap-2">
                      <label className="cursor-pointer p-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200" title="Change">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setLogoCropImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <Upload size={16} />
                      </label>
                      <button
                        onClick={async () => {
                          setSettings({ ...settings, assets: { ...settings.assets, logoUrl: '' } });
                          await updateDoc(doc(db, 'system_configs', 'main'), { 'assets.logoUrl': '' });
                          toast.success('Logo removed');
                        }}
                        className="p-2 bg-neutral-100 text-red-500 rounded-lg hover:bg-red-50" title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Camera size={32} className="mx-auto text-neutral-300 mb-2" />
                    <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Click to Upload</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setLogoCropImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <input
                type="text"
                value={settings.assets?.logoUrl || settings.organizationLogo || ''}
                onChange={(e) => {
                  setSettings({ ...settings, assets: { ...settings.assets, logoUrl: e.target.value } });
                  checkDirty({ ...settings, assets: { ...settings.assets, logoUrl: e.target.value } }, 'assets');
                }}
                placeholder="Or paste logo URL"
                className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a] mb-4 block">Favicon (assets.faviconUrl)</label>
          <input
            type="text"
            value={settings.assets?.faviconUrl || settings.faviconUrl || ''}
            onChange={(e) => {
              setSettings({ ...settings, assets: { ...settings.assets, faviconUrl: e.target.value } });
              checkDirty({ ...settings, assets: { ...settings.assets, faviconUrl: e.target.value } }, 'assets');
            }}
            placeholder="https://..."
            className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
          />
        </div>
      </div>

      {/* HOME PAGE SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight text-[#1c1b1b]">Home Page Settings</h3>
          <button
            onClick={handleSaveHomePage}
            disabled={!homePageDirty || isSavingMaster}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${
              homePageDirty 
                ? 'bg-black text-white hover:bg-[#b30400]' 
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            Save
          </button>
        </div>
        
        <div className="space-y-2 mb-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Hero Title</label>
          <input
            type="text"
            value={settings.homePage?.heroTitle || settings.heroTitle || ''}
            onChange={(e) => {
              setSettings({ ...settings, homePage: { ...settings.homePage, heroTitle: e.target.value } });
              checkDirty({ ...settings, homePage: { ...settings.homePage, heroTitle: e.target.value } }, 'homePage');
            }}
            className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
          />
        </div>
        
        <div className="space-y-2 mb-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Promo Video URL</label>
          <input
            type="text"
            value={settings.homePage?.promoVideoUrl || settings.promoVideoUrl || ''}
            onChange={(e) => {
              setSettings({ ...settings, homePage: { ...settings.homePage, promoVideoUrl: e.target.value } });
              checkDirty({ ...settings, homePage: { ...settings.homePage, promoVideoUrl: e.target.value } }, 'homePage');
            }}
            placeholder="https://youtube.com/..."
            className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#b30400]/20 outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Hero Image URLs</label>
            <button onClick={handleAddHeroImage} className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#b30400]">
              <Plus size={14} />Add
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroImages.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={"Hero " + (index + 1)} className="w-full h-24 object-cover rounded-lg" />
                <button onClick={() => handleRemoveHeroImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                  <X size={12} />
                </button>
              </div>
            ))}
            {heroImages.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
                <ImageIcon size={32} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-xs text-neutral-400">No hero images</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API KEYS SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight text-[#1c1b1b]">API Keys</h3>
          <button onClick={() => setShowAddKeyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#b30400]">
            <PlusCircle size={14} />Add Key
          </button>
        </div>
        
        <div>
          <h4 className="text-sm font-bold mb-4">Gemini API Keys</h4>
          <div className="flex flex-wrap gap-2">
            {geminiKeys.length === 0 ? (
              <p className="text-xs text-neutral-400">No Gemini API keys added</p>
            ) : (
              geminiKeys.map(key => (
                <div key={key.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${key.isActive ? 'border-green-500 bg-green-50' : 'border-neutral-200'}`}>
                  <Key size={14} className={key.isActive ? 'text-green-500' : 'text-neutral-400'} />
                  <span className="text-xs font-medium">{key.label}</span>
                  {key.isActive && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>}
                  <button onClick={() => handleSetActiveKey(key.id, 'gemini')} title="Set Active"><CheckCircle size={14} className="text-neutral-400 hover:text-green-500" /></button>
                  <button onClick={() => handleDeleteKey(key.id, 'gemini')} title="Delete"><Trash2 size={14} className="text-neutral-400 hover:text-red-500" /></button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-bold mb-4">Support AI Keys</h4>
          <div className="flex flex-wrap gap-2">
            {supportAiKeys.length === 0 ? (
              <p className="text-xs text-neutral-400">No Support AI keys added</p>
            ) : (
              supportAiKeys.map(key => (
                <div key={key.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${key.isActive ? 'border-green-500 bg-green-50' : 'border-neutral-200'}`}>
                  <Key size={14} className={key.isActive ? 'text-green-500' : 'text-neutral-400'} />
                  <span className="text-xs font-medium">{key.label}</span>
                  {key.isActive && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>}
                  <button onClick={() => handleSetActiveKey(key.id, 'support')} title="Set Active"><CheckCircle size={14} className="text-neutral-400 hover:text-green-500" /></button>
                  <button onClick={() => handleDeleteKey(key.id, 'support')} title="Delete"><Trash2 size={14} className="text-neutral-400 hover:text-red-500" /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD API KEY MODAL */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Key Type</label>
                <select value={activeKeyType} onChange={(e) => setActiveKeyType(e.target.value as 'gemini' | 'support')} className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm">
                  <option value="gemini">Gemini</option>
                  <option value="support">Support AI</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">Label (optional)</label>
                <input type="text" value={newApiKeyLabel} onChange={(e) => setNewApiKeyLabel(e.target.value)} placeholder="My API Key" className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e3f3a]">API Key</label>
                <input type="password" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="Enter API key..." className="w-full bg-[#f6f3f2] border-none rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowAddKeyModal(false); setNewApiKey(''); setNewApiKeyLabel(''); }} className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg border border-neutral-200">Cancel</button>
              <button onClick={handleAddApiKey} className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg bg-black text-white">Add Key</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGO CROP MODAL */}
      {logoCropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Crop Logo (PNG)</h3>
            <div className="relative h-80 mb-4">
              <Cropper 
                image={logoCropImage} 
                aspect={1} 
                crop={logoCropPosition}
                onCropChange={(cropPos) => setLogoCropPosition(cropPos)}
                onCropComplete={(_croppedArea, croppedPixels) => setLogoCropArea(croppedPixels)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setLogoCropImage(null); setLogoCropArea(null); }} className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg border border-neutral-200">Cancel</button>
              <button onClick={handleLogoUpload} disabled={isUploadingLogo} className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg bg-black text-white disabled:opacity-50">
                {isUploadingLogo ? 'Uploading...' : 'Save as PNG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}