import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { signSessionJwt } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  // 1. Find user by email in custom users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, password_hash, name, role')
    .eq('email', email)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  }

  // 2. Compare password hash
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  }

  const role = (user as any).role || 'user';

  // 4. Sign JWT and set httpOnly cookie
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

