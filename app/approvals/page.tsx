'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabaseClient';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  RotateCcw,
  Monitor,
  Package,
  Search,
  Filter,
  Eye,
  CalendarDays,
  X,
  Grid2X2,
  ArrowDownToLine,
  ArrowUpToLine,
} from 'lucide-react';

const RETURN_PENDING_STATUSES = ['return_pending', 'return_requested'];

type FilterMode = 'all' | 'borrow' | 'return' | 'urgent';
type DateFieldFilter = 'created_at' | 'borrow_date' | 'return_date';
type StatusFilter = 'all' | 'pending' | 'return_pending';
type TypeFilter = 'all' | 'equipment' | 'computer';
type UrgentFilter = 'all' | 'urgent' | 'normal';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [dateFieldFilter, setDateFieldFilter] =
    useState<DateFieldFilter>('created_at');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [urgentFilter, setUrgentFilter] = useState<UrgentFilter>('all');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'confirm_return'
  >('approve');
  const [successMsg, setSuccessMsg] = useState('');

  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          window.location.href = '/login';
          return;
        }

        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error || profile?.role !== 'admin') {
          window.location.href = '/user/booking';
          return;
        }

        setAllowed(true);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);

      const { data: requestData, error: requestError } = await supabase
        .from('borrow_requests')
        .select(
          `
          id,
          request_no,
          user_name,
          user_email,
          borrow_date,
          return_date,
          status,
          request_type,
          equipment_id,
          computer_id,
          reason,
          reject_reason,
          urgent,
          created_at,
          approved_at,
          returned_at,
          approved_by
        `
        )
        .in('status', ['pending', 'return_pending', 'return_requested'])
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (requestError) {
        console.error('borrow_requests error:', requestError);
        throw requestError;
      }

      const rows = requestData || [];

      const equipmentIds = Array.from(
        new Set(
          rows
            .filter(
              (item) =>
                item.request_type === 'equipment' && item.equipment_id
            )
            .map((item) => item.equipment_id)
        )
      );

      const computerIds = Array.from(
        new Set(
          rows
            .filter(
              (item) => item.request_type === 'computer' && item.computer_id
            )
            .map((item) => item.computer_id)
        )
      );

      let equipmentMap = new Map<string, any>();
      let computerMap = new Map<string, any>();

      if (equipmentIds.length > 0) {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select(
            `
            id,
            name,
            category,
            code,
            equipment_code,
            available_stock,
            status
          `
          )
          .in('id', equipmentIds);

        if (equipmentError) {
          console.error('equipment error:', equipmentError);
        }

        equipmentMap = new Map(
          (equipmentData || []).map((item) => [item.id, item])
        );
      }

      if (computerIds.length > 0) {
        const { data: computerData, error: computerError } = await supabase
          .from('computers')
          .select(
            `
            id,
            pc_name,
            room_name,
            status
          `
          )
          .in('id', computerIds);

        if (computerError) {
          console.error('computers error:', computerError);
        }

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

      setRequests(mergedRows.filter((item) => item.status === 'pending'));

      setReturnRequests(
        mergedRows.filter((item) =>
          RETURN_PENDING_STATUSES.includes(item.status)
        )
      );
    } catch (error: any) {
      console.warn('fetchRequests warning:', error?.message || error);
      setRequests([]);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;

    fetchRequests();

    const channel = supabase
      .channel('approvals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'borrow_requests' },
        fetchRequests
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment' },
        fetchRequests
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'computers' },
        fetchRequests
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        fetchRequests
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allowed, fetchRequests]);

  const openConfirm = (
    req: any,
    type: 'approve' | 'reject' | 'confirm_return'
  ) => {
    setSelected(req);
    setActionType(type);
    setRejectReason('');
    setRejectReasonError('');
    setShowConfirm(true);
  };

  const getRequestTitle = (req: any) => {
    if (req?.request_type === 'computer') {
      return req.computers?.pc_name || 'ไม่ระบุคอมพิวเตอร์';
    }

    return req.equipment?.name || 'ไม่พบข้อมูลอุปกรณ์ในคลัง';
  };

  const getRequestSubtitle = (req: any) => {
    if (req?.request_type === 'computer') {
      return req.computers?.room_name || 'ไม่ระบุห้อง';
    }

    return req.equipment?.category || 'ไม่ระบุหมวดหมู่';
  };

  const getRequestTypeLabel = (req: any) => {
    return req?.request_type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
  };

  const getRequestNo = (req: any) => {
    return req?.request_no || 'ยังไม่มีเลขคำขอ';
  };

  const getItemCode = (req: any) => {
    if (req?.request_type === 'computer') {
      return req.computers?.pc_name || 'ไม่มีรหัสคอมพิวเตอร์';
    }

    return (
      req?.equipment?.code ||
      req?.equipment?.equipment_code ||
      'ไม่มีรหัสอุปกรณ์'
    );
  };

  const getItemCodeLabel = (req: any) => {
    return req?.request_type === 'computer' ? 'รหัสคอมพิวเตอร์' : 'รหัสอุปกรณ์';
  };

  const getAvailabilityText = (req: any) => {
    if (req?.request_type === 'computer') {
      return req.computers?.status === 'available' ? 'ว่าง' : 'ไม่ว่าง';
    }

    return `คงเหลือ ${req.equipment?.available_stock ?? 0}`;
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
      month: '2-digit',
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

  const requestMatchesSearch = (req: any) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    const text = [
      getRequestTitle(req),
      getRequestSubtitle(req),
      getRequestNo(req),
      getItemCode(req),
      req.user_name,
      req.user_email,
      req.reason,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return text.includes(keyword);
  };

  const requestMatchesAdvancedFilter = (req: any) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && req.status !== 'pending') return false;
      if (
        statusFilter === 'return_pending' &&
        !RETURN_PENDING_STATUSES.includes(req.status)
      ) {
        return false;
      }
    }

    if (typeFilter !== 'all' && req.request_type !== typeFilter) {
      return false;
    }

    if (urgentFilter === 'urgent' && !req.urgent) {
      return false;
    }

    if (urgentFilter === 'normal' && req.urgent) {
      return false;
    }

    const rawDate = req?.[dateFieldFilter];

    if (startDateFilter || endDateFilter || monthFilter || yearFilter) {
      if (!rawDate) return false;

      const dateValue = new Date(rawDate);

      if (Number.isNaN(dateValue.getTime())) return false;

      if (startDateFilter) {
        const start = new Date(`${startDateFilter}T00:00:00`);
        if (dateValue < start) return false;
      }

      if (endDateFilter) {
        const end = new Date(`${endDateFilter}T23:59:59`);
        if (dateValue > end) return false;
      }

      if (monthFilter) {
        const month = dateValue.getMonth() + 1;
        if (month !== Number(monthFilter)) return false;
      }

      if (yearFilter) {
        const thaiYear = dateValue.getFullYear() + 543;
        const christianYear = dateValue.getFullYear();
        const inputYear = Number(yearFilter);

        if (thaiYear !== inputYear && christianYear !== inputYear) {
          return false;
        }
      }
    }

    return true;
  };

  const filteredRequests = requests.filter((req) => {
    if (filterMode === 'return') return false;
    if (filterMode === 'urgent' && !req.urgent) return false;

    return requestMatchesSearch(req) && requestMatchesAdvancedFilter(req);
  });

  const filteredReturnRequests = returnRequests.filter((req) => {
    if (filterMode === 'borrow') return false;
    if (filterMode === 'urgent' && !req.urgent) return false;

    return requestMatchesSearch(req) && requestMatchesAdvancedFilter(req);
  });

  const activeAdvancedFilterCount = [
    startDateFilter,
    endDateFilter,
    monthFilter,
    yearFilter,
    statusFilter !== 'all' ? statusFilter : '',
    typeFilter !== 'all' ? typeFilter : '',
    urgentFilter !== 'all' ? urgentFilter : '',
  ].filter(Boolean).length;

  const resetAdvancedFilter = () => {
    setDateFieldFilter('created_at');
    setStartDateFilter('');
    setEndDateFilter('');
    setMonthFilter('');
    setYearFilter('');
    setStatusFilter('all');
    setTypeFilter('all');
    setUrgentFilter('all');
  };

  const addNotification = async (
    userEmail: string | null,
    title: string,
    message: string,
    type: string,
    requestId: string
  ) => {
    if (!userEmail) return;

    await supabase.from('notifications').insert([
      {
        user_email: userEmail,
        title,
        message,
        type,
        related_request_id: requestId,
      },
    ]);
  };

  const sendEmail = async (
    to: string | null,
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

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.warn('ส่งอีเมลไม่สำเร็จ:', result);
        return;
      }

      console.log('ส่งอีเมลสำเร็จ:', result);
    } catch (error) {
      console.warn('ส่งอีเมลไม่สำเร็จ:', error);
    }
  };

  const getEmailDisplayName = async (req: any) => {
    const rawName =
      typeof req?.user_name === 'string' ? req.user_name.trim() : '';

    if (rawName && !rawName.includes('@')) {
      return rawName;
    }

    if (req?.user_email) {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('email', req.user_email)
        .maybeSingle();

      if (!error && userProfile?.name && !userProfile.name.includes('@')) {
        return userProfile.name;
      }
    }

    return 'ผู้ใช้งาน';
  };

  const handleFinalAction = async () => {
    if (!selected) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const requestNo = getRequestNo(selected);
      const itemCode = getItemCode(selected);
      const itemCodeLabel = getItemCodeLabel(selected);
      const itemName = getRequestTitle(selected);
      const itemTypeText = getRequestTypeLabel(selected);
      const itemSubtitle = getRequestSubtitle(selected);
      const userDisplayName = await getEmailDisplayName(selected);

      if (actionType === 'approve') {
        const title = 'แจ้งผลการอนุมัติคำขอใช้งาน';

        const message = `ระบบได้อนุมัติคำขอของท่านเรียบร้อยแล้ว รายละเอียดรายการ: ${itemName} ${itemCodeLabel}: ${itemCode} เลขคำขอยืม: ${requestNo} กรุณาคืนรายการภายในวันและเวลาที่กำหนด`;

        if (selected.request_type === 'computer') {
          const { data: computerData, error: computerFetchError } =
            await supabase
              .from('computers')
              .select('id, status')
              .eq('id', selected.computer_id)
              .single();

          if (computerFetchError) throw computerFetchError;

          if (computerData?.status !== 'available') {
            alert('คอมพิวเตอร์เครื่องนี้ไม่ว่างแล้ว ไม่สามารถอนุมัติได้');
            return;
          }

          const { error: reqError } = await supabase
            .from('borrow_requests')
            .update({
              status: 'approved',
              reject_reason: null,
              approved_at: new Date().toISOString(),
              approved_by: session?.user?.id ?? null,
              returned_at: null,
            })
            .eq('id', selected.id);

          if (reqError) throw reqError;

          const { error: computerUpdateError } = await supabase
            .from('computers')
            .update({ status: 'busy' })
            .eq('id', selected.computer_id);

          if (computerUpdateError) throw computerUpdateError;
        } else {
          const { data: equipmentData, error: equipmentFetchError } =
            await supabase
              .from('equipment')
              .select('id, available_stock, status')
              .eq('id', selected.equipment_id)
              .single();

          if (equipmentFetchError) throw equipmentFetchError;

          const currentStock = equipmentData?.available_stock || 0;

          if (currentStock <= 0) {
            alert('อุปกรณ์ชิ้นนี้ไม่ว่างแล้ว ไม่สามารถอนุมัติได้');
            return;
          }

          const { error: reqError } = await supabase
            .from('borrow_requests')
            .update({
              status: 'approved',
              reject_reason: null,
              approved_at: new Date().toISOString(),
              approved_by: session?.user?.id ?? null,
              returned_at: null,
            })
            .eq('id', selected.id);

          if (reqError) throw reqError;

          const newStock = currentStock - 1;

          const { error: equipmentUpdateError } = await supabase
            .from('equipment')
            .update({
              available_stock: newStock,
              status: newStock > 0 ? 'available' : 'busy',
            })
            .eq('id', selected.equipment_id);

          if (equipmentUpdateError) throw equipmentUpdateError;
        }

        await addNotification(
          selected.user_email,
          title,
          message,
          'approved',
          selected.id
        );

        await sendEmail(
          selected.user_email,
          title,
          `เรียน คุณ${userDisplayName}

ระบบขอแจ้งให้ทราบว่า คำขอใช้งานของท่านได้รับการอนุมัติเรียบร้อยแล้ว

รายละเอียดคำขอ
เลขคำขอยืม: ${requestNo}
${itemCodeLabel}: ${itemCode}
ประเภทคำขอ: ${itemTypeText}
รายการ: ${itemName}
รายละเอียด: ${itemSubtitle}
วันที่เริ่มยืม: ${formatThaiDateTime(selected.borrow_date)}
วันที่กำหนดคืน: ${formatThaiDateTime(selected.return_date)}

กรุณาตรวจสอบรายละเอียดรายการ และดำเนินการใช้งานตามวันและเวลาที่ได้รับอนุมัติ

ทั้งนี้ ผู้ใช้งานต้องคืนรายการดังกล่าวภายในวันและเวลาที่กำหนด หากคืนล่าช้าหรือไม่คืนตามกำหนด อาจมีการดำเนินการตามระเบียบของหน่วยงาน

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`
        );

        setSuccessMsg('อนุมัติคำขอเรียบร้อยแล้ว');
      }

      if (actionType === 'reject') {
        const finalRejectReason = rejectReason.trim();

        if (!finalRejectReason) {
          setRejectReasonError('กรุณาระบุเหตุผลการปฏิเสธ');
          return;
        }

        const title = 'แจ้งผลการพิจารณาคำขอใช้งาน';

        const message = `ระบบได้พิจารณาคำขอของท่านแล้ว และไม่สามารถอนุมัติคำขอนี้ได้ รายละเอียดรายการ: ${itemName} ${itemCodeLabel}: ${itemCode} เลขคำขอยืม: ${requestNo} เหตุผล: ${finalRejectReason}`;

        const { error: reqError } = await supabase
          .from('borrow_requests')
          .update({
            status: 'rejected',
            reject_reason: finalRejectReason,
            approved_at: null,
            approved_by: null,
            returned_at: null,
          })
          .eq('id', selected.id);

        if (reqError) throw reqError;

        await addNotification(
          selected.user_email,
          title,
          message,
          'rejected',
          selected.id
        );

        await sendEmail(
          selected.user_email,
          title,
          `เรียน คุณ${userDisplayName}

ระบบขอแจ้งให้ทราบว่า คำขอใช้งานของท่านไม่ได้รับการอนุมัติ

รายละเอียดคำขอ
เลขคำขอยืม: ${requestNo}
${itemCodeLabel}: ${itemCode}
ประเภทคำขอ: ${itemTypeText}
รายการ: ${itemName}
รายละเอียด: ${itemSubtitle}
วันที่เริ่มยืม: ${formatThaiDateTime(selected.borrow_date)}
วันที่กำหนดคืน: ${formatThaiDateTime(selected.return_date)}

เหตุผลการไม่อนุมัติ
${finalRejectReason}

กรุณาตรวจสอบรายละเอียดคำขอ และดำเนินการส่งคำขอใหม่อีกครั้ง หากยังต้องการใช้งานรายการดังกล่าว

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`
        );

        setSuccessMsg('ปฏิเสธคำขอแล้ว');
      }

      if (actionType === 'confirm_return') {
        const title = 'แจ้งผลการยืนยันรับคืนรายการ';

        const message = `เจ้าหน้าที่ได้ยืนยันการรับคืนรายการของท่านเรียบร้อยแล้ว รายละเอียดรายการ: ${itemName} ${itemCodeLabel}: ${itemCode} เลขคำขอยืม: ${requestNo}`;

        const { error: reqError } = await supabase
          .from('borrow_requests')
          .update({
            status: 'returned',
            returned_at: new Date().toISOString(),
          })
          .eq('id', selected.id);

        if (reqError) throw reqError;

        if (selected.request_type === 'computer') {
          const { error: computerUpdateError } = await supabase
            .from('computers')
            .update({ status: 'available' })
            .eq('id', selected.computer_id);

          if (computerUpdateError) throw computerUpdateError;
        } else {
          const { data: equipmentData, error: equipmentFetchError } =
            await supabase
              .from('equipment')
              .select('id, available_stock')
              .eq('id', selected.equipment_id)
              .single();

          if (equipmentFetchError) throw equipmentFetchError;

          const newStock = (equipmentData?.available_stock || 0) + 1;

          const { error: equipmentUpdateError } = await supabase
            .from('equipment')
            .update({
              available_stock: newStock,
              status: 'available',
            })
            .eq('id', selected.equipment_id);

          if (equipmentUpdateError) throw equipmentUpdateError;
        }

        await addNotification(
          selected.user_email,
          title,
          message,
          'returned',
          selected.id
        );

        await sendEmail(
          selected.user_email,
          title,
          `เรียน คุณ${userDisplayName}

ระบบขอแจ้งให้ทราบว่า เจ้าหน้าที่ได้ยืนยันการรับคืนรายการของท่านเรียบร้อยแล้ว

รายละเอียดการคืน
เลขคำขอยืม: ${requestNo}
${itemCodeLabel}: ${itemCode}
ประเภทคำขอ: ${itemTypeText}
รายการ: ${itemName}
รายละเอียด: ${itemSubtitle}
วันที่ยืนยันรับคืน: ${formatThaiDateTime(new Date().toISOString())}

ขอขอบคุณที่ดำเนินการคืนรายการตามขั้นตอนของหน่วยงาน

ขอแสดงความนับถือ
ระบบยืม–คืนอุปกรณ์และขอใช้คอมพิวเตอร์`
        );

        setSuccessMsg('ยืนยันรับคืนเรียบร้อยแล้ว');
      }

      setShowConfirm(false);
      setIsDetailModalOpen(false);
      setShowSuccess(true);
      setRejectReason('');
      setRejectReasonError('');
      await fetchRequests();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const FilterButton = ({
    mode,
    icon,
    label,
  }: {
    mode: FilterMode;
    icon: React.ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setFilterMode(mode)}
      className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black transition-all ${
        filterMode === mode
          ? 'border-blue-100 bg-blue-50 text-blue-600 shadow-sm'
          : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const RequestNoBadge = ({ req }: { req: any }) => (
    <div className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
      เลขคำขอ: {getRequestNo(req)}
    </div>
  );

  const ItemCodeBadge = ({ req }: { req: any }) => (
    <div className="inline-flex w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
      {getItemCodeLabel(req)}: {getItemCode(req)}
    </div>
  );

  const EmptyState = ({ text }: { text: string }) => (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/60 p-14 text-center">
      <CheckCircle2 size={36} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-black italic text-slate-400">{text}</p>
    </div>
  );

  const PendingRequestCard = ({ req }: { req: any }) => (
    <div className="group rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_260px_300px] lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl ${
              req.request_type === 'computer'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {req.request_type === 'computer' ? (
              <Monitor size={30} />
            ) : (
              <Package size={30} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-black leading-snug text-slate-900 md:text-lg">
                {getRequestTitle(req)}
              </h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                {req.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <RequestNoBadge req={req} />
              <ItemCodeBadge req={req} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-slate-300" />
                {req.user_name || req.user_email || 'ไม่ทราบชื่อผู้ใช้'}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-300" />
                {formatThaiDateTime(req.created_at)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-bold leading-relaxed text-slate-500">
              เหตุผล: {req.reason || 'ไม่ได้ระบุเหตุผล'}
            </p>

            <p className="mt-2 text-xs font-bold text-slate-300">
              {getRequestSubtitle(req)} · {getAvailabilityText(req)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4 lg:border-l lg:border-y-0 lg:border-r-0 lg:bg-transparent">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">วันที่ยืม</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(req.borrow_date)} {shortTime(req.borrow_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">กำหนดคืน</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(req.return_date)} {shortTime(req.return_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {req.urgent && (
            <span className="inline-flex w-fit rounded-full bg-red-50 px-5 py-2 text-sm font-black text-red-600">
              ด่วน
            </span>
          )}

          <div className="grid w-full grid-cols-3 gap-2 lg:max-w-[300px]">
            <Button
              className="h-12 rounded-2xl bg-slate-100 px-3 text-xs font-black !text-slate-600 hover:bg-slate-200"
              onClick={() => {
                setSelected(req);
                setIsDetailModalOpen(true);
              }}
            >
              <Eye size={16} className="mr-1" />
              รายละเอียด
            </Button>

            <Button
              className="h-12 rounded-2xl bg-emerald-500 px-3 text-xs font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600"
              onClick={() => openConfirm(req, 'approve')}
            >
              <CheckCircle2 size={16} className="mr-1" />
              อนุมัติ
            </Button>

            <Button
              className="h-12 rounded-2xl bg-red-500 px-3 text-xs font-black text-white shadow-lg shadow-red-100 hover:bg-red-600"
              onClick={() => openConfirm(req, 'reject')}
            >
              <X size={16} className="mr-1" />
              ปฏิเสธ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReturnRequestCard = ({ req }: { req: any }) => (
    <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_260px_180px] lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <RotateCcw size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-black leading-snug text-slate-900 md:text-lg">
                {getRequestTitle(req)}
              </h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                {req.request_type === 'computer' ? 'COMPUTER' : 'EQUIPMENT'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex w-fit rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
                เลขคำขอคืน: {getRequestNo(req)}
              </div>
              <ItemCodeBadge req={req} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-slate-300" />
                {req.user_name || req.user_email || 'ไม่ทราบชื่อผู้ใช้'}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-300" />
                {formatThaiDateTime(req.created_at)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-bold leading-relaxed text-slate-500">
              หมายเหตุ: {req.reason || 'ผู้ใช้แจ้งคืนอุปกรณ์แล้ว'}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50/40 p-4 lg:border-l lg:border-y-0 lg:border-r-0 lg:bg-transparent">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">วันที่ยืม</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(req.borrow_date)} {shortTime(req.borrow_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs font-black text-slate-400">กำหนดคืน</p>
                <p className="text-sm font-black text-slate-700">
                  {shortDate(req.return_date)} {shortTime(req.return_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black !text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
          onClick={() => openConfirm(req, 'confirm_return')}
        >
          <CheckCircle2 size={17} className="mr-2 text-white" />
          ยืนยันรับคืน
        </Button>
      </div>
    </div>
  );

  if (checking) {
    return (
      <DashboardLayout title="รายการอนุมัติการใช้อุปกรณ์">
        <div className="p-10 font-bold text-black">กำลังตรวจสอบสิทธิ์...</div>
      </DashboardLayout>
    );
  }

  if (!allowed) return null;

  return (
    <DashboardLayout title="รายการอนุมัติการใช้อุปกรณ์">
      <div className="space-y-8 pb-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              รายการอนุมัติการใช้อุปกรณ์
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-400">
              ตรวจสอบและอนุมัติคำขอยืม - คืนอุปกรณ์
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100/60 md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อผู้ขอ / อุปกรณ์ / เลขคำขอ"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                mode="all"
                icon={<Grid2X2 size={17} />}
                label="ทั้งหมด"
              />
              <FilterButton
                mode="borrow"
                icon={<ArrowDownToLine size={17} />}
                label="คำขอยืม"
              />
              <FilterButton
                mode="return"
                icon={<ArrowUpToLine size={17} />}
                label="คำขอคืน"
              />
              <FilterButton
                mode="urgent"
                icon={<AlertCircle size={17} />}
                label="ด่วน"
              />

              <button
                type="button"
                onClick={() => setShowAdvancedFilter(true)}
                className={`relative ml-0 flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black transition xl:ml-4 ${
                  activeAdvancedFilterCount > 0
                    ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <Filter size={17} />
                ตัวกรองเพิ่มเติม
                {activeAdvancedFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {(filterMode === 'all' ||
          filterMode === 'borrow' ||
          filterMode === 'urgent') && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-blue-600"></span>
              <h2 className="text-xl font-black text-slate-900">
                คำขอรออนุมัติ
              </h2>
              <span className="text-sm font-black text-slate-400">
                Pending Requests
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                {filteredRequests.length} รายการ
              </span>
            </div>

            {loading ? (
              <div className="rounded-[2rem] bg-white p-14 text-center font-bold text-slate-400 shadow-sm">
                กำลังโหลดข้อมูล...
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="custom-scrollbar max-h-[420px] space-y-4 overflow-y-auto rounded-[2rem] pr-2">
                {filteredRequests.map((req) => (
                  <PendingRequestCard key={req.id} req={req} />
                ))}
              </div>
            ) : (
              <EmptyState text="ไม่มีรายการรออนุมัติแล้ว" />
            )}
          </section>
        )}

        {(filterMode === 'all' || filterMode === 'return') && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <h2 className="text-xl font-black text-slate-900">คำขอรับคืน</h2>
              <span className="text-sm font-black text-slate-400">
                Return Requests
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
                {filteredReturnRequests.length} รายการ
              </span>
            </div>

            {loading ? (
              <div className="rounded-[2rem] bg-white p-14 text-center font-bold text-slate-400 shadow-sm">
                กำลังโหลดข้อมูล...
              </div>
            ) : filteredReturnRequests.length > 0 ? (
              <div className="custom-scrollbar max-h-[420px] space-y-4 overflow-y-auto rounded-[2rem] pr-2">
                {filteredReturnRequests.map((req) => (
                  <ReturnRequestCard key={req.id} req={req} />
                ))}
              </div>
            ) : (
              <EmptyState text="ไม่มีรายการรอรับคืน" />
            )}
          </section>
        )}

        {filterMode === 'urgent' && filteredRequests.length === 0 && (
          <EmptyState text="ไม่มีคำขอด่วนในขณะนี้" />
        )}
      </div>

      <Modal
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        title="ตัวกรองเพิ่มเติม"
      >
        <div className="space-y-5 pt-2 text-slate-800">
          <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Filter size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  กรองรายการคำขอ
                </h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                  เลือกช่วงวันที่ เดือน ปี สถานะ ประเภท หรือคำขอด่วน เพื่อค้นหารายการที่ต้องการ
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                ใช้วันที่จาก
              </label>
              <select
                value={dateFieldFilter}
                onChange={(e) =>
                  setDateFieldFilter(e.target.value as DateFieldFilter)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="created_at">วันที่ส่งคำขอ</option>
                <option value="borrow_date">วันที่เริ่มยืม</option>
                <option value="return_date">วันที่กำหนดคืน</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                ปี
              </label>
              <input
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                placeholder="เช่น 2569 หรือ 2026"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                เดือน
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">ทุกเดือน</option>
                <option value="1">มกราคม</option>
                <option value="2">กุมภาพันธ์</option>
                <option value="3">มีนาคม</option>
                <option value="4">เมษายน</option>
                <option value="5">พฤษภาคม</option>
                <option value="6">มิถุนายน</option>
                <option value="7">กรกฎาคม</option>
                <option value="8">สิงหาคม</option>
                <option value="9">กันยายน</option>
                <option value="10">ตุลาคม</option>
                <option value="11">พฤศจิกายน</option>
                <option value="12">ธันวาคม</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                สถานะ
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">ทั้งหมด</option>
                <option value="pending">รออนุมัติ</option>
                <option value="return_pending">รอรับคืน</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                ประเภท
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">ทั้งหมด</option>
                <option value="equipment">อุปกรณ์</option>
                <option value="computer">คอมพิวเตอร์</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                ความเร่งด่วน
              </label>
              <select
                value={urgentFilter}
                onChange={(e) =>
                  setUrgentFilter(e.target.value as UrgentFilter)
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">ทั้งหมด</option>
                <option value="urgent">คำขอด่วน</option>
                <option value="normal">คำขอปกติ</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black !text-slate-600 hover:bg-slate-200"
              onClick={resetAdvancedFilter}
            >
              ล้างตัวกรอง
            </Button>

            <Button
              className="flex-[1.4] rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
              onClick={() => setShowAdvancedFilter(false)}
            >
              ใช้ตัวกรอง
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="📋 รายละเอียดคำขอ"
      >
        {selected && (
          <div className="space-y-6 pt-3 text-black">
            <div className="rounded-[1.75rem] border border-[#e6edf9] bg-[#f8fbff] p-5 md:p-6">
              <div className="mb-5 flex items-start gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    selected.request_type === 'computer'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {selected.request_type === 'computer' ? (
                    <Monitor size={22} />
                  ) : (
                    <Package size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold leading-snug text-slate-900">
                      {getRequestTitle(selected)}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        selected.request_type === 'computer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {selected.request_type === 'computer'
                        ? 'COMPUTER'
                        : 'EQUIPMENT'}
                    </span>

                    {selected.urgent ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-600">
                        เร่งด่วน
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                        ปกติ
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {getRequestSubtitle(selected)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <RequestNoBadge req={selected} />
                    <ItemCodeBadge req={selected} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    เลขคำขอยืม
                  </p>
                  <p className="text-sm font-bold text-blue-700">
                    {getRequestNo(selected)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    {getItemCodeLabel(selected)}
                  </p>
                  <p className="text-sm font-bold text-indigo-700">
                    {getItemCode(selected)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    ประเภทคำขอ
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {getRequestTypeLabel(selected)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    สถานะคำขอ
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {selected.urgent ? 'เร่งด่วน' : 'ปกติ'}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    ผู้ขอยืม
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {selected.user_name ||
                      selected.user_email ||
                      'ไม่ทราบชื่อผู้ใช้'}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    วันที่เริ่มยืม
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatThaiDateTime(selected.borrow_date)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    วันที่กำหนดคืน
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatThaiDateTime(selected.return_date)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    {selected.request_type === 'computer'
                      ? 'ห้อง / ตำแหน่ง'
                      : 'หมวดหมู่'}
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {getRequestSubtitle(selected)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    สถานะปัจจุบัน
                  </p>
                  <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
                    {selected.request_type === 'computer'
                      ? `สถานะ: ${getAvailabilityText(selected)}`
                      : getAvailabilityText(selected)}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#e6edf9] pt-5">
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  เหตุผล
                </p>
                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4 text-sm font-medium leading-relaxed text-blue-700 shadow-sm">
                  {selected.reason
                    ? `"${selected.reason}"`
                    : 'ไม่ได้ระบุเหตุผล'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1 rounded-2xl bg-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-red-100"
                onClick={() => openConfirm(selected, 'reject')}
              >
                ปฏิเสธ
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-emerald-500 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100"
                onClick={() => openConfirm(selected, 'approve')}
              >
                อนุมัติ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="">
        <div className="flex flex-col items-center py-6 text-center font-bold">
          <div
            className={`mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full ${
              actionType === 'approve'
                ? 'bg-emerald-50'
                : actionType === 'reject'
                ? 'bg-red-50'
                : 'bg-blue-50'
            }`}
          >
            {actionType === 'approve' ? (
              <CheckCircle2 size={40} className="text-emerald-500" />
            ) : actionType === 'reject' ? (
              <AlertCircle size={40} className="text-red-500" />
            ) : (
              <RotateCcw size={40} className="text-blue-600" />
            )}
          </div>

          {selected && (
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                เลขคำขอยืม: {getRequestNo(selected)}
              </div>
              <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-700">
                {getItemCodeLabel(selected)}: {getItemCode(selected)}
              </div>
            </div>
          )}

          <h3 className="mb-2 text-xl font-black text-slate-800">
            {actionType === 'approve'
              ? 'ยืนยันการอนุมัติ?'
              : actionType === 'reject'
              ? 'ยืนยันการปฏิเสธ?'
              : 'ยืนยันรับคืน?'}
          </h3>

          <p className="mb-5 text-[10px] text-slate-400">
            {actionType === 'confirm_return'
              ? 'เมื่อยืนยันแล้ว สถานะจะเปลี่ยนเป็นคืนเสร็จสิ้นทันที'
              : actionType === 'reject'
              ? 'กรุณาระบุเหตุผล เพื่อให้ผู้ใช้ทราบสาเหตุการปฏิเสธ'
              : 'การดำเนินการนี้จะมีผลต่อสถานะการใช้งานทันที'}
          </p>

          {actionType === 'reject' && (
            <div className="mb-6 w-full px-4 text-left">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                เหตุผลการปฏิเสธ
              </label>

              <textarea
                className={`w-full rounded-2xl border-2 bg-red-50/40 p-4 text-sm font-bold text-slate-700 outline-none transition focus:border-red-400 ${
                  rejectReasonError ? 'border-red-300' : 'border-red-100'
                }`}
                rows={4}
                placeholder="เช่น อุปกรณ์ถูกใช้งานอยู่ / ข้อมูลไม่ครบ / วันที่ยืมไม่เหมาะสม"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectReasonError('');
                }}
              />

              {rejectReasonError && (
                <p className="mt-2 text-xs font-bold text-red-500">
                  {rejectReasonError}
                </p>
              )}
            </div>
          )}

          <div className="flex w-full gap-3 px-4">
            <Button
              className="flex-1 rounded-2xl bg-slate-300 py-3 font-black text-slate-500"
              onClick={() => {
                setShowConfirm(false);
                setRejectReason('');
                setRejectReasonError('');
              }}
            >
              ยกเลิก
            </Button>
            <Button
              className={`flex-[1.5] rounded-2xl py-3 font-black !text-white shadow-lg ${
                actionType === 'approve'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : actionType === 'reject'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleFinalAction}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="">
        <div className="flex flex-col items-center py-8 text-center font-bold">
          <div className="mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="mb-2 text-xl font-black leading-tight text-slate-800">
            {successMsg}
          </h3>
          <p className="mb-8 text-[10px] uppercase tracking-widest italic text-slate-400">
            Updated Successfully
          </p>
          <Button
            className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl"
            onClick={() => setShowSuccess(false)}
          >
            ตกลง
          </Button>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DashboardLayout>
  );
}