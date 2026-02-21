import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用 service key 繞過 RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, birthInfo, interpretation, readingType } = body;

    // 驗證必填欄位
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }
    if (!name || !birthInfo || !interpretation) {
      return NextResponse.json({ error: '資料不完整' }, { status: 400 });
    }

    // 直接保存到 readings（不再驗證 user 存在，因為外鍵會檢查）
    const { data, error } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        name,
        birth_info: birthInfo,
        interpretation,
        reading_type: readingType || 'comprehensive',
      })
      .select('id')
      .single();

    if (error) {
      console.error('保存錯誤:', error);
      // 返回更詳細的錯誤訊息以便診斷
      if (error.code === '23503') {
        // 外鍵約束失敗 - 可能是 user_id 格式問題或指向錯誤的表
        console.error('外鍵錯誤詳情:', error);
        return NextResponse.json({ 
          error: '帳號驗證失敗，請登出後重新登入' 
        }, { status: 400 });
      }
      if (error.code === '42501') {
        return NextResponse.json({ 
          error: '權限不足，請聯繫管理員' 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        error: `保存失敗：${error.message || '未知錯誤'}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      readingId: data.id 
    });
  } catch (e) {
    console.error('保存錯誤:', e);
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 });
  }
}
