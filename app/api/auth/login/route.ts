import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1) ล็อกอินผ่าน Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

    if (authError || !authData.user) {
      console.error('Login error:', authError?.message);
      return NextResponse.json(
        { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const user = authData.user;

    // 2) ดึงข้อมูลเพิ่มจากตาราง users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, full_name, username, role, email_verified')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError.message);
    }

    if (!profile) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' },
        { status: 404 }
      );
    }

    // 3) เช็กว่ายืนยันอีเมลหรือยัง
    if (!profile.email_verified) {
      await supabase.auth.signOut();

      return NextResponse.json(
        { message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' },
        { status: 403 }
      );
    }

    const role = profile.role || 'user';

    const fullName =
      profile.full_name ||
      profile.name ||
      profile.username ||
      user.user_metadata?.full_name ||
      user.email ||
      'User';

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        fullName,
        role,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('ระบบขัดข้อง:', err.message);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}