/**
 * RAG 檢索器
 * 根據命盤自動提取關鍵元素並檢索對應知識
 */

import { getTianGanKnowledge, generateDayMasterText, type TianGanKnowledge } from './knowledge/bazi/tiangan';
import { getShiShenKnowledge, generateShiShenText } from './knowledge/bazi/shishen';
import { getDiZhiKnowledge, generateDayZhiText } from './knowledge/bazi/dizhi';
import { getStarKnowledge, generateStarInPalaceText } from './knowledge/ziwei/stars';
import { getSiHuaKnowledge, generateSiHuaInPalaceText } from './knowledge/ziwei/sihua';
import { getPalaceKnowledge, generatePalaceText } from './knowledge/ziwei/palaces';

export interface BaziElements {
  dayGan: string;           // 日主天干
  dayZhi: string;           // 日支
  yearShiShen: string;      // 年柱十神
  monthShiShen: string;     // 月柱十神
  hourShiShen: string;      // 時柱十神
  fourPillars: string;      // 四柱字串
}

export interface ZiweiElements {
  mingGongStars: string[];  // 命宮主星
  shenGongStars: string[];  // 身宮主星
  caiBoStars: string[];     // 財帛宮主星
  guanLuStars: string[];    // 官祿宮主星
  fuQiStars: string[];      // 夫妻宮主星
  wuXingJu: string;         // 五行局
}

export interface RetrievedKnowledge {
  dayMaster: string;        // 日主解讀
  shiShen: string[];        // 十神解讀
  mingGong: string[];       // 命宮主星解讀
  career: string[];         // 事業相關
  wealth: string[];         // 財運相關
  relationship: string[];   // 感情相關
}

/**
 * 從八字命盤提取關鍵元素
 */
export function extractBaziElements(baziResult: any): BaziElements {
  // 支援兩種結構
  const dayPillar = baziResult.dayPillar || baziResult.day;
  const yearPillar = baziResult.yearPillar || baziResult.year;
  const monthPillar = baziResult.monthPillar || baziResult.month;
  const hourPillar = baziResult.hourPillar || baziResult.hour;

  return {
    dayGan: dayPillar?.gan || '',
    dayZhi: dayPillar?.zhi || '',
    yearShiShen: baziResult.yearShiShen || '',
    monthShiShen: baziResult.monthShiShen || '',
    hourShiShen: baziResult.hourShiShen || '',
    fourPillars: `${yearPillar?.gan || ''}${yearPillar?.zhi || ''} ${monthPillar?.gan || ''}${monthPillar?.zhi || ''} ${dayPillar?.gan || ''}${dayPillar?.zhi || ''} ${hourPillar?.gan || ''}${hourPillar?.zhi || ''}`,
  };
}

/**
 * 從紫微命盤提取關鍵元素
 */
export function extractZiweiElements(ziweiChart: any): ZiweiElements {
  const palaces = ziweiChart.palaces || ziweiChart.gongs || [];
  
  const getStarsFromPalace = (palaceName: string): string[] => {
    const palace = palaces.find((p: any) => p.name === palaceName || p.gongName === palaceName);
    if (!palace) return [];
    return (palace.mainStars || []).map((s: any) => s.name || s);
  };

  return {
    mingGongStars: getStarsFromPalace('命宮'),
    shenGongStars: getStarsFromPalace(ziweiChart.shenGong?.gongName || ''),
    caiBoStars: getStarsFromPalace('財帛宮'),
    guanLuStars: getStarsFromPalace('官祿宮'),
    fuQiStars: getStarsFromPalace('夫妻宮'),
    wuXingJu: ziweiChart.wuXingJu?.name || '',
  };
}

/**
 * 根據八字元素檢索知識
 */
export function retrieveBaziKnowledge(elements: BaziElements): RetrievedKnowledge {
  const result: RetrievedKnowledge = {
    dayMaster: '',
    shiShen: [],
    mingGong: [],
    career: [],
    wealth: [],
    relationship: [],
  };

  // 1. 日主知識（最重要！）
  if (elements.dayGan) {
    result.dayMaster = generateDayMasterText(elements.dayGan);
    
    // 加入日支知識
    if (elements.dayZhi) {
      const dayZhiText = generateDayZhiText(elements.dayZhi);
      if (dayZhiText) {
        result.dayMaster += '\n\n' + dayZhiText;
      }
    }
  }

  // 2. 十神知識
  const shiShens = [
    { name: elements.yearShiShen, pillar: '年柱' },
    { name: elements.monthShiShen, pillar: '月柱' },
    { name: elements.hourShiShen, pillar: '時柱' },
  ];

  for (const ss of shiShens) {
    if (ss.name) {
      const text = generateShiShenText(ss.name, ss.pillar);
      if (text) {
        result.shiShen.push(text);
      }
    }
  }

  return result;
}

/**
 * 根據紫微元素檢索知識
 */
export function retrieveZiweiKnowledge(elements: ZiweiElements): RetrievedKnowledge {
  const result: RetrievedKnowledge = {
    dayMaster: '',
    shiShen: [],
    mingGong: [],
    career: [],
    wealth: [],
    relationship: [],
  };

  // 輔助函數：處理星曜（包含四化）
  const processStarWithSiHua = (starInfo: any, palace: string): string => {
    let text = '';
    const starName = typeof starInfo === 'string' ? starInfo : starInfo.name;
    
    // 主星知識
    const starText = generateStarInPalaceText(starName, palace);
    if (starText) {
      text += starText;
    }
    
    // 如果有四化
    if (typeof starInfo === 'object' && starInfo.siHua) {
      const sihuaText = generateSiHuaInPalaceText(starInfo.siHua, palace, starName);
      if (sihuaText) {
        text += '\n\n' + sihuaText;
      }
    }
    
    return text;
  };

  // 1. 命宮主星
  for (const star of elements.mingGongStars) {
    const text = processStarWithSiHua(star, '命宮');
    if (text) {
      result.mingGong.push(text);
    }
  }

  // 2. 財帛宮
  for (const star of elements.caiBoStars) {
    const text = processStarWithSiHua(star, '財帛宮');
    if (text) {
      result.wealth.push(text);
    }
  }

  // 3. 官祿宮
  for (const star of elements.guanLuStars) {
    const text = processStarWithSiHua(star, '官祿宮');
    if (text) {
      result.career.push(text);
    }
  }

  // 4. 夫妻宮
  for (const star of elements.fuQiStars) {
    const text = processStarWithSiHua(star, '夫妻宮');
    if (text) {
      result.relationship.push(text);
    }
  }

  return result;
}

/**
 * 綜合檢索：八字 + 紫微
 */
export function retrieveComprehensiveKnowledge(
  baziResult: any,
  ziweiChart: any
): { bazi: RetrievedKnowledge; ziwei: RetrievedKnowledge; summary: string } {
  const baziElements = extractBaziElements(baziResult);
  const ziweiElements = extractZiweiElements(ziweiChart);

  const baziKnowledge = retrieveBaziKnowledge(baziElements);
  const ziweiKnowledge = retrieveZiweiKnowledge(ziweiElements);

  // 生成摘要
  const summary = `
【八字核心】
日主：${baziElements.dayGan}
四柱：${baziElements.fourPillars}
十神：年${baziElements.yearShiShen}｜月${baziElements.monthShiShen}｜時${baziElements.hourShiShen}

【紫微核心】
命宮主星：${ziweiElements.mingGongStars.join('、') || '無'}
五行局：${ziweiElements.wuXingJu}
財帛主星：${ziweiElements.caiBoStars.join('、') || '無'}
官祿主星：${ziweiElements.guanLuStars.join('、') || '無'}
夫妻主星：${ziweiElements.fuQiStars.join('、') || '無'}
`.trim();

  return {
    bazi: baziKnowledge,
    ziwei: ziweiKnowledge,
    summary,
  };
}

/**
 * 格式化檢索到的知識（用於 prompt）
 */
export function formatKnowledgeForPrompt(knowledge: {
  bazi: RetrievedKnowledge;
  ziwei: RetrievedKnowledge;
  summary: string;
}): string {
  const sections: string[] = [];

  // 摘要
  sections.push('=== 命盤摘要 ===');
  sections.push(knowledge.summary);

  // 日主知識（最重要）
  if (knowledge.bazi.dayMaster) {
    sections.push('\n=== 日主特性（八字核心）===');
    sections.push(knowledge.bazi.dayMaster);
  }

  // 命宮知識
  if (knowledge.ziwei.mingGong.length > 0) {
    sections.push('\n=== 命宮主星（紫微核心）===');
    sections.push(knowledge.ziwei.mingGong.join('\n\n---\n\n'));
  }

  // 十神知識
  if (knowledge.bazi.shiShen.length > 0) {
    sections.push('\n=== 十神配置 ===');
    sections.push(knowledge.bazi.shiShen.join('\n\n---\n\n'));
  }

  // 事業相關
  if (knowledge.ziwei.career.length > 0) {
    sections.push('\n=== 事業宮位（官祿）===');
    sections.push(knowledge.ziwei.career.join('\n\n'));
  }

  // 財運相關
  if (knowledge.ziwei.wealth.length > 0) {
    sections.push('\n=== 財運宮位（財帛）===');
    sections.push(knowledge.ziwei.wealth.join('\n\n'));
  }

  // 感情相關
  if (knowledge.ziwei.relationship.length > 0) {
    sections.push('\n=== 感情宮位（夫妻）===');
    sections.push(knowledge.ziwei.relationship.join('\n\n'));
  }

  return sections.join('\n\n');
}
