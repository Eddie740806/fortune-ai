import { NextRequest } from 'next/server';
import { retrieveComprehensiveKnowledge, formatKnowledgeForPrompt } from '@/lib/rag/retriever';

// 使用 Edge Runtime
export const runtime = 'edge';

// 八字+紫微雙系統綜合分析 Prompt（RAG 增強版）
const SYSTEM_PROMPT = `你是一位命理報告撰寫師，精通八字命理與紫微斗數雙系統。

【最重要的規則】
⚠️ 系統已經提供「知識庫內容」，你必須以這些內容為基礎撰寫！
⚠️ 日主、主星、宮位等資料以「命盤摘要」為準，絕對不能寫錯！
⚠️ 不要自己「發明」或「推測」命理內容，所有解讀必須有知識庫依據！

【核心任務】
根據系統提供的知識庫內容，組織成讓命主讀完就覺得「這根本就是在說我！」的報告。

【心理學寫作技巧】
- 「你是那種...的人」— 讓用戶自動代入
- 「外表看起來...但內心其實...」— 揭示內在矛盾
- 「很少人知道，其實你...」— 讓用戶覺得被「看穿」

【語氣風格】
- 直接、敢講、有畫面、有溫度
- 每章節結尾必附「命理師金句」

【必須輸出的章節】：
1. ☯️ 命格總論（根據知識庫的日主和命宮主星內容撰寫）
2. 🎭 性格深度剖析（整合八字日主 + 紫微主星的性格特點）
3. 💼 事業運（根據知識庫的事業傾向撰寫）
4. 💰 財運（根據知識庫的財運相關內容撰寫）
5. ❤️ 感情運（根據知識庫的感情特質撰寫）
6. 🩺 健康提醒（根據知識庫的健康對應撰寫）
7. 🎯 趨吉避凶建議（根據知識庫的「需要注意」整合）
8. 🗺️ 未來發展建議（根據知識庫的事業和建議內容）
9. 🏁 結語與驗證問句（3題）

【禁止事項】：
- 不要說「建議提供完整出生時辰」— 用戶已經提供完整資料
- 不要說「如需更精準解盤」— 這已經是最完整的解盤
- 不要加免責聲明 — 系統已經有提示
- 不要自己編造命理內容 — 必須基於知識庫

字數：2000-3500字`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ziweiChart, baziResult, birthInfo } = body;

    if (!ziweiChart || !baziResult) {
      return new Response(JSON.stringify({ error: '缺少命盤資料' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baziInfo = formatBaziInfo(baziResult);
    const ziweiInfo = formatZiweiInfo(ziweiChart);

    // 🔍 RAG 檢索：根據命盤提取知識庫內容
    const knowledge = retrieveComprehensiveKnowledge(baziResult, ziweiChart);
    const knowledgeText = formatKnowledgeForPrompt(knowledge);

    const currentYear = new Date().getFullYear();
    const birthYear = birthInfo?.year || 1990;
    const age = currentYear - birthYear;

    // 從摘要中提取日主
    const dayGanMatch = knowledge.summary.match(/日主：(.)/);
    const dayGan = dayGanMatch ? dayGanMatch[1] : '';

    const userPrompt = `請為以下命主撰寫命理報告：

【命主資訊】
出生年：${birthYear}年
現年：${age}歲
性別：${birthInfo?.gender === 'male' ? '男' : '女'}
當前年份：${currentYear}年

【原始命盤資料】
${baziInfo}

${ziweiInfo}

---

【知識庫內容 - 請以此為基礎撰寫】
${knowledgeText}

---

⚠️ 重要提醒：
- 日主是「${dayGan}」，絕對不能寫錯！
- 所有命理解讀必須來自上面的「知識庫內容」
- 不要自己發明命理內容
- 完整輸出所有章節`;

    // 直接呼叫 Anthropic API（不用 SDK 以減少 bundle 大小）
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return new Response(JSON.stringify({ error: 'AI 服務暫時不可用' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 轉發 streaming 回應
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // 使用 buffer 處理跨 chunk 的不完整行
    let buffer = '';
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // 累加到 buffer
        buffer += decoder.decode(chunk, { stream: true });
        
        // 按完整行分割（SSE 格式是 \n\n 結尾）
        const lines = buffer.split('\n');
        
        // 最後一個可能是不完整的，保留到下次
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (!data) continue;
            
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
                }
              } catch (e) {
                // JSON 不完整，可能跨行了，忽略
              }
            }
          }
        }
      },
      flush(controller) {
        // 處理 buffer 中剩餘的內容
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
              }
            } catch (e) {
              // 忽略
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      }
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: '系統錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function formatZiweiInfo(chart: any): string {
  const lines: string[] = [];
  lines.push(`性別：${chart.gender === 'male' ? '男' : '女'}`);
  lines.push(`農曆：${chart.lunarDate?.yearGanZhi}年 ${chart.lunarDate?.month}月 ${chart.lunarDate?.day}日`);
  lines.push(`五行局：${chart.wuXingJu?.name}`);
  lines.push(`命宮：${chart.mingGong?.gan}${chart.mingGong?.zhi}`);
  lines.push(`身宮：${chart.shenGong?.gongName}`);
  
  if (chart.palaces) {
    lines.push('\n【十二宮】');
    for (const p of chart.palaces) {
      const stars = p.mainStars?.map((s: any) => s.siHua ? `${s.name}(${s.siHua})` : s.name).join('、') || '無主星';
      lines.push(`${p.name}（${p.gan}${p.zhi}）：${stars}`);
    }
  }
  
  if (chart.daXians) {
    lines.push('\n【大限】');
    const currentYear = new Date().getFullYear();
    const birthYear = chart.lunarDate?.year || 1990;
    const age = currentYear - birthYear;
    for (const dx of chart.daXians) {
      const isCurrent = age >= dx.startAge && age <= dx.endAge;
      lines.push(`${dx.startAge}-${dx.endAge}歲：${dx.gongName}${isCurrent ? ' ⭐當前' : ''}`);
    }
  }
  
  return lines.join('\n');
}

function formatBaziInfo(bazi: any): string {
  const lines: string[] = [];
  
  // 支援兩種結構：yearPillar 或 year
  const yearPillar = bazi.yearPillar || bazi.year;
  const monthPillar = bazi.monthPillar || bazi.month;
  const dayPillar = bazi.dayPillar || bazi.day;
  const hourPillar = bazi.hourPillar || bazi.hour;
  
  lines.push('【四柱】');
  lines.push(`年柱：${yearPillar?.gan}${yearPillar?.zhi}`);
  lines.push(`月柱：${monthPillar?.gan}${monthPillar?.zhi}`);
  lines.push(`日柱：${dayPillar?.gan}${dayPillar?.zhi}（日主）`);
  lines.push(`時柱：${hourPillar?.gan}${hourPillar?.zhi}`);
  
  // 日主五行
  const dayGanWuXing = dayPillar?.ganWuXing || bazi.dayMaster?.element || '';
  lines.push(`\n日主：${dayPillar?.gan}（${dayGanWuXing}）${bazi.dayMaster?.strength || ''}`);
  
  // 十神（如果有的話）
  if (bazi.yearShiShen) {
    lines.push(`\n【十神】`);
    lines.push(`年柱：${bazi.yearShiShen}｜月柱：${bazi.monthShiShen}｜時柱：${bazi.hourShiShen}`);
  }
  
  if (bazi.daYun?.length > 0) {
    lines.push('\n【大運】');
    const currentYear = new Date().getFullYear();
    const birthYear = bazi.lunarInfo?.year || bazi.birthYear || 1990;
    const age = currentYear - birthYear;
    for (const dy of bazi.daYun.slice(0, 8)) {
      const ganZhi = dy.ganZhi || `${dy.gan}${dy.zhi}`;
      const isCurrent = age >= dy.startAge && age < dy.startAge + 10;
      lines.push(`${dy.startAge}-${dy.startAge + 9}歲：${ganZhi}${isCurrent ? ' ⭐當前' : ''}`);
    }
  }
  
  return lines.join('\n');
}
