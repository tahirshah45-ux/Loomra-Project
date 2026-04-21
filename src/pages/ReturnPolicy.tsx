/**
 * Return Policy Page
 * Extracted from App.tsx for cleaner architecture
 */
'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Page } from '../App';

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

export default function ReturnPolicy({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <PolicyLayout title="Return Policy" setPage={setPage}>
      <section className="space-y-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight">1. Return Window</h3>
        <p>We offer a 7-day return policy for all unused items with tags attached.</p>
      </section>
      <section className="space-y-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight">2. Refund Process</h3>
        <p>Refunds are processed within 5-7 business days after receiving the returned item.</p>
      </section>
    </PolicyLayout>
  );
}
