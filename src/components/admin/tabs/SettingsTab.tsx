import React from 'react';
import { Settings, Globe, Users, Mail } from 'lucide-react';
import { useAdminState } from '../AdminContext';
import GeneralSettings from './settings/GeneralSettings';
import SeoSettings from './settings/SeoSettings';
import TeamSettings from './settings/TeamSettings';
import SmtpSettings from './settings/SmtpSettings';
import { cn } from '@/lib/utils';

const SETTINGS_TABS = [
  { id: 'general', icon: <Settings size={20} />, label: 'General' },
  { id: 'seo', icon: <Globe size={20} />, label: 'SEO & API' },
  { id: 'team', icon: <Users size={20} />, label: 'Team' },
  { id: 'smtp', icon: <Mail size={20} />, label: 'Integrations' }
] as const;

const SettingsTab: React.FC = () => {
  const { settingsTab, setSettingsTab } = useAdminState();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Settings</h2>
        <p className="text-[#5e3f3a] mt-1 max-w-2xl">
          Manage your store configuration, team members, and third-party integrations.
        </p>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-0 shadow-sm overflow-hidden">
        <div className="flex gap-1 border-b border-neutral-200 bg-[#fbfaf9] p-3 overflow-x-auto">
          {SETTINGS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition whitespace-nowrap',
                settingsTab === tab.id
                  ? 'bg-[#b30400] text-white'
                  : 'text-neutral-600 hover:text-[#1c1b1b] hover:bg-neutral-100'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {settingsTab === 'general' && <GeneralSettings />}
          {settingsTab === 'seo' && <SeoSettings />}
          {settingsTab === 'team' && <TeamSettings />}
          {settingsTab === 'smtp' && <SmtpSettings />}
        </div>
      </section>
    </div>
  );
};

export default SettingsTab;
