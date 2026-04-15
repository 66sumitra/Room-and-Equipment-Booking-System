import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // 1. ดึงค่าจาก .env.local (พยายามดึงทั้งแบบ Server และ Public)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. เช็คว่ามีค่าไหม (ถ้าไม่มีจะแสดง Error ที่อ่านรู้เรื่องใน Console)
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
      return NextResponse.json({ 
        message: 'ตั้งค่า Supabase URL หรือ Key ใน .env.local ไม่ถูกต้องครับ (ห้ามใช้ตัวอย่าง your-project-url)' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 3. ดึงข้อมูล
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 4. ส่งกลับ
    const formattedUsers = (users || []).map((u: any) => ({
      id: u.id,
      fullName: u.name || 'ไม่ได้ระบุชื่อ',
      email: u.email,
      role: u.role
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error: any) {
    console.error("❌ API ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}