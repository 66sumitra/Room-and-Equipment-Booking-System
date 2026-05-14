import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function escapeHtml(text: string) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseDateTime(value: string | null | undefined) {
  if (!value) return null;

  const text = value.replace(' ', 'T');

  if (text.endsWith('Z') || text.includes('+')) {
    return new Date(text);
  }

  return new Date(`${text}+07:00`);
}

function formatThaiDateTime(dateTime: string | null | undefined) {
  const date = parseDateTime(dateTime);

  if (!date) return 'ไม่ระบุ';

  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getReminderTime(borrowDate: string, returnDate: string) {
  const borrowAt = parseDateTime(borrowDate);
  const returnAt = parseDateTime(returnDate);

  if (!borrowAt || !returnAt) return null;

  const durationMs = returnAt.getTime() - borrowAt.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // ถ้ายืมหลายวัน แจ้งก่อน 1 วัน เวลา 08:00 น.
  if (durationMs > oneDayMs) {
    const returnText = returnDate.replace(' ', 'T').slice(0, 10);
    const returnDay = new Date(`${returnText}T00:00:00+07:00`);

    returnDay.setDate(returnDay.getDate() - 1);

    const year = returnDay.getFullYear();
    const month = String(returnDay.getMonth() + 1).padStart(2, '0');
    const day = String(returnDay.getDate()).padStart(2, '0');

    return new Date(`${year}-${month}-${day}T08:00:00+07:00`);
  }

  // ถ้ายืมวันเดียว / ระยะสั้น แจ้งก่อนคืน 15 นาที
  return new Date(returnAt.getTime() - 15 * 60 * 1000);
}

function getComputerData(item: any) {
  return Array.isArray(item.computers) ? item.computers[0] : item.computers;
}

function getEquipmentData(item: any) {
  return Array.isArray(item.equipment) ? item.equipment[0] : item.equipment;
}

function getItemName(item: any) {
  const computerData = getComputerData(item);
  const equipmentData = getEquipmentData(item);

  if (item.request_type === 'computer') {
    return computerData?.pc_name || 'คอมพิวเตอร์';
  }

  return equipmentData?.name || 'อุปกรณ์';
}

function getItemCode(item: any) {
  const computerData = getComputerData(item);
  const equipmentData = getEquipmentData(item);

  if (item.request_type === 'computer') {
    return computerData?.pc_name || 'ไม่ระบุรหัสคอมพิวเตอร์';
  }

  return (
    equipmentData?.code ||
    equipmentData?.equipment_code ||
    'ไม่ระบุรหัสอุปกรณ์'
  );
}

function getItemDetail(item: any) {
  const computerData = getComputerData(item);
  const equipmentData = getEquipmentData(item);

  if (item.request_type === 'computer') {
    return computerData?.room_name || 'ไม่ระบุห้อง';
  }

  return equipmentData?.category || 'ไม่ระบุหมวดหมู่';
}

function getItemTypeText(item: any) {
  return item.request_type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
}

async function getUserDisplayName(item: any) {
  const rawName =
    typeof item.user_name === 'string' ? item.user_name.trim() : '';

  if (rawName && !rawName.includes('@')) {
    return rawName;
  }

  if (item.user_email) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('email', item.user_email)
      .maybeSingle();

    if (data?.name && !data.name.includes('@')) {
      return data.name;
    }
  }

  return 'ผู้ใช้งาน';
}

async function sendEmail(
  to: string | null | undefined,
  subject: string,
  message: string
) {
  if (!to) {
    return {
      ok: false,
      error: 'ไม่มีอีเมลผู้รับ',
    };
  }

  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      return {
        ok: false,
        error:
          'ยังไม่ได้ตั้งค่า GMAIL_USER หรือ GMAIL_APP_PASSWORD ใน Vercel Environment Variables',
      };
    }

    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"ระบบยืม-คืน" <${gmailUser}>`,
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

    return {
      ok: true,
      result: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    };
  } catch (error: any) {
    return {
      ok: false,
      error: {
        message: error?.message || 'ส่งอีเมลไม่สำเร็จ',
        code: error?.code || null,
        response: error?.response || null,
      },
    };
  }
}

export async function GET() {
  try {
    const now = new Date();

    const { data: requests, error } = await supabaseAdmin
      .from('borrow_requests')
      .select(
        `
        id,
        request_no,
        request_type,
        user_name,
        user_email,
        borrow_date,
        return_date,
        status,
        return_reminder_sent,
        overdue_reminder_sent,
        equipment:equipment_id (
          name,
          category,
          code,
          equipment_code
        ),
        computers:computer_id (
          pc_name,
          room_name
        )
      `
      )
      .eq('status', 'approved');

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    let returnReminderCount = 0;
    let overdueCount = 0;
    let emailSentCount = 0;
    let emailFailedCount = 0;
    let adminEmailSentCount = 0;
    let adminEmailFailedCount = 0;

    const emailErrors: any[] = [];
    const adminEmailErrors: any[] = [];

    for (const item of (requests || []) as any[]) {
      const returnAt = parseDateTime(item.return_date);
      const reminderAt = getReminderTime(item.borrow_date, item.return_date);

      if (!returnAt || !reminderAt) continue;

      const itemName = getItemName(item);
      const itemCode = getItemCode(item);
      const itemDetail = getItemDetail(item);
      const itemTypeText = getItemTypeText(item);
      const userEmail = item.user_email;
      const userName = await getUserDisplayName(item);
      const requestNo = item.request_no || 'ไม่ระบุเลขคำขอ';
      const returnDateText = formatThaiDateTime(item.return_date);

      // 1) แจ้งเตือนก่อนถึงเวลาคืน 15 นาที
      if (
        !item.return_reminder_sent &&
        now.getTime() >= reminderAt.getTime() &&
        now.getTime() < returnAt.getTime()
      ) {
        const title = 'แจ้งเตือนใกล้ถึงกำหนดคืนรายการ';

        const notificationMessage = `รายการ ${itemName} ใกล้ถึงกำหนดคืนแล้ว กรุณาคืนภายใน ${returnDateText}`;

        const emailMessage = `เรียน คุณ${userName}

ระบบขอแจ้งเตือนว่า รายการยืมของท่านใกล้ถึงกำหนดคืนภายใน 15 นาที

รายละเอียดรายการ
เลขคำขอยืม: ${requestNo}
ประเภท: ${itemTypeText}
รายการ: ${itemName}
รหัสรายการ: ${itemCode}
รายละเอียด: ${itemDetail}
กำหนดคืน: ${returnDateText}

กรุณาดำเนินการคืนรายการภายในเวลาที่กำหนด หรือแจ้งคืนผ่านระบบให้เร็วที่สุด

หากเลยกำหนดคืน ระบบอาจบันทึกรายการเป็นการคืนเกินกำหนด

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`;

        const emailResult = await sendEmail(userEmail, title, emailMessage);

        if (!emailResult.ok) {
          emailFailedCount++;

          emailErrors.push({
            requestId: item.id,
            requestNo,
            to: userEmail,
            type: 'return_reminder',
            error: emailResult.error,
          });

          continue;
        }

        await supabaseAdmin.from('notifications').insert([
          {
            user_email: userEmail,
            title,
            message: notificationMessage,
            type: 'return_reminder',
            related_request_id: item.id,
          },
        ]);

        await supabaseAdmin
          .from('borrow_requests')
          .update({ return_reminder_sent: true })
          .eq('id', item.id);

        returnReminderCount++;
        emailSentCount++;
      }

      // 2) แจ้งเตือนเกินกำหนดคืน
      if (!item.overdue_reminder_sent && now.getTime() >= returnAt.getTime()) {
        const title = 'แจ้งเตือนรายการเกินกำหนดคืน';

        const notificationMessage = `รายการ ${itemName} เกินกำหนดคืนแล้ว กรุณารีบดำเนินการคืนรายการ`;

        const emailMessage = `เรียน คุณ${userName}

ระบบตรวจพบว่ารายการยืมของท่านเกินกำหนดคืนแล้ว

รายละเอียดรายการ
เลขคำขอยืม: ${requestNo}
ประเภท: ${itemTypeText}
รายการ: ${itemName}
รหัสรายการ: ${itemCode}
รายละเอียด: ${itemDetail}
กำหนดคืน: ${returnDateText}

กรุณารีบคืนรายการ หรือแจ้งคืนผ่านระบบโดยเร็วที่สุด

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`;

        const emailResult = await sendEmail(userEmail, title, emailMessage);

        if (!emailResult.ok) {
          emailFailedCount++;

          emailErrors.push({
            requestId: item.id,
            requestNo,
            to: userEmail,
            type: 'overdue',
            error: emailResult.error,
          });

          continue;
        }

        await supabaseAdmin.from('notifications').insert([
          {
            user_email: userEmail,
            title,
            message: notificationMessage,
            type: 'overdue',
            related_request_id: item.id,
          },
        ]);

        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          for (const admin of admins as any[]) {
            if (!admin.email) continue;

            const adminEmailResult = await sendEmail(
              admin.email,
              'มีรายการเกินกำหนดคืนในระบบ',
              `เรียน ผู้ดูแลระบบ

ระบบตรวจพบรายการเกินกำหนดคืน

รายละเอียดรายการ
เลขคำขอยืม: ${requestNo}
ผู้ยืม: ${userName}
อีเมล: ${userEmail}
ประเภท: ${itemTypeText}
รายการ: ${itemName}
รหัสรายการ: ${itemCode}
กำหนดคืน: ${returnDateText}

กรุณาเข้าสู่ระบบเพื่อตรวจสอบและดำเนินการต่อ`
            );

            if (adminEmailResult.ok) {
              adminEmailSentCount++;
            } else {
              adminEmailFailedCount++;

              adminEmailErrors.push({
                requestId: item.id,
                requestNo,
                to: admin.email,
                type: 'admin_overdue',
                error: adminEmailResult.error,
              });
            }
          }
        }

        await supabaseAdmin
          .from('borrow_requests')
          .update({ overdue_reminder_sent: true })
          .eq('id', item.id);

        overdueCount++;
        emailSentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'check return reminders success',
      totalApprovedRequests: requests?.length || 0,
      returnReminderCount,
      overdueCount,
      emailSentCount,
      emailFailedCount,
      adminEmailSentCount,
      adminEmailFailedCount,
      emailErrors,
      adminEmailErrors,
    });
  } catch (error) {
    const err = error as Error;

    return NextResponse.json(
      {
        success: false,
        message: err.message || 'server error',
      },
      { status: 500 }
    );
  }
}