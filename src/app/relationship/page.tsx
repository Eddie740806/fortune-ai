'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const HOURS = [
  { value: '子', label: '子時 (23:00-01:00)' },
  { value: '丑', label: '丑時 (01:00-03:00)' },
  { value: '寅', label: '寅時 (03:00-05:00)' },
  { value: '卯', label: '卯時 (05:00-07:00)' },
  { value: '辰', label: '辰時 (07:00-09:00)' },
  { value: '巳', label: '巳時 (09:00-11:00)' },
  { value: '午', label: '午時 (11:00-13:00)' },
  { value: '未', label: '未時 (13:00-15:00)' },
  { value: '申', label: '申時 (15:00-17:00)' },
  { value: '酉', label: '酉時 (17:00-19:00)' },
  { value: '戌', label: '戌時 (19:00-21:00)' },
  { value: '亥', label: '亥時 (21:00-23:00)' },
  { value: '未知', label: '不確定' },
];

const RELATIONSHIP_TYPES = [
  { value: 'lover', label: '💕 情人/配偶', desc: '感情、婚姻' },
  { value: 'crush', label: '💗 曖昧對象', desc: '發展可能性' },
  { value: 'boss', label: '💼 上司/老闆', desc: '向上管理' },
  { value: 'subordinate', label: '📋 下屬/部屬', desc: '帶人風格' },
  { value: 'partner', label: '🤝 合夥人', desc: '合作契合度' },
  { value: 'friend', label: '👥 朋友/同事', desc: '日常相處' },
  { value: 'family', label: '👨‍👩‍👧 家人', desc: '親情互動' },
  { value: 'client', label: '🎯 客戶', desc: '成交機率' },
  { value: 'other', label: '❓ 其他', desc: '自己描述' },
];

interface MyReading {
  id: string;
  name: string;
  birth_info: {
    year: number;
    month: number;
    day: number;
    hour: string;
    gender: string;
  };
}

