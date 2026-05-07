import { createClient } from "@supabase/supabase-js";

// ブラウザ専用クライアント（anon key）
// RLSポリシーによりitemsへの全CRUD操作が許可されている
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
