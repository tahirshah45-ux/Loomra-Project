import React from 'react';
import { Instagram, Globe } from 'lucide-react';
import type { Page, GlobalSettings } from '../../types';

interface FooterProps {
  setPage: (p: Page) => void;
  setIsChatOpen: (o: boolean) => void;
  settings: GlobalSettings;
}

export const Footer = ({ setPage, setIsChatOpen, settings }: FooterProps) => (
  <footer className="bg-white pt-20 pb-12 border-t border-black/5">
    <div className="px-6 space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        {settings.organizationLogo ? (
          <img src={settings.organizationLogo} className="h-8 w-fit object-contain" alt={settings.organizationName} />
        ) : (
          <h2 className="text-4xl font-black tracking-tighter uppercase font-display">{settings.organizationName}</h2>
        )}
        <p className="text-gray-500 font-label text-sm max-w-xs leading-relaxed">
          {settings.siteDescription}
        </p>
        <div className="flex gap-4">
          <a className="w-10 h-10 flex items-center justify-center border border-black/10 hover:bg-black hover:text-white transition-colors" href="#">
            <Instagram size={20} />
          </a>
          <a className="w-10 h-10 flex items-center justify-center border border-black/10 hover:bg-black hover:text-white transition-colors" href="#">
            <Globe size={20} />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-bold uppercase text-xs tracking-widest">Shop</h4>
          <ul className="font-label text-xs space-y-3 text-gray-500 uppercase">
            <li><button onClick={() => setPage('shop')}>New Arrivals</button></li>
            <li><button onClick={() => setPage('shop')}>Best Sellers</button></li>
            <li><button onClick={() => setPage('shop')}>Collections</button></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold uppercase text-xs tracking-widest">Support</h4>
          <ul className="font-label text-xs space-y-3 text-gray-500 uppercase">
            <li><button onClick={() => setPage('shipping')}>Shipping Policy</button></li>
            <li><button onClick={() => setPage('return')}>Return & Exchange</button></li>
            <li><button onClick={() => setPage('privacy')}>Privacy Policy</button></li>
            <li><button onClick={() => setIsChatOpen(true)}>Contact</button></li>
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-bold uppercase text-xs tracking-widest">Newsletter</h4>
        <div className="relative">
          <input className="w-full bg-transparent border-0 border-b-2 border-black/10 focus:ring-0 focus:border-brand-red px-0 py-3 font-label text-xs uppercase tracking-widest transition-colors" placeholder="EMAIL ADDRESS" type="email"/>
          <button className="absolute right-0 bottom-3 text-brand-red font-bold font-label text-xs uppercase tracking-widest">Join</button>
        </div>
      </div>
      <div className="pt-12 border-t border-black/5 flex flex-col gap-4">
        <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest">© 2024 LOOMRA CLOTHING LTD. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  </footer>
);

// Re-export as default for backward compatibility
export default Footer;
