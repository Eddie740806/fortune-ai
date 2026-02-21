/**
 * 十二宮位知識庫
 * 每個宮位代表人生的不同面向
 */

export interface PalaceKnowledge {
  name: string;
  represents: string[];     // 代表的人事物
  focus: string;            // 核心關注點
  goodStars: string[];      // 喜見的星曜
  badStars: string[];       // 不喜見的星曜
  interpretation: string;   // 解讀要點
}

export const PALACE_KNOWLEDGE: Record<string, PalaceKnowledge> = {
  '命宮': {
    name: '命宮',
    represents: [
      '自己的本性',
      '個性、才能、志向',
      '一生的總體運勢',
      '給人的第一印象',
    ],
    focus: '你是什麼樣的人',
    goodStars: ['紫微', '天府', '天相', '天梁', '太陽（廟旺）', '太陰（廟旺）'],
    badStars: ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'],
    interpretation: '命宮是最重要的宮位，決定一個人的基本格局。主星強則一生有成就，煞星多則波折多。',
  },

  '兄弟宮': {
    name: '兄弟宮',
    represents: [
      '兄弟姐妹',
      '同輩的朋友',
      '合夥人',
      '母親（部分學派）',
    ],
    focus: '手足關係、同輩互動',
    goodStars: ['天府', '天相', '天同', '天梁'],
    badStars: ['七殺', '破軍', '擎羊', '陀羅'],
    interpretation: '看與兄弟姐妹的關係，也看合夥運。吉星多則手足有助，煞星多則緣薄或有爭執。',
  },

  '夫妻宮': {
    name: '夫妻宮',
    represents: [
      '配偶',
      '戀愛對象',
      '婚姻狀況',
      '感情模式',
    ],
    focus: '感情與婚姻',
    goodStars: ['天府', '天相', '太陽', '太陰', '天同'],
    badStars: ['廉貞', '貪狼', '七殺', '破軍', '擎羊', '陀羅'],
    interpretation: '看婚姻和感情運。吉星主婚姻美滿，桃花星多則感情複雜，煞星多則婚姻波折。',
  },

  '子女宮': {
    name: '子女宮',
    represents: [
      '子女',
      '學生、晚輩',
      '創作、作品',
      '性生活',
    ],
    focus: '子女緣分與親子關係',
    goodStars: ['天府', '天相', '天同', '天梁', '太陽', '太陰'],
    badStars: ['七殺', '破軍', '擎羊', '陀羅', '地空', '地劫'],
    interpretation: '看與子女的緣分和關係。吉星多則子女有出息，煞星多則子女讓人操心或緣薄。',
  },

  '財帛宮': {
    name: '財帛宮',
    represents: [
      '財運',
      '賺錢能力',
      '理財方式',
      '金錢觀念',
    ],
    focus: '財富與金錢',
    goodStars: ['武曲', '天府', '太陰', '祿存', '化祿'],
    badStars: ['地空', '地劫', '擎羊', '陀羅'],
    interpretation: '看賺錢能力和財運。財星廟旺則財運好，空劫進入則財來財去不易守。',
  },

  '疾厄宮': {
    name: '疾厄宮',
    represents: [
      '身體健康',
      '疾病傾向',
      '災厄意外',
      '體質強弱',
    ],
    focus: '健康與疾病',
    goodStars: ['天府', '天相', '天同', '天梁'],
    badStars: ['廉貞', '七殺', '破軍', '擎羊', '陀羅', '火星', '鈴星'],
    interpretation: '看身體健康和疾病傾向。吉星多則體質好，煞星多則要注意某些疾病或意外。',
  },

  '遷移宮': {
    name: '遷移宮',
    represents: [
      '出外運',
      '人際關係',
      '社會上的表現',
      '貴人緣',
    ],
    focus: '外出與社交',
    goodStars: ['紫微', '天府', '天相', '太陽', '化祿'],
    badStars: ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'],
    interpretation: '看出外發展的運勢和人際關係。吉星多則在外有貴人，煞星多則出外不利或易有意外。',
  },

  '交友宮': {
    name: '交友宮',
    represents: [
      '朋友',
      '部下',
      '同事',
      '人際網絡',
    ],
    focus: '朋友與部下',
    goodStars: ['天府', '天相', '天同', '天梁'],
    badStars: ['廉貞', '貪狼', '七殺', '破軍', '擎羊'],
    interpretation: '看交友運和與部下的關係。吉星多則朋友有助力，煞星多則朋友帶來麻煩或被背叛。',
  },

  '官祿宮': {
    name: '官祿宮',
    represents: [
      '事業',
      '工作',
      '社會地位',
      '學業',
    ],
    focus: '事業與成就',
    goodStars: ['紫微', '天府', '武曲', '天相', '太陽', '化權'],
    badStars: ['地空', '地劫', '擎羊', '陀羅'],
    interpretation: '看事業成就和工作運。吉星廟旺則事業有成，煞星多則事業有波折或不穩定。',
  },

  '田宅宮': {
    name: '田宅宮',
    represents: [
      '房產',
      '不動產',
      '家庭環境',
      '祖業',
    ],
    focus: '房產與家庭',
    goodStars: ['天府', '太陰', '武曲', '天同', '祿存'],
    badStars: ['破軍', '七殺', '擎羊', '陀羅', '火星', '鈴星'],
    interpretation: '看房產運和家庭環境。吉星多則有房產或祖業蔭，煞星多則房產有變動或家庭不安。',
  },

  '福德宮': {
    name: '福德宮',
    represents: [
      '精神狀態',
      '興趣嗜好',
      '福報',
      '壽命',
    ],
    focus: '精神與福報',
    goodStars: ['天府', '天同', '天梁', '太陰', '化祿'],
    badStars: ['廉貞', '貪狼', '七殺', '破軍', '擎羊', '陀羅'],
    interpretation: '看精神狀態和福報。吉星多則心態好有福享，煞星多則精神壓力大或不易滿足。',
  },

  '父母宮': {
    name: '父母宮',
    represents: [
      '父母',
      '長輩',
      '上司',
      '與長輩的關係',
    ],
    focus: '父母與長輩',
    goodStars: ['天府', '天相', '天梁', '太陽', '太陰'],
    badStars: ['七殺', '破軍', '擎羊', '陀羅', '化忌'],
    interpretation: '看與父母的關係和長輩緣。吉星多則父母有助力，煞星多則與父母緣薄或有代溝。',
  },
};

/**
 * 獲取宮位知識
 */
export function getPalaceKnowledge(palace: string): PalaceKnowledge | null {
  const normalized = palace.replace('宮', '') + '宮';
  return PALACE_KNOWLEDGE[normalized] || PALACE_KNOWLEDGE[palace] || null;
}

/**
 * 生成宮位解讀
 */
export function generatePalaceText(palace: string): string {
  const k = getPalaceKnowledge(palace);
  if (!k) return '';

  return `
【${k.name}】— ${k.focus}

代表的人事物：
${k.represents.map(r => `• ${r}`).join('\n')}

喜見星曜：${k.goodStars.join('、')}
忌見星曜：${k.badStars.join('、')}

解讀要點：
${k.interpretation}
`.trim();
}
