import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 驗證
    if (!username || username.length < 3) {
      return NextResponse.json({ error: '帳號至少需要 3 個字元' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 });
    }

    // 檢查帳號是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: '此帳號已被註冊' }, { status: 400 });
    }

    // 加密密碼
    const passwordHash = await bcrypt.hash(password, 10);

    // 建立用戶
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        password_hash: passwordHash,
      })
      .select('id, username')
      .single();

    if (error) {
      console.error('註冊錯誤:', error);
      return NextResponse.json({ error: '註冊失敗，請稍後再試' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (e) {
    console.error('註冊錯誤:', e);
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 });
  }
}
