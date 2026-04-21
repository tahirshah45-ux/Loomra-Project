import React, { useState } from 'react';
import { Save, TestTube } from 'lucide-react';
import { useAdminState } from '../../AdminContext';
import type { SMTPSettings, AISettings } from '../../types/admin.types';

const SmtpSettings: React.FC = () => {
  const { smtpSettings, aiSettings, updateSMTPSettings, updateAISettings, testGeminiConnection } = useAdminState();
  const [localSmtp, setLocalSmtp] = useState<SMTPSettings>(smtpSettings);
  const [localAI, setLocalAI] = useState<AISettings>(aiSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSmtpChange = (key: keyof SMTPSettings, value: any) => {
    setLocalSmtp(prev => ({ ...prev, [key]: value }));
  };

  const handleAIChange = (key: keyof AISettings, value: any) => {
    setLocalAI(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSmtp = async () => {
    setIsSaving(true);
    try {
      updateSMTPSettings(localSmtp);
      alert('SMTP settings saved successfully!');
    } catch (error) {
      alert('Failed to save SMTP settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAI = async () => {
    setIsSaving(true);
    try {
      updateAISettings(localAI);
      alert('AI settings saved successfully!');
    } catch (error) {
      alert('Failed to save AI settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testGeminiConnection();
      alert('AI connection test passed!');
    } catch (error) {
      alert('AI connection test failed. Please check your API key.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1c1b1b]">Integrations</h3>
        <p className="text-sm text-neutral-500 mt-1">Configure email and AI services for your store.</p>
      </div>

      {/* SMTP Settings */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h4 className="font-semibold text-[#1c1b1b]">Email Configuration (SMTP)</h4>
          <p className="text-xs text-neutral-400 mt-1">Set up email delivery for order notifications.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[#1c1b1b]">SMTP Host</label>
            <input
              type="text"
              value={localSmtp.host || ''}
              onChange={e => handleSmtpChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1b1b]">SMTP Port</label>
            <input
              type="number"
              value={localSmtp.port || 587}
              onChange={e => handleSmtpChange('port', Number(e.target.value))}
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1b1b]">Email Address</label>
            <input
              type="email"
              value={localSmtp.email || ''}
              onChange={e => handleSmtpChange('email', e.target.value)}
              placeholder="noreply@loomra.com"
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1b1b]">Password</label>
            <input
              type="password"
              value={localSmtp.password || ''}
              onChange={e => handleSmtpChange('password', e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
          <input
            type="checkbox"
            checked={localSmtp.enabled || false}
            onChange={e => handleSmtpChange('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
          />
          <span className="text-sm font-semibold text-[#1c1b1b]">Enable SMTP</span>
        </label>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSaveSmtp}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save SMTP'}
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h4 className="font-semibold text-[#1c1b1b]">AI Configuration</h4>
          <p className="text-xs text-neutral-400 mt-1">Set up AI services for product descriptions and analytics.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#1c1b1b]">Gemini API Key</label>
            <input
              type="password"
              value={localAI.apiKey || ''}
              onChange={e => handleAIChange('apiKey', e.target.value)}
              placeholder="Enter your Gemini API key"
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            />
            <p className="mt-1 text-xs text-neutral-400">Get your key from Google AI Studio.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1b1b]">Model</label>
            <select
              value={localAI.model || 'gemini-pro'}
              onChange={e => handleAIChange('model', e.target.value)}
              className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-pro-vision">Gemini Pro Vision</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4 cursor-pointer hover:bg-[#f5f2f0]">
          <input
            type="checkbox"
            checked={localAI.enabled || false}
            onChange={e => handleAIChange('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-[#b30400]"
          />
          <span className="text-sm font-semibold text-[#1c1b1b]">Enable AI Services</span>
        </label>

        <div className="pt-4 border-t border-neutral-200 space-y-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !localAI.apiKey}
            className="inline-flex items-center gap-2 rounded-full border border-[#b30400] bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#b30400] transition hover:bg-[#b30400] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube size={16} />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            onClick={handleSaveAI}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmtpSettings;
