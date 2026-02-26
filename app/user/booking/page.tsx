'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabaseClient';

export default function BookingPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    borrowDate: '',
    returnDate: '',
    reason: '',
    urgent: false,
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    // ดึงข้อมูลอุปกรณ์โดยตรง ไม่ต้อง Group เองแล้ว
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    if (error) {
      console.error(error.message);
      return;
    }

    setEquipment(data || []);
  };

  const submitBorrow = async () => {
    // เช็คจากคอลัมน์ available_stock แทน
    if (!selected || selected.available_stock <= 0) {
      alert('ขออภัย อุปกรณ์นี้ไม่มีชิ้นที่ว่างในขณะนี้');
      return;
    }

    // 1. ส่งคำขอยืมลงตาราง borrow_requests
    const { error: insertError } = await supabase.from('borrow_requests').insert([
      {
        equipment_id: selected.id,
        user_name: form.name,
        borrow_date: form.borrowDate,
        return_date: form.returnDate,
        reason: form.reason,
        urgent: form.urgent,
        status: 'pending',
      },
    ]);

    if (insertError) {
      console.error("Insert Error:", insertError);
      alert("เกิดข้อผิดพลาด: " + insertError.message);
      return;
    }

    // 2. ตัดสต็อก: ลดจำนวน available_stock ลง 1 ทันทีที่กดยืม
    const { error: updateError } = await supabase
      .from('equipment')
      .update({ available_stock: selected.available_stock - 1 })
      .eq('id', selected.id);

    if (updateError) {
      console.error("Update Stock Error:", updateError);
    }

    alert('ส่งคำขอยืมสำเร็จ! รอการตรวจสอบจากแอดมินนะคะ');
    setOpen(false);
    setForm({ name: '', borrowDate: '', returnDate: '', reason: '', urgent: false });
    fetchEquipment(); // โหลดข้อมูลใหม่เพื่อให้อัปเดตเลขบนหน้าจอ
  };

  return (
    <DashboardLayout
      title="ขอยืมอุปกรณ์"
      actionButton={
        <Link href="/user/computer-booking">
          <Button variant="secondary" size="md" className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ขอใช้คอมพิวเตอร์
          </Button>
        </Link>
      }
    >
      <div>
        <h2 className="text-lg font-semibold text-black mb-6">ยืมอุปกรณ์</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all">
            <div className="p-6 flex-1 text-black">
              <h3 className="font-bold text-lg leading-tight mb-2 text-black">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide font-medium">{item.category}</p>
              
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-1">ทั้งหมด</p>
                  <p className="text-xl font-bold text-black">{item.total_stock || 0}</p>
                </div>
                <div className="flex-1 bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 font-medium mb-1">ว่าง</p>
                  <p className="text-xl font-bold text-emerald-700">{item.available_stock || 0}</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Button
                disabled={item.available_stock <= 0}
                className={`w-full py-3.5 rounded-xl font-semibold shadow-sm transition-all ${
                  item.available_stock <= 0 ? 'bg-slate-200 cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                }`}
                onClick={() => { setSelected(item); setOpen(true); }}
              >
                {item.available_stock <= 0 ? 'สินค้าหมด' : 'ขอยืม'}
              </Button>
            </div>
          </div>
        ))}
        </div>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`📌 ขอยืม: ${selected?.name || ''}`}>
        <div className="space-y-4 pt-2 text-black">
          <Input label="ชื่อผู้ขอยืม" placeholder="ระบุชื่อ-นามสกุล" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" label="วันเวลาเริ่มยืม" value={form.borrowDate} onChange={(e) => setForm({ ...form, borrowDate: e.target.value })} />
            <Input type="datetime-local" label="วันเวลาคืน" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">เหตุผลในการยืม</label>
            <textarea className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black" rows={3} placeholder="ระบุเหตุผลความจำเป็น..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 p-3 bg-red-50 rounded-xl cursor-pointer border border-red-100">
            <input type="checkbox" className="w-5 h-5 accent-red-500" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} />
            <span className="text-sm font-bold text-red-600">เคสเร่งด่วน (ต้องการใช้งานทันที)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 py-2.5 bg-gray-300 hover:bg-gray-400 !text-black !font-black border-2 border-gray-500 rounded-lg transition-all shadow-md" 
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all" 
              onClick={submitBorrow}
            >
              ยืนยันขอยืม
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}