'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  LayoutDashboard,
  Calendar,
  Search,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchAdminReportData();
  }, []);

  const fetchAdminReportData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('borrow_requests')
      .select(
        `
        id,
        request_no,
        request_type,
        user_name,
        user_email,
        borrow_date,
        return_date,
        status,
        reason,
        created_at,
        equipment (
          name,
          category,
          code,
          equipment_code,
          item_code
        ),
        computers (
          pc_name,
          room_name
        )
      `
      )
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
      setStats({
        total: data.length,
        approved: data.filter((i) => i.status === 'approved').length,
        pending: data.filter((i) => i.status === 'pending').length,
        rejected: data.filter((i) => i.status === 'rejected').length,
      });
    }

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';

    return new Date(dateStr).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequestNo = (item: any) => {
    return item?.request_no || 'ยังไม่มีเลขคำขอ';
  };

  const getItemName = (item: any) => {
    if (item.request_type === 'computer') {
      return item.computers?.pc_name || 'คอมพิวเตอร์';
    }

    return item.equipment?.name || 'อุปกรณ์';
  };

  const getItemCode = (item: any) => {
    if (item.request_type === 'computer') {
      return item.computers?.pc_name || 'ไม่มีรหัสคอมพิวเตอร์';
    }

    return (
      item.equipment?.code ||
      item.equipment?.equipment_code ||
      item.equipment?.item_code ||
      'ไม่มีรหัสอุปกรณ์'
    );
  };

  const getItemCodeLabel = (item: any) => {
    return item.request_type === 'computer' ? 'รหัสคอมพิวเตอร์' : 'รหัสอุปกรณ์';
  };

  const getItemDetail = (item: any) => {
    if (item.request_type === 'computer') {
      return item.computers?.room_name || 'ไม่ระบุห้อง';
    }

    return item.equipment?.category || 'ไม่ระบุหมวดหมู่';
  };

  const getTypeText = (item: any) => {
    return item.request_type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
  };

  const getUserName = (item: any) => {
    return item.user_name || item.user_email || 'ไม่ระบุผู้ใช้งาน';
  };

  const getThaiStatus = (status: string) => {
    if (status === 'approved') return 'อนุมัติ';
    if (status === 'pending') return 'รอตรวจ';
    if (status === 'rejected') return 'ปฏิเสธ';
    if (status === 'returned') return 'คืนแล้ว';
    if (status === 'return_pending') return 'รอรับคืน';
    return status || '-';
  };

  return (
    <DashboardLayout title="Report System">
      <style jsx global>{`
        .print-only {
          display: none;
        }

        @media print {
          nav,
          aside,
          .no-print,
          button,
          header,
          .user-status {
            display: none !important;
          }

          main,
          .dashboard-content {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          .print-only {
            display: block !important;
            width: 100% !important;
          }

          body {
            background: white !important;
            color: #1e293b !important;
          }

          @page {
            size: A4 landscape;
            margin: 14mm;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid #e2e8f0 !important;
          }

          th {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            padding: 10px 6px !important;
            color: #475569 !important;
            font-size: 9pt !important;
          }

          td {
            border: 1px solid #f1f5f9 !important;
            padding: 8px 6px !important;
            font-size: 9pt !important;
            color: #334155 !important;
            vertical-align: top !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto min-h-screen max-w-6xl space-y-8 p-4 md:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
              <LayoutDashboard size={32} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">
                Report Insights
              </h1>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
                Analytics Dashboard
              </p>
            </div>
          </div>

          <Button
            onClick={() => window.print()}
            className="flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-7 font-bold text-white shadow-2xl transition-all hover:bg-black active:scale-95"
          >
            <Printer size={20} />
            พิมพ์รายงานสรุปผล
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatCard
            label="Total Bookings"
            value={stats.total}
            color="indigo"
            icon={<FileText size={20} />}
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            color="emerald"
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="amber"
            icon={<Clock size={20} />}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            color="rose"
            icon={<XCircle size={20} />}
          />
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
              <span className="h-8 w-2 rounded-full bg-indigo-600"></span>
              Recent Transactions
            </h2>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="animate-pulse p-20 text-center text-slate-400">
                Loading database...
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl shadow-inner">
                      {item.request_type === 'computer' ? '💻' : '📦'}
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <div className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-600">
                          เลขคำขอยืม: {getRequestNo(item)}
                        </div>

                        <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-600">
                          {getItemCodeLabel(item)}: {getItemCode(item)}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold leading-tight text-slate-800">
                        {getItemName(item)}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-indigo-500">
                        {getUserName(item)}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-400">
                        ประเภท: {getTypeText(item)} · รายละเอียด:{' '}
                        {getItemDetail(item)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-10 md:justify-end">
                    <div className="hidden text-right lg:block">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-tighter text-slate-300">
                        Time Period
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar size={14} className="text-indigo-300" />
                        {formatDate(item.borrow_date)}
                      </div>
                    </div>

                    <DashboardStatusBadge status={item.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center">
                <Search size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">
                  ยังไม่มีข้อมูลรายการจอง
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="print-only">
        <div className="relative mb-10 border-b border-slate-200 pb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            รายงานสรุปผลการจองและเบิก-ยืมอุปกรณ์
          </h1>
          <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
            Faculty of Engineering and Technology (PIM)
          </p>

          <div className="mt-8 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>REFERENCE: RE-SUM-2026</span>
            <span>PRINTED DATE: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="w-8 text-center">#</th>
              <th className="w-32 text-left">เลขคำขอยืม</th>
              <th className="w-28 text-left">รหัสรายการ</th>
              <th className="text-left">รายการ</th>
              <th className="w-24 text-left">ประเภท</th>
              <th className="w-34 text-left">ผู้เบิก/ยืม</th>
              <th className="w-44 text-center font-bold">
                กำหนดเวลา ยืม - คืน
              </th>
              <th className="w-20 text-center">สถานะ</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center text-slate-400">{index + 1}</td>

                <td className="font-bold text-indigo-600">
                  {getRequestNo(item)}
                </td>

                <td className="font-bold text-blue-600">
                  {getItemCode(item)}
                </td>

                <td>
                  <p className="font-bold text-slate-800">{getItemName(item)}</p>
                  <p className="text-[9px] text-slate-400">
                    {getItemDetail(item)}
                  </p>
                </td>

                <td className="font-medium">{getTypeText(item)}</td>

                <td className="font-medium">{getUserName(item)}</td>

                <td className="text-center text-[9px] font-medium text-slate-500">
                  {formatDate(item.borrow_date)} <br /> ถึง <br />{' '}
                  {formatDate(item.return_date)}
                </td>

                <td className="text-center font-bold">
                  <span
                    className={
                      item.status === 'approved'
                        ? 'text-emerald-600'
                        : item.status === 'pending'
                        ? 'text-indigo-600'
                        : item.status === 'rejected'
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }
                  >
                    {getThaiStatus(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-32 flex justify-end">
          <div className="w-80 text-center">
            <p className="mb-20 text-xs font-bold uppercase tracking-widest text-slate-400 italic">
              Certified By Administrator
            </p>
            <div className="mb-2 w-full border-b border-slate-200"></div>
            <p className="text-sm font-bold text-slate-800">
              ( ........................................................... )
            </p>
            <p className="mt-2 text-[10px] font-bold tracking-tighter text-slate-400">
              วันที่ยืนยันเอกสาร: ____ / ____ / ____
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, color, icon }: any) {
  const colorMaps: any = {
    indigo:
      'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-100/50',
    emerald:
      'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/50',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 shadow-rose-100/50',
  };

  return (
    <div
      className={`rounded-[2.5rem] border p-6 shadow-xl transition-all hover:scale-105 ${colorMaps[color]}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">
          {label}
        </span>
        <div className="rounded-xl bg-white p-2 shadow-sm">{icon}</div>
      </div>
      <p className="text-3xl font-black tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function DashboardStatusBadge({ status }: { status: string }) {
  const configs: any = {
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    returned: 'bg-blue-50 text-blue-600 border-blue-100',
    return_pending: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const labelMap: any = {
    approved: 'APPROVED',
    pending: 'PENDING',
    rejected: 'REJECTED',
    returned: 'RETURNED',
    return_pending: 'RETURN PENDING',
  };

  const dotMap: any = {
    approved: 'bg-emerald-500',
    pending: 'bg-indigo-500',
    rejected: 'bg-rose-500',
    returned: 'bg-blue-500',
    return_pending: 'bg-amber-500',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-[11px] font-bold shadow-sm ${
        configs[status] || 'bg-slate-50 text-slate-400'
      }`}
    >
      <span
        className={`h-2 w-2 animate-pulse rounded-full ${
          dotMap[status] || 'bg-slate-400'
        }`}
      ></span>
      {labelMap[status] || status || 'UNKNOWN'}
    </div>
  );
}