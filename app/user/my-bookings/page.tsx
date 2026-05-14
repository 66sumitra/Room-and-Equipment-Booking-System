'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  Eye,
  CalendarDays,
  User,
  XCircle,
  Grid2X2,
  ArrowDownToLine,
  ArrowUpToLine,
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

  const [selected, setSelected] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const shortDate = (dateTime: string | null | undefined) => {
    if (!dateTime) return 'ไม่ระบุ';

    return new Date(dateTime).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const shortTime = (dateTime: string | null | undefined) => {
    if (!dateTime) return '';

    return new Date(dateTime).toLocaleString('th-TH', {
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
          .select('id, name, category, code, equipment_code')
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
      'ไม่มีรหัสอุปกรณ์'
    );
  };

  const getStatusText = (status: string) => {
    if (status === 'approved') return 'กำลังใช้งาน';
    if (status === 'return_pending') return 'รอรับคืน';
    if (status === 'returned') return 'คืนแล้ว';

    return status;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') {
      return 'bg-blue-50 text-blue-600 border-blue-100';
    }

    if (status === 'return_pending') {
      return 'bg-amber-50 text-amber-600 border-amber-100';
    }

    if (status === 'returned') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }

    return 'bg-slate-50 text-slate-500 border-slate-100';
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

  const stats = useMemo(() => {
    return {
      all: allBookings.length,
      approved: approvedBookings.length,
      returnPending: returnPendingBookings.length,
      returned: returnedBookings.length,
      equipment: allBookings.filter((item) => item.request_type === 'equipment')
        .length,
      computer: allBookings.filter((item) => item.request_type === 'computer')
        .length,
    };
  }, [allBookings, approvedBookings, returnPendingBookings, returnedBookings]);

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
      <Monitor size={28} />
    ) : (
      <Package size={28} />
    );
  };

  const getRequestButtonText = (item: any) => {
    return item?.request_type === 'computer'
      ? 'แจ้งคืนคอมพิวเตอร์'
      : 'แจ้งคืนอุปกรณ์';
  };

  const RequestNoBadge = ({ item }: { item: any }) => (
    <div className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
      เลขคำขอ: {getRequestNo(item)}
    </div>
  );

  const EquipmentCodeBadge = ({ item }: { item: any }) => (
    <div className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
      {item?.request_type === 'computer' ? 'รหัสคอมพิวเตอร์' : 'รหัสอุปกรณ์'}:{' '}
      {getEquipmentCode(item)}
    </div>
  );

  const StatusCard = ({
    icon,
    title,
    value,
    active,
    onClick,
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    active: boolean;
    onClick: () => void;
    color: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[150px] items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? 'border-blue-200 shadow-lg shadow-blue-100/50'
          : 'border-slate-100 shadow-sm'
      }`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400">{title}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </button>
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
      className={`h-11 shrink-0 rounded-2xl border px-4 text-[12px] font-black transition-all ${
        active
          ? 'border-blue-100 bg-blue-50 text-blue-600 shadow-sm'
          : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  );

  const EmptyState = ({ text }: { text: string }) => (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/60 p-14 text-center">
      <CheckCircle2 size={36} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-black italic text-slate-400">{text}</p>
    </div>
  );

  const BookingCard = ({ item }: { item: any }) => (
    <div className="group rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_260px_220px] lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl ${
              item.request_type === 'computer'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {getRequestIcon(item)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-black leading-snug text-slate-900 md:text-lg">
                {getRequestTitle(item)}
              </h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                {item.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
              </span>
            </div>

            <p className="mt-1 text-xs font-bold text-slate-400">
              {getRequestSubtitle(item)}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <RequestNoBadge item={item} />
              <EquipmentCodeBadge item={item} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-slate-300" />
                {currentUserEmail || item.user_email || 'ผู้ใช้งาน'}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-300" />
                ส่งคำขอ: {formatThaiDateTime(item.created_at)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-bold leading-relaxed text-slate-500">
              เหตุผล: {item.reason || 'ไม่ได้ระบุเหตุผล'}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4 lg:border-y-0 lg:border-l lg:border-r-0 lg:bg-transparent">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">วันที่ยืม</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(item.borrow_date)} {shortTime(item.borrow_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">กำหนดคืน</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(item.return_date)} {shortTime(item.return_date)}
                </p>
              </div>
            </div>

            {item.status === 'returned' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-500" />
                <div>
                  <p className="text-xs font-black text-slate-400">คืนสำเร็จ</p>
                  <p className="text-sm font-black text-emerald-600">
                    {formatThaiDateTime(item.returned_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <span
            className={`inline-flex w-fit rounded-full border px-5 py-2 text-sm font-black ${getStatusStyle(
              item.status
            )}`}
          >
            {getStatusText(item.status)}
          </span>

          <div className="grid w-full grid-cols-1 gap-2 lg:max-w-[220px]">
            <Button
              className="h-12 rounded-2xl bg-white px-4 text-xs font-black !text-blue-600 ring-1 ring-blue-100 hover:bg-blue-50"
              onClick={() => {
                setSelected(item);
                setDetailOpen(true);
              }}
            >
              <Eye size={16} className="mr-2" />
              ดูรายละเอียด
            </Button>

            {item.status === 'approved' && (
              <Button
                className="h-12 rounded-2xl bg-red-500 px-4 text-xs font-black text-white shadow-lg shadow-red-100 hover:bg-red-600"
                onClick={() => handleRequestReturn(item)}
              >
                <RotateCcw size={16} className="mr-2" />
                {getRequestButtonText(item)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="ประวัติการจองของฉัน"
      actionButton={
        <Link href="/user/booking">
          <Button className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-black text-white">
            กลับไปหน้าขอยืม
          </Button>
        </Link>
      }
    >
      <div className="space-y-7 pb-20">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            ประวัติการจองของฉัน
          </h1>
          <p className="mt-2 text-sm font-bold text-slate-400">
            ติดตามสถานะการจองและรายการยืมทั้งหมดของคุณ
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100/60 md:p-5">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr] xl:items-center">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่ออุปกรณ์ / เลขคำขอ / รหัสรายการ..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              >
                สถานะทั้งหมด
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
                ประเภททั้งหมด
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

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          <StatusCard
            icon={<Grid2X2 size={22} />}
            title="ทั้งหมด"
            value={stats.all}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            color="bg-blue-50 text-blue-600"
          />
          <StatusCard
            icon={<Clock size={22} />}
            title="กำลังใช้งาน"
            value={stats.approved}
            active={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
            color="bg-blue-50 text-blue-600"
          />
          <StatusCard
            icon={<RotateCcw size={22} />}
            title="รอรับคืน"
            value={stats.returnPending}
            active={statusFilter === 'return_pending'}
            onClick={() => setStatusFilter('return_pending')}
            color="bg-amber-50 text-amber-600"
          />
          <StatusCard
            icon={<CheckCircle2 size={22} />}
            title="คืนแล้ว"
            value={stats.returned}
            active={statusFilter === 'returned'}
            onClick={() => setStatusFilter('returned')}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatusCard
            icon={<Package size={22} />}
            title="อุปกรณ์"
            value={stats.equipment}
            active={typeFilter === 'equipment'}
            onClick={() => setTypeFilter('equipment')}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatusCard
            icon={<Monitor size={22} />}
            title="คอมพิวเตอร์"
            value={stats.computer}
            active={typeFilter === 'computer'}
            onClick={() => setTypeFilter('computer')}
            color="bg-sky-50 text-sky-600"
          />
        </div>

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-600"></span>
            <h2 className="text-xl font-black text-slate-900">
              ประวัติการจองทั้งหมด
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {filteredBookings.length} รายการ
            </span>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-black text-slate-500 shadow-sm">
            <SlidersHorizontal size={15} className="text-slate-400" />
            เรียงล่าสุด
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] bg-white p-14 text-center font-bold text-slate-400 shadow-sm">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((item) => (
              <BookingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState text="ไม่พบรายการที่ค้นหา" />
        )}
      </div>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="รายละเอียดรายการยืม"
      >
        {selected && (
          <div className="space-y-5 pt-2 text-slate-800">
            <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    selected.request_type === 'computer'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {getRequestIcon(selected)}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black leading-snug text-slate-900">
                    {getRequestTitle(selected)}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {getRequestSubtitle(selected)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <RequestNoBadge item={selected} />
                    <EquipmentCodeBadge item={selected} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="ประเภท" value={getRequestTypeText(selected)} />
              <InfoBlock label="สถานะ" value={getStatusText(selected.status)} />
              <InfoBlock
                label="วันที่ยืม"
                value={formatThaiDateTime(selected.borrow_date)}
              />
              <InfoBlock
                label="กำหนดคืน"
                value={formatThaiDateTime(selected.return_date)}
              />
              <InfoBlock
                label="วันที่ส่งคำขอ"
                value={formatThaiDateTime(selected.created_at)}
              />
              <InfoBlock
                label="วันที่คืนสำเร็จ"
                value={
                  selected.returned_at
                    ? formatThaiDateTime(selected.returned_at)
                    : 'ยังไม่ได้คืนสำเร็จ'
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                เหตุผล
              </p>
              <p className="text-sm font-bold leading-relaxed text-slate-700">
                {selected.reason || 'ไม่ได้ระบุเหตุผล'}
              </p>
            </div>

            {selected.status === 'approved' && (
              <Button
                className="w-full rounded-2xl bg-red-500 py-4 text-sm font-black text-white shadow-lg shadow-red-100"
                onClick={() => {
                  setDetailOpen(false);
                  handleRequestReturn(selected);
                }}
              >
                <RotateCcw size={17} className="mr-2" />
                {getRequestButtonText(selected)}
              </Button>
            )}
          </div>
        )}
      </Modal>

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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}