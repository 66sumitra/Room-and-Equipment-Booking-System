'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchAdminReportData();
  }, []);

  const fetchAdminReportData = async () => {
    const { data, error } = await supabase
      .from('borrow_requests')
      .select(`
        id,
        user_name,
        borrow_date,
        status,
        equipment ( name )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
      setStats({
        total: data.length,
        approved: data.filter(item => item.status === 'approved').length,
        pending: data.filter(item => item.status === 'pending').length,
        rejected: data.filter(item => item.status === 'rejected').length,
      });
    }
  };

  return (
    <DashboardLayout
      title="Admin: รายงานสรุปผลการจอง"
      actionButton={
        /* เพิ่มปุ่มพิมพ์ที่เรียกคำสั่ง Print */
        <Button variant="success" size="md" onClick={() => window.print()} className="no-print">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            พิมพ์รายงาน (PDF)
          </span>
        </Button>
      }
    >
      {/* ส่วน CSS สำหรับปรับแต่งการพิมพ์ */}
      <style jsx global>{`
        @media print {
          /* ซ่อนแถบเมนูข้าง, ปุ่มกด และส่วนที่ไม่ใช่เนื้อหาหลัก */
          aside, nav, .no-print, button, .action-button {
            display: none !important;
          }
          /* ปรับเนื้อหาให้เต็มหน้ากระดาษ */
          main, .dashboard-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* ปรับตารางให้อ่านง่ายขึ้นในกระดาษ */
          table {
            border: 1px solid #000 !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            color: black !important;
          }
          .stats-grid {
            display: flex !important;
            gap: 10px !important;
          }
          .card {
            border: 1px solid #ccc !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="space-y-6 print-container">
        {/* Header สำหรับ Admin เท่านั้น */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 no-print">
          <p className="text-sm text-gray-600 font-semibold uppercase">
            สถานะแผงควบคุม: <span className="text-blue-600">ผู้ดูแลระบบ (ADMINISTRATOR)</span>
          </p>
        </div>

        {/* กล่องสรุปสถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stats-grid">
          <div className="bg-blue-600 text-white rounded-xl p-6 shadow card">
            <p className="text-xs font-bold uppercase opacity-80">ทั้งหมด</p>
            <h3 className="text-3xl font-black">{stats.total}</h3>
          </div>
          <div className="bg-emerald-500 text-white rounded-xl p-6 shadow card">
            <p className="text-xs font-bold uppercase opacity-80">อนุมัติแล้ว</p>
            <h3 className="text-3xl font-black">{stats.approved}</h3>
          </div>
          <div className="bg-orange-500 text-white rounded-xl p-6 shadow card">
            <p className="text-xs font-bold uppercase opacity-80">รออนุมัติ</p>
            <h3 className="text-3xl font-black">{stats.pending}</h3>
          </div>
          <div className="bg-red-500 text-white rounded-xl p-6 shadow card">
            <p className="text-xs font-bold uppercase opacity-80">ไม่อนุมัติ</p>
            <h3 className="text-3xl font-black">{stats.rejected}</h3>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 p-4 no-print">
            <h3 className="text-white font-bold">บันทึกข้อมูลส่วนกลาง (Admin Log)</h3>
          </div>
          {/* ส่วนนี้จะโชว์เป็นหัวข้อในกระดาษ */}
          <h2 className="hidden print:block text-xl font-bold mb-4 text-center">รายงานสรุปผลการจองอุปกรณ์</h2>
          
          <table className="w-full text-black">
            <thead className="bg-gray-100 border-b">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs font-black uppercase">อุปกรณ์</th>
                <th className="px-6 py-4 text-xs font-black uppercase">ผู้ยืม</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-bold">{item.equipment?.name}</td>
                  <td className="px-6 py-4 font-medium">{item.user_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-black border ${
                      item.status === 'approved' ? 'text-emerald-700 border-emerald-200' :
                      item.status === 'pending' ? 'text-orange-700 border-orange-200' :
                      'text-red-700 border-red-200'
                    }`}>
                      {item.status === 'approved' ? 'อนุมัติสำเร็จ' :
                       item.status === 'pending' ? 'รอตรวจสอบ' : 'ปฏิเสธ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}