'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'admin' | 'user';

type NotificationItem = {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_request_id?: string | null;
};

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const getUniqueKey = (item: NotificationItem) => {
    return `${item.user_email}-${item.type}-${item.related_request_id ?? item.id}`;
  };

  const removeDuplicateNotifications = (rows: NotificationItem[]) => {
    const seen = new Set<string>();

    return rows.filter((item) => {
      const key = getUniqueKey(item);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  };

  const fetchNotifications = async (email: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', email)
      .order('is_read', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return;

    const rows = (data || []) as NotificationItem[];
    const uniqueRows = removeDuplicateNotifications(rows);

    setNotifications(uniqueRows);
    setUnreadCount(uniqueRows.filter((item) => !item.is_read).length);
  };

  const getDueType = (returnDate: string) => {
    const now = new Date();
    const dueDate = new Date(returnDate);
    const diffMinutes = (dueDate.getTime() - now.getTime()) / 1000 / 60;

    if (diffMinutes < 0) return 'overdue';
    if (diffMinutes <= 15) return 'due_15_min';
    if (diffMinutes <= 60) return 'due_1_hour';
    if (diffMinutes <= 1440) return 'due_1_day';

    return null;
  };

  const getDueTitle = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'เกินกำหนดคืนแล้ว';
      case 'due_15_min':
        return 'ใกล้ถึงกำหนดคืนใน 15 นาที';
      case 'due_1_hour':
        return 'ใกล้ถึงกำหนดคืนใน 1 ชั่วโมง';
      case 'due_1_day':
        return 'ใกล้ถึงกำหนดคืนวันนี้';
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

  const checkDueReturnNotifications = async () => {
    if (!userEmail || !userRole) return;

    let query = supabase
      .from('borrow_requests')
      .select(`
        id,
        user_email,
        request_type,
        return_date,
        equipment ( name ),
        computers ( pc_name )
      `)
      .eq('status', 'approved')
      .not('return_date', 'is', null);

    if (userRole !== 'admin') {
      query = query.eq('user_email', userEmail);
    }

    const { data: requests, error } = await query;

    if (error || !requests || requests.length === 0) return;

    const dueRequests = requests
      .map((item: any) => ({
        ...item,
        dueType: getDueType(item.return_date),
      }))
      .filter((item: any) => item.dueType);

    if (dueRequests.length === 0) return;

    const requestIds = dueRequests.map((item: any) => item.id);
    const dueTypes = ['overdue', 'due_15_min', 'due_1_hour', 'due_1_day'];

    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('user_email, type, related_request_id')
      .in('related_request_id', requestIds)
      .in('type', dueTypes);

    const existingSet = new Set(
      (existingNotifications || []).map(
        (item: any) => `${item.user_email}-${item.type}-${item.related_request_id}`
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
      const dueText = new Date(item.return_date).toLocaleString('th-TH');
      const title = getDueTitle(item.dueType);

      const userMessage =
        item.dueType === 'overdue'
          ? `${itemName} เกินกำหนดคืนแล้ว กรุณาติดต่อเจ้าหน้าที่ทันที`
          : `${itemName} ใกล้ถึงกำหนดคืน กรุณาคืนภายใน ${dueText}`;

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
                  : 'มีรายการใกล้ถึงกำหนดคืน',
              message:
                item.dueType === 'overdue'
                  ? `${item.user_email} ยังไม่คืน ${itemName} และเกินกำหนดแล้ว`
                  : `${item.user_email} ต้องคืน ${itemName} ภายใน ${dueText}`,
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

    fetchNotifications(userEmail);

    if (!hasCheckedDueRef.current) {
      hasCheckedDueRef.current = true;
      checkDueReturnNotifications();
    }
  }, [userEmail, userRole]);

  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel(`user-notifications-${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newItem = payload.new as NotificationItem;

          if (newItem.user_email !== userEmail) return;

          setNotifications((prev) => {
            const isDuplicate = prev.some(
              (item) => getUniqueKey(item) === getUniqueKey(newItem)
            );

            if (isDuplicate) return prev;

            if (!newItem.is_read) {
              setUnreadCount((count) => count + 1);
            }

            return [newItem, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  const markAsRead = async (id: string) => {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.is_read) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );

    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  };

  const deleteAllNotifications = async () => {
    if (!userEmail) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_email', userEmail);

    if (error) return;

    setNotifications([]);
    setUnreadCount(0);
    setOpenNotifications(false);
  };

  const getNotificationDotColor = (type: string) => {
    switch (type) {
      case 'approved':
      case 'returned':
      case 'request_submitted':
        return 'bg-emerald-500';
      case 'rejected':
      case 'overdue':
        return 'bg-red-500';
      case 'due_1_day':
      case 'due_1_hour':
      case 'due_15_min':
      case 'return_requested':
      case 'urgent_request':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-bold text-black">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header
          title={title}
          actionButton={
            <div className="flex items-center gap-3">
              {actionButton}

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setOpenNotifications((prev) => !prev)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
                >
                  <Bell size={20} className="text-slate-600" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {openNotifications && (
                  <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800">
                          การแจ้งเตือน
                        </h3>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                        >
                          อ่านแล้วทั้งหมด
                        </button>

                        <button
                          type="button"
                          onClick={deleteAllNotifications}
                          className="text-[11px] font-bold text-red-500 hover:text-red-600"
                        >
                          ลบทั้งหมด
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={`w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                              !item.is_read ? 'bg-blue-50/40' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 h-2.5 w-2.5 rounded-full ${getNotificationDotColor(
                                  item.type
                                )}`}
                              />

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800">
                                  {item.title}
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                  {item.message}
                                </p>

                                <p className="mt-2 text-[10px] font-semibold text-slate-400">
                                  {new Date(item.created_at).toLocaleString('th-TH')}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                          ยังไม่มีการแจ้งเตือน
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
        />

        <main className="p-6" onClick={() => setOpenNotifications(false)}>
          {children}
        </main>
      </div>
    </div>
  );
}