/**
 * 十二地支知識庫
 * 地支特性、藏干、刑沖合害
 */

export interface DiZhiKnowledge {
  zhi: string;
  wuxing: string;
  yinYang: '陽' | '陰';
  season: string;           // 對應季節
  month: string;            // 對應月份
  hour: string;             // 對應時辰
  cangGan: string[];        // 藏干
  nature: string;           // 自然象徵
  character: string[];      // 性格傾向
  body: string;             // 對應身體部位
  animal: string;           // 生肖
}

export const DIZHI_KNOWLEDGE: Record<string, DiZhiKnowledge> = {
  '子': {
    zhi: '子',
    wuxing: '水',
    yinYang: '陽',
    season: '冬季',
    month: '十一月',
    hour: '23:00-01:00',
    cangGan: ['癸'],
    nature: '深夜、寒冷、收藏',
    character: [
      '聰明機智，思維活躍',
      '適應力強，靈活變通',
      '有時城府較深',
      '情緒起伏大',
    ],
    body: '腎臟、膀胱、耳朵',
    animal: '鼠',
  },
  '丑': {
    zhi: '丑',
    wuxing: '土',
    yinYang: '陰',
    season: '冬末春初',
    month: '十二月',
    hour: '01:00-03:00',
    cangGan: ['己', '癸', '辛'],
    nature: '濕土、墓庫、積蓄',
    character: [
      '踏實穩重，有耐心',
      '善於積累，懂得儲蓄',
      '有時固執保守',
      '不善表達情感',
    ],
    body: '脾胃、腹部',
    animal: '牛',
  },
  '寅': {
    zhi: '寅',
    wuxing: '木',
    yinYang: '陽',
    season: '春季',
    month: '正月',
    hour: '03:00-05:00',
    cangGan: ['甲', '丙', '戊'],
    nature: '初春、生發、開始',
    character: [
      '有衝勁，敢於開創',
      '正直勇敢，有領導力',
      '有時過於急躁',
      '喜歡自由，不受約束',
    ],
    body: '肝膽、四肢',
    animal: '虎',
  },
  '卯': {
    zhi: '卯',
    wuxing: '木',
    yinYang: '陰',
    season: '春季',
    month: '二月',
    hour: '05:00-07:00',
    cangGan: ['乙'],
    nature: '仲春、溫和、生長',
    character: [
      '溫和有禮，人緣好',
      '善於溝通，有藝術天分',
      '有時優柔寡斷',
      '重視外表形象',
    ],
    body: '肝臟、眼睛',
    animal: '兔',
  },
  '辰': {
    zhi: '辰',
    wuxing: '土',
    yinYang: '陽',
    season: '春末夏初',
    month: '三月',
    hour: '07:00-09:00',
    cangGan: ['戊', '乙', '癸'],
    nature: '水庫、變化、轉折',
    character: [
      '有包容心，能容納不同',
      '變化多端，適應力強',
      '有時情緒不穩',
      '有神秘感',
    ],
    body: '脾胃、皮膚',
    animal: '龍',
  },
  '巳': {
    zhi: '巳',
    wuxing: '火',
    yinYang: '陰',
    season: '夏季',
    month: '四月',
    hour: '09:00-11:00',
    cangGan: ['丙', '庚', '戊'],
    nature: '初夏、熱情、轉化',
    character: [
      '聰明靈活，反應快',
      '有智慧，善於謀略',
      '有時心機較重',
      '適應環境能力強',
    ],
    body: '心臟、眼睛',
    animal: '蛇',
  },
  '午': {
    zhi: '午',
    wuxing: '火',
    yinYang: '陽',
    season: '夏季',
    month: '五月',
    hour: '11:00-13:00',
    cangGan: ['丁', '己'],
    nature: '盛夏、光明、熱情',
    character: [
      '熱情開朗，積極向上',
      '有領導力，喜歡表現',
      '有時衝動急躁',
      '情緒來得快去得也快',
    ],
    body: '心臟、血液',
    animal: '馬',
  },
  '未': {
    zhi: '未',
    wuxing: '土',
    yinYang: '陰',
    season: '夏末秋初',
    month: '六月',
    hour: '13:00-15:00',
    cangGan: ['己', '丁', '乙'],
    nature: '木庫、滋養、包容',
    character: [
      '溫和善良，有愛心',
      '有藝術天分，審美好',
      '有時過於敏感',
      '容易委屈自己',
    ],
    body: '脾胃、腸道',
    animal: '羊',
  },
  '申': {
    zhi: '申',
    wuxing: '金',
    yinYang: '陽',
    season: '秋季',
    month: '七月',
    hour: '15:00-17:00',
    cangGan: ['庚', '壬', '戊'],
    nature: '初秋、收斂、變革',
    character: [
      '聰明靈活，反應敏捷',
      '善於變通，有商業頭腦',
      '有時過於精明',
      '喜歡自由，不愛受約束',
    ],
    body: '肺、大腸',
    animal: '猴',
  },
  '酉': {
    zhi: '酉',
    wuxing: '金',
    yinYang: '陰',
    season: '秋季',
    month: '八月',
    hour: '17:00-19:00',
    cangGan: ['辛'],
    nature: '仲秋、收穫、完美',
    character: [
      '追求完美，注重細節',
      '有品味，審美能力強',
      '有時過於挑剔',
      '口才好，善於表達',
    ],
    body: '肺、皮膚',
    animal: '雞',
  },
  '戌': {
    zhi: '戌',
    wuxing: '土',
    yinYang: '陽',
    season: '秋末冬初',
    month: '九月',
    hour: '19:00-21:00',
    cangGan: ['戊', '辛', '丁'],
    nature: '火庫、忠誠、守護',
    character: [
      '忠誠可靠，重義氣',
      '有責任感，值得信賴',
      '有時固執己見',
      '對認定的事堅持到底',
    ],
    body: '脾胃、四肢',
    animal: '狗',
  },
  '亥': {
    zhi: '亥',
    wuxing: '水',
    yinYang: '陰',
    season: '冬季',
    month: '十月',
    hour: '21:00-23:00',
    cangGan: ['壬', '甲'],
    nature: '初冬、收藏、包容',
    character: [
      '善良寬厚，有包容心',
      '有智慧，思想深刻',
      '有時過於放縱',
      '情感豐富但不善表達',
    ],
    body: '腎臟、生殖系統',
    animal: '豬',
  },
};

/**
 * 地支六合
 */
export const DIZHI_LIUHE: Record<string, { partner: string; result: string }> = {
  '子': { partner: '丑', result: '土' },
  '丑': { partner: '子', result: '土' },
  '寅': { partner: '亥', result: '木' },
  '亥': { partner: '寅', result: '木' },
  '卯': { partner: '戌', result: '火' },
  '戌': { partner: '卯', result: '火' },
  '辰': { partner: '酉', result: '金' },
  '酉': { partner: '辰', result: '金' },
  '巳': { partner: '申', result: '水' },
  '申': { partner: '巳', result: '水' },
  '午': { partner: '未', result: '土' },
  '未': { partner: '午', result: '土' },
};

/**
 * 地支六沖
 */
export const DIZHI_LIUCHONG: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

/**
 * 獲取地支知識
 */
export function getDiZhiKnowledge(zhi: string): DiZhiKnowledge | null {
  return DIZHI_KNOWLEDGE[zhi] || null;
}

/**
 * 生成日支解讀
 */
export function generateDayZhiText(zhi: string): string {
  const k = DIZHI_KNOWLEDGE[zhi];
  if (!k) return '';

  return `
【日支${k.zhi}（${k.wuxing}・${k.animal}）】

藏干：${k.cangGan.join('、')}
自然象徵：${k.nature}

性格傾向：
${k.character.map(c => `• ${c}`).join('\n')}

健康對應：${k.body}
`.trim();
}
