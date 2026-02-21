'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';

interface User {
  id: string;
  username: string;
}

interface Reading {
  id: string;
  name: string;
  birth_info: {
    year: number;
    month: number;
    day: number;
    hour: string;
    gender: string;
  };
  reading_type: string;
  created_at: string;
}

export default function MyReadingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // 從 localStorage 讀取用戶資訊
    const savedUser = localStorage.getItem('fortune_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchReadings(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchReadings = async (userId: string) => {
    const { data, error } = await supabase
      .from('readings')
      .select('id, name, birth_info, reading_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReadings(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆紀錄嗎？')) return;
    
    setDeleting(id);
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id);

    if (!error) {
      setReadings(readings.filter(r => r.id !== id));
    }
    setDeleting(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('fortune_user');
    setUser(null);
    setReadings([]);
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    fetchReadings(u.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReadingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      comprehensive: '八字+紫微 綜合',
      bazi: '八字命盤',
      ziwei: '紫微斗數',
      yijing: '易經占卜',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] 
                      flex items-center justify-center">
        <div className="text-white/60">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 頂部導航 */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-purple-300 hover:text-amber-300 transition-colors"
            >
              <span>←</span>
              <span>返回首頁</span>
            </Link>
            
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">
                  👤 {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  登出
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📋</span>
            <span>我的紀錄</span>
          </h1>

          {/* 未登入狀態 */}
          {!user ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔐</div>
              <p className="text-white/60 mb-6">登入後可以保存和查看您的排盤紀錄</p>
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r 
                           from-purple-500 to-pink-500 rounded-full text-white font-medium
                           hover:opacity-90 transition-opacity"
              >
                <span>👤</span>
                <span>登入 / 註冊</span>
              </button>
            </div>
          ) : readings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">還沒有任何紀錄</p>
              <Link
                href="/comprehensive"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r 
                           from-purple-500 to-pink-500 rounded-full text-white font-medium
                           hover:opacity-90 transition-opacity"
              >
                <span>☯️</span>
                <span>開始排盤</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 
                             border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/my-readings/${reading.id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-medium text-white group-hover:text-purple-300 
                                       transition-colors truncate">
                          {reading.name}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                          {reading.birth_info.year}年{reading.birth_info.month}月{reading.birth_info.day}日
                          {reading.birth_info.hour && ` ${reading.birth_info.hour}時`}
                          {' · '}
                          {reading.birth_info.gender === 'male' ? '男' : '女'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                            {getReadingTypeLabel(reading.reading_type)}
                          </span>
                          <span className="text-white/40">
                            {formatDate(reading.created_at)}
                          </span>
                        </div>
                      </Link>
                      
                      {/* 合盤按鈕 */}
                      <Link
                        href={`/relationship?from=${reading.id}`}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 
                                   bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                                   border border-purple-500/30 rounded-lg
                                   text-purple-300 text-sm hover:from-purple-500/30 hover:to-pink-500/30 
                                   transition-all"
                      >
                        <span>💫</span>
                        <span>與他人合盤</span>
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(reading.id)}
                      disabled={deleting === reading.id}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 
                                 rounded-lg transition-all"
                      title="刪除"
                    >
                      {deleting === reading.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 登入彈窗 */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
