import { NextRequest } from 'next/server';
import { retrieveComprehensiveKnowledge, formatKnowledgeForPrompt } from '@/lib/rag/retriever';

// 使用 Edge Runtime
export const runtime = 'edge';

// 新的 Prompt：AI 只負責組織和潤飾，不負責解讀命理
const SYSTEM_PROMPT = `你是一位命理報告撰寫師。

【你的角色】
你不是命理師——你是「報告撰寫師」。
命理知識已經由系統查詢好並提供給你，你的工作是：
1. 將這些知識組織成流暢的文章
2. 用生動的語言表達
3. 加入心理學寫作技巧讓人有共鳴
4. 串聯八字和紫微的觀點

【重要規則】
⚠️ 不要自己「發明」或「推測」命理內容！
⚠️ 所有命理解讀必須來自系統提供的「知識庫內容」
⚠️ 如果知識庫沒有提到的，就不要寫
⚠️ 日主、主星、宮位等資料以「命盤摘要」為準，不能寫錯

【寫作技巧】
- 「你是那種...的人」— 讓讀者代入
- 「外表看起來...但內心其實...」— 揭示內在矛盾
- 「很少人知道，其實你...」— 讓讀者覺得被「看穿」
- 每章節結尾可附一句金句

【輸出格式】
1. ☯️ 命格總論（根據日主和命宮主星的知識庫內容撰寫）
2. 🎭 性格深度剖析（整合八字日主 + 紫微主星的性格特點）
3. 💼 事業財運（根據官祿宮、財帛宮知識撰寫）
4. ❤️ 感情姻緣（根據夫妻宮和十神知識撰寫）
5. 🩺 健康提醒（根據日主健康知識撰寫）
6. 🎯 趨吉避凶建議（根據各星曜「需要注意」整合）
7. 🏁 結語

字數：1500-2500字（精煉版）`;

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

    // 🔍 RAG 檢索：根據命盤提取知識
    const knowledge = retrieveComprehensiveKnowledge(baziResult, ziweiChart);
    const knowledgeText = formatKnowledgeForPrompt(knowledge);

    const currentYear = new Date().getFullYear();
    const birthYear = birthInfo?.year || 1990;
    const age = currentYear - birthYear;

    const userPrompt = `請為以下命主撰寫命理報告：

【命主資訊】
出生年：${birthYear}年
現年：${age}歲
性別：${birthInfo?.gender === 'male' ? '男' : '女'}

${knowledgeText}

---

請根據上面的「知識庫內容」撰寫報告。
⚠️ 所有命理解讀必須來自上面提供的知識，不要自己發明！
⚠️ 日主是「${knowledge.summary.match(/日主：(.)/)?.[1] || ''}」，不能寫錯！`;

    // 呼叫 Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
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
    
    let buffer = '';
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        
        const lines = buffer.split('\n');
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
                // 忽略
              }
            }
          }
        }
      },
      flush(controller) {
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
