'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 5,
    totalComputers: 0,
    available: 0,
    booked: 0,
    maintenance: 0,
    pendingCount: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // 1. ดึงข้อมูลสถิติคอมพิวเตอร์
    const { data: computers } = await supabase.from('computers').select('status');
    
    // 2. นับจำนวนรายการที่รออนุมัติ
    const { count: pCount } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // 3. ดึงประวัติการจองล่าสุด
    const { data: bookings } = await supabase
      .from('borrow_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (computers) {
      setStats(prev => ({
        ...prev,
        totalComputers: computers.length,
        available: computers.filter(c => c.status === 'available').length,
        booked: computers.filter(c => c.status === 'booked').length,
        maintenance: computers.filter(c => c.status === 'maintenance').length,
        pendingCount: pCount || 0
      }));
    }
    if (bookings) setRecentBookings(bookings);
  };

  return (
    <DashboardLayout title="ระบบจัดการห้องคอมและอุปกรณ์">
      <div className="space-y-6 text-black">
        
        {/* แถวการ์ดสถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">ห้องทั้งหมด</h3>
            <p className="text-2xl font-black">{stats.totalRooms}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-teal-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">คอมพิวเตอร์</h3>
            <p className="text-2xl font-black">{stats.totalComputers}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">พร้อมใช้งาน</h3>
            <p className="text-2xl font-black text-green-600">{stats.available}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase">รออนุมัติ</h3>
            <p className="text-2xl font-black text-yellow-600">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ประวัติการจอง */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-black">📅 ประวัติการจองล่าสุด</h2>
              <Link href="/admin/bookings" className="text-blue-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="p-4 space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">💻</div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{b.item_name || 'PC-Unknown'}</p>
                        <p className="text-[11px] text-gray-500 font-bold">{b.user_name} • {new Date(b.created_at).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${b.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {b.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-400 font-bold">ไม่มีข้อมูลการจอง</p>
              )}
            </div>
          </div>

          {/* รายการอนุมัติด่วน */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-black mb-4 text-orange-600">⚠️ ต้องอนุมัติด่วน</h2>
            <div className="space-y-4">
               {recentBookings.filter(b => b.status === 'pending').length > 0 ? (
                 recentBookings.filter(b => b.status === 'pending').slice(0, 3).map((req) => (
                   <div key={req.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-xs text-gray-800">{req.item_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono font-bold uppercase">{req.item_code || 'LAB-PC'}</p>
                        </div>
                        <Link href={`/approvals?id=${req.id}`}>
                          <button className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-blue-700 transition-colors">อนุมัติ</button>
                        </Link>
                      </div>
                      <div className="text-[11px] text-gray-600 font-bold">
                        <p>👤 {req.user_name}</p>
                        <p className="text-orange-600">⏰ {new Date(req.created_at).toLocaleTimeString('th-TH')} น.</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-gray-400 font-bold text-center py-4">✅ ไม่มีรายการค้าง</p>
               )}

               <Link href="/approvals">
                 <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all">
                   จัดการคำขอทั้งหมด ({stats.pendingCount})
                 </button>
               </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}