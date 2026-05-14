'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Search,
  SlidersHorizontal,
} from 'lucide-react';

type StatusFilter = 'all' | 'approved' | 'return_pending' | 'returned';
type TypeFilter = 'all' | 'equipment' | 'computer';

export default function MyBookingsPage() {
  const [approvedBookings, setApprovedBookings] = useState<any[]>([]);
  const [returnPendingBookings, setReturnPendingBookings] = useState<any[]>([]);
  const [returnedBookings, setReturnedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

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

  const sendEmail = async (
    to: string | null | undefined,
    subject: string,
    message: string
  ) => {
    if (!to) return;

    try {
      const response = await fetch('/api/send-email', {
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
        console.error('send return request email error:', errorData);
      }
    } catch (error) {
      console.error('send return request email failed:', error);
    }
  };

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

  const fetchBookings = async (userEmail: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('borrow_requests')
        .select(`
          id,
          request_no,
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
            .filter(
              (item) => item.request_type === 'equipment' && item.equipment_id
            )
            .map((item) => item.equipment_id)
        )
      );

      const computerIds = Array.from(
        new Set(
          rows
            .filter(
              (item) =>
                item.request_type === 'computer' && item.computer_id !== null
            )
            .map((item) => item.computer_id)
        )
      );

      let equipmentMap = new Map();
      let computerMap = new Map();

      if (equipmentIds.length > 0) {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, category, code, equipment_code, item_code')
          .in('id', equipmentIds);

        if (equipmentError) throw equipmentError;

        equipmentMap = new Map(
          (equipmentData || []).map((item) => [item.id, item])
        );
      }

      if (computerIds.length > 0) {
        const { data: computerData, error: computerError } = await supabase
          .from('computers')
          .select('id, pc_name, room_name')
          .in('id', computerIds);

        if (computerError) throw computerError;

        computerMap = new Map(
          (computerData || []).map((item) => [item.id, item])
        );
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

      setApprovedBookings(
        mergedRows.filter((item) => item.status === 'approved')
      );
      setReturnPendingBookings(
        mergedRows.filter((item) => item.status === 'return_pending')
      );
      setReturnedBookings(
        mergedRows.filter((item) => item.status === 'returned')
      );
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

  const getRequestTypeText = (item: any) => {
    return item?.request_type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
  };

  const getRequestNo = (item: any) => {
    return item?.request_no || 'ยังไม่มีเลขคำขอ';
  };

  const getEquipmentCode = (item: any) => {
    if (item?.request_type === 'computer') {
      return item.computers?.pc_name || 'ไม่มีรหัสคอมพิวเตอร์';
    }

    return (
      item?.equipment?.code ||
      item?.equipment?.equipment_code ||
      item?.equipment?.item_code ||
      'ไม่มีรหัสอุปกรณ์'
    );
  };

  const allBookings = useMemo(() => {
    return [...approvedBookings, ...returnPendingBookings, ...returnedBookings];
  }, [approvedBookings, returnPendingBookings, returnedBookings]);

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return allBookings.filter((item) => {
      const title = getRequestTitle(item).toLowerCase();
      const subtitle = getRequestSubtitle(item).toLowerCase();
      const requestNo = getRequestNo(item).toLowerCase();
      const code = getEquipmentCode(item).toLowerCase();
      const reason = (item.reason || '').toLowerCase();

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        subtitle.includes(keyword) ||
        requestNo.includes(keyword) ||
        code.includes(keyword) ||
        reason.includes(keyword);

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      const matchesType =
        typeFilter === 'all' || item.request_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allBookings, searchTerm, statusFilter, typeFilter]);

  const filteredApprovedBookings = filteredBookings.filter(
    (item) => item.status === 'approved'
  );

  const filteredReturnPendingBookings = filteredBookings.filter(
    (item) => item.status === 'return_pending'
  );

  const filteredReturnedBookings = filteredBookings.filter(
    (item) => item.status === 'returned'
  );

  const hasAnyFilteredResult = filteredBookings.length > 0;

  const handleRequestReturn = async (item: any) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: 'return_pending' })
        .eq('id', item.id);

      if (error) throw error;

      const itemName = getRequestTitle(item);
      const itemTypeText = getRequestTypeText(item);
      const itemSubtitle = getRequestSubtitle(item);
      const requestNo = getRequestNo(item);
      const equipmentCode = getEquipmentCode(item);
      const userEmail = item.user_email || currentUserEmail;

      const { data: admins, error: adminError } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin');

      const adminEmails = (admins || [])
        .map((admin) => admin.email)
        .filter(Boolean);

      if (!adminError && adminEmails.length > 0) {
        await supabase.from('notifications').insert(
          adminEmails.map((adminEmail) => ({
            user_email: adminEmail,
            title: 'มีคำขอคืนใหม่',
            message: `${userEmail} ได้ส่งคำขอคืน ${itemName} รหัส ${equipmentCode} เลขคำขอ ${requestNo}`,
            type: 'return_requested',
            related_request_id: item.id,
          }))
        );

        await Promise.all(
          adminEmails.map((adminEmail) =>
            sendEmail(
              adminEmail,
              'มีคำขอคืนใหม่',
              `มีคำขอคืน${itemTypeText}ใหม่จากผู้ใช้ ${userEmail}

รายละเอียดคำขอคืน
เลขคำขอยืม: ${requestNo}
รหัสรายการ: ${equipmentCode}
รายการที่ขอคืน: ${itemName}
ประเภท: ${itemTypeText}
รายละเอียด: ${itemSubtitle}
เหตุผลเดิม: ${item.reason || 'ไม่ระบุ'}

กรุณาเข้าสู่ระบบเพื่อตรวจสอบและยืนยันการรับคืน`
            )
          )
        );
      }

      if (userEmail) {
        await supabase.from('notifications').insert([
          {
            user_email: userEmail,
            title: 'ส่งคำขอคืนสำเร็จ',
            message: `คุณได้ส่งคำขอคืน ${itemName} รหัส ${equipmentCode} เลขคำขอ ${requestNo} แล้ว กรุณารอแอดมินยืนยันรับคืน`,
            type: 'return_requested',
            related_request_id: item.id,
          },
        ]);
      }

      showPopup(
        'success',
        'แจ้งคืนสำเร็จ',
        item.request_type === 'computer'
          ? `แจ้งคืนคอมพิวเตอร์เรียบร้อยแล้ว เลขคำขอ ${requestNo} กรุณารอแอดมินยืนยันรับคืน`
          : `แจ้งคืนอุปกรณ์เรียบร้อยแล้ว รหัสอุปกรณ์ ${equipmentCode} เลขคำขอ ${requestNo} กรุณารอแอดมินยืนยันรับคืน`
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
    return item?.request_type === 'computer'
      ? 'แจ้งคืนคอมพิวเตอร์'
      : 'แจ้งคืนอุปกรณ์';
  };

  const RequestNoBadge = ({ item }: { item: any }) => (
    <div className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
      เลขคำขอยืม: {getRequestNo(item)}
    </div>
  );

  const EquipmentCodeBadge = ({ item }: { item: any }) => (
    <div className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
      {item?.request_type === 'computer' ? 'รหัสคอมพิวเตอร์' : 'รหัสอุปกรณ์'}:{' '}
      {getEquipmentCode(item)}
    </div>
  );

  const FilterButton = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 shrink-0 rounded-2xl border px-4 text-[12px] font-black transition-all ${
        active
          ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200'
          : 'border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  );

  const BookingCard = ({ item, mode }: { item: any; mode: string }) => (
    <div
      className={`flex flex-col gap-4 rounded-[2rem] border bg-white p-5 shadow-sm md:p-6 lg:flex-row lg:items-center lg:justify-between ${
        mode === 'approved'
          ? 'border-slate-100'
          : mode === 'return_pending'
          ? 'border-amber-100'
          : 'border-emerald-100'
      }`}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            item.request_type === 'computer'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {getRequestIcon(item)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-sm font-black text-slate-800 md:text-base">
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

          <div className="mt-2 flex flex-wrap gap-2">
            <RequestNoBadge item={item} />
            <EquipmentCodeBadge item={item} />
          </div>

          <p className="mt-3 text-[12px] font-bold uppercase tracking-widest text-slate-400">
            {getRequestSubtitle(item)}
          </p>

          <div className="mt-2 grid gap-1 text-[13px] font-bold text-slate-500 sm:grid-cols-2">
            <p>วันที่ยืม: {formatThaiDateTime(item.borrow_date)}</p>
            <p>กำหนดคืน: {formatThaiDateTime(item.return_date)}</p>
          </div>

          {mode === 'returned' && (
            <p className="mt-1 text-[12px] font-bold text-emerald-600">
              วันที่คืนสำเร็จ: {formatThaiDateTime(item.returned_at)}
            </p>
          )}

          {item.reason && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
              เหตุผล: {item.reason}
            </p>
          )}
        </div>
      </div>

      {mode === 'approved' && (
        <Button
          className="w-full rounded-xl bg-red-500 px-5 py-3 text-sm font-black uppercase text-white shadow-lg shadow-red-100 lg:w-auto"
          onClick={() => handleRequestReturn(item)}
        >
          {getRequestButtonText(item)}
        </Button>
      )}

      {mode === 'return_pending' && (
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700">
          รอรับคืน
        </span>
      )}

      {mode === 'returned' && (
        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
          คืนแล้ว
        </span>
      )}
    </div>
  );

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
      <div className="space-y-7 pb-20">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-100/50 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                ค้นหารายการยืม
              </h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                ค้นหาจากชื่ออุปกรณ์ รหัสอุปกรณ์ เลขคำขอยืม หรือเหตุผลการยืม
              </p>
            </div>

            <div className="grid w-full gap-3 xl:max-w-4xl xl:grid-cols-[1.2fr_1fr_0.8fr]">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหา เช่น FG-001, BR-2026, Function Generator..."
                  className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                <FilterButton
                  active={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                >
                  ทั้งหมด
                </FilterButton>
                <FilterButton
                  active={statusFilter === 'approved'}
                  onClick={() => setStatusFilter('approved')}
                >
                  กำลังใช้งาน
                </FilterButton>
                <FilterButton
                  active={statusFilter === 'return_pending'}
                  onClick={() => setStatusFilter('return_pending')}
                >
                  รอรับคืน
                </FilterButton>
                <FilterButton
                  active={statusFilter === 'returned'}
                  onClick={() => setStatusFilter('returned')}
                >
                  คืนแล้ว
                </FilterButton>
              </div>

              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                <FilterButton
                  active={typeFilter === 'all'}
                  onClick={() => setTypeFilter('all')}
                >
                  ทุกประเภท
                </FilterButton>
                <FilterButton
                  active={typeFilter === 'equipment'}
                  onClick={() => setTypeFilter('equipment')}
                >
                  อุปกรณ์
                </FilterButton>
                <FilterButton
                  active={typeFilter === 'computer'}
                  onClick={() => setTypeFilter('computer')}
                >
                  คอมพิวเตอร์
                </FilterButton>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-[12px] font-black text-slate-500">
            <SlidersHorizontal size={15} className="text-slate-400" />
            พบรายการทั้งหมด {filteredBookings.length} รายการ
            {searchTerm.trim() && (
              <button
                onClick={() => setSearchTerm('')}
                className="rounded-full bg-white px-3 py-1 text-[11px] text-red-500 shadow-sm"
              >
                ล้างคำค้นหา
              </button>
            )}
          </div>
        </div>

        {!loading && !hasAnyFilteredResult && (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <Search size={38} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-black text-slate-500">
              ไม่พบรายการที่ค้นหา
            </p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองเป็นทั้งหมด
            </p>
          </div>
        )}

        {(statusFilter === 'all' || statusFilter === 'approved') &&
          hasAnyFilteredResult && (
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100/50">
                <h2 className="text-xl font-black text-slate-800">
                  รายการที่กำลังใช้งานอยู่
                </h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  รายการที่อนุมัติแล้วและยังไม่แจ้งคืน
                </p>
              </div>

              {loading ? (
                <div className="rounded-[2rem] border border-slate-100 bg-white p-10 text-center font-bold text-slate-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : filteredApprovedBookings.length > 0 ? (
                filteredApprovedBookings.map((item) => (
                  <BookingCard key={item.id} item={item} mode="approved" />
                ))
              ) : (
                statusFilter === 'approved' && (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <CheckCircle2
                      size={36}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-sm font-bold italic text-slate-400">
                      ไม่มีรายการที่กำลังใช้งานอยู่
                    </p>
                  </div>
                )
              )}
            </div>
          )}

        {(statusFilter === 'all' || statusFilter === 'return_pending') &&
          hasAnyFilteredResult && (
            <div className="rounded-[2rem] border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    รายการที่แจ้งคืนแล้ว
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    รอแอดมินยืนยันรับคืน
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {filteredReturnPendingBookings.length > 0 ? (
                  filteredReturnPendingBookings.map((item) => (
                    <BookingCard
                      key={item.id}
                      item={item}
                      mode="return_pending"
                    />
                  ))
                ) : (
                  <p className="text-sm font-bold text-slate-400">
                    ไม่มีรายการรอรับคืน
                  </p>
                )}
              </div>
            </div>
          )}

        {(statusFilter === 'all' || statusFilter === 'returned') &&
          hasAnyFilteredResult && (
            <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Clock size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    ประวัติการคืนแล้ว
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    รายการที่แอดมินยืนยันรับคืนเรียบร้อย
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {filteredReturnedBookings.length > 0 ? (
                  filteredReturnedBookings.map((item) => (
                    <BookingCard key={item.id} item={item} mode="returned" />
                  ))
                ) : (
                  <p className="text-sm font-bold text-slate-400">
                    ยังไม่มีประวัติคืนรายการ
                  </p>
                )}
              </div>
            </div>
          )}
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
                <h3 className="text-sm font-black text-slate-800">
                  {popup.title}
                </h3>
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