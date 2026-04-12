'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';

// --- 1. ข้อมูลคอมพิวเตอร์ (Mock Data) ---
type ComputerStatus = 'available' | 'maintenance' | 'damaged';
interface Computer { id: string; roomCode: string; pcNumberInRoom: string; pcCode: string; position: string; status: ComputerStatus; }
interface ComputerRoom { id: string; name: string; roomCode: string; building: string; floor: string; description: string; computers: Computer[]; }
const createComputers = (roomCode: string, total: number): Computer[] => Array.from({ length: total }, (_, index) => { const positionRow = String.fromCharCode(65 + Math.floor(index / 8)); const positionSeat = (index % 8) + 1; const status: ComputerStatus = (index + 1) % 10 === 0 ? 'maintenance' : (index + 1) % 15 === 0 ? 'damaged' : 'available'; return { id: `${roomCode.toLowerCase()}-pc-${index + 1}`, roomCode, pcNumberInRoom: String(index + 1).padStart(2, '0'), pcCode: `${roomCode}-PC${String(index + 1).padStart(2, '0')}`, position: `แถว ${positionRow} ที่นั่ง ${positionSeat}`, status, }; });
const computerRooms: ComputerRoom[] = [ { id: 'lab501', name: 'ห้องคอมพิวเตอร์ 1-0303', roomCode: '1-0303', building: 'อาคาร 1', floor: '3', description: 'ห้องปฏิบัติการหลักสำหรับการเรียนการสอนด้านโปรแกรมมิ่ง', computers: createComputers('LAB0103', 24), }, { id: 'lab302', name: 'ห้องคอมพิวเตอร์ 1-0103', roomCode: 'LAB302', building: 'อาคาร 1', floor: '3', description: 'เหมาะสำหรับการอบรมระยะสั้น', computers: createComputers('LAB302', 20), } ];

export default function UserBookingPage() {
  const supabase = createClient(
    'https://ruqklydhqbzfhucvrbgw.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cWtseWRocWJ6Zmh1Y3ZyYmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.hGjjKM_z7WBpMyQOZXllmn4hk3bUZJiy9pc50fI8z4s'
  );

  const [activeTab, setActiveTab] = useState<'computer' | 'equipment'>('computer');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'computer' | 'equipment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [bookingForm, setBookingForm] = useState({ userName: '', reason: '' });

  // 2. ดึงข้อมูลอุปกรณ์
  const fetchEquipment = async () => {
    setLoadingEquipment(true);
    const { data, error } = await supabase.from('equipment').select('*').order('id', { ascending: true });
    
    if (error) {
      console.error("Error fetching equipment:", error);
      setToast({ isVisible: true, message: 'ดึงข้อมูลไม่สำเร็จ: ' + error.message, type: 'error' });
    } else if (data) {
      setEquipmentList(data);
    }
    setLoadingEquipment(false);
  };
=======
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
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87

  useEffect(() => {
    fetchEquipment();
  }, []);

<<<<<<< HEAD
  // --- LOGIC จัดกลุ่ม (Grouping) ---
  const getGroupedEquipment = () => {
    const filtered = equipmentList.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.code && item.code.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query))
      );
    });

    const grouped = filtered.reduce((acc: any[], item) => {
      const existing = acc.find(g => g.name === item.name);
      if (existing) {
        existing.total += 1;
        if (item.status === 'available') {
          existing.available += 1;
          existing.availableItems.push(item);
        }
      } else {
        acc.push({
          name: item.name,
          category: item.category,
          image: '⚡',
          total: 1,
          available: item.status === 'available' ? 1 : 0,
          availableItems: item.status === 'available' ? [item] : []
        });
      }
      return acc;
    }, []);
    return grouped;
  };

  const groupedEquipment = getGroupedEquipment();

  const handleBookGroup = (group: any) => {
    if (group.available > 0) {
      const itemToBook = group.availableItems[0];
      setSelectedType('equipment');
      setSelectedItem(itemToBook);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookComputer = (item: any) => {
    setSelectedType('computer');
    setSelectedItem(item);
    setIsBookingModalOpen(true);
  };

  // 3. ฟังก์ชันบันทึกการจอง + ตัดสต็อก
  const handleSubmitBooking = async () => {
    if (!selectedItem) return;

    if (selectedType === 'equipment') {
      const { error: bookingError } = await supabase.from('borrow_requests').insert({
        // 👇 แก้ตรงนี้ให้แล้วครับ (ใช้ .id)
        equipment_id: selectedItem.id, 
        user_name: bookingForm.userName || 'ไม่ระบุชื่อ',
        reason: bookingForm.reason || 'ยืมใช้งาน',
        status: 'pending'
      });

      if (bookingError) {
        setToast({ isVisible: true, message: 'เกิดข้อผิดพลาด: ' + bookingError.message, type: 'error' });
        return;
      }

      // ตัดสต็อก
      await supabase.from('equipment').update({ status: 'busy' }).eq('id', selectedItem.id);

      setIsBookingModalOpen(false);
      setToast({ isVisible: true, message: 'จองสำเร็จ! ตัดยอดคงเหลือแล้ว', type: 'success' });
      setBookingForm({ userName: '', reason: '' });
      fetchEquipment(); 

    } else {
      setIsBookingModalOpen(false);
      setToast({ isVisible: true, message: 'จำลองการจองคอมพิวเตอร์สำเร็จ', type: 'success' });
    }
  };

  // Styles
  const statusStyles: Record<ComputerStatus, { badge: string; border: string; text: string }> = {
    available: { badge: 'bg-green-100 text-green-700', border: 'border-green-300 bg-green-50 hover:border-green-400', text: 'text-gray-900' },
    maintenance: { badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-300 bg-yellow-50 hover:border-yellow-400', text: 'text-gray-900' },
    damaged: { badge: 'bg-red-100 text-red-700', border: 'border-red-300 bg-red-50 hover:border-red-400', text: 'text-gray-900' },
  };
  const statusLabels: Record<ComputerStatus, string> = { available: 'ว่าง', maintenance: 'ซ่อมบำรุง', damaged: 'ชำรุด' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ระบบขอใช้คอมพิวเตอร์และอุปกรณ์</h1>
            <p className="text-sm text-gray-600 mt-1">เลือกห้องคอมและอุปกรณ์ที่ต้องการใช้ได้ในที่เดียว</p>
          </div>
          <Link href="/approvals"><Button variant="secondary" size="md">ไปหน้า Admin</Button></Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
          />
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button onClick={() => setActiveTab('computer')} className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'computer' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
              ขอใช้คอมพิวเตอร์ ({computerRooms.length})
            </button>
            <button onClick={() => setActiveTab('equipment')} className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'equipment' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
              จองอุปกรณ์
            </button>
          </div>
        </div>

        {activeTab === 'computer' && (
          <div className="space-y-8">
            {computerRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">{room.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {room.computers.map((computer) => (
                    <button
                      key={computer.id}
                      onClick={() => handleBookComputer({ ...computer, name: `${room.roomCode} - เครื่องที่ ${computer.pcNumberInRoom}` })}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${statusStyles[computer.status].border}`}
                    >
                      <p className={`font-bold text-lg ${statusStyles[computer.status].text}`}>{computer.pcNumberInRoom}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold mt-1 ${statusStyles[computer.status].badge}`}>
                        {statusLabels[computer.status]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div>
            {loadingEquipment ? (
              <p className="text-center text-gray-600 py-10">กำลังโหลดข้อมูลอุปกรณ์...</p>
            ) : groupedEquipment.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">ไม่พบข้อมูลอุปกรณ์ในระบบ</p>
                <p className="text-sm text-gray-400 mt-2">กรุณาตรวจสอบว่ามีข้อมูลใน Database หรือยัง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedEquipment.map((group, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-center">
                      <div className="text-5xl mb-2">{group.image}</div>
                      <h3 className="text-xl font-bold text-white truncate">{group.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">{group.category}</p>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">คงเหลือ</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${group.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {group.available}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-lg text-gray-600">{group.total}</span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full"
                        disabled={group.available === 0}
                        onClick={() => handleBookGroup(group)}
                      >
                        {group.available > 0 ? 'จองรุ่นนี้' : 'สินค้าหมด'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="ยืนยันการจอง">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <p className="text-sm text-gray-600">กำลังจอง:</p>
            <p className="text-lg font-bold text-blue-900">{selectedItem?.name}</p>
            {selectedType === 'equipment' && (
              <p className="text-xs text-gray-600">
                รหัสเครื่องที่จะได้รับ: <span className="font-mono font-bold text-blue-700">{selectedItem?.code}</span>
              </p>
            )}
          </div>
          
          <Input 
            label="ชื่อผู้จอง" 
            value={bookingForm.userName} 
            onChange={(e) => setBookingForm({ ...bookingForm, userName: e.target.value })} 
          />
          
          <div className="flex flex-col gap-1">
             <label className="text-sm font-medium text-gray-700">เหตุผล</label>
             <textarea 
               className="w-full px-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
               rows={2} 
               value={bookingForm.reason} 
               onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })} 
             />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1" variant="primary" onClick={handleSubmitBooking}>ยืนยัน (ตัดสต็อก)</Button>
            <Button className="flex-1" variant="secondary" onClick={() => setIsBookingModalOpen(false)}>ยกเลิก</Button>
          </div>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isVisible: false })} />
    </div>
=======
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
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
  );
}