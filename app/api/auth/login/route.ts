import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { signSessionJwt } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    console.log("--- เริ่มการล็อกอิน (โหมดแก้ไขด่วน) ---");
    console.log("กำลังตรวจสอบอีเมล:", `'${cleanEmail}'`);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, name, role')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userError || !user) {
      console.log("❌ ไม่พบผู้ใช้ในระบบ");
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้งานนี้ในระบบ' },
        { status: 401 }
      );
    }

    // --- 🚨 ส่วนที่แก้ไข: ทางลัดพิเศษสำหรับคุณสุมิตรา 🚨 ---
    // เช็กว่าถ้าพิมพ์ 123456 ให้ผ่านทันที หรือจะเช็กแบบ Bcrypt ปกติก็ได้
    const isHardcodedValid = cleanPassword === '123456';
    const isBcryptValid = await bcrypt.compare(cleanPassword, user.password_hash);
    const valid = isHardcodedValid || isBcryptValid;

    console.log("ผลการตรวจรหัสผ่าน:", valid ? "ถูกต้อง ✅" : "ผิด ❌");

    if (!valid) {
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
    // --------------------------------------------------

    const role = (user as any).role || 'user';

    const token = await signSessionJwt({
      userId: user.id,
      email: user.email,
      role,
    });

    const response = NextResponse.json(
      {
        id: user.id,
        email: user.email,
        fullName: (user as any).name ?? user.email,
        role,
      },
      { status: 200 }
    );

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (err: any) {
    console.error("ระบบขัดข้อง:", err.message);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}