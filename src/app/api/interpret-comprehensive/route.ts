import { NextRequest } from 'next/server';

// 使用 Edge Runtime
export const runtime = 'edge';

// 八字+紫微雙系統綜合分析 Prompt
const SYSTEM_PROMPT = `你是一位資深命理師，精通八字命理與紫微斗數雙系統。

【核心任務】
你的解盤要讓命主讀完第一段就覺得：「這根本就是在說我！」

【心理學寫作技巧】
- 「你是那種...的人」— 讓用戶自動代入
- 「外表看起來...但內心其實...」— 揭示內在矛盾
- 「很少人知道，其實你...」— 讓用戶覺得被「看穿」

【語氣風格】
- 直接、敢講、有畫面、有溫度
- 每章節結尾必附「命理師金句」

【必須輸出的章節】：
1. ☯️ 命格總論（開盤金句、八字格局、紫微命宮）
2. 🎭 性格深度剖析（八字+紫微+雙系統交叉）
3. 🔮 過去驗證（3-5個年份區間）
4. 💼 事業運（八字+紫微+趨吉策略）
5. 💰 財運（八字+紫微+趨吉策略）
6. ❤️ 感情運（八字+紫微+趨吉策略）
7. 🩺 健康提醒
8. 📅 流年劇情（五幕式）
9. 🎯 趨吉避凶行動指南
10. 🗺️ 未來三年戰略地圖（表格）
11. 👥 貴人與小人
12. 🏁 結語與驗證問句（3題）

字數：至少3000字`;

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

    const currentYear = new Date().getFullYear();
    const birthYear = birthInfo?.year || 1990;
    const age = currentYear - birthYear;

    const userPrompt = `請為以下命主進行八字+紫微雙系統綜合解讀：

命主：${birthYear}年生，現年${age}歲，${birthInfo?.gender === 'male' ? '男' : '女'}

【八字命盤】
${baziInfo}

【紫微斗數命盤】
${ziweiInfo}

⚠️ 重要：
- 當前是${currentYear}年
- 命主現年${age}歲
- 必須完整輸出所有12個章節`;

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
  lines.push('【四柱】');
  lines.push(`年柱：${bazi.year?.gan}${bazi.year?.zhi}`);
  lines.push(`月柱：${bazi.month?.gan}${bazi.month?.zhi}`);
  lines.push(`日柱：${bazi.day?.gan}${bazi.day?.zhi}（日主）`);
  lines.push(`時柱：${bazi.hour?.gan}${bazi.hour?.zhi}`);
  lines.push(`\n日主：${bazi.day?.gan}（${bazi.dayMaster?.element || ''}）${bazi.dayMaster?.strength || ''}`);
  
  if (bazi.daYun?.length > 0) {
    lines.push('\n【大運】');
    const currentYear = new Date().getFullYear();
    const birthYear = bazi.birthYear || 1990;
    const age = currentYear - birthYear;
    for (const dy of bazi.daYun.slice(0, 8)) {
      const isCurrent = age >= dy.startAge && age < dy.startAge + 10;
      lines.push(`${dy.startAge}-${dy.startAge + 9}歲：${dy.gan}${dy.zhi}${isCurrent ? ' ⭐當前' : ''}`);
    }
  }
  
  return lines.join('\n');
}
