'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { siteConfig } from '@/config/site';

// 動態載入 AuthButton，避免 SSR 問題
const AuthButton = dynamic(() => import('./AuthButton'), { 
  ssr: false,
  loading: () => <div className="w-20 h-9 bg-white/10 rounded-full animate-pulse" />
});

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <span className="text-2xl">☯️</span>
          <span className="font-bold text-lg hidden sm:inline">{siteConfig.name}</span>
        </Link>
        
        <AuthButton />
      </div>
    </header>
  );
}
