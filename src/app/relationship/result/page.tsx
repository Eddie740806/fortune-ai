'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';

// 時辰對應小時
const SHICHEN_TO_HOUR: Record<string, number> = {
  '子': 23, '丑': 1, '寅': 3, '卯': 5, '辰': 7, '巳': 9,
  '午': 11, '未': 13, '申': 15, '酉': 17, '戌': 19, '亥': 21, '未知': 0,
};
import LoadingAnimation from '@/components/LoadingAnimation';

interface PersonInfo {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: string;
  gender: string;
  bazi?: BaziResult;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  lover: '💕 情人/配偶',
  crush: '💗 曖昧對象',
  boss: '💼 上司/老闆',
  subordinate: '📋 下屬/部屬',
  partner: '🤝 合夥人',
  friend: '👥 朋友/同事',
  family: '👨‍👩‍👧 家人',
  client: '🎯 客戶',
  other: '❓ 其他',
};

function RelationshipResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [myInfo, setMyInfo] = useState<PersonInfo | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PersonInfo | null>(null);
  const [relationshipType, setRelationshipType] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    // 解析 URL 參數
    const my: PersonInfo = {
      name: searchParams.get('myName') || '',
      year: Number(searchParams.get('myYear')) || 1990,
      month: Number(searchParams.get('myMonth')) || 1,
      day: Number(searchParams.get('myDay')) || 1,
      hour: searchParams.get('myHour') || '未知',
      gender: searchParams.get('myGender') || 'male',
    };
    
    const partner: PersonInfo = {
      name: searchParams.get('partnerName') || '',
      year: Number(searchParams.get('partnerYear')) || 1990,
      month: Number(searchParams.get('partnerMonth')) || 1,
      day: Number(searchParams.get('partnerDay')) || 1,
      hour: searchParams.get('partnerHour') || '未知',
      gender: searchParams.get('partnerGender') || 'male',
    };

    const relType = searchParams.get('relationshipType') || '';
    const relDesc = searchParams.get('relationshipDesc') || '';
    const q = searchParams.get('question') || '';

    if (!my.name || !partner.name || !relType) {
      setError('資料不完整，請重新填寫');
      setLoading(false);
      return;
    }

    // 計算八字（時辰轉小時）
    const myHourNum = SHICHEN_TO_HOUR[my.hour] ?? 0;
    const partnerHourNum = SHICHEN_TO_HOUR[partner.hour] ?? 0;
    my.bazi = calculateBazi(my.year, my.month, my.day, myHourNum, 0, my.gender as 'male' | 'female');
    partner.bazi = calculateBazi(partner.year, partner.month, partner.day, partnerHourNum, 0, partner.gender as 'male' | 'female');

    setMyInfo(my);
    setPartnerInfo(partner);
    setRelationshipType(relDesc || relType);
    setQuestion(q);

    // 呼叫 API
    fetchInterpretation(my, partner, relDesc || relType, q);
  }, [searchParams]);

  const fetchInterpretation = async (my: PersonInfo, partner: PersonInfo, relType: string, q: string) => {
    try {
      const response = await fetch('/api/interpret-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          my: {
            name: my.name,
            birthInfo: { year: my.year, month: my.month, day: my.day, hour: my.hour, gender: my.gender },
            bazi: my.bazi,
          },
          partner: {
            name: partner.name,
            birthInfo: { year: partner.year, month: partner.month, day: partner.day, hour: partner.hour, gender: partner.gender },
            bazi: partner.bazi,
          },
          relationshipType: relType,
          question: q,
        }),
      });

      if (!response.ok) {
        throw new Error('分析失敗');
      }

      const data = await response.json();
      setInterpretation(data.interpretation);
    } catch (e) {
      setError('分析過程發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
        <div className="pt-24 px-4 text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => router.push('/relationship')}
            className="text-purple-400 hover:text-purple-300"
          >
            ← 重新填寫
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <LoadingAnimation type="comprehensive" />
          <p className="text-white/60 mt-4">正在分析你們的緣分...</p>
          <p className="text-white/40 text-sm mt-2">結合八字命理，為你解讀關係奧秘</p>
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
            <span>返回我的紀錄</span>
          </Link>

          {/* 標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">💫 關係合盤分析</h1>
            <p className="text-white/60">
              {myInfo?.name} ✕ {partnerInfo?.name}
            </p>
          </div>

          {/* 雙方資訊 */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* 我 */}
            <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <div className="text-purple-300 text-sm mb-1">本人</div>
              <div className="text-white font-bold text-lg">{myInfo?.name}</div>
              <div className="text-white/60 text-sm">
                {myInfo?.year}年{myInfo?.month}月{myInfo?.day}日
                {myInfo?.hour !== '未知' && ` ${myInfo?.hour}時`}
                {' · '}{myInfo?.gender === 'male' ? '男' : '女'}
              </div>
              {myInfo?.bazi && (
                <div className="mt-2 text-white/80 text-sm font-mono">
                  {myInfo.bazi.yearPillar.gan}{myInfo.bazi.yearPillar.zhi}{' '}
                  {myInfo.bazi.monthPillar.gan}{myInfo.bazi.monthPillar.zhi}{' '}
                  {myInfo.bazi.dayPillar.gan}{myInfo.bazi.dayPillar.zhi}{' '}
                  {myInfo.bazi.hourPillar.gan}{myInfo.bazi.hourPillar.zhi}
                </div>
              )}
            </div>

            {/* 對方 */}
            <div className="bg-pink-500/10 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <div className="text-pink-300 text-sm mb-1">
                {RELATIONSHIP_LABELS[relationshipType] || relationshipType}
              </div>
              <div className="text-white font-bold text-lg">{partnerInfo?.name}</div>
              <div className="text-white/60 text-sm">
                {partnerInfo?.year}年{partnerInfo?.month}月{partnerInfo?.day}日
                {partnerInfo?.hour !== '未知' && ` ${partnerInfo?.hour}時`}
                {' · '}{partnerInfo?.gender === 'male' ? '男' : '女'}
              </div>
              {partnerInfo?.bazi && (
                <div className="mt-2 text-white/80 text-sm font-mono">
                  {partnerInfo.bazi.yearPillar.gan}{partnerInfo.bazi.yearPillar.zhi}{' '}
                  {partnerInfo.bazi.monthPillar.gan}{partnerInfo.bazi.monthPillar.zhi}{' '}
                  {partnerInfo.bazi.dayPillar.gan}{partnerInfo.bazi.dayPillar.zhi}{' '}
                  {partnerInfo.bazi.hourPillar.gan}{partnerInfo.bazi.hourPillar.zhi}
                </div>
              )}
            </div>
          </div>

          {/* 問題 */}
          {question && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
              <div className="text-white/40 text-sm mb-1">想了解的問題</div>
              <div className="text-white">{question}</div>
            </div>
          )}

          {/* 解讀內容 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔮</span>
              <span>合盤解析</span>
            </h2>
            <div className="prose prose-invert prose-purple max-w-none
                            prose-headings:text-purple-300 
                            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-white/80 prose-p:leading-relaxed
                            prose-strong:text-purple-200
                            prose-li:text-white/80">
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            </div>
          </div>

          {/* 再合一盤 */}
          <div className="mt-6 text-center">
            <Link
              href="/relationship"
              className="inline-block px-6 py-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            >
              🔄 與其他人合盤
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RelationshipResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] flex items-center justify-center">
        <div className="text-white/60">載入中...</div>
      </div>
    }>
      <RelationshipResultContent />
    </Suspense>
  );
}
