'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Bell, CheckCircle2, Trash2, X, UserCircle2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  actionButton?: ReactNode;
}

interface NotificationItem {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: string;
  related_request_id?: string | null;
  is_read?: boolean;
  created_at?: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { role, loading } = useAuth();

  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayRole, setDisplayRole] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const getRoleLabel = (userRole?: string | null) => {
    if (userRole === 'admin') return 'ผู้ดูแลระบบ';
    return 'ผู้ใช้งาน';
  };

  const fetchUserProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return;

    setUserEmail(user.email);

    const { data: profile } = await supabase
      .from('users')
      .select('name, email, role')
      .eq('email', user.email)
      .maybeSingle();

    const fallbackName = user.email.split('@')[0];

    setDisplayName(profile?.name || fallbackName);
    setDisplayRole(getRoleLabel(profile?.role || role));
  }, [role]);

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return;

    setUserEmail(user.email);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error) {
      setNotifications(data || []);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchNotifications();

    const channel = supabase
      .channel('header-notifications-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUserProfile, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!userEmail) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_email', userEmail);

    fetchNotifications();
  };

  const deleteAllNotifications = async () => {
    if (!userEmail) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_email', userEmail);

    setNotifications([]);
  };

  const getNotificationRoute = (notification: NotificationItem) => {
    const requestId = notification.related_request_id;

    if (role === 'admin') {
      return requestId ? `/approvals?id=${requestId}` : '/approvals';
    }

    return requestId
      ? `/user/my-bookings?id=${requestId}`
      : '/user/my-bookings';
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setOpen(false);
    router.push(getNotificationRoute(notification));
  };

  const getDotColor = (type: string) => {
    if (type === 'approved' || type === 'returned') return 'bg-emerald-500';
    if (type === 'rejected') return 'bg-red-500';
    if (type === 'urgent_request') return 'bg-red-500';
    if (type === 'return_pending' || type === 'new_return') return 'bg-orange-500';

    return 'bg-blue-500';
  };

  const formatDate = (date?: string) => {
    if (!date) return '';

    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="relative flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
      <h1 className="text-xl font-black text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-md transition hover:bg-slate-50"
          >
            <Bell size={22} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    การแจ้งเตือน
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    ทั้งหมด {notifications.length} รายการ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-black text-blue-600 hover:underline"
                >
                  อ่านแล้วทั้งหมด
                </button>

                <button
                  type="button"
                  onClick={deleteAllNotifications}
                  className="text-[11px] font-black text-red-500 hover:underline"
                >
                  ลบทั้งหมด
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-blue-50 ${
                        notification.is_read ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getDotColor(
                          notification.type
                        )}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="line-clamp-1 text-sm font-black text-slate-800">
                            {notification.title}
                          </p>

                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-600">
                              ใหม่
                            </span>
                          )}
                        </div>

                        <p className="line-clamp-2 text-xs font-bold leading-relaxed text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] font-bold text-slate-400">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                      <CheckCircle2 size={26} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-black text-slate-400">
                      ยังไม่มีการแจ้งเตือน
                    </p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-slate-100 p-3">
                  <button
                    type="button"
                    onClick={deleteAllNotifications}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition hover:bg-red-500"
                  >
                    <Trash2 size={15} />
                    ล้างการแจ้งเตือนทั้งหมด
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserCircle2 size={22} />
          </div>

          <div className="leading-tight">
            <p className="max-w-[140px] truncate font-black text-slate-800">
              {loading ? 'กำลังโหลด...' : displayName || 'ผู้ใช้งาน'}
            </p>
            <p
              className={`text-[10px] font-black uppercase tracking-wide ${
                role === 'admin' ? 'text-blue-500' : 'text-emerald-500'
              }`}
            >
              {loading ? 'Loading' : displayRole || getRoleLabel(role)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}