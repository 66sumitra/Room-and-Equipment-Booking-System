import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"ระบบยืม-คืน" <no-reply@demo.local>',
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr />
          <p style="font-size: 12px; color: #777;">
            อีเมลนี้ส่งจากระบบยืม-คืนอุปกรณ์และขอใช้คอมพิวเตอร์
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, info });
  } catch (error: any) {
    console.error('send-email route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}