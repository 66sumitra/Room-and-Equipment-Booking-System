'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ComputersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState('1-0301'); 
  const [computers, setComputers] = useState<any[]>([]);
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  // State สำหรับ Bulk Add
  const [bulkConfig, setBulkConfig] = useState({ startNum: 1, amount: 10 });
  
  const [formData, setFormData] = useState({
    pc_name: '',
    room_name: '1-0301',
    cpu: '',
    ram: '',
    storage: '',
    status: 'available'
  });

  const rooms = [
    { id: '1-0301', name: 'ห้องคอมพิวเตอร์ 1-0301' },
    { id: '1-0303', name: 'ห้องคอมพิวเตอร์ 1-0303' },
  ];

  useEffect(() => { fetchComputers(); }, [selectedRoom]);

  const fetchComputers = async () => {
    const { data, error } = await supabase
      .from('computers') 
      .select('*')
      .eq('room_name', selectedRoom) 
      .order('pc_name', { ascending: true });
    if (!error) setComputers(data || []);
  };

  // 🚀 ฟังก์ชันเพิ่มเครื่องแบบรวดเดียวหลายเครื่อง
  const handleBulkInsert = async () => {
    const newPCs = [];
    for (let i = 0; i < bulkConfig.amount; i++) {
      const num = bulkConfig.startNum + i;
      const formattedNum = num < 10 ? `0${num}` : num; // ทำเป็น 01, 02...
      newPCs.push({
        pc_name: `PC-${formattedNum}`,
        room_name: selectedRoom,
        cpu: 'Core i5', // ค่าเริ่มต้น
        ram: 16,
        storage: 'SSD 512GB',
        status: 'available'
      });
    }

    const { error } = await supabase.from('computers').insert(newPCs);
    if (!error) {
      showToast(`เพิ่มเครื่องห้อง ${selectedRoom} จำนวน ${bulkConfig.amount} เครื่องสำเร็จ!`, 'success');
      setIsBulkAddModalOpen(false);
      fetchComputers();
    } else {
      showToast("เกิดข้อผิดพลาดในการเพิ่มหลายเครื่อง", "error");
    }
  };

  const handleSave = async () => {
    const payload = { ...formData, ram: Number(formData.ram) };
    if (selectedComputer) {
      const { error } = await supabase.from('computers').update(payload).eq('id', selectedComputer.id);
      if (!error) showToast('แก้ไขข้อมูลสำเร็จ', 'success');
    } else {
      const { error } = await supabase.from('computers').insert([payload]);
      if (!error) showToast('เพิ่มเครื่องสำเร็จ', 'success');
    }
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    fetchComputers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันที่จะลบเครื่องนี้?')) {
      const { error } = await supabase.from('computers').delete().eq('id', id);
      if (!error) { showToast('ลบข้อมูลเรียบร้อย', 'info'); fetchComputers(); }
    }
  };

  const showToast = (message: string, type: any) => {
    setToast({ isVisible: true, message, type });
  };

  return (
    <DashboardLayout 
      title="จัดการคอมพิวเตอร์"
      actionButton={
        <div className="flex gap-2">
          {/* ปุ่มเพิ่มหลายเครื่อง */}
          <Button variant="secondary" size="md" onClick={() => setIsBulkAddModalOpen(true)} className="font-black">
            + เพิ่มหลายเครื่อง
          </Button>
          <Button variant="success" size="md" onClick={() => { setSelectedComputer(null); setFormData({pc_name:'', room_name: selectedRoom, cpu:'', ram:'', storage:'', status:'available'}); setIsAddModalOpen(true); }} className="font-black">
            + เพิ่มเครื่องเดียว
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-black">
        {/* Dropdown เลือกห้อง */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 font-black">
          <label className="block text-sm mb-2 uppercase">เลือกห้องเรียนเพื่อดูข้อมูล</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 border-2 border-gray-200 rounded-xl text-black font-bold outline-none"
          >
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-black">
          <table className="w-full">
            <thead className="bg-gray-800 text-white font-black text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">ชื่อเครื่อง</th>
                <th className="px-6 py-4 text-left">สเปก</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold">
              {computers.map((pc) => (
                <tr key={pc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-blue-700">{pc.pc_name}</td>
                  <td className="px-6 py-4 text-xs">{pc.cpu} | {pc.ram}GB</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${pc.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {pc.status === 'available' ? 'พร้อมใช้' : 'ซ่อมบำรุง'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => { setSelectedComputer(pc); setFormData(pc); setIsEditModalOpen(true); }} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">แก้ไข</button>
                    <button onClick={() => handleDelete(pc.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่มหลายเครื่อง (Bulk Add) */}
      <Modal isOpen={isBulkAddModalOpen} onClose={() => setIsBulkAddModalOpen(false)} title="เพิ่มหลายเครื่องอัตโนมัติ">
        <div className="space-y-4 pt-2 text-black font-black">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
             <p className="text-sm text-blue-800">ระบบจะสร้างเครื่องห้อง <strong>{selectedRoom}</strong> ให้อัตโนมัติ</p>
          </div>
          <Input label="เริ่มจากเลขที่ (เช่น 1)" type="number" value={bulkConfig.startNum} onChange={(e) => setBulkConfig({...bulkConfig, startNum: Number(e.target.value)})} />
          <Input label="จำนวนที่ต้องการเพิ่ม (เช่น 40)" type="number" value={bulkConfig.amount} onChange={(e) => setBulkConfig({...bulkConfig, amount: Number(e.target.value)})} />
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-gray-300 !text-black border-2 border-gray-500 font-black" onClick={() => setIsBulkAddModalOpen(false)}>ยกเลิก</Button>
            <Button className="flex-[2] bg-blue-600 text-white font-black" onClick={handleBulkInsert}>ยืนยันเพิ่มเครื่องทั้งหมด</Button>
          </div>
        </div>
      </Modal>

      {/* Modal เพิ่มเครื่องเดียว/แก้ไข */}
      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={selectedComputer ? "แก้ไขคอมพิวเตอร์" : "เพิ่มเครื่องใหม่"}>
        <div className="space-y-4 pt-2 text-black font-black">
          <Input label="ชื่อเครื่อง (เช่น PC-01)" value={formData.pc_name} onChange={(e) => setFormData({...formData, pc_name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPU" value={formData.cpu} onChange={(e) => setFormData({...formData, cpu: e.target.value})} />
            <Input label="RAM (GB)" type="number" value={formData.ram} onChange={(e) => setFormData({...formData, ram: e.target.value})} />
          </div>
          <Input label="Storage" value={formData.storage} onChange={(e) => setFormData({...formData, storage: e.target.value})} />
          <select className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="available">พร้อมใช้งาน</option>
              <option value="maintenance">ซ่อมบำรุง</option>
          </select>
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-gray-300 !text-black border-2 border-gray-500 font-black" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>ยกเลิก</Button>
            <Button className="flex-[2] bg-blue-600 text-white font-black" onClick={handleSave}>บันทึกข้อมูล</Button>
          </div>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isVisible: false })} />
    </DashboardLayout>
  );
}