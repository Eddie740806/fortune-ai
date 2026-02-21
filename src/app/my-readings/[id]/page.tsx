'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';

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
  interpretation: string;
  reading_type: string;
  created_at: string;
}

export default function ReadingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchReading();
    }
  }, [params.id]);

  const fetchReading = async () => {
    const supabase = createClient();
    
    // RLS 已開放，直接查詢
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      setError('找不到這筆紀錄');
    } else {
      setReading(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] 
                      flex items-center justify-center">
        <div className="text-white/60">載入中...</div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
        <div className="pt-24 px-4 text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white/60 mb-4">{error || '找不到這筆紀錄'}</p>
          <button
            onClick={() => router.push('/my-readings')}
            className="text-purple-400 hover:text-purple-300"
          >
            ← 返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      <main className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 返回按鈕 */}
          <Link
            href="/my-readings"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>返回列表</span>
          </Link>

          {/* 基本資訊 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-2">{reading.name}</h1>
            <p className="text-white/60">
              {reading.birth_info.year}年{reading.birth_info.month}月{reading.birth_info.day}日
              {reading.birth_info.hour && ` ${reading.birth_info.hour}時`}
              {' · '}
              {reading.birth_info.gender === 'male' ? '男' : '女'}
            </p>
            <p className="text-white/40 text-sm mt-2">
              排盤時間：{new Date(reading.created_at).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* 解讀內容 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>☯️</span>
              <span>AI 解讀</span>
            </h2>
            <div className="prose prose-invert prose-purple max-w-none
                            prose-headings:text-purple-300 
                            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-white/80 prose-p:leading-relaxed
                            prose-strong:text-purple-200
                            prose-li:text-white/80
                            prose-table:text-sm
                            prose-th:bg-purple-500/20 prose-th:text-purple-200
                            prose-td:border-white/10">
              <ReactMarkdown>{reading.interpretation}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
