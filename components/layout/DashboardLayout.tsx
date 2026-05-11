'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'admin' | 'user';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  allowedRoles?: UserRole[];
  actionButton?: ReactNode;
}

export function DashboardLayout({
  children,
  title = 'ระบบจัดการ',
  allowedRoles,
  actionButton,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const userEmail = user?.email ?? '';
  const userRole = role as UserRole | null;

  const hasCheckedDueRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      router.replace(userRole === 'admin' ? '/dashboard' : '/user/booking');
    }
  }, [user, userRole, loading, allowedRoles, router]);

  const isSameDate = (dateA: Date, dateB: Date) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const isBorrowMultipleDays = (borrowDate: string, returnDate: string) => {
    const borrow = new Date(borrowDate);
    const due = new Date(returnDate);

    return !isSameDate(borrow, due);
  };

  const isInMorningWindow = () => {
    const now = new Date();
    const hour = now.getHours();

    return hour === 8;
  };

  const getDueType = (borrowDate: string, returnDate: string) => {
    const now = new Date();
    const due = new Date(returnDate);

    const diffMinutes = (due.getTime() - now.getTime()) / 1000 / 60;

    if (diffMinutes < 0) {
      return 'overdue';
    }

    const multipleDays = isBorrowMultipleDays(borrowDate, returnDate);

    if (multipleDays) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const isOneDayBeforeDue = isSameDate(tomorrow, due);
      const isDueToday = isSameDate(now, due);

      if (isOneDayBeforeDue && isInMorningWindow()) {
        return 'due_1_day_before';
      }

      if (isDueToday && isInMorningWindow()) {
        return 'due_today_morning';
      }

      return null;
    }

    if (diffMinutes <= 15) {
      return 'due_15_min';
    }

    return null;
  };

  const getDueTitle = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'เกินกำหนดคืนแล้ว';
      case 'due_1_day_before':
        return 'พรุ่งนี้ถึงกำหนดคืน';
      case 'due_today_morning':
        return 'วันนี้ถึงกำหนดคืน';
      case 'due_15_min':
        return 'ใกล้ถึงกำหนดคืนใน 15 นาที';
      default:
        return 'แจ้งเตือนกำหนดคืน';
    }
  };

  const getItemName = (item: any) => {
    if (item.request_type === 'computer') {
      return item.computers?.pc_name || 'คอมพิวเตอร์';
    }

    return item.equipment?.name || 'อุปกรณ์';
  };

  const formatThaiDateTime = (date: string) => {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatThaiTime = (date: string) => {
    return new Date(date).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserDueMessage = (
    type: string,
    itemName: string,
    returnDate: string
  ) => {
    const dueDateText = formatThaiDateTime(returnDate);
    const dueTimeText = formatThaiTime(returnDate);

    switch (type) {
      case 'overdue':
        return `${itemName} เกินกำหนดคืนแล้ว กรุณาติดต่อเจ้าหน้าที่ทันที`;

      case 'due_1_day_before':
        return `พรุ่งนี้ถึงกำหนดคืน ${itemName} กรุณาคืนภายในเวลา ${dueTimeText}`;

      case 'due_today_morning':
        return `วันนี้ถึงกำหนดคืน ${itemName} กรุณาคืนภายในเวลา ${dueTimeText}`;

      case 'due_15_min':
        return `${itemName} ใกล้ถึงกำหนดคืนใน 15 นาที กรุณาคืนภายใน ${dueDateText}`;

      default:
        return `${itemName} ใกล้ถึงกำหนดคืน กรุณาคืนภายใน ${dueDateText}`;
    }
  };

  const getAdminDueMessage = (
    type: string,
    userEmailText: string,
    itemName: string,
    returnDate: string
  ) => {
    const dueDateText = formatThaiDateTime(returnDate);
    const dueTimeText = formatThaiTime(returnDate);

    switch (type) {
      case 'overdue':
        return `${userEmailText} ยังไม่คืน ${itemName} และเกินกำหนดแล้ว`;

      case 'due_1_day_before':
        return `${userEmailText} ต้องคืน ${itemName} ในวันพรุ่งนี้ ภายในเวลา ${dueTimeText}`;

      case 'due_today_morning':
        return `${userEmailText} ต้องคืน ${itemName} วันนี้ ภายในเวลา ${dueTimeText}`;

      case 'due_15_min':
        return `${userEmailText} ต้องคืน ${itemName} ภายใน 15 นาที (${dueDateText})`;

      default:
        return `${userEmailText} ต้องคืน ${itemName} ภายใน ${dueDateText}`;
    }
  };

  const checkDueReturnNotifications = async () => {
    if (!userEmail || !userRole) return;

    let query = supabase
      .from('borrow_requests')
      .select(
        `
        id,
        user_email,
        request_type,
        borrow_date,
        return_date,
        equipment ( name ),
        computers ( pc_name )
      `
      )
      .eq('status', 'approved')
      .not('borrow_date', 'is', null)
      .not('return_date', 'is', null);

    if (userRole !== 'admin') {
      query = query.eq('user_email', userEmail);
    }

    const { data: requests, error } = await query;

    if (error || !requests || requests.length === 0) return;

    const dueRequests = requests
      .map((item: any) => ({
        ...item,
        dueType: getDueType(item.borrow_date, item.return_date),
      }))
      .filter((item: any) => item.dueType);

    if (dueRequests.length === 0) return;

    const requestIds = dueRequests.map((item: any) => item.id);
    const dueTypes = [
      'overdue',
      'due_1_day_before',
      'due_today_morning',
      'due_15_min',
    ];

    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('user_email, type, related_request_id')
      .in('related_request_id', requestIds)
      .in('type', dueTypes);

    const existingSet = new Set(
      (existingNotifications || []).map(
        (item: any) =>
          `${item.user_email}-${item.type}-${item.related_request_id}`
      )
    );

    const newSet = new Set(existingSet);

    let adminEmails: string[] = [];

    if (userRole === 'admin') {
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin');

      adminEmails = (admins || [])
        .map((admin: any) => admin.email)
        .filter(Boolean);
    }

    const rowsToInsert: any[] = [];

    dueRequests.forEach((item: any) => {
      const itemName = getItemName(item);
      const title = getDueTitle(item.dueType);

      const userMessage = getUserDueMessage(
        item.dueType,
        itemName,
        item.return_date
      );

      const userKey = `${item.user_email}-${item.dueType}-${item.id}`;

      if (item.user_email && !newSet.has(userKey)) {
        newSet.add(userKey);

        rowsToInsert.push({
          user_email: item.user_email,
          title,
          message: userMessage,
          type: item.dueType,
          related_request_id: item.id,
        });
      }

      if (userRole === 'admin') {
        adminEmails.forEach((adminEmail) => {
          const adminKey = `${adminEmail}-${item.dueType}-${item.id}`;

          if (!newSet.has(adminKey)) {
            newSet.add(adminKey);

            rowsToInsert.push({
              user_email: adminEmail,
              title:
                item.dueType === 'overdue'
                  ? 'มีรายการเกินกำหนดคืน'
                  : 'แจ้งเตือนรายการใกล้ถึงกำหนดคืน',
              message: getAdminDueMessage(
                item.dueType,
                item.user_email,
                itemName,
                item.return_date
              ),
              type: item.dueType,
              related_request_id: item.id,
            });
          }
        });
      }
    });

    if (rowsToInsert.length > 0) {
      await supabase.from('notifications').insert(rowsToInsert);
    }
  };

  useEffect(() => {
    if (!userEmail || !userRole) return;

    if (!hasCheckedDueRef.current) {
      hasCheckedDueRef.current = true;
      checkDueReturnNotifications();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center font-bold text-black">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return null;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-50">
      {/* Desktop / iPad sidebar */}
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 w-full">
        <Header title={title} actionButton={actionButton} />

        <main className="w-full overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}