'use client';

import { pricingConfig } from '@/config/pricing';

interface FreeSummaryProps {
  dayMaster: string;  // 日主
  dayMasterElement: string;  // 日主五行
  mingGong: string;  // 命宮主星
  onUnlock: () => void;
}

export default function FreeSummary({ dayMaster, dayMasterElement, mingGong, onUnlock }: FreeSummaryProps) {
  // 日主簡易解讀
  const dayMasterTraits: Record<string, { trait: string; tip: string }> = {
    '甲': { trait: '如參天大樹，正直上進，有領導氣質', tip: '需要陽光（火）和水分才能茁壯' },
    '乙': { trait: '如花草藤蔓，柔韌靈活，善於適應環境', tip: '借力使力，攀附而上' },
    '丙': { trait: '如太陽光芒，熱情開朗，照亮四方', tip: '需要舞台發揮，忌被掩蓋' },
    '丁': { trait: '如燭火星光，細膩敏感，溫暖人心', tip: '適合幕後工作，內斂而有深度' },
    '戊': { trait: '如高山厚土，穩重踏實，值得信賴', tip: '包容力強，但要避免過於固執' },
    '己': { trait: '如田園沃土，謙虛務實，滋養萬物', tip: '適合服務他人，低調中有力量' },
    '庚': { trait: '如刀劍鋼鐵，果決剛毅，行動力強', tip: '需要磨練才能發光，逆境中成長' },
    '辛': { trait: '如珠寶美玉，精緻細膩，追求完美', tip: '外柔內剛，在意形象與品質' },
    '壬': { trait: '如江河大海，智慧流動，包容萬象', tip: '變通能力強，但要避免過於飄忽' },
    '癸': { trait: '如雨露甘霖，細膩敏銳，潤物無聲', tip: '直覺力強，適合幕後策劃' },
  };

  const traits = dayMasterTraits[dayMaster] || { trait: '獨特的命格特質', tip: '需要完整解盤才能了解' };

  return (
    <div className="relative p-6 md:p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-2xl border border-amber-500/30 shadow-lg overflow-hidden">
      {/* 模糊遮罩效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/95 pointer-events-none" />
      
      {/* 免費版標籤 */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-xs font-medium">
        免費預覽
      </div>
      
      <h3 className="text-xl font-bold text-amber-300 mb-6 flex items-center gap-2">
        ✨ 命格速覽
      </h3>
      
      {/* 日主簡介 */}
      <div className="mb-6 p-4 bg-amber-950/30 rounded-xl border border-amber-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {dayMaster}
          </div>
          <div>
            <div className="text-amber-200 font-bold">{dayMaster}{dayMasterElement} 日主</div>
            <div className="text-amber-400/70 text-sm">您的命格核心</div>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">
          {traits.trait}
        </p>
        <p className="text-amber-400/80 text-sm mt-2">
          💡 {traits.tip}
        </p>
      </div>
      
      {/* 命宮主星 */}
      <div className="mb-6 p-4 bg-purple-950/30 rounded-xl border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xl shadow-lg">
            ⭐
          </div>
          <div>
            <div className="text-purple-200 font-bold">命宮主星：{mingGong || '待解析'}</div>
            <div className="text-purple-400/70 text-sm">您的內在本質</div>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          命宮主星代表您的核心性格與人生態度，完整解盤將深入分析...
        </p>
      </div>
      
      {/* 遮擋區域 - 模擬更多內容 */}
      <div className="relative">
        <div className="space-y-3 filter blur-[6px] select-none pointer-events-none">
          <div className="h-4 bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-700/50 rounded w-4/5" />
          <div className="h-4 bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-700/50 rounded w-3/4" />
          <div className="h-4 bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-700/50 rounded w-5/6" />
        </div>
        
        {/* 解鎖提示 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 bg-slate-900/90 rounded-xl border border-amber-500/40">
            <p className="text-gray-400 mb-2">完整解盤包含：</p>
            <ul className="text-left text-sm text-gray-500 mb-4 space-y-1">
              <li>✦ 性格深度剖析</li>
              <li>✦ 事業財運分析</li>
              <li>✦ 感情婚姻指引</li>
              <li>✦ 流年運勢預測</li>
              <li>✦ 貴人方位建議</li>
            </ul>
            <button
              onClick={onUnlock}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-purple-500 transition-all hover:scale-105"
            >
              解鎖完整解盤
              <span className="ml-2 text-sm opacity-80">
                NT${pricingConfig.interpretation.salePrice}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
