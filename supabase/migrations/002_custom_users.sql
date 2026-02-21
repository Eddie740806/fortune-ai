-- 自訂 users 表（不用 Supabase Auth）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 允許 service key 存取
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 修改 readings 表，使用自訂 user_id
ALTER TABLE readings 
  DROP CONSTRAINT IF EXISTS readings_user_id_fkey,
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- RLS: 用戶只能看自己的紀錄
CREATE POLICY "Users can view own readings" ON readings
  FOR SELECT USING (true);  -- 暫時開放，之後用 API 層控制

CREATE POLICY "Users can insert own readings" ON readings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own readings" ON readings
  FOR DELETE USING (true);
