'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('borrow_requests')
      .select(`
        id,
        user_name,
        borrow_date,
        status,
        equipment_id,
        reason,
        equipment (
          name,
          category
        )
      `)
      .eq('status', 'pending');

    if (!error) {
      setRequests(data || []);
    } else {
      console.error("Fetch Error:", error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: any) => {
    await supabase
      .from('borrow_requests')
      .update({ status: 'approved' })
      .eq('id', req.id);

    await supabase
      .from('equipment')
      .update({ status: 'busy' })
      .eq('id', req.equipment_id);

    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setIsDetailModalOpen(false);
    alert('อนุมัติการยืมเรียบร้อย');
  };

  const handleReject = async (req: any) => {
    if (!confirm('ไม่อนุมัติรายการนี้ใช่ไหม')) return;

    await supabase
      .from('borrow_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id);

    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setIsDetailModalOpen(false);
  };

  return (
    <DashboardLayout title="อนุมัติการขอใช้อุปกรณ์">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 text-black">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">อุปกรณ์</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">ผู้ขอ</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">วันเวลาที่ขอ</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase">จัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-black">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{req.equipment?.name}</p>
                  <p className="text-xs text-blue-600 font-medium">{req.equipment?.category}</p>
                </td>
                <td className="px-6 py-4 font-medium">{req.user_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{req.borrow_date}</td>
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

                    {/* ปรับสีปุ่มปฏิเสธให้เข้มขึ้นชัดเจน */}
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

            {requests.length === 0 && (
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
              <p><span className="text-gray-500 font-medium">📅 เวลา:</span> {selected.borrow_date}</p>
              <p><span className="text-gray-500 font-medium">📝 เหตุผล:</span> <span className="text-blue-700 font-semibold">{selected.reason || 'ไม่ได้ระบุ'}</span></p>
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