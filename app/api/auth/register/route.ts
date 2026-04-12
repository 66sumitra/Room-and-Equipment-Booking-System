import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  const { fullName, email, password } = await request.json();

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  // 1) Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 2) Create user row
  const { data: user, error: userError } = await supabase
  .from('users')
  .insert([{ email, password_hash: passwordHash, name: fullName, role: 'user' }])
  .select('id, email, name, role')
  .single();

  if (userError || !user) {
    // ตรวจ error unique key
    if ((userError as any)?.code === '23505') {
      return NextResponse.json(
        { message: 'อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: userError?.message || 'ไม่สามารถสร้างผู้ใช้ได้' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      fullName: (user as any).name ?? fullName,
      role: (user as any).role ?? 'user',
    },
    { status: 201 }
  );
}

