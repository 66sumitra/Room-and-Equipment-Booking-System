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
} from 'lucide-react';

const RETURN_PENDING_STATUSES = ['return_pending', 'return_requested'];

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

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

      const baseSelect = `
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
        approved_by,
        equipment (
          id,
          name,
          category,
          code,
          equipment_code,
          item_code,
          available_stock,
          status
        ),
        computers (
          id,
          pc_name,
          room_name,
          status
        )
      `;

      const { data: pendingData, error: pendingError } = await supabase
        .from('borrow_requests')
        .select(baseSelect)
        .eq('status', 'pending')
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      const { data: returnData, error: returnError } = await supabase
        .from('borrow_requests')
        .select(baseSelect)
        .in('status', RETURN_PENDING_STATUSES)
        .order('created_at', { ascending: false });

      if (returnError) throw returnError;

      setRequests(pendingData || []);
      setReturnRequests(returnData || []);
    } catch (error: any) {
      console.warn('fetchRequests warning:', error.message);
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

    return req.equipment?.name || 'ไม่ระบุอุปกรณ์';
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
      req?.equipment?.item_code ||
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

  const RequestNoBadge = ({ req }: { req: any }) => (
    <div className="mt-2 inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
      เลขคำขอยืม: {getRequestNo(req)}
    </div>
  );

  const ItemCodeBadge = ({ req }: { req: any }) => (
    <div className="mt-2 inline-flex w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-700">
      {getItemCodeLabel(req)}: {getItemCode(req)}
    </div>
  );

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
      const userDisplayName =
        selected.user_name || selected.user_email || 'ผู้ใช้งาน';

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
      <div className="space-y-10 pb-20">
        <div className="flex items-center justify-between rounded-[2rem] border border-slate-50 bg-white p-6 shadow-xl shadow-slate-100/50">
          <div>
            <h2 className="text-xl font-black italic text-slate-800">
              Pending Requests
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                มีรายการรออนุมัติ {requests.length} รายการ
              </p>
              {requests.filter((r) => r.urgent).length > 0 && (
                <span className="animate-pulse rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 text-[9px] font-black text-red-500">
                  ด่วน {requests.filter((r) => r.urgent).length} รายการ
                </span>
              )}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-white text-black shadow-xl shadow-slate-100/50">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-slate-800 text-[11px] font-black uppercase tracking-[0.2em] text-white">
              <tr>
                <th className="px-10 py-5 text-left">รายละเอียดคำขอ</th>
                <th className="py-5 text-left">ข้อมูลผู้ขอ</th>
                <th className="px-10 py-5 text-center">จัดการคำขอ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className={`group transition-colors ${
                    req.urgent
                      ? 'bg-red-50/40 hover:bg-red-50/60'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="relative px-8 py-6">
                    {req.urgent && (
                      <div className="absolute bottom-0 left-0 top-0 w-1 animate-pulse bg-red-500" />
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {getRequestTitle(req)}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[8px] font-black ${
                          req.request_type === 'computer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.request_type === 'computer'
                          ? 'COMPUTER'
                          : 'EQUIPMENT'}
                      </span>

                      {req.urgent && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-black text-white shadow-lg shadow-red-200">
                          🚨 URGENT
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <RequestNoBadge req={req} />
                      <ItemCodeBadge req={req} />
                    </div>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                      {getRequestSubtitle(req)}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-300">
                      {req.request_type === 'computer'
                        ? `สถานะ: ${getAvailabilityText(req)}`
                        : getAvailabilityText(req)}
                    </p>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <User size={12} className="text-slate-300" />
                        {req.user_name || req.user_email || 'ไม่ทราบชื่อผู้ใช้'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock size={12} className="text-slate-200" />
                        {formatThaiDateTime(req.borrow_date)}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        ประเภท: {getRequestTypeLabel(req)}
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <Button
                        className="h-9 rounded-xl bg-slate-100 px-4 text-[10px] font-black uppercase !text-slate-500"
                        onClick={() => {
                          setSelected(req);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        รายละเอียด
                      </Button>
                      <Button
                        className="h-9 rounded-xl bg-emerald-500 px-5 text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-100"
                        onClick={() => openConfirm(req, 'approve')}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        className="h-9 rounded-xl bg-red-500 px-5 text-[10px] font-black uppercase text-white shadow-lg shadow-red-100"
                        onClick={() => openConfirm(req, 'reject')}
                      >
                        ปฏิเสธ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && requests.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-20 text-center font-black italic text-slate-400"
                  >
                    <CheckCircle2
                      className="mx-auto mb-2 text-slate-200"
                      size={40}
                    />
                    ไม่มีรายการรออนุมัติแล้ว
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between rounded-[2rem] border border-slate-50 bg-white p-6 shadow-xl shadow-slate-100/50">
          <div>
            <h2 className="text-xl font-black italic text-slate-800">
              Return Requests
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              มีรายการรอรับคืน {returnRequests.length} รายการ
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <RotateCcw size={24} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-white text-black shadow-xl shadow-slate-100/50">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-amber-500 text-[12px] font-black uppercase tracking-[0.2em] text-white">
              <tr>
                <th className="px-10 py-5 text-left">รายละเอียดคำขอ</th>
                <th className="px-10 py-5 text-left">ผู้แจ้งคืน</th>
                <th className="px-10 py-5 text-center">สถานะ</th>
                <th className="px-10 py-5 text-center">ยืนยันรับคืน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {returnRequests.map((req) => (
                <tr
                  key={req.id}
                  className="transition-colors hover:bg-amber-50/30"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {getRequestTitle(req)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                          req.request_type === 'computer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.request_type === 'computer'
                          ? 'COMPUTER'
                          : 'EQUIPMENT'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <RequestNoBadge req={req} />
                      <ItemCodeBadge req={req} />
                    </div>

                    <p className="mt-1 text-[12px] font-bold uppercase tracking-tighter text-slate-400">
                      {getRequestSubtitle(req)}
                    </p>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <User size={12} className="text-slate-300" />
                        {req.user_name || req.user_email || 'ไม่ทราบชื่อผู้ใช้'}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-400">
                        <Clock size={12} className="text-slate-200" />
                        {formatThaiDateTime(req.return_date)}
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-center">
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-4 py-1 text-[10px] font-black text-amber-600">
                      รอรับคืน
                    </span>
                  </td>

                  <td className="px-8 py-6 text-center">
                    <Button
                      className="h-10 rounded-xl bg-amber-500 px-5 text-[13px] font-black uppercase text-white shadow-lg shadow-amber-100"
                      onClick={() => openConfirm(req, 'confirm_return')}
                    >
                      ยืนยันรับคืน
                    </Button>
                  </td>
                </tr>
              ))}

              {!loading && returnRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-20 text-center font-black italic text-slate-400"
                  >
                    <RotateCcw
                      className="mx-auto mb-2 text-slate-200"
                      size={40}
                    />
                    ไม่มีรายการรอรับคืน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

                  <div className="flex flex-wrap gap-2">
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
                    {selected.request_type === 'computer'
                      ? 'คอมพิวเตอร์'
                      : 'อุปกรณ์'}
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
                : 'bg-amber-50'
            }`}
          >
            {actionType === 'approve' ? (
              <CheckCircle2 size={40} className="text-emerald-500" />
            ) : actionType === 'reject' ? (
              <AlertCircle size={40} className="text-red-500" />
            ) : (
              <RotateCcw size={40} className="text-amber-500" />
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
              className={`flex-[1.5] rounded-2xl py-3 font-black text-white shadow-lg ${
                actionType === 'approve'
                  ? 'bg-emerald-500'
                  : actionType === 'reject'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
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
    </DashboardLayout>
  );
}