'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Monitor,
  RotateCcw,
} from 'lucide-react';

type Booking = {
  id: string;
  item_name?: string | null;
  item_code?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  created_at: string;
  status?: string | null;
  urgent?: boolean | null;
  equipment_name?: string | null;
  reason?: string | null;
  request_type?: string | null;
  equipment?: any;
  computers?: any;
  [key: string]: any;
};

const PENDING_STATUSES = ['pending', 'Pending', 'รออนุมัติ'];
const RETURN_PENDING_STATUSES = ['return_pending', 'return_requested', 'รอรับคืน'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRooms: 5,
    totalComputers: 0,
    available: 0,
    booked: 0,
    maintenance: 0,
    pendingCount: 0,
    returnPendingCount: 0,
    urgentPendingCount: 0,
  });

  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingList, setPendingList] = useState<Booking[]>([]);

  const getDisplayName = (item: Booking) => {
    if (item.request_type === 'computer') {
      return item.computers?.pc_name || item.item_name || 'คำขอใช้คอมพิวเตอร์';
    }

    return item.equipment?.name || item.item_name || item.equipment_name || 'คำขอยืมอุปกรณ์';
  };

  const getUserDisplayName = (item: Booking) => {
    return item.user_name || item.user_email || 'ไม่ทราบชื่อผู้ใช้';
  };

  const getItemCode = (item: Booking) => {
    if (item.request_type === 'computer') {
      return item.computers?.room_name || item.computers?.pc_name || 'COMPUTER';
    }

    return item.equipment?.category || item.item_code || 'EQUIPMENT';
  };

  const isPendingStatus = (status?: string | null) => {
    if (!status) return false;
    return PENDING_STATUSES.includes(status);
  };

  const isReturnPendingStatus = (status?: string | null) => {
    if (!status) return false;
    return RETURN_PENDING_STATUSES.includes(status);
  };

  const getStatusText = (status?: string | null) => {
    if (status === 'approved') return 'อนุมัติแล้ว';
    if (status === 'rejected') return 'ปฏิเสธ';
    if (status === 'returned') return 'คืนเสร็จสิ้น';
    if (status === 'completed') return 'คืนแล้ว';
    if (status === 'checked_in') return 'กำลังใช้งาน';
    if (status === 'overdue') return 'เกินกำหนด';
    if (isReturnPendingStatus(status)) return 'รอรับคืน';
    return 'รออนุมัติ';
  };

  const getStatusStyle = (status?: string | null) => {
    if (status === 'approved') return 'border-emerald-100 bg-emerald-50 text-emerald-600';
    if (status === 'rejected') return 'border-rose-100 bg-rose-50 text-rose-600';
    if (status === 'returned' || status === 'completed') return 'border-blue-100 bg-blue-50 text-blue-600';
    if (isReturnPendingStatus(status)) return 'border-orange-100 bg-orange-50 text-orange-600';
    if (status === 'overdue') return 'border-red-100 bg-red-50 text-red-600';

    return 'border-amber-100 bg-amber-50 text-amber-600';
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const baseSelect = `
        id,
        user_name,
        user_email,
        borrow_date,
        return_date,
        status,
        request_type,
        equipment_id,
        computer_id,
        reason,
        urgent,
        created_at,
        approved_at,
        returned_at,
        equipment ( id, name, category, available_stock, status ),
        computers ( id, pc_name, room_name, status )
      `;

      const [computersRes, recentRes, allRequestsRes] = await Promise.all([
        supabase.from('computers').select('status'),
        supabase
          .from('borrow_requests')
          .select(baseSelect)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('borrow_requests')
          .select(baseSelect)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (computersRes.error) throw computersRes.error;
      if (recentRes.error) throw recentRes.error;
      if (allRequestsRes.error) throw allRequestsRes.error;

      const computers = computersRes.data ?? [];
      const recent = (recentRes.data ?? []) as Booking[];
      const allRequests = (allRequestsRes.data ?? []) as Booking[];

      const pendingRequests = allRequests.filter((item) => isPendingStatus(item.status));
      const returnPendingRequests = allRequests.filter((item) => isReturnPendingStatus(item.status));

      const urgentPending = pendingRequests.filter((item) => item.urgent === true);
      const normalPending = pendingRequests.filter((item) => item.urgent !== true);

      const mergedPending = [...urgentPending, ...normalPending]
        .sort((a, b) => {
          const urgentA = a.urgent === true ? 1 : 0;
          const urgentB = b.urgent === true ? 1 : 0;

          if (urgentA !== urgentB) return urgentB - urgentA;

          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, 5);

      setStats({
        totalRooms: 5,
        totalComputers: computers.length,
        available: computers.filter((c: any) => c.status === 'available').length,
        booked: computers.filter((c: any) => c.status === 'booked' || c.status === 'busy').length,
        maintenance: computers.filter((c: any) => c.status === 'maintenance').length,
        pendingCount: pendingRequests.length,
        returnPendingCount: returnPendingRequests.length,
        urgentPendingCount: urgentPending.length,
      });

      setRecentBookings(recent);
      setPendingList(mergedPending);
    } catch (error: any) {
      console.error('Fetch dashboard error:', error?.message || error);

      setRecentBookings([]);
      setPendingList([]);
      setStats((prev) => ({
        ...prev,
        pendingCount: 0,
        returnPendingCount: 0,
        urgentPendingCount: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrow_requests' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'computers' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  return (
    <DashboardLayout title="Admin Dashboard" allowedRoles={['admin']}>
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="animate-in space-y-8 fade-in duration-500">
          {stats.urgentPendingCount > 0 && (
            <div className="rounded-[2rem] border border-red-100 bg-gradient-to-r from-red-50 to-white p-6 shadow-xl shadow-red-100/50">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-red-600">
                      High Priority Alert
                    </p>
                    <h2 className="text-xl font-black text-slate-800">
                      พบคำขอเร่งด่วน {stats.urgentPendingCount} รายการ
                    </h2>
                  </div>
                </div>

                <Link href="/approvals">
                  <button className="rounded-2xl bg-red-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95">
                    จัดการทันที
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <StatBox title="ห้องทั้งหมด" value={stats.totalRooms} color="blue" icon={<LayoutDashboard size={16} />} />
            <StatBox title="คอมพิวเตอร์" value={stats.totalComputers} color="teal" icon={<Monitor size={16} />} />
            <StatBox title="พร้อมใช้" value={stats.available} color="green" icon={<CheckCircle2 size={16} />} />
            <StatBox title="รออนุมัติ" value={stats.pendingCount} color="amber" icon={<Clock size={16} />} isHighlight />
            <StatBox title="รอรับคืน" value={stats.returnPendingCount} color="orange" icon={<RotateCcw size={16} />} isHighlight />
            <StatBox title="คำขอด่วน" value={stats.urgentPendingCount} color="red" icon={<AlertCircle size={16} />} isHighlight />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between px-2">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  ประวัติการจองล่าสุด
                </h2>

                <Link href="/bookings" className="text-xs font-bold uppercase tracking-tighter text-blue-600 hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>

              <div className="space-y-3 rounded-[2.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                {recentBookings.length > 0 ? (
                  recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`group rounded-3xl border p-4 transition-all hover:shadow-md ${
                        b.urgent ? 'border-red-100 bg-red-50/60' : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                              b.status === 'returned'
                                ? 'bg-blue-50 text-blue-600'
                                : b.urgent
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {b.status === 'returned' ? '✅' : b.urgent ? '🚨' : '💻'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-slate-800 group-hover:text-blue-600">
                                {getDisplayName(b)}
                              </p>

                              {b.urgent && (
                                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white">
                                  เร่งด่วน
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-slate-500">
                              ผู้จอง: {getUserDisplayName(b)}
                            </p>

                            <p className="text-xs font-bold text-slate-400">
                              รายละเอียด: {getItemCode(b)}
                            </p>

                            <p className="text-xs font-bold text-slate-400">
                              วันที่ขอ:{' '}
                              {new Date(b.created_at).toLocaleDateString('th-TH')}{' '}
                              เวลา{' '}
                              {new Date(b.created_at).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              น.
                            </p>

                            {b.reason && (
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              เหตุผล: {b.reason}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className={`shrink-0 rounded-full border px-4 py-1 text-[14px] font-black ${getStatusStyle(b.status)}`}>
                          {getStatusText(b.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center font-bold text-slate-300">
                    ไม่มีข้อมูลการจอง
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 px-2 text-lg font-black text-slate-800">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                รายการรออนุมัติ
              </h2>

              <div className="space-y-4">
                {pendingList.length > 0 ? (
                  pendingList.map((req) => (
                    <div
                      key={req.id}
                      className={`rounded-[2rem] border p-5 transition-all hover:shadow-lg ${
                        req.urgent ? 'border-red-100 bg-red-50 ring-2 ring-red-500/5' : 'border-slate-100 bg-white shadow-sm'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black text-slate-800">
                              {getDisplayName(req)}
                            </p>

                            {req.urgent ? (
                              <span className="animate-pulse rounded-lg bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                                Urgent
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase text-slate-600">
                                Normal
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {getItemCode(req)}
                          </p>

                          {req.reason && (
                            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                              เหตุผล: {req.reason}
                            </p>
                          )}
                        </div>

                        <Link href={`/approvals?id=${req.id}`}>
                          <button
                            className={`rounded-xl p-2 text-white shadow-lg transition-all active:scale-90 ${
                              req.urgent ? 'bg-red-600 shadow-red-200' : 'bg-blue-600 shadow-blue-200'
                            }`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="text-[11px] font-bold text-slate-500">
                          👤 {getUserDisplayName(req)}
                        </div>

                        <div className={`text-[10px] font-black ${req.urgent ? 'text-red-500' : 'text-slate-400'}`}>
                          ⏰{' '}
                          {new Date(req.created_at).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          น.
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold italic tracking-tight text-slate-400">
                      ไม่มีรายการค้าง
                    </p>
                  </div>
                )}

                <Link href="/approvals" className="mt-4 block">
                  <button className="group flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-slate-900 py-4 text-xs font-black text-white shadow-xl shadow-slate-200 transition-all hover:bg-black">
                    จัดการทั้งหมด
                    <span className="rounded-full bg-white/20 px-2 py-0.5 transition-colors group-hover:bg-white/40">
                      {stats.pendingCount + stats.returnPendingCount}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatBox({ title, value, color, icon, isHighlight = false }: any) {
  const colorMaps: any = {
    blue: 'border-blue-600 text-blue-600 bg-blue-50/30',
    teal: 'border-teal-600 text-teal-600 bg-teal-50/30',
    green: 'border-emerald-600 text-emerald-600 bg-emerald-50/30',
    yellow: 'border-amber-500 text-amber-500 bg-amber-50/30',
    amber: 'border-amber-500 text-amber-500 bg-amber-50/30',
    orange: 'border-orange-500 text-orange-500 bg-orange-50/30',
    red: 'border-red-600 text-red-600 bg-red-50/30',
  };

  return (
    <div
      className={`rounded-3xl border-b-4 bg-white p-5 shadow-xl shadow-slate-100/50 transition-all hover:-translate-y-1 ${colorMaps[color]}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </h3>
        <div className="rounded-lg bg-white p-1.5 shadow-sm">{icon}</div>
      </div>

      <p
        className={`text-2xl font-black tracking-tight tabular-nums ${
          isHighlight ? colorMaps[color].split(' ')[1] : 'text-slate-800'
        }`}
      >
        {value}
      </p>
    </div>
  );
}