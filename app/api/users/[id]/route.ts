import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ สังเกตตรง { params }: { params: Promise<{ id: string }> }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 🔥 บรรทัดนี้แหละที่สำคัญที่สุดใน Next.js 15!
    const resolvedParams = await params; 
    const userId = resolvedParams.id;

    const { role } = await req.json();

    // เช็กเผื่อไว้ถ้า ID หลุดมาเป็นคำว่า "undefined"
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ message: 'ไม่พบ ID ผู้ใช้งาน' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('users')
      .update({ role: role })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (error: any) {
    console.error("❌ PATCH ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ทำแบบเดียวกันกับฟังก์ชัน DELETE ครับ
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}