import { NextResponse } from 'next/server';

const RELATIONSHIP_PROMPTS: Record<string, string> = {
  lover: '情人或配偶關係，重點分析感情契合度、婚姻穩定性、相處模式',
  crush: '曖昧對象，重點分析是否有發展可能、對方心意、適合追求的方式',
  boss: '上司或老闆關係，重點分析向上管理技巧、如何獲得賞識、需要注意的地雷',
  subordinate: '下屬或部屬關係，重點分析帶人風格、如何激勵對方、潛在挑戰',
  partner: '合夥人關係，重點分析合作契合度、分工建議、可能的摩擦點',
  friend: '朋友或同事關係，重點分析日常相處、友誼深淺、適合的互動方式',
  family: '家人關係，重點分析親情互動、溝通方式、如何化解衝突',
  client: '客戶關係，重點分析成交機率、溝通要點、銷售策略建議',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { my, partner, relationshipType, question } = body;

    if (!my?.bazi || !partner?.bazi) {
      return NextResponse.json({ error: '命盤資料不完整' }, { status: 400 });
    }

    const relationshipContext = RELATIONSHIP_PROMPTS[relationshipType] || `${relationshipType}關係`;

    const systemPrompt = `你是一位精通八字命理的專業命理師，專門分析兩人之間的關係契合度。

你的分析風格：
- 專業但親切，不說太多術語，讓普通人也能理解
- 正面積極，即使有挑戰也要給出建設性建議
- 具體實用，給出可操作的相處建議
- 不迷信，以性格分析和相處之道為主

分析重點：
1. 日主相生相剋關係（兩人日干的五行互動）
2. 年柱相合相沖（緣分深淺）
3. 用神是否互補
4. 性格特質搭配
5. 具體相處建議

輸出格式（用 Markdown）：
## 🎯 關係總評
（一句話概括兩人關係的核心特質）

## ⚡ 契合度分析
（五行相生相剋、日主互動分析）

## 💡 相處之道
（具體可操作的建議，分點列出）

## ⚠️ 需要注意
（可能的摩擦點和化解方法）

## 🌟 這段關係的最佳定位
（一段總結和祝福）`;

    const userPrompt = `請分析以下兩人的關係：

【本人】${my.name}
- 出生：${my.birthInfo.year}年${my.birthInfo.month}月${my.birthInfo.day}日 ${my.birthInfo.hour !== '未知' ? my.birthInfo.hour + '時' : ''}
- 性別：${my.birthInfo.gender === 'male' ? '男' : '女'}
- 八字：${my.bazi.yearPillar.gan}${my.bazi.yearPillar.zhi} ${my.bazi.monthPillar.gan}${my.bazi.monthPillar.zhi} ${my.bazi.dayPillar.gan}${my.bazi.dayPillar.zhi} ${my.bazi.hourPillar.gan}${my.bazi.hourPillar.zhi}
- 日主：${my.bazi.dayPillar.gan}（${my.bazi.dayMaster?.wuxing || ''}）
- 用神：${my.bazi.yongShen || '未知'}

【對方】${partner.name}
- 出生：${partner.birthInfo.year}年${partner.birthInfo.month}月${partner.birthInfo.day}日 ${partner.birthInfo.hour !== '未知' ? partner.birthInfo.hour + '時' : ''}
- 性別：${partner.birthInfo.gender === 'male' ? '男' : '女'}
- 八字：${partner.bazi.yearPillar.gan}${partner.bazi.yearPillar.zhi} ${partner.bazi.monthPillar.gan}${partner.bazi.monthPillar.zhi} ${partner.bazi.dayPillar.gan}${partner.bazi.dayPillar.zhi} ${partner.bazi.hourPillar.gan}${partner.bazi.hourPillar.zhi}
- 日主：${partner.bazi.dayPillar.gan}（${partner.bazi.dayMaster?.wuxing || ''}）
- 用神：${partner.bazi.yongShen || '未知'}

【關係類型】${relationshipContext}

${question ? `【特別想了解】${question}` : ''}

請根據八字命理，深入分析這兩人的關係，給出專業且實用的建議。`;

    // 呼叫 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 3000,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return NextResponse.json({ error: 'AI 分析失敗' }, { status: 500 });
    }

    const data = await response.json();
    const interpretation = data.candidates?.[0]?.content?.parts?.[0]?.text || '分析結果生成失敗';

    return NextResponse.json({ interpretation });
  } catch (e) {
    console.error('合盤分析錯誤:', e);
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 });
  }
}
