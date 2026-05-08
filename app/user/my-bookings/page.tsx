'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Package,
  Monitor,
  AlertCircle,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [approvedBookings, setApprovedBookings] = useState<any[]>([]);
  const [returnPendingBookings, setReturnPendingBookings] = useState<any[]>([]);
  const [returnedBookings, setReturnedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [popup, setPopup] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: any = null;

    const initPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const userEmail = user.email || '';

      if (!isMounted) return;
      setCurrentUserEmail(userEmail);

      await fetchBookings(userEmail);

      if (!isMounted) return;

      const channelName = `my-bookings-realtime-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      realtimeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'borrow_requests' },
          async () => {
            if (!isMounted) return;
            await fetchBookings(userEmail);
          }
        )
        .subscribe();
    };

    initPage();

    return () => {
      isMounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const showPopup = (
    type: 'success' | 'error',
    title: string,
    message: string
  ) => {
    setPopup({
      open: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setPopup((prev) => ({
        ...prev,
        open: false,
      }));
    }, 2200);
  };

  const fetchBookings = async (userEmail: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('borrow_requests')
        .select(`
          id,
          status,
          request_type,
          created_at,
          borrow_date,
          return_date,
          equipment_id,
          computer_id,
          reason,
          approved_at,
          returned_at,
          user_email
        `)
        .eq('user_email', userEmail)
        .in('status', ['approved', 'return_pending', 'returned'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data || [];

      const equipmentIds = Array.from(
        new Set(
          rows
            .filter((item) => item.request_type === 'equipment' && item.equipment_id)
            .map((item) => item.equipment_id)
        )
      );

      const computerIds = Array.from(
        new Set(
          rows
            .filter((item) => item.request_type === 'computer' && item.computer_id !== null)
            .map((item) => item.computer_id)
        )
      );

      let equipmentMap = new Map();
      let computerMap = new Map();

      if (equipmentIds.length > 0) {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, category')
          .in('id', equipmentIds);

        if (equipmentError) throw equipmentError;

        equipmentMap = new Map((equipmentData || []).map((item) => [item.id, item]));
      }

      if (computerIds.length > 0) {
        const { data: computerData, error: computerError } = await supabase
          .from('computers')
          .select('id, pc_name, room_name')
          .in('id', computerIds);

        if (computerError) throw computerError;

        computerMap = new Map((computerData || []).map((item) => [item.id, item]));
      }

      const mergedRows = rows.map((item) => ({
        ...item,
        equipment:
          item.request_type === 'equipment'
            ? equipmentMap.get(item.equipment_id) || null
            : null,
        computers:
          item.request_type === 'computer'
            ? computerMap.get(item.computer_id) || null
            : null,
      }));

      setApprovedBookings(mergedRows.filter((item) => item.status === 'approved'));
      setReturnPendingBookings(
        mergedRows.filter((item) => item.status === 'return_pending')
      );
      setReturnedBookings(mergedRows.filter((item) => item.status === 'returned'));
    } catch (error: any) {
      console.error('fetchBookings error:', error.message);
      setApprovedBookings([]);
      setReturnPendingBookings([]);
      setReturnedBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTitle = (item: any) => {
    if (item?.request_type === 'computer') {
      return item.computers?.pc_name || 'ไม่ระบุคอมพิวเตอร์';
    }
    return item.equipment?.name || 'ไม่ระบุอุปกรณ์';
  };

  const getRequestSubtitle = (item: any) => {
    if (item?.request_type === 'computer') {
      return item.computers?.room_name || 'ไม่ระบุห้อง';
    }
    return item.equipment?.category || 'ไม่ระบุหมวดหมู่';
  };

  const handleRequestReturn = async (item: any) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'return_pending' })
        .eq('id', item.id);

      if (error) throw error;

      const itemName = getRequestTitle(item);
      const userEmail = item.user_email || currentUserEmail;

      const { data: admins, error: adminError } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin');

      if (!adminError && admins && admins.length > 0) {
        await supabase.from('notifications').insert(
          admins
            .filter((admin) => admin.email)
            .map((admin) => ({
              user_email: admin.email,
              title: 'มีคำขอคืนใหม่',
              message: `${userEmail} ได้ส่งคำขอคืน ${itemName}`,
              type: 'return_requested',
              related_request_id: item.id,
            }))
        );
      }

      if (userEmail) {
        await supabase.from('notifications').insert([
          {
            user_email: userEmail,
            title: 'ส่งคำขอคืนสำเร็จ',
            message: `คุณได้ส่งคำขอคืน ${itemName} แล้ว กรุณารอแอดมินยืนยันรับคืน`,
            type: 'return_requested',
            related_request_id: item.id,
          },
        ]);
      }

      showPopup(
        'success',
        'แจ้งคืนสำเร็จ',
        item.request_type === 'computer'
          ? 'แจ้งคืนคอมพิวเตอร์เรียบร้อยแล้ว กรุณารอแอดมินยืนยันรับคืน'
          : 'แจ้งคืนอุปกรณ์เรียบร้อยแล้ว กรุณารอแอดมินยืนยันรับคืน'
      );

      fetchBookings(currentUserEmail);
    } catch (error: any) {
      showPopup('error', 'เกิดข้อผิดพลาด', error.message);
    }
  };

  const getRequestIcon = (item: any) => {
    return item?.request_type === 'computer' ? (
      <Monitor size={24} />
    ) : (
      <Package size={24} />
    );
  };

  const getRequestButtonText = (item: any) => {
    return item?.request_type === 'computer' ? 'แจ้งคืนคอมพิวเตอร์' : 'แจ้งคืนอุปกรณ์';
  };

  return (
    <DashboardLayout
      title="รายการยืมของฉัน"
      actionButton={
        <Link href="/user/booking">
          <Button className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-black text-white">
            กลับไปหน้าขอยืม
          </Button>
        </Link>
      }
    >
      <div className="space-y-8 pb-20">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-black text-slate-800">รายการที่กำลังใช้งานอยู่</h2>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            รายการที่อนุมัติแล้วและยังไม่แจ้งคืน
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-[2rem] border border-slate-100 bg-white p-10 text-center font-bold text-slate-400">
              กำลังโหลดข้อมูล...
            </div>
          ) : approvedBookings.length > 0 ? (
            approvedBookings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      item.request_type === 'computer'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {getRequestIcon(item)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {getRequestTitle(item)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          item.request_type === 'computer'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
                      </span>
                    </div>

                    <p className="mt-1 text-[13px] font-bold uppercase tracking-widest text-slate-400">
                      {getRequestSubtitle(item)}
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-slate-500">
                      วันที่ยืม: {item.borrow_date || 'ไม่ระบุ'}
                    </p>

                    {item.reason && (
                      <p className="mt-1 text-[13px] text-slate-400">
                        เหตุผล: {item.reason}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black uppercase text-white shadow-lg shadow-red-100"
                  onClick={() => handleRequestReturn(item)}
                >
                  {getRequestButtonText(item)}
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold italic text-slate-400">
                ไม่มีรายการที่กำลังใช้งานอยู่
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">รายการที่แจ้งคืนแล้ว</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                รอแอดมินยืนยันรับคืน
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {returnPendingBookings.length > 0 ? (
              returnPendingBookings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {getRequestTitle(item)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                          item.request_type === 'computer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {getRequestSubtitle(item)}
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-slate-500">
                      วันที่กำหนดคืน: {item.return_date || 'ไม่ระบุ'}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700">
                    รอรับคืน
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-slate-400">ไม่มีรายการรอรับคืน</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Clock size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">ประวัติการคืนแล้ว</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                รายการที่แอดมินยืนยันรับคืนเรียบร้อย
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {returnedBookings.length > 0 ? (
              returnedBookings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {getRequestTitle(item)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                          item.request_type === 'computer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {getRequestSubtitle(item)}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      วันที่คืนสำเร็จ: {item.returned_at || 'ไม่ระบุ'}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
                    คืนแล้ว
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-slate-400">ยังไม่มีประวัติคืนรายการ</p>
            )}
          </div>
        </div>
      </div>

      {popup.open && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-8">
          <div
            className={`w-full max-w-md rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-sm transition-all duration-300 ${
              popup.type === 'success'
                ? 'border-emerald-100 bg-white text-slate-800'
                : 'border-red-100 bg-white text-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-full ${
                  popup.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {popup.type === 'success' ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <AlertCircle size={22} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-800">{popup.title}</h3>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                  {popup.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}