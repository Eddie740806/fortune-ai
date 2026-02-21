/**
 * 命理 RAG 系統
 * 
 * 用法：
 * 1. 從命盤提取元素
 * 2. 檢索對應知識
 * 3. 格式化給 AI 使用
 */

export {
  extractBaziElements,
  extractZiweiElements,
  retrieveBaziKnowledge,
  retrieveZiweiKnowledge,
  retrieveComprehensiveKnowledge,
  formatKnowledgeForPrompt,
  type BaziElements,
  type ZiweiElements,
  type RetrievedKnowledge,
} from './retriever';

export {
  getTianGanKnowledge,
  generateDayMasterText,
  TIANGAN_KNOWLEDGE,
  type TianGanKnowledge,
} from './knowledge/bazi/tiangan';

export {
  getShiShenKnowledge,
  generateShiShenText,
  SHISHEN_KNOWLEDGE,
  type ShiShenKnowledge,
} from './knowledge/bazi/shishen';

export {
  getStarKnowledge,
  generateStarInPalaceText,
  MAIN_STARS,
  type StarKnowledge,
} from './knowledge/ziwei/stars';
