'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Bell, UserCircle, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

interface HeaderProps {
  title: string;
  actionButton?: ReactNode;
}

type NotificationItem = {
  id: string;
  user_email: string;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  related_request_id?: string | null;
  created_at?: string | null;
};

export function Header({ title, actionButton }: HeaderProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [openNotification, setOpenNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const userEmail = user?.email ?? '';
  const userRole = role || 'user';

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'ผู้ใช้งาน';

  const fetchNotifications = async () => {
    if (!userEmail) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('fetch notifications error:', error.message);
      return;
    }

    setNotifications((data || []) as NotificationItem[]);
  };

  useEffect(() => {
    if (!userEmail) return;

    fetchNotifications();

    const channelName = `header-notifications-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const channel = supabase
      .channel(channelName)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    setOpenNotification(false);

    if (userRole === 'admin') {
      if (item.related_request_id) {
        router.push(`/approvals?id=${item.related_request_id}`);
        return;
      }

      router.push('/approvals');
      return;
    }

    router.push('/user/my-bookings');
  };

  const handleClearAllNotifications = async () => {
    if (!userEmail) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_email', userEmail);

    if (error) {
      console.error('clear notifications error:', error.message);
      return;
    }

    setNotifications([]);
    setOpenNotification(false);
  };

  const getRoleText = () => {
    if (loading) return 'กำลังโหลด';
    return userRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน';
  };

  const getRoleColor = () => {
    return userRole === 'admin' ? 'text-blue-600' : 'text-emerald-600';
  };

  return (
    <header className="relative border-b border-slate-100 bg-white px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-black leading-tight text-slate-800 md:text-2xl lg:text-3xl">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {actionButton && <div>{actionButton}</div>}

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenNotification((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-sm shadow-slate-200/60 transition hover:text-blue-600 md:h-11 md:w-11"
              aria-label="เปิดการแจ้งเตือน"
            >
              <Bell size={20} strokeWidth={2.3} />

              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-md">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {openNotification && (
              <div
                className="
                  fixed left-3 right-3 top-28 z-[9999]
                  max-h-[65vh] overflow-hidden rounded-[1.5rem]
                  border border-slate-100 bg-white shadow-2xl shadow-slate-900/20
                  md:absolute md:left-auto md:right-0 md:top-[calc(100%+12px)]
                  md:w-[390px] md:max-w-[390px]
                "
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                  <div>
                    <h2 className="text-base font-black text-slate-800">
                      การแจ้งเตือน
                    </h2>
                    <p className="text-xs font-bold text-slate-400">
                      ทั้งหมด {notifications.length} รายการ
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenNotification(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="ปิดการแจ้งเตือน"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-[46vh] overflow-y-auto overscroll-contain">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className="block w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
                      >
                        <p className="line-clamp-1 text-sm font-black text-slate-800">
                          {item.title || 'แจ้งเตือน'}
                        </p>

                        <p className="mt-1 line-clamp-3 text-sm font-semibold leading-relaxed text-slate-500">
                          {item.message || '-'}
                        </p>

                        {item.created_at && (
                          <p className="mt-2 text-[11px] font-bold text-slate-300">
                            {new Date(item.created_at).toLocaleString('th-TH', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Bell size={26} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">
                        ยังไม่มีการแจ้งเตือน
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-slate-100 bg-white p-3">
                    <button
                      type="button"
                      onClick={handleClearAllNotifications}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-black"
                    >
                      <Trash2 size={17} />
                      ล้างการแจ้งเตือนทั้งหมด
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm shadow-slate-200/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserCircle size={25} />
            </div>

            <div className="min-w-0">
              <p className="max-w-[115px] truncate text-sm font-black leading-tight text-slate-800 md:max-w-[140px]">
                {displayName}
              </p>
              <p className={`text-[11px] font-black leading-tight ${getRoleColor()}`}>
                {getRoleText()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}