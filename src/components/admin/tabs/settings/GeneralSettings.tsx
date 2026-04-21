import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useAdminState } from '../../AdminContext';
import type { GlobalSettings } from '../../types/admin.types';

const GeneralSettings: React.FC = () => {
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
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1c1b1b]">Site Details</h3>
        <p className="text-sm text-neutral-500 mt-1">Configure your store's basic information.</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Site Title</label>
          <input
            type="text"
            value={localSettings.siteTitle || ''}
            onChange={e => handleChange('siteTitle', e.target.value)}
            placeholder="e.g., https://loomra.com"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
          <p className="mt-1 text-xs text-neutral-400">Your store's main domain URL.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Organization Name</label>
          <input
            type="text"
            value={localSettings.organizationName || ''}
            onChange={e => handleChange('organizationName', e.target.value)}
            placeholder="e.g., Loomra Inc."
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Site Description</label>
          <textarea
            value={localSettings.siteDescription || ''}
            onChange={e => handleChange('siteDescription', e.target.value)}
            placeholder="Brief description of your store."
            rows={3}
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Organization Logo URL</label>
          <input
            type="text"
            value={localSettings.organizationLogo || ''}
            onChange={e => handleChange('organizationLogo', e.target.value)}
            placeholder="https://cdn.example.com/logo.png"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
          {localSettings.organizationLogo && (
            <div className="mt-3 rounded-3xl border border-neutral-200 bg-[#f5f2f0] p-4">
              <img src={localSettings.organizationLogo} alt="Logo" className="h-16 object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Support Email</label>
          <input
            type="email"
            value={localSettings.supportEmail || ''}
            onChange={e => handleChange('supportEmail', e.target.value)}
            placeholder="support@loomra.com"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Domain</label>
          <input
            type="text"
            value={localSettings.domain || ''}
            onChange={e => handleChange('domain', e.target.value)}
            placeholder="loomra.com"
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b]">Default Shipping Cost (Rs.)</label>
          <input
            type="number"
            value={localSettings.defaultShippingCost || 0}
            onChange={e => handleChange('defaultShippingCost', Number(e.target.value))}
            className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
            <input
              type="checkbox"
              checked={localSettings.codEnabled || false}
              onChange={e => handleChange('codEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
            />
            <span className="text-sm font-semibold text-[#1c1b1b]">Enable Cash on Delivery</span>
          </label>

          <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
            <input
              type="checkbox"
              checked={localSettings.nfcEnabled || false}
              onChange={e => handleChange('nfcEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
            />
            <span className="text-sm font-semibold text-[#1c1b1b]">Enable NFC Verification</span>
          </label>
        </div>

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

export default GeneralSettings;
