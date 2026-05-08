import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ message: 'Config missing' }, { status: 500 });
    }

    // รับ access token จาก header: Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // client สำหรับยืนยันว่า token นี้เป็นของ user จริง
    const authClient = createClient(supabaseUrl, anonKey);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // client สำหรับ query แบบ privileged หลังจากเช็กสิทธิ์แล้ว
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // เช็ก role ของ caller ก่อน
    const { data: me, error: meError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (meError) {
      return NextResponse.json({ message: meError.message }, { status: 500 });
    }

    if (!me || me.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // ถ้าเป็น admin ค่อยดึงรายชื่อผู้ใช้ทั้งหมด
    const { data: users, error } = await adminClient
      .from('users')
      .select('id, name, email, role')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const formattedUsers = (users || []).map((u: any) => ({
      id: u.id,
      fullName: u.name || 'ไม่ได้ระบุชื่อ',
      email: u.email,
      role: u.role,
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}