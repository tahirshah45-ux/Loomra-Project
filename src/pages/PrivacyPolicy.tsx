/**
 * Privacy Policy Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Page } from '../types';

function PolicyLayout({ title, children, setPage }: { title: string; children: React.ReactNode; setPage: (p: Page) => void }) {
  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <button onClick={() => setPage('home')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-12 hover:text-brand-red transition-colors">
        <ArrowLeft size={14} />
        Back to Home
      </button>
      <h1 className="text-5xl font-black tracking-tighter uppercase mb-12 leading-none">{title}</h1>
      <div className="prose prose-neutral max-w-none font-label text-sm leading-relaxed text-gray-600 space-y-8">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicy({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <PolicyLayout title="Privacy Policy" setPage={setPage}>
      <section className="space-y-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight">1. Data Collection</h3>
        <p>We collect personal information such as name, email, and shipping address to process orders.</p>
      </section>
      <section className="space-y-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight">2. Data Usage</h3>
        <p>Your information is used solely for order processing and improving our services.</p>
      </section>
    </PolicyLayout>
  );
}
