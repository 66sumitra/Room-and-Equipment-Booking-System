'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
<<<<<<< HEAD
import { useState } from 'react';
import Link from 'next/link';
=======
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87

export default function ComputersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
<<<<<<< HEAD
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'seat'>('list');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rooms = [
    { id: '1', name: 'ห้องคอมพิวเตอร์ 1-0303', roomCode: '1-0303', building: 'อาคาร 1', floor: '3' },
    { id: '2', name: 'ห้องคอมพิวเตอร์ 1-0103', roomCode: '1-0103', building: 'อาคาร 1', floor: '3' },
    { id: '3', name: 'ต้องลบ', roomCode: '-', building: '-', floor: '-' },
  ];

  const computers = [
    {
      id: '1',
      roomId: '1',
      roomCode: '1-0303',
      pcNumberInRoom: '01',
      pcCode: '1-0303-PC01',
      specs: { cpu: 'Intel i5', ram: '16GB', storage: 'SSD 512GB' },
      status: 'available',
    },
    {
      id: '2',
      roomId: '1',
      roomCode: '1-0103',
      pcNumberInRoom: '02',
      pcCode: '1-0103-PC02',
      
      specs: { cpu: 'Intel i5', ram: '16GB', storage: 'SSD 512GB' },
      status: 'available',
    },
    {
      id: '3',
      roomId: '1',
      roomCode: '1-0303',
      pcNumberInRoom: '03',
      pcCode: '1-0303-PC03',
      
      specs: { cpu: 'Intel i7', ram: '32GB', storage: 'SSD 1TB' },
      status: 'maintenance',
    },
    {
      id: '4',
      roomId: '1',
      roomCode: '1-0103',
      pcNumberInRoom: '01',
      pcCode: '1-0103-PC01',
      
      specs: { cpu: 'Intel i5', ram: '16GB', storage: 'SSD 512GB' },
      status: 'available',
    },
  ];

  const filteredComputers = selectedRoom
    ? computers.filter(c => c.roomId === selectedRoom)
    : computers;

  const handleEdit = (computer: any) => {
    setSelectedComputer(computer);
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      damaged: 'bg-red-100 text-red-700',
      disabled: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      available: 'พร้อมใช้งาน',
      maintenance: 'ซ่อมบำรุง',
      damaged: 'ชำรุด',
      disabled: 'ปิดใช้งาน',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <DashboardLayout
      title="จัดการคอมพิวเตอร์"
      actionButton={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsBulkAddModalOpen(true)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มหลายเครื่อง
            </span>
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มเครื่อง
            </span>
=======
  
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
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
          </Button>
        </div>
      }
    >
<<<<<<< HEAD
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกห้อง</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name} ({room.roomCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ทั้งหมด</option>
                <option>พร้อมใช้งาน</option>
                <option>ซ่อมบำรุง</option>
                <option>ชำรุด</option>
                <option>ปิดใช้งาน</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  รายการ
                </button>
                <button
                  onClick={() => setViewMode('seat')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'seat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  แผนผัง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Computers List */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                รายการคอมพิวเตอร์ ({filteredComputers.length} เครื่อง)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสห้อง</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ห้อง</th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สเปก</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComputers.map((computer) => (
                    <tr key={computer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-mono font-semibold text-gray-800">{computer.pcCode}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <Link href={`/admin/rooms/${computer.roomId}/computers`} className="text-blue-600 hover:text-blue-800">
                          {computer.roomCode}
                        </Link>
                      </td>
                      
                      <td className="px-6 py-4">
                        {computer.specs ? (
                          <div className="text-xs text-gray-600">
                            <p>{computer.specs.cpu}</p>
                            <p>{computer.specs.ram} / {computer.specs.storage}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(computer.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(computer)}
                            className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 bg-red-100 rounded flex items-center justify-center hover:bg-red-200 transition-colors">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">แผนผังที่นั่ง</h2>
            <div className="text-center py-12 text-gray-400">
              <p>แผนผังที่นั่ง (Seat Map View)</p>
              <p className="text-sm mt-2">ฟีเจอร์นี้จะแสดงในอนาคต</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Computer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มเครื่องคอมพิวเตอร์"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกห้อง</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>เลือกห้อง</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name} ({room.roomCode})</option>
              ))}
            </select>
          </div>
          <div>
            <Input
              type="text"
              label="หมายเลขเครื่องในห้อง"
              placeholder="เช่น 01, 02, 03"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">ระบบจะสร้างรหัสเครื่องอัตโนมัติ: {selectedRoom ? rooms.find(r => r.id === selectedRoom)?.roomCode : 'ROOM'}-PC01</p>
          </div>
          <div>
            <Input
              type="text"
              label="ตำแหน่ง (ถ้ามี)"
              placeholder="เช่น แถว A ที่นั่ง 1"
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                label="CPU"
                placeholder="เช่น Intel i5"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="text"
                label="RAM"
                placeholder="เช่น 16GB"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Storage"
                placeholder="เช่น SSD 512GB"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะเริ่มต้น</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>พร้อมใช้งาน</option>
              <option>ยังไม่พร้อม</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                setToast({
                  isVisible: true,
                  message: 'เพิ่มเครื่องคอมพิวเตอร์สำเร็จ!',
                  type: 'success',
                });
              }}
            >
              บันทึก
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              ยกเลิก
            </Button>
=======
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
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
          </div>
        </div>
      </Modal>

<<<<<<< HEAD
      {/* Bulk Add Modal */}
      <Modal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        title="เพิ่มหลายเครื่องทีเดียว"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกห้อง</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>เลือกห้อง</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name} ({room.roomCode})</option>
              ))}
            </select>
          </div>
          <div>
            <Input
              type="number"
              label="จำนวนเครื่อง"
              placeholder="เช่น 40"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">ระบบจะสร้างเครื่องตั้งแต่ PC01 ถึง PC{40} ให้อัตโนมัติ</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>ตัวอย่าง:</strong> ถ้าเลือกห้อง LAB501 และจำนวน 40 เครื่อง<br />
              ระบบจะสร้าง: LAB501-PC01, LAB501-PC02, ..., LAB501-PC40
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                setIsBulkAddModalOpen(false);
                setToast({
                  isVisible: true,
                  message: 'เพิ่มเครื่องคอมพิวเตอร์ 40 เครื่องสำเร็จ!',
                  type: 'success',
                });
              }}
            >
              สร้างเครื่องทั้งหมด
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsBulkAddModalOpen(false)}
            >
              ยกเลิก
            </Button>
=======
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
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
          </div>
        </div>
      </Modal>

<<<<<<< HEAD
      {/* Edit Computer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขเครื่องคอมพิวเตอร์"
        size="lg"
      >
        {selectedComputer && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">รหัสเครื่อง</p>
              <p className="font-mono font-semibold text-lg text-gray-800">{selectedComputer.pcCode}</p>
            </div>
            <div>
              <Input
                type="text"
                label="ตำแหน่ง"
                defaultValue={selectedComputer.position}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  type="text"
                  label="CPU"
                  defaultValue={selectedComputer.specs?.cpu}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="RAM"
                  defaultValue={selectedComputer.specs?.ram}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Storage"
                  defaultValue={selectedComputer.specs?.storage}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ</label>
              <select
                defaultValue={selectedComputer.status}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">พร้อมใช้งาน</option>
                <option value="maintenance">ซ่อมบำรุง</option>
                <option value="damaged">ชำรุด</option>
                <option value="disabled">ปิดใช้งาน</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setToast({
                    isVisible: true,
                    message: 'แก้ไขเครื่องคอมพิวเตอร์สำเร็จ!',
                    type: 'success',
                  });
                }}
              >
                บันทึกการแก้ไข
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </DashboardLayout>
  );
}

=======
      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isVisible: false })} />
    </DashboardLayout>
  );
}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
