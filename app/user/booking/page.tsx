'use client';

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

  useEffect(() => {
    fetchEquipment();
  }, []);

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
  );
}