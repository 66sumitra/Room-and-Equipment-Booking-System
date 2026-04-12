'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function UserComputerBooking() {
  const [computers, setComputers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPc, setSelectedPc] = useState<any>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function fetchAvailablePCs() {
      const { data } = await supabase
        .from('computers')
        .select('*')
        .eq('room_name', '1-0301')
        .order('pc_name', { ascending: true });

      if (data) setComputers(data);
      setLoading(false);
    }
    fetchAvailablePCs();
  }, []);

  const handleBooking = async () => {
    if (!selectedPc || !reason) {
      alert('กรุณาเลือกเครื่องและระบุเหตุผล');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('กรุณาล็อกอินก่อน');
      return;
    }

    await supabase.from('borrow_requests').insert([{
      equipment_id: selectedPc.id,
      user_name: user.email,
      reason,
      status: 'pending',
    }]);

    alert('ส่งคำขอเรียบร้อย');
    setSelectedPc(null);
    setReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ปุ่มย้อนกลับ */}
        <Link
          href="/user/booking"
          className="inline-flex items-center gap-2 text-black font-medium hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับไปหน้าจอง
        </Link>

        {/* หัวข้อ */}
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
          <h1 className="text-xl font-semibold text-black">
            ขอใช้งานคอมพิวเตอร์
          </h1>
          <p className="text-sm text-black mt-1">
            ห้องคอมพิวเตอร์ LAB 1-0301
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ผังคอม */}
          <div className="lg:col-span-8">
            <h2 className="text-base font-semibold text-black mb-3">เลือกเครื่องคอมพิวเตอร์</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm
              grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">

              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-black font-medium">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                computers.map(pc => (
                  <button
                    key={pc.id}
                    disabled={pc.status !== 'available'}
                    onClick={() => setSelectedPc(pc)}
                    className={`rounded-xl border-2 p-4 transition-all duration-200 text-left
                      ${
                        selectedPc?.id === pc.id
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30 shadow-md'
                          : pc.status === 'available'
                          ? 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'
                          : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className="font-bold text-lg text-black">
                      {pc.pc_name.replace('PC-', '')}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {pc.pc_name}
                    </div>
                    <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      pc.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {pc.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* รายละเอียดการจอง */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md sticky top-6">
              <h2 className="text-base font-semibold mb-5 text-black flex items-center gap-2 border-b-2 border-slate-200 pb-3">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                รายละเอียดการจอง
              </h2>

              {selectedPc ? (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-black uppercase tracking-wide mb-1">เครื่องที่เลือก</p>
                    <p className="text-xl font-semibold text-black">{selectedPc.pc_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">เหตุผลการใช้งาน <span className="text-red-500">*</span></label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full h-24 border-2 border-slate-200 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                      placeholder="เช่น ใช้เรียนวิชา, ทำโครงงาน..."
                    />
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    ยืนยันคำขอจอง
                  </button>
                </div>
              ) : (
                <div className="text-center py-14 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-600 font-medium">กรุณาเลือกเครื่องที่ว่างด้านซ้าย</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}