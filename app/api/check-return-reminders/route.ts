import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function parseDateTime(value: string) {
  if (!value) return null;

  const text = value.replace(' ', 'T');

  if (text.endsWith('Z') || text.includes('+')) {
    return new Date(text);
  }

  return new Date(`${text}+07:00`);
}

function formatThaiDateTime(dateTime: string) {
  const date = parseDateTime(dateTime);

  if (!date) return '-';

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

  // ถ้ายืมหลายวัน แจ้งก่อนวันคืน 1 วัน ตอน 08:00 น.
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

async function sendEmail(
  origin: string,
  to: string | null | undefined,
  subject: string,
  message: string
) {
  if (!to) return;

  try {
    const response = await fetch(`${origin}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('send reminder email error:', errorData);
    }
  } catch (error) {
    console.error('send reminder email failed:', error);
  }
}

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const now = new Date();

    const { data: requests, error } = await supabaseAdmin
      .from('borrow_requests')
      .select(
        `
        id,
        request_type,
        user_name,
        user_email,
        borrow_date,
        return_date,
        status,
        return_reminder_sent,
        overdue_reminder_sent,
        equipment:equipment_id (
          name
        ),
        computers:computer_id (
          pc_name
        )
      `
      )
      .eq('status', 'approved');

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    let returnReminderCount = 0;
    let overdueCount = 0;

    for (const item of (requests || []) as any[]) {
      const returnAt = parseDateTime(item.return_date);
      const reminderAt = getReminderTime(item.borrow_date, item.return_date);

      if (!returnAt || !reminderAt) continue;

      const computerData = Array.isArray(item.computers)
        ? item.computers[0]
        : item.computers;

      const equipmentData = Array.isArray(item.equipment)
        ? item.equipment[0]
        : item.equipment;

      const itemName =
        item.request_type === 'computer'
          ? computerData?.pc_name || 'คอมพิวเตอร์'
          : equipmentData?.name || 'อุปกรณ์';

      const userEmail = item.user_email;
      const userName = item.user_name || userEmail || 'ผู้ใช้งาน';

      // 1) แจ้งเตือนก่อนถึงเวลาคืน
      // ล็อกก่อนส่ง เพื่อกันเด้งซ้ำหลายรอบ
      if (
        !item.return_reminder_sent &&
        now.getTime() >= reminderAt.getTime() &&
        now.getTime() < returnAt.getTime()
      ) {
        const { data: lockedReminder, error: lockReminderError } =
          await supabaseAdmin
            .from('borrow_requests')
            .update({ return_reminder_sent: true })
            .eq('id', item.id)
            .eq('return_reminder_sent', false)
            .select('id')
            .maybeSingle();

        if (lockReminderError || !lockedReminder) {
          continue;
        }

        const title = 'ใกล้ถึงเวลาคืนอุปกรณ์';
        const message = `ใกล้ถึงเวลาคืน ${itemName} แล้ว กรุณาคืนภายใน ${formatThaiDateTime(
          item.return_date
        )}`;

        await supabaseAdmin.from('notifications').insert([
          {
            user_email: userEmail,
            title,
            message,
            type: 'return_reminder',
            related_request_id: item.id,
          },
        ]);

        await sendEmail(
          origin,
          userEmail,
          'แจ้งเตือนใกล้ถึงเวลาคืนอุปกรณ์',
          `เรียน ${userName}

ระบบขอแจ้งเตือนว่าใกล้ถึงเวลาคืนอุปกรณ์แล้ว

รายละเอียด
รายการ: ${itemName}
กำหนดคืน: ${formatThaiDateTime(item.return_date)}

กรุณาคืนอุปกรณ์ภายในเวลาที่กำหนด

ขอบคุณค่ะ`
        );

        returnReminderCount++;
      }

      // 2) แจ้งเตือนเกินกำหนดคืน
      // ล็อกก่อนส่ง เพื่อกันเด้งซ้ำหลายรอบ
      if (!item.overdue_reminder_sent && now.getTime() >= returnAt.getTime()) {
        const { data: lockedOverdue, error: lockOverdueError } =
          await supabaseAdmin
            .from('borrow_requests')
            .update({ overdue_reminder_sent: true })
            .eq('id', item.id)
            .eq('overdue_reminder_sent', false)
            .select('id')
            .maybeSingle();

        if (lockOverdueError || !lockedOverdue) {
          continue;
        }

        const title = 'เกินกำหนดคืนอุปกรณ์';
        const message = `${itemName} เกินกำหนดคืนแล้ว กรุณารีบดำเนินการคืนอุปกรณ์`;

        await supabaseAdmin.from('notifications').insert([
          {
            user_email: userEmail,
            title,
            message,
            type: 'overdue',
            related_request_id: item.id,
          },
        ]);

        await sendEmail(
          origin,
          userEmail,
          'แจ้งเตือนเกินกำหนดคืนอุปกรณ์',
          `เรียน ${userName}

ระบบตรวจพบว่ารายการของคุณเกินกำหนดคืนแล้ว

รายละเอียด
รายการ: ${itemName}
กำหนดคืน: ${formatThaiDateTime(item.return_date)}

กรุณารีบคืนอุปกรณ์หรือติดต่อเจ้าหน้าที่

ขอบคุณค่ะ`
        );

        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          await Promise.all(
            (admins as any[])
              .filter((admin) => admin.email)
              .map((admin) =>
                sendEmail(
                  origin,
                  admin.email,
                  'มีรายการเกินกำหนดคืนอุปกรณ์',
                  `มีรายการเกินกำหนดคืนในระบบ

ผู้ยืม: ${userName}
อีเมล: ${userEmail}
รายการ: ${itemName}
กำหนดคืน: ${formatThaiDateTime(item.return_date)}

กรุณาเข้าสู่ระบบเพื่อตรวจสอบ`
                )
              )
          );
        }

        overdueCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'check return reminders success',
      returnReminderCount,
      overdueCount,
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