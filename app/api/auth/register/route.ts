import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    console.log('📩 Payload received:', { email, name, hasPassword: !!password });

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
        },
      });

    if (authError) {
      throw authError;
    }

    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      name,
      email,
    });

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('❌ Database Insert Error:', dbError.message);
      throw dbError;
    }

    return NextResponse.json({ message: 'Success' }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Register API Error:', error.message);

    let friendlyMessage = error.message;
    if (error.message.includes('already registered')) {
      friendlyMessage = 'อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้เมลอื่น';
    } else if (error.message.includes('Password should be')) {
      friendlyMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    return NextResponse.json({ message: friendlyMessage }, { status: 500 });
  }
}