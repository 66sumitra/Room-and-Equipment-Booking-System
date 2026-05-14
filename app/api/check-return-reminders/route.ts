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

function formatThaiDateOnly(date: Date | null) {
  if (!date) return 'ไม่ระบุ';

  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getBangkokDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';

  return { year, month, day };
}

function createBangkokDateTime(year: string, month: string, day: string, hour: string, minute: string) {
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
}

function getDayBeforeMorningTime(returnDate: string) {
  const returnAt = parseDateTime(returnDate);
  if (!returnAt) return null;

  const { year, month, day } = getBangkokDateParts(returnAt);
  const returnDayMorning = createBangkokDateTime(year, month, day, '08', '00');

  return new Date(returnDayMorning.getTime() - 24 * 60 * 60 * 1000);
}

function getDueDayMorningTime(returnDate: string) {
  const returnAt = parseDateTime(returnDate);
  if (!returnAt) return null;

  const { year, month, day } = getBangkokDateParts(returnAt);

  return createBangkokDateTime(year, month, day, '08', '00');
}

function isMultiDayBorrow(borrowDate: string | null | undefined, returnDate: string | null | undefined) {
  const borrowAt = parseDateTime(borrowDate);
  const returnAt = parseDateTime(returnDate);

  if (!borrowAt || !returnAt) return false;

  const durationMs = returnAt.getTime() - borrowAt.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return durationMs > oneDayMs;
}

function getShortBorrowReminderTime(returnDate: string | null | undefined) {
  const returnAt = parseDateTime(returnDate);

  if (!returnAt) return null;

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

async function createNotification(
  userEmail: string | null | undefined,
  title: string,
  message: string,
  type: string,
  requestId: string
) {
  if (!userEmail) return;

  await supabaseAdmin.from('notifications').insert([
    {
      user_email: userEmail,
      title,
      message,
      type,
      related_request_id: requestId,
    },
  ]);
}

function createReminderEmailMessage({
  userName,
  heading,
  requestNo,
  itemTypeText,
  itemName,
  itemCode,
  itemDetail,
  returnDateText,
  extraText,
}: {
  userName: string;
  heading: string;
  requestNo: string;
  itemTypeText: string;
  itemName: string;
  itemCode: string;
  itemDetail: string;
  returnDateText: string;
  extraText: string;
}) {
  return `เรียน คุณ${userName}

${heading}

รายละเอียดรายการ
เลขคำขอยืม: ${requestNo}
ประเภท: ${itemTypeText}
รายการ: ${itemName}
รหัสรายการ: ${itemCode}
รายละเอียด: ${itemDetail}
กำหนดคืน: ${returnDateText}

${extraText}

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`;
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
        day_before_reminder_sent,
        due_day_morning_reminder_sent,
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

    let shortReturnReminderCount = 0;
    let dayBeforeReminderCount = 0;
    let dueDayMorningReminderCount = 0;
    let overdueCount = 0;

    let emailSentCount = 0;
    let emailFailedCount = 0;
    let adminEmailSentCount = 0;
    let adminEmailFailedCount = 0;

    const emailErrors: any[] = [];
    const adminEmailErrors: any[] = [];

    for (const item of (requests || []) as any[]) {
      const returnAt = parseDateTime(item.return_date);

      if (!returnAt) continue;

      const itemName = getItemName(item);
      const itemCode = getItemCode(item);
      const itemDetail = getItemDetail(item);
      const itemTypeText = getItemTypeText(item);
      const userEmail = item.user_email;
      const userName = await getUserDisplayName(item);
      const requestNo = item.request_no || 'ไม่ระบุเลขคำขอ';
      const returnDateText = formatThaiDateTime(item.return_date);
      const multiDay = isMultiDayBorrow(item.borrow_date, item.return_date);

      // 1) ยืมหลายวัน: แจ้งก่อนวันคืน 1 วัน เวลา 08:00 น.
      if (multiDay && !item.day_before_reminder_sent) {
        const dayBeforeReminderAt = getDayBeforeMorningTime(item.return_date);

        if (
          dayBeforeReminderAt &&
          now.getTime() >= dayBeforeReminderAt.getTime() &&
          now.getTime() < returnAt.getTime()
        ) {
          const title = 'แจ้งเตือนล่วงหน้าก่อนถึงวันคืนรายการ';

          const notificationMessage = `รายการ ${itemName} จะถึงกำหนดคืนในวันพรุ่งนี้ กรุณาเตรียมคืนภายใน ${returnDateText}`;

          const emailMessage = createReminderEmailMessage({
            userName,
            heading:
              'ระบบขอแจ้งเตือนว่า รายการยืมของท่านจะถึงกำหนดคืนในวันพรุ่งนี้',
            requestNo,
            itemTypeText,
            itemName,
            itemCode,
            itemDetail,
            returnDateText,
            extraText:
              'กรุณาเตรียมรายการให้พร้อม และดำเนินการคืนตามวันและเวลาที่กำหนด',
          });

          const emailResult = await sendEmail(userEmail, title, emailMessage);

          if (!emailResult.ok) {
            emailFailedCount++;

            emailErrors.push({
              requestId: item.id,
              requestNo,
              to: userEmail,
              type: 'day_before_return_reminder',
              error: emailResult.error,
            });

            continue;
          }

          await createNotification(
            userEmail,
            title,
            notificationMessage,
            'day_before_return_reminder',
            item.id
          );

          await supabaseAdmin
            .from('borrow_requests')
            .update({ day_before_reminder_sent: true })
            .eq('id', item.id);

          dayBeforeReminderCount++;
          emailSentCount++;
        }
      }

      // 2) ยืมหลายวัน: แจ้งอีกครั้ง 08:00 น. ของวันที่ต้องคืน
      if (multiDay && !item.due_day_morning_reminder_sent) {
        const dueDayMorningReminderAt = getDueDayMorningTime(item.return_date);

        if (
          dueDayMorningReminderAt &&
          now.getTime() >= dueDayMorningReminderAt.getTime() &&
          now.getTime() < returnAt.getTime()
        ) {
          const title = 'แจ้งเตือนกำหนดคืนรายการภายในวันนี้';

          const notificationMessage = `รายการ ${itemName} มีกำหนดคืนภายในวันนี้ กรุณาคืนภายใน ${returnDateText}`;

          const emailMessage = createReminderEmailMessage({
            userName,
            heading:
              'ระบบขอแจ้งเตือนว่า รายการยืมของท่านมีกำหนดคืนภายในวันนี้',
            requestNo,
            itemTypeText,
            itemName,
            itemCode,
            itemDetail,
            returnDateText,
            extraText:
              'กรุณาดำเนินการคืนรายการภายในวันนี้ตามเวลาที่กำหนด หรือแจ้งคืนผ่านระบบให้เรียบร้อย',
          });

          const emailResult = await sendEmail(userEmail, title, emailMessage);

          if (!emailResult.ok) {
            emailFailedCount++;

            emailErrors.push({
              requestId: item.id,
              requestNo,
              to: userEmail,
              type: 'due_day_morning_reminder',
              error: emailResult.error,
            });

            continue;
          }

          await createNotification(
            userEmail,
            title,
            notificationMessage,
            'due_day_morning_reminder',
            item.id
          );

          await supabaseAdmin
            .from('borrow_requests')
            .update({ due_day_morning_reminder_sent: true })
            .eq('id', item.id);

          dueDayMorningReminderCount++;
          emailSentCount++;
        }
      }

      // 3) ยืมระยะสั้น / วันเดียว: แจ้งก่อนคืน 15 นาที
      if (!multiDay && !item.return_reminder_sent) {
        const shortReminderAt = getShortBorrowReminderTime(item.return_date);

        if (
          shortReminderAt &&
          now.getTime() >= shortReminderAt.getTime() &&
          now.getTime() < returnAt.getTime()
        ) {
          const title = 'แจ้งเตือนใกล้ถึงกำหนดคืนรายการ';

          const notificationMessage = `รายการ ${itemName} ใกล้ถึงกำหนดคืนแล้ว กรุณาคืนภายใน ${returnDateText}`;

          const emailMessage = createReminderEmailMessage({
            userName,
            heading:
              'ระบบขอแจ้งเตือนว่า รายการยืมของท่านใกล้ถึงกำหนดคืนภายใน 15 นาที',
            requestNo,
            itemTypeText,
            itemName,
            itemCode,
            itemDetail,
            returnDateText,
            extraText:
              'กรุณาดำเนินการคืนรายการภายในเวลาที่กำหนด หรือแจ้งคืนผ่านระบบให้เร็วที่สุด\n\nหากเลยกำหนดคืน ระบบอาจบันทึกรายการเป็นการคืนเกินกำหนด',
          });

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

          await createNotification(
            userEmail,
            title,
            notificationMessage,
            'return_reminder',
            item.id
          );

          await supabaseAdmin
            .from('borrow_requests')
            .update({ return_reminder_sent: true })
            .eq('id', item.id);

          shortReturnReminderCount++;
          emailSentCount++;
        }
      }

      // 4) แจ้งเตือนเกินกำหนดคืน
      if (!item.overdue_reminder_sent && now.getTime() >= returnAt.getTime()) {
        const title = 'แจ้งเตือนรายการเกินกำหนดคืน';

        const notificationMessage = `รายการ ${itemName} เกินกำหนดคืนแล้ว กรุณารีบดำเนินการคืนรายการ`;

        const emailMessage = createReminderEmailMessage({
          userName,
          heading: 'ระบบตรวจพบว่ารายการยืมของท่านเกินกำหนดคืนแล้ว',
          requestNo,
          itemTypeText,
          itemName,
          itemCode,
          itemDetail,
          returnDateText,
          extraText: 'กรุณารีบคืนรายการ หรือแจ้งคืนผ่านระบบโดยเร็วที่สุด',
        });

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

        await createNotification(
          userEmail,
          title,
          notificationMessage,
          'overdue',
          item.id
        );

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
      apiVersion: 'multi-day-two-reminders-v1',
      message: 'check return reminders success',
      totalApprovedRequests: requests?.length || 0,

      shortReturnReminderCount,
      dayBeforeReminderCount,
      dueDayMorningReminderCount,
      returnReminderCount:
        shortReturnReminderCount +
        dayBeforeReminderCount +
        dueDayMorningReminderCount,

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