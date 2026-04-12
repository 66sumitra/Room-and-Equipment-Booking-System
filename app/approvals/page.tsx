'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ApprovalsPage() {
  const supabase = createClient(
    'https://ruqklydhqbzfhucvrbgw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cWtseWRocWJ6Zmh1Y3ZyYmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.hGjjKM_z7WBpMyQOZXllmn4hk3bUZJiy9pc50fI8z4s'
  );

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูล (FINAL STABLE VERSION: SELECT *)
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*') // 👈 ใช้ SELECT * เท่านั้น เพื่อความเสถียร
        .order('created_at', { ascending: false });

      if (error) {
        alert("API ERROR: " + error.message); 
      } else if (data) {
        setRequests(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('borrow_requests').update({ status: 'approved' }).eq('id', id);
    if (!error) { alert('อนุมัติเรียบร้อย ✅'); fetchRequests(); } else { alert('Error: ' + error.message); }
  };

  const handleReject = async (req: any) => {
    if (!confirm('ยืนยันที่จะปฏิเสธคำขอนี้? (ของจะถูกคืนเข้าสต็อก)')) return;

    const { error: reqError } = await supabase.from('borrow_requests').update({ status: 'rejected' }).eq('id', req.id);
    if (reqError) { alert('Error Updating Request: ' + reqError.message); return; }

    const { error: equipError } = await supabase
      .from('equipment')
      .update({ status: 'available' })
      .eq('id', req.equipment_id); // คืนสต็อกด้วย UUID

    if (!equipError) {
      alert('ปฏิเสธคำขอแล้ว ❌ (คืนของเข้าสต็อกเรียบร้อย)');
      fetchRequests();
    } else {
      alert('Error Restoring Stock: ' + equipError.message);
    }
  };

  return (
    <DashboardLayout title="รายการอนุมัติ">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800">รายการรออนุมัติ</h2>
          <p className="text-sm text-gray-600 mt-1">ทั้งหมด {requests.length} รายการ</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ขอ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อุปกรณ์ที่ขอ (ID)</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เหตุผล</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {req.user_name || 'ไม่ระบุชื่อผู้ใช้งาน'} 
                      </td>
                      {/* 💡 แสดงผล UUID ดิบๆ ที่ใช้งานได้จริง (แทนการแสดงชื่อที่พัง) */}
                      <td className="px-6 py-4 text-sm text-blue-600 font-mono font-bold">
                         {req.equipment_id} 
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {req.status === 'pending' ? 'รออนุมัติ' : req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(req.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition">อนุมัติ</button>
                            <button onClick={() => handleReject(req)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">ไม่</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}