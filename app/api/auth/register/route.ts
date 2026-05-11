import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    console.log('📩 Payload received:', {
      email,
      name,
      hasPassword: !!password,
    });

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

    const verificationToken = crypto.randomUUID();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,

        // ใช้ระบบยืนยันอีเมลของเราเอง
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
      role: 'user',
      email_verified: false,
      email_verification_token: verificationToken,
    });

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('❌ Database Insert Error:', dbError.message);
      throw dbError;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const verifyLink = `${appUrl}/verify-email?token=${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ระบบยืม-คืน" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'ยืนยันอีเมลสำหรับสมัครสมาชิก',
      text: `กรุณากดลิงก์นี้เพื่อยืนยันอีเมลของคุณ: ${verifyLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>ยืนยันอีเมลสำหรับสมัครสมาชิก</h2>

          <p>สวัสดีคุณ ${name}</p>

          <p>
            กรุณากดปุ่มด้านล่างเพื่อยืนยันว่าอีเมลนี้เป็นของคุณจริง
            ก่อนเข้าใช้งานระบบยืม-คืนอุปกรณ์และขอใช้คอมพิวเตอร์
          </p>

          <a
            href="${verifyLink}"
            style="
              display: inline-block;
              margin-top: 12px;
              padding: 12px 20px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: bold;
            "
          >
            ยืนยันอีเมล
          </a>

          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            หากปุ่มกดไม่ได้ ให้คัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์:
            <br />
            ${verifyLink}
          </p>

          <hr />

          <p style="font-size: 12px; color: #777;">
            อีเมลนี้ส่งจากระบบยืม-คืนอุปกรณ์และขอใช้คอมพิวเตอร์
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message:
          'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ',
      },
      { status: 201 }
    );
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