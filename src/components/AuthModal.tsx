'use client';

import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('請填寫帳號和密碼');
      return;
    }

    if (username.length < 3) {
      setError('帳號至少需要 3 個字元');
      return;
    }

    if (password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '操作失敗');
        return;
      }

      // 儲存到 localStorage
      localStorage.setItem('fortune_user', JSON.stringify(data.user));
      
      onSuccess(data.user);
      onClose();
    } catch (e) {
      setError('發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 彈窗 */}
      <div className="relative w-full max-w-sm bg-gradient-to-br from-[#1a1a3a] to-[#0d0d2b] 
                      rounded-2xl border border-purple-500/30 shadow-2xl p-6">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* 標題 */}
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? '登入' : '註冊'}
        </h2>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入帳號"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                         text-white placeholder-white/40 focus:border-purple-400 
                         focus:outline-none transition-colors"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                         text-white placeholder-white/40 focus:border-purple-400 
                         focus:outline-none transition-colors"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-white/70 text-sm mb-1">確認密碼</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入密碼"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                           text-white placeholder-white/40 focus:border-purple-400 
                           focus:outline-none transition-colors"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white font-medium rounded-xl hover:opacity-90 
                       disabled:opacity-50 transition-opacity"
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
          </button>
        </form>

        {/* 切換模式 */}
        <p className="mt-4 text-center text-white/50 text-sm">
          {mode === 'login' ? (
            <>還沒有帳號？<button onClick={() => { setMode('register'); setError(''); }} className="text-purple-400 hover:text-purple-300">註冊</button></>
          ) : (
            <>已有帳號？<button onClick={() => { setMode('login'); setError(''); }} className="text-purple-400 hover:text-purple-300">登入</button></>
          )}
        </p>
      </div>
    </div>
  );
}
