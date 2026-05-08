'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function RoomsListPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    room_name: '',
    building: '',
    floor: '',
    department: ''
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room')
        .select('*')
        .order('room_name', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('room').insert([formData]);
      if (error) throw error;
      setToast({ isVisible: true, message: 'เพิ่มห้องสำเร็จ!', type: 'success' });
      setIsAddModalOpen(false);
      setFormData({ room_name: '', building: '', floor: '', department: '' });
      fetchRooms();
    } catch (err: any) {
      setToast({ isVisible: true, message: 'ข้อผิดพลาด: ' + err.message, type: 'error' });
    }
  };

  // ✅ ฟังก์ชันลบห้อง
  const handleDeleteRoom = async (id: string, roomName: string) => {
    if (confirm(`คุณต้องการลบห้อง "${roomName}" ใช่หรือไม่?\n*การลบห้องอาจส่งผลต่อข้อมูลคอมพิวเตอร์ที่ผูกอยู่*`)) {
      try {
        const { error } = await supabase
          .from('room')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setToast({ isVisible: true, message: 'ลบห้องเรียบร้อยแล้ว', type: 'success' });
        fetchRooms(); // โหลดข้อมูลใหม่
      } catch (err: any) {
        setToast({ isVisible: true, message: 'ลบไม่สำเร็จ: ' + err.message, type: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <DashboardLayout
      title="จัดการห้องคอมพิวเตอร์" allowedRoles={['admin']}
      actionButton={
        <Button variant="success" size="md" onClick={() => setIsAddModalOpen(true)}>
          <span className="flex items-center gap-2 font-bold">+ เพิ่มห้อง</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">กำลังโหลด...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative group">
                
                {/* ✅ ปุ่มลบห้อง (ถังขยะสีแดง) */}
                <button 
                  onClick={() => handleDeleteRoom(room.id, room.room_name)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  title="ลบห้อง"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <h3 className="text-xl font-bold text-gray-800 pr-8">{room.room_name}</h3>
                <div className="text-sm text-gray-500 mt-2 mb-6">
                  <p>🏢 อาคาร: {room.building || '-'}</p>
                  <p>📍 ชั้น: {room.floor || '-'}</p>
                </div>
                <Link href={`/admin/rooms/${room.room_name}/computers`}>
                  <Button variant="primary" className="w-full font-bold">จัดการคอมพิวเตอร์</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal เพิ่มห้อง */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="เพิ่มห้องใหม่">
        <form onSubmit={handleAddRoom} className="space-y-4 pt-2">
          <Input 
            label="รหัส/ชื่อห้อง *" 
            value={formData.room_name}
            onChange={(e) => setFormData({...formData, room_name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="อาคาร" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
            <Input label="ชั้น" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
          </div>
          <Button type="submit" variant="primary" className="w-full h-12 font-bold">บันทึกข้อมูล</Button>
        </form>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isVisible: false })} />
    </DashboardLayout>
  );
}