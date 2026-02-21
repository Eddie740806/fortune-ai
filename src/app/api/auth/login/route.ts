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

    if (!username || !password) {
      return NextResponse.json({ error: '請輸入帳號和密碼' }, { status: 400 });
    }

    // 查找用戶
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    // 驗證密碼
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    // 登入成功，回傳用戶資訊（不含密碼）
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (e) {
    console.error('登入錯誤:', e);
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 });
  }
}
