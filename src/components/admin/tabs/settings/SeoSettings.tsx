import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAdminState } from '../../AdminContext';
import type { GlobalSettings } from '../../types/admin.types';

const SeoSettings: React.FC = () => {
  const { settings, updateSettings, saveMasterSettings } = useAdminState();
  const [localSettings, setLocalSettings] = useState<Partial<GlobalSettings>>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: keyof GlobalSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(localSettings);
      await saveMasterSettings({ settings: { ...settings, ...localSettings } });
      alert('SEO settings saved successfully!');
    } catch (error) {
      alert('Failed to save SEO settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1c1b1b]">SEO & Schema Markup</h3>
        <p className="text-sm text-neutral-500 mt-1">Improve your store's visibility in search results.</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">WhatsApp Number</label>
          <input
            type="text"
            value={localSettings.whatsappNumber || ''}
            onChange={e => handleChange('whatsappNumber', e.target.value)}
            placeholder="+923001234567"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
          <p className="mt-1 text-xs text-neutral-400">Include country code for WhatsApp integration.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Firebase API Key</label>
          <input
            type="password"
            value={localSettings.firebaseApiKey || ''}
            onChange={e => handleChange('firebaseApiKey', e.target.value)}
            placeholder="Enter your Firebase API key"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
          <p className="mt-1 text-xs text-neutral-400">Keep this secure and do not share.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Firebase Project ID</label>
          <input
            type="text"
            value={localSettings.firebaseProjectId || ''}
            onChange={e => handleChange('firebaseProjectId', e.target.value)}
            placeholder="loomra-k3yt"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
            <input
              type="checkbox"
              checked={localSettings.autoGenerateSeo || false}
              onChange={e => handleChange('autoGenerateSeo', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
            />
            <span className="text-sm font-semibold text-[#1c1b1b]">Auto-generate SEO</span>
          </label>

          <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
            <input
              type="checkbox"
              checked={localSettings.schemaMarkupEnabled || false}
              onChange={e => handleChange('schemaMarkupEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
            />
            <span className="text-sm font-semibold text-[#1c1b1b]">Enable Schema Markup</span>
          </label>

          <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
            <input
              type="checkbox"
              checked={localSettings.whatsappEnabled || false}
              onChange={e => handleChange('whatsappEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
            />
            <span className="text-sm font-semibold text-[#1c1b1b]">Enable WhatsApp</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Announcement Bar Text</label>
          <input
            type="text"
            value={localSettings.announcementBarText || ''}
            onChange={e => handleChange('announcementBarText', e.target.value)}
            placeholder="Scrolling announcement text..."
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
          <input
            type="checkbox"
            checked={localSettings.announcementBarEnabled || false}
            onChange={e => handleChange('announcementBarEnabled', e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
          />
          <span className="text-sm font-semibold text-[#1c1b1b]">Show Announcement Bar</span>
        </label>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoSettings;
