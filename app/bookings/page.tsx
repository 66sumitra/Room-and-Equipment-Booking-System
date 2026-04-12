'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';

export default function BookingsPage() {
  // 1. สร้างตัวเชื่อมต่อ (ใช้ URL และ Key เดิม)
  const supabase = createClient(
    'https://ruqklydhqbzfhucvrbgw.supabase.co',
    'eyJxhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cWtseWRocWJ6Zmh1Y3ZyYmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.hGjjKM_z7WBpMyQOZXllmn4hk3bUZJiy9pc50fI8z4s'
  );

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. ดึงข้อมูลจริง
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('borrow_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setBookings(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // 3. คำนวณตัวเลขสถิติ (ให้ตรงกับข้อมูลจริง)
  const total = bookings.length;
  const approved = bookings.filter(b => b.status === 'approved').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const rejected = bookings.filter(b => b.status === 'rejected').length;

  return (
    <DashboardLayout
      title="รายงานการจอง"
      actionButton={
        <Button variant="success" size="md">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ส่งออกรายงาน
          </span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Card 1: ทั้งหมด */}
          <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-blue-100 text-sm">ทั้งหมด</p>
              </div>
            </div>
          </div>
          
          {/* Card 2: อนุมัติ */}
          <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-3xl font-bold">{approved}</p>
                <p className="text-green-100 text-sm">อนุมัติ</p>
              </div>
            </div>
          </div>
          
          {/* Card 3: รออนุมัติ */}
          <div className="bg-orange-500 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-3xl font-bold">{pending}</p>
                <p className="text-orange-100 text-sm">รออนุมัติ</p>
              </div>
            </div>
          </div>
          
          {/* Card 4: ไม่อนุมัติ (ผมเปลี่ยนเป็นสีแดงให้นะครับ จะได้สื่อความหมายชัดเจน) */}
          <div className="bg-red-500 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-3xl font-bold">{rejected}</p>
                <p className="text-red-100 text-sm">ไม่อนุมัติ</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            กรองข้อมูล
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>ทั้งหมด</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>ทั้งหมด</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="success" size="md">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                กรองข้อมูล
              </span>
            </Button>
            <Button variant="secondary" size="md">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ล้าง
              </span>
            </Button>
          </div>
        </div>

        {/* Table Section (ส่วนที่เพิ่มมาให้ เพื่อให้เห็นรายการจริง) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จอง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อุปกรณ์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">ไม่มีข้อมูล</td></tr>
              ) : (
                bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.user_name}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-mono">{item.equipment_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.status === 'approved' ? 'อนุมัติ' : 
                         item.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอตรวจสอบ'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}