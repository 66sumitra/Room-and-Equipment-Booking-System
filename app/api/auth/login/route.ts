import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

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

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, role, email_verified')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError.message);
      return NextResponse.json(
        { message: 'ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' },
        { status: 404 }
      );
    }

    if (profile.email_verified === false) {
      await supabase.auth.signOut();

      return NextResponse.json(
        { message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' },
        { status: 403 }
      );
    }

    const role = profile.role || 'user';

    const fullName =
      profile.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
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
    console.error('ระบบขัดข้อง:', err?.message || err);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}