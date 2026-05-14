import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RETURN_REMINDER_MINUTES = 15;

const formatThaiDateTime = (dateTime: string | null | undefined) => {
  if (!dateTime) return 'ไม่ระบุ';

  return new Date(dateTime).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getItemName = (item: any) => {
  if (item.request_type === 'computer') {
    return item.computers?.pc_name || 'คอมพิวเตอร์';
  }

  return item.equipment?.name || 'อุปกรณ์';
};

const getItemCode = (item: any) => {
  if (item.request_type === 'computer') {
    return item.computers?.pc_name || 'ไม่ระบุ';
  }

  return item.equipment?.code || item.equipment?.equipment_code || 'ไม่ระบุ';
};

const getItemType = (item: any) => {
  return item.request_type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
};

const getItemDetail = (item: any) => {
  if (item.request_type === 'computer') {
    return item.computers?.room_name || 'ไม่ระบุห้อง';
  }

  return item.equipment?.category || 'ไม่ระบุหมวดหมู่';
};

const getDisplayName = async (item: any) => {
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
};

const sendEmail = async (
  origin: string,
  to: string | null,
  subject: string,
  message: string
) => {
  if (!to) return false;

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
      return false;
    }

    return true;
  } catch (error) {
    console.error('send reminder email failed:', error);
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;

    const now = new Date();
    const next15Minutes = new Date(
      now.getTime() + RETURN_REMINDER_MINUTES * 60 * 1000
    );

    const { data: reminderRows, error: reminderError } = await supabaseAdmin
      .from('borrow_requests')
      .select(
        `
        id,
        request_no,
        user_name,
        user_email,
        request_type,
        equipment_id,
        computer_id,
        borrow_date,
        return_date,
        status,
        return_reminder_sent,
        equipment (
          id,
          name,
          category,
          code,
          equipment_code
        ),
        computers (
          id,
          pc_name,
          room_name
        )
      `
      )
      .eq('status', 'approved')
      .eq('return_reminder_sent', false)
      .gte('return_date', now.toISOString())
      .lte('return_date', next15Minutes.toISOString());

    if (reminderError) {
      throw reminderError;
    }

    let returnReminderCount = 0;

    for (const item of reminderRows || []) {
      const userEmail = item.user_email;
      const userDisplayName = await getDisplayName(item);

      const requestNo = item.request_no || 'ไม่ระบุเลขคำขอ';
      const itemName = getItemName(item);
      const itemCode = getItemCode(item);
      const itemType = getItemType(item);
      const itemDetail = getItemDetail(item);
      const returnDateText = formatThaiDateTime(item.return_date);

      const title = 'แจ้งเตือนใกล้ถึงกำหนดคืนรายการ';

      const message = `ระบบขอแจ้งเตือนว่า รายการยืมของท่านใกล้ถึงกำหนดคืนภายใน ${RETURN_REMINDER_MINUTES} นาที กรุณาดำเนินการคืนรายการภายในเวลาที่กำหนด`;

      const emailMessage = `เรียน คุณ${userDisplayName}

ระบบขอแจ้งเตือนว่า รายการยืมของท่านใกล้ถึงกำหนดคืนภายใน ${RETURN_REMINDER_MINUTES} นาที

รายละเอียดรายการ
เลขคำขอยืม: ${requestNo}
ประเภท: ${itemType}
รายการ: ${itemName}
รหัสรายการ: ${itemCode}
รายละเอียด: ${itemDetail}
กำหนดคืน: ${returnDateText}

กรุณาดำเนินการคืนรายการภายในเวลาที่กำหนด หรือแจ้งคืนผ่านระบบให้เร็วที่สุด

หากเลยกำหนดคืน ระบบอาจบันทึกรายการเป็นการคืนเกินกำหนด

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`;

      const emailSent = await sendEmail(
        origin,
        userEmail,
        title,
        emailMessage
      );

      if (!emailSent) {
        console.error('email not sent for request:', requestNo);
        continue;
      }

      await supabaseAdmin.from('notifications').insert([
        {
          user_email: userEmail,
          title,
          message: `${message} รายการ: ${itemName} เลขคำขอ: ${requestNo} กำหนดคืน: ${returnDateText}`,
          type: 'return_reminder',
          related_request_id: item.id,
        },
      ]);

      const { error: updateError } = await supabaseAdmin
        .from('borrow_requests')
        .update({
          return_reminder_sent: true,
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('update return_reminder_sent error:', updateError);
        continue;
      }

      returnReminderCount += 1;
    }

    return NextResponse.json({
      success: true,
      message: 'check return reminders success',
      returnReminderCount,
      overdueCount: 0,
    });
  } catch (error: any) {
    console.error('check-return-reminders error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'check return reminders failed',
      },
      { status: 500 }
    );
  }
}