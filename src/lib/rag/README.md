# 命理 RAG 系統

## 架構

```
用戶輸入生日 → 排盤計算 → 提取關鍵元素 → RAG 檢索 → AI 組織語言
                              ↓
                    「甲木日主」「寅月」「紫微在命宮」
                              ↓
                    檢索知識庫取得專業解釋
                              ↓
                    AI 串聯 + 潤飾 + 個性化
```

## 知識庫分類

### 八字
- 天干特性（10個）
- 地支特性（12個）
- 十神含義（10個）
- 五行關係
- 格局判斷
- 調候用神
- 大運流年

### 紫微
- 十四主星（14個）
- 十二宮位（12個）
- 四化含義（4個 × 主星數）
- 六吉六煞
- 大限解讀

## 技術方案

- 向量資料庫：Supabase pgvector
- Embedding：OpenAI text-embedding-3-small
- 檢索策略：根據命盤元素精確匹配 + 向量相似度

## 檔案結構

```
src/lib/rag/
├── README.md
├── index.ts          # 主入口
├── embeddings.ts     # Embedding 生成
├── retriever.ts      # 檢索邏輯
├── knowledge/
│   ├── bazi/
│   │   ├── tiangan.ts    # 天干
│   │   ├── dizhi.ts      # 地支
│   │   ├── shishen.ts    # 十神
│   │   └── geju.ts       # 格局
│   └── ziwei/
│       ├── stars.ts      # 星曜
│       ├── palaces.ts    # 宮位
│       └── sihua.ts      # 四化
└── prompts/
    └── synthesizer.ts    # AI 組織 prompt
```
