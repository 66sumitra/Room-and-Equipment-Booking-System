'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileText, CheckCircle, Clock, XCircle, Printer, LayoutDashboard, Calendar, Search
} from 'lucide-react';

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    fetchAdminReportData();
  }, []);

  const fetchAdminReportData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('borrow_requests')
      .select(`id, user_name, borrow_date, return_date, status, equipment ( name )`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
      setStats({
        total: data.length,
        approved: data.filter(i => i.status === 'approved').length,
        pending: data.filter(i => i.status === 'pending').length,
        rejected: data.filter(i => i.status === 'rejected').length,
      });
    }
    setLoading(false);
  };

  // ฟังก์ชันช่วยจัดรูปแบบวันที่ให้อ่านง่าย
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 16);
  };

  return (
    <DashboardLayout title="Report System">
      
      {/* 🛠 CSS: แยกโลก Screen (Soft Dashboard) กับ Print (Clean Report) */}
      <style jsx global>{`
        .print-only { display: none; }
        
        @media print {
          /* ซ่อนส่วน UI เว็บ */
          nav, aside, .no-print, button, header, .user-status { display: none !important; }
          main, .dashboard-content { margin: 0 !important; padding: 0 !important; display: block !important; }
          
          /* แสดงแผ่นรายงานทางการแบบสะอาดตา */
          .print-only { display: block !important; width: 100% !important; }
          body { background: white !important; color: #1e293b !important; }
          @page { size: A4; margin: 20mm; }
          
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; }
          th { background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; padding: 12px 8px !important; color: #475569 !important; font-size: 10pt !important; }
          td { border: 1px solid #f1f5f9 !important; padding: 10px 8px !important; font-size: 10pt !important; color: #334155 !important; }
        }
      `}</style>

      {/* --- [1] หน้าจอ DASHBOARD (สไตล์ Modern Soft UI) --- */}
      <div className="no-print space-y-8 max-w-6xl mx-auto p-4 md:p-10 min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 flex items-center justify-center">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Report Insights</h1>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Analytics Dashboard</p>
            </div>
          </div>
          <Button 
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-black text-white px-10 py-7 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-3 font-bold"
          >
            <Printer size={20} /> พิมพ์รายงานสรุปผล
          </Button>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Total Bookings" value={stats.total} color="indigo" icon={<FileText size={20} />} />
          <StatCard label="Approved" value={stats.approved} color="emerald" icon={<CheckCircle size={20} />} />
          <StatCard label="Pending" value={stats.pending} color="amber" icon={<Clock size={20} />} />
          <StatCard label="Rejected" value={stats.rejected} color="rose" icon={<XCircle size={20} />} />
        </div>

        {/* รายการแบบ Modern Cards */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              Recent Transactions
            </h2>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="p-20 text-center animate-pulse text-slate-400">Loading database...</div>
            ) : bookings.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-2xl flex items-center justify-center shadow-inner">
                    {item.equipment?.name?.toLowerCase().includes('computer') ? '💻' : '📦'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.equipment?.name || 'Unknown Item'}</h3>
                    <p className="text-sm text-indigo-500 font-bold mt-1">{item.user_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-10">
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] uppercase font-black text-slate-300 tracking-tighter mb-1">Time Period</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="text-indigo-300" />
                      {formatDate(item.borrow_date)}
                    </div>
                  </div>
                  <DashboardStatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- [2] ส่วนใบรายงานทางการ (Clean & Comfortable Print) --- */}
      <div className="print-only">
        <div className="text-center mb-10 pb-8 border-b border-slate-200 relative">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">รายงานสรุปผลการจองและเบิก-ยืมอุปกรณ์</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Faculty of Engineering and Technology (PIM)</p>
          
          <div className="mt-8 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>REFERENCE: RE-SUM-2026</span>
            <span>PRINTED DATE: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th className="text-left">ชื่อรายการอุปกรณ์</th>
              <th className="w-40 text-left">ผู้เบิก/ยืม</th>
              <th className="w-52 text-center font-bold">กำหนดเวลา ยืม - คืน</th>
              <th className="w-28 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center text-slate-400">{index + 1}</td>
                <td className="font-bold text-slate-800">{item.equipment?.name}</td>
                <td className="font-medium">{item.user_name}</td>
                <td className="text-center text-[9px] text-slate-500 font-medium">
                  {formatDate(item.borrow_date)} <br/> ถึง <br/> {formatDate(item.return_date)}
                </td>
                <td className="text-center font-bold">
                  <span className={item.status === 'approved' ? 'text-emerald-600' : item.status === 'pending' ? 'text-indigo-600' : 'text-rose-600'}>
                    {item.status === 'approved' ? 'อนุมัติ' : item.status === 'pending' ? 'รอตรวจ' : 'ปฏิเสธ'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Area */}
        <div className="mt-32 flex justify-end">
          <div className="text-center w-80">
            <p className="mb-20 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Certified By Administrator</p>
            <div className="border-b border-slate-200 w-full mb-2"></div>
            <p className="text-sm font-bold text-slate-800">( ........................................................... )</p>
            <p className="text-[10px] font-bold mt-2 text-slate-400 tracking-tighter">วันที่ยืนยันเอกสาร: ____ / ____ / ____</p>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}

// Re-usable Stat Card
function StatCard({ label, value, color, icon }: any) {
  const colorMaps: any = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-100/50",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/50",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50",
    rose: "text-rose-600 bg-rose-50 border-rose-100 shadow-rose-100/50",
  };
  return (
    <div className={`p-6 rounded-[2.5rem] border ${colorMaps[color]} shadow-xl transition-all hover:scale-105`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">{label}</span>
        <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
      </div>
      <p className="text-3xl font-black tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

// Status Badge for Dashboard
function DashboardStatusBadge({ status }: { status: string }) {
  const configs: any = {
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-indigo-50 text-indigo-600 border-indigo-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-[11px] shadow-sm ${configs[status] || 'bg-slate-50 text-slate-400'}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'approved' ? 'bg-emerald-500' : status === 'pending' ? 'bg-indigo-500' : 'bg-rose-500'}`}></span>
      {status === 'approved' ? 'APPROVED' : status === 'pending' ? 'PENDING' : 'REJECTED'}
    </div>
  );
}