'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={async () => {
          setIsLoggingIn(true);
          try {
            await signInWithGoogle();
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoggingIn(false);
          }
        }}
        disabled={isLoggingIn}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 
                   rounded-full text-white text-sm font-medium transition-all
                   border border-white/20 hover:border-white/40"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoggingIn ? '登入中...' : '登入'}
      </button>
    );
  }

  // 已登入
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all"
      >
        {user.user_metadata.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-9 h-9 rounded-full border-2 border-white/30"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                          flex items-center justify-center text-white font-bold">
            {(user.email?.[0] || '?').toUpperCase()}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute right-0 top-12 z-50 w-56 py-2 bg-gray-900/95 backdrop-blur-lg 
                          rounded-xl border border-white/10 shadow-2xl">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-white font-medium truncate">
                {user.user_metadata.full_name || user.user_metadata.name || '用戶'}
              </p>
              <p className="text-white/50 text-sm truncate">{user.email}</p>
            </div>
            
            <Link
              href="/my-readings"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                         hover:bg-white/10 transition-all"
            >
              <span>📋</span>
              <span>我的紀錄</span>
            </Link>
            
            <button
              onClick={async () => {
                setShowMenu(false);
                await signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                         hover:bg-white/10 transition-all"
            >
              <span>🚪</span>
              <span>登出</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