export default function RelationshipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const myReadingId = searchParams.get('from'); // 從哪個命盤來的

  const [myReading, setMyReading] = useState<MyReading | null>(null);
  const [myReadings, setMyReadings] = useState<MyReading[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 對方資料
  const [partnerName, setPartnerName] = useState('');
  const [partnerYear, setPartnerYear] = useState(1990);
  const [partnerMonth, setPartnerMonth] = useState(1);
  const [partnerDay, setPartnerDay] = useState(1);
  const [partnerHour, setPartnerHour] = useState('未知');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('male');
  
  // 關係類型
  const [relationshipType, setRelationshipType] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  
  // 想問的問題
  const [question, setQuestion] = useState('');

  useEffect(() => {
    fetchMyReadings();
  }, []);

  useEffect(() => {
    if (myReadingId && myReadings.length > 0) {
      const found = myReadings.find(r => r.id === myReadingId);
      if (found) setMyReading(found);
    }
  }, [myReadingId, myReadings]);

  const fetchMyReadings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/');
      return;
    }

    const { data, error } = await supabase
      .from('readings')
      .select('id, name, birth_info')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setMyReadings(data);
      if (!myReadingId) {
        setMyReading(data[0]); // 預設用最新的
      }
    } else {
      // 沒有命盤，導回首頁
      router.push('/comprehensive');
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!myReading || !partnerName || !relationshipType) {
      alert('請填寫完整資料');
      return;
    }

    const params = new URLSearchParams({
      // 我的資料
      myId: myReading.id,
      myName: myReading.name,
      myYear: String(myReading.birth_info.year),
      myMonth: String(myReading.birth_info.month),
      myDay: String(myReading.birth_info.day),
      myHour: myReading.birth_info.hour,
      myGender: myReading.birth_info.gender,
      // 對方資料
      partnerName,
      partnerYear: String(partnerYear),
      partnerMonth: String(partnerMonth),
      partnerDay: String(partnerDay),
      partnerHour,
      partnerGender,
      // 關係
      relationshipType,
      relationshipDesc: relationshipType === 'other' ? otherDescription : '',
      question,
    });

    router.push(`/relationship/result?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] flex items-center justify-center">
        <div className="text-white/60">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 返回 */}
          <Link
            href="/my-readings"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>返回我的紀錄</span>
          </Link>

          {/* 標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">💫 關係合盤</h1>
            <p className="text-white/60">分析你與他人的命理契合度</p>
          </div>

          {/* Step 1: 選擇我的命盤 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">1</span>
              選擇你的命盤
            </h2>
            
            {myReadings.length > 1 ? (
              <select
                value={myReading?.id || ''}
                onChange={(e) => {
                  const found = myReadings.find(r => r.id === e.target.value);
                  if (found) setMyReading(found);
                }}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                {myReadings.map((r) => (
                  <option key={r.id} value={r.id} className="bg-gray-800">
                    {r.name} ({r.birth_info.year}年{r.birth_info.month}月{r.birth_info.day}日)
                  </option>
                ))}
              </select>
            ) : myReading ? (
              <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <p className="text-white font-medium">{myReading.name}</p>
                <p className="text-white/60 text-sm">
                  {myReading.birth_info.year}年{myReading.birth_info.month}月{myReading.birth_info.day}日
                  {myReading.birth_info.hour !== '未知' && ` ${myReading.birth_info.hour}時`}
                  {' · '}
                  {myReading.birth_info.gender === 'male' ? '男' : '女'}
                </p>
              </div>
            ) : null}
          </div>

          {/* Step 2: 輸入對方資料 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">2</span>
              輸入對方資料
            </h2>

            <div className="space-y-4">
              {/* 姓名 */}
              <div>
                <label className="block text-white/80 mb-2">對方姓名/稱呼</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="例：小明、王經理"
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40"
                />
              </div>

              {/* 生日 */}
              <div>
                <label className="block text-white/80 mb-2">出生日期（國曆）</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={partnerYear}
                    onChange={(e) => setPartnerYear(Number(e.target.value))}
                    className="p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {Array.from({ length: 100 }, (_, i) => 2024 - i).map((y) => (
                      <option key={y} value={y} className="bg-gray-800">{y}年</option>
                    ))}
                  </select>
                  <select
                    value={partnerMonth}
                    onChange={(e) => setPartnerMonth(Number(e.target.value))}
                    className="p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-800">{m}月</option>
                    ))}
                  </select>
                  <select
                    value={partnerDay}
                    onChange={(e) => setPartnerDay(Number(e.target.value))}
                    className="p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-gray-800">{d}日</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 時辰 */}
              <div>
                <label className="block text-white/80 mb-2">出生時辰</label>
                <select
                  value={partnerHour}
                  onChange={(e) => setPartnerHour(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  {HOURS.map((h) => (
                    <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>
                  ))}
                </select>
              </div>

              {/* 性別 */}
              <div>
                <label className="block text-white/80 mb-2">性別</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPartnerGender('male')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      partnerGender === 'male'
                        ? 'bg-blue-500/30 border-blue-500 text-white'
                        : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    ♂ 男
                  </button>
                  <button
                    onClick={() => setPartnerGender('female')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      partnerGender === 'female'
                        ? 'bg-pink-500/30 border-pink-500 text-white'
                        : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    ♀ 女
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: 選擇關係類型 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">3</span>
              你們的關係是？
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setRelationshipType(type.value)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    relationshipType === type.value
                      ? 'bg-purple-500/30 border-purple-500 text-white'
                      : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs opacity-70">{type.desc}</div>
                </button>
              ))}
            </div>

            {relationshipType === 'other' && (
              <input
                type="text"
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                placeholder="請描述你們的關係..."
                className="w-full mt-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40"
              />
            )}
          </div>

          {/* Step 4: 想問的問題（可選） */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">4</span>
              想特別了解什麼？
              <span className="text-white/40 text-sm font-normal">（可選）</span>
            </h2>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例：我們適合一起創業嗎？他對我有意思嗎？如何跟這位老闆相處？"
              rows={3}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none"
            />
          </div>

          {/* 開始分析按鈕 */}
          <button
            onClick={handleSubmit}
            disabled={!myReading || !partnerName || !relationshipType}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all
                       bg-gradient-to-r from-purple-500 to-pink-500 text-white
                       hover:from-purple-600 hover:to-pink-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨ 開始合盤分析
          </button>
        </div>
      </main>
    </div>
  );
}
