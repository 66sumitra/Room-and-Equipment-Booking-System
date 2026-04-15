'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabaseClient';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ฟังก์ชันดึงข้อมูลรายการที่รออนุมัติ
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_requests')
        .select(`
          id,
          user_name,
          borrow_date,
          status,
          equipment_id,
          reason,
          created_at,
          equipment (
            name,
            category
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch Error:", error.message);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ฟังก์ชันอนุมัติ
  const handleApprove = async (req: any) => {
    try {
      // 1. อัพเดทสถานะการยืมเป็น approved
      const { error: reqError } = await supabase
        .from('borrow_requests')
        .update({ status: 'approved' })
        .eq('id', req.id);

      if (reqError) throw reqError;

      // 2. อัพเดทสถานะอุปกรณ์เป็น busy
      const { error: equipError } = await supabase
        .from('equipment')
        .update({ status: 'busy' })
        .eq('id', req.equipment_id);

      if (equipError) throw equipError;

      alert('อนุมัติการยืมเรียบร้อย ✅');
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setIsDetailModalOpen(false);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // ฟังก์ชันปฏิเสธ
  const handleReject = async (req: any) => {
    if (!confirm('ยืนยันที่จะปฏิเสธคำขอนี้?')) return;

    try {
      // 1. อัพเดทสถานะการยืมเป็น rejected
      const { error: reqError } = await supabase
        .from('borrow_requests')
        .update({ status: 'rejected' })
        .eq('id', req.id);

      if (reqError) throw reqError;

      // 2. คืนสถานะอุปกรณ์เป็น available (เผื่อกรณีระบบล็อคไว้ก่อนหน้า)
      await supabase
        .from('equipment')
        .update({ status: 'available' })
        .eq('id', req.equipment_id);

      alert('ปฏิเสธคำขอแล้ว ❌');
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setIsDetailModalOpen(false);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <DashboardLayout title="รายการอนุมัติการใช้อุปกรณ์">
      <div className="space-y-6">
        {/* ส่วนหัวแสดงจำนวนรายการ */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">รายการรออนุมัติ</h2>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? 'กำลังโหลดข้อมูล...' : `มีรายการค้างอยู่ ${requests.length} รายการ`}
          </p>
        </div>

        {/* ตารางแสดงรายการ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-black">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">อุปกรณ์</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ผู้ขอ</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">วันเวลาที่ขอ</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-black">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{req.equipment?.name || 'ไม่ระบุชื่อ'}</p>
                    <p className="text-xs text-blue-600 font-medium">{req.equipment?.category}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{req.user_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {req.borrow_date || new Date(req.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5"
                        onClick={() => {
                          setSelected(req);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        ดูเหตุผล
                      </Button>

                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5"
                        onClick={() => handleApprove(req)}
                      >
                        อนุมัติ
                      </Button>

                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5"
                        onClick={() => handleReject(req)}
                      >
                        ไม่อนุมัติ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* กรณีไม่มีข้อมูล */}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-400">
                    <p className="text-lg font-medium">ไม่มีรายการรออนุมัติ</p>
                    <p className="text-sm">คำขอยืมอุปกรณ์ทั้งหมดได้รับการจัดการแล้ว</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal แสดงรายละเอียด */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="รายละเอียดการขอยืม"
      >
        {selected && (
          <div className="space-y-4 text-gray-800">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
              <p><span className="text-gray-500 font-medium">👤 ผู้ขอ:</span> {selected.user_name}</p>
              <p><span className="text-gray-500 font-medium">📦 อุปกรณ์:</span> {selected.equipment?.name}</p>
              <p><span className="text-gray-500 font-medium">📅 วันที่ขอ:</span> {selected.borrow_date}</p>
              <p><span className="text-gray-500 font-medium">📝 เหตุผลการยืม:</span></p>
              <div className="bg-white p-3 rounded border border-gray-200 text-blue-700 font-semibold">
                {selected.reason || 'ไม่ได้ระบุเหตุผล'}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold"
                onClick={() => handleApprove(selected)}
              >
                อนุมัติคำขอ
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 font-bold shadow-md"
                onClick={() => handleReject(selected)}
              >
                ปฏิเสธคำขอ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}