import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: 'ไม่พบ token สำหรับยืนยันอีเมล' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified')
      .eq('email_verification_token', token)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!userData) {
      return NextResponse.json(
        { message: 'ลิงก์ยืนยันไม่ถูกต้อง หรือถูกใช้งานไปแล้ว' },
        { status: 404 }
      );
    }

    if (userData.email_verified) {
      return NextResponse.json(
        { message: 'อีเมลนี้ได้รับการยืนยันแล้ว' },
        { status: 200 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
      })
      .eq('id', userData.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      { message: 'ยืนยันอีเมลสำเร็จ สามารถเข้าสู่ระบบได้แล้ว' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify email error:', error.message);

    return NextResponse.json(
      { message: error.message || 'ยืนยันอีเมลไม่สำเร็จ' },
      { status: 500 }
    );
  }
}