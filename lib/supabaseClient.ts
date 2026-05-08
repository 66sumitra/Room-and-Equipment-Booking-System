import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("🔗 Supabase URL:", supabaseUrl);
console.log("🔑 Supabase Key:", supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // 🌟 หัวใจสำคัญคือ 2 บรรทัดนี้ครับพี่!
      persistSession: true,   // สั่งให้จำสถานะการล็อกอินไว้ในเครื่อง (LocalStorage/Cookies)
      autoRefreshToken: true, // สั่งให้ต่ออายุบัตรผ่านอัตโนมัติ ไม่ต้องล็อกอินใหม่บ่อยๆ
      detectSessionInUrl: true // ช่วยให้ระบบตรวจเจอเวลาล็อกอินผ่าน Link หรือ Provider อื่นๆ
    }
  }
);
