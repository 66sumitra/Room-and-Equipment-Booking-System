import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"ระบบยืม-คืน" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.8; max-width: 720px;">
          <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
            ${safeSubject}
          </h2>

          <div style="font-size: 14px; line-height: 1.9; color: #1f2937;">
            ${safeMessage}
          </div>

          <hr style="margin: 28px 0 16px; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            อีเมลนี้ส่งจากระบบยืม-คืนอุปกรณ์และขอใช้คอมพิวเตอร์
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, info });
  } catch (error: any) {
    console.warn('send-email route warning:', error);
    return NextResponse.json(
      { error: error.message || 'ส่งอีเมลไม่สำเร็จ' },
      { status: 500 }
    );
  }
}