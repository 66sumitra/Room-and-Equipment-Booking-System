'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';
import Link from 'next/link';

export default function ComputersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'seat'>('list');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rooms = [
    { id: '1', name: 'ห้องคอมพิวเตอร์ LAB501', roomCode: 'LAB501', building: 'อาคาร 1', floor: '5' },
    { id: '2', name: 'ห้องคอมพิวเตอร์ LAB502', roomCode: 'LAB502', building: 'อาคาร 1', floor: '5' },
    { id: '3', name: 'ห้องแลบ LAB201', roomCode: 'LAB201', building: 'อาคาร 2', floor: '2' },
  ];

  const computers = [
    {
      id: '1',
      roomId: '1',
      roomCode: 'LAB501',
      pcNumberInRoom: '01',
      pcCode: 'LAB501-PC01',
      specs: { cpu: 'Intel i5', ram: '16GB', storage: 'SSD 512GB' },
      status: 'available',
    },
    {
      id: '2',
      roomId: '1',
      roomCode: 'LAB501',
      pcNumberInRoom: '02',
      pcCode: 'LAB501-PC02',
      
      specs: { cpu: 'Intel i5', ram: '16GB', storage: 'SSD 512GB' },
      status: 'available',
    },
    {
      id: '3',
      roomId: '1',
      roomCode: 'LAB501',
      pcNumberInRoom: '03',
      pcCode: 'LAB501-PC03',
      
      specs: { cpu: 'Intel i7', ram: '32GB', storage: 'SSD 1TB' },
      status: 'maintenance',
    },
    {
      id: '4',
      roomId: '2',
      roomCode: 'LAB502',
      pcNumberInRoom: '01',
      pcCode: 'LAB502-PC01',
      
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
          </Button>
        </div>
      }
    >
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
          </div>
        </div>
      </Modal>

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
          </div>
        </div>
      </Modal>

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

