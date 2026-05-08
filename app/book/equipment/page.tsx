'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function BookEquipmentPage() {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rooms = [
    { id: '1', name: 'ห้องแลบ LAB201', roomCode: 'LAB201', building: 'อาคาร 2', floor: '2' },
    { id: '2', name: 'ห้องเครื่องมือ LAB301', roomCode: 'LAB301', building: 'อาคาร 3', floor: '3' },
  ];

  const categories = ['ทั้งหมด', 'คอมพิวเตอร์', 'กล้อง', 'อุปกรณ์นำเสนอ', 'อุปกรณ์ทดลอง', 'อื่นๆ'];

  const equipment = [
    {
      id: '1',
      name: 'โน๊ตบุ๊ค Dell',
      assetCode: 'ASSET-001',
      category: 'คอมพิวเตอร์',
      roomId: '1',
      roomCode: 'LAB201',
      location: 'ตู้เก็บอุปกรณ์ A',
      quantity: 10,
      available: 7,
      status: 'available',
      requiresApproval: false,
    },
    {
      id: '2',
      name: 'กล้อง Canon EOS R6',
      assetCode: 'ASSET-002',
      category: 'กล้อง',
      roomId: '1',
      roomCode: 'LAB201',
      location: 'ตู้เก็บอุปกรณ์ B',
      quantity: 3,
      available: 1,
      status: 'available',
      requiresApproval: true,
    },
    {
      id: '3',
      name: 'โปรเจคเตอร์ Epson',
      assetCode: 'ASSET-003',
      category: 'อุปกรณ์นำเสนอ',
      roomId: '2',
      roomCode: 'LAB301',
      location: 'ตู้เก็บอุปกรณ์ C',
      quantity: 5,
      available: 3,
      status: 'available',
      requiresApproval: false,
    },
  ];

  const filteredEquipment = equipment.filter(eq => {
    const roomMatch = !selectedRoom || eq.roomId === selectedRoom;
    const categoryMatch = !selectedCategory || selectedCategory === 'ทั้งหมด' || eq.category === selectedCategory;
    return roomMatch && categoryMatch && eq.available > 0;
  });

  const handleSelectEquipment = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = () => {
    setIsBookingModalOpen(false);
    setToast({
      isVisible: true,
      message: `จอง ${selectedEquipment?.name} สำเร็จ! ${selectedEquipment?.requiresApproval ? 'รอการอนุมัติ' : 'จองสำเร็จ'}`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">จองอุปกรณ์ในห้อง Lab</h1>
              <p className="text-sm text-gray-500 mt-1">เลือกห้อง Lab และอุปกรณ์ที่ต้องการยืม</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/user/my-bookings">
                <Button variant="secondary" size="md">
                  ประวัติการจองของฉัน
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                ผ
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ห้อง / Lab</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.roomCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทอุปกรณ์</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่รับ</label>
              <Input
                type="date"
                value={selectedDate.start}
                onChange={(e) => setSelectedDate({ ...selectedDate, start: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่คืน</label>
            <Input
              type="date"
              value={selectedDate.end}
              onChange={(e) => setSelectedDate({ ...selectedDate, end: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              อุปกรณ์ที่สามารถยืมได้ ({filteredEquipment.length} รายการ)
            </h2>
          </div>
          
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>ไม่พบอุปกรณ์ที่ว่าง</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleSelectEquipment(item)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      {item.assetCode && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">รหัส: {item.assetCode}</p>
                      )}
                    </div>
                    <span className="text-3xl">💻</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{item.roomCode} - {item.location}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">ว่าง</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">{item.available}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-lg text-gray-600">{item.quantity}</span>
                      </div>
                    </div>
                    {item.requiresApproval && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                        ต้องอนุมัติ
                      </span>
                    )}
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEquipment(item);
                    }}
                  >
                    เลือกอุปกรณ์นี้
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="ยืนยันการจองอุปกรณ์"
        size="md"
      >
        {selectedEquipment && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">อุปกรณ์ที่เลือก</p>
              <p className="font-semibold text-xl text-gray-800">{selectedEquipment.name}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedEquipment.category}</p>
              {selectedEquipment.assetCode && (
                <p className="text-xs text-gray-500 mt-1 font-mono">รหัส: {selectedEquipment.assetCode}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่รับ</p>
                <p className="font-semibold text-gray-800">{selectedDate.start || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่คืน</p>
                <p className="font-semibold text-gray-800">{selectedDate.end || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">ห้อง/จุดรับ</p>
                <p className="font-semibold text-gray-800">{selectedEquipment.roomCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">ตำแหน่งเก็บ</p>
                <p className="font-semibold text-gray-800">{selectedEquipment.location}</p>
              </div>
            </div>

            <div>
              <Input
                type="text"
                label="วัตถุประสงค์"
                placeholder="ระบุวัตถุประสงค์การยืม"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                หมายเหตุ (ถ้ามี)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ระบุหมายเหตุเพิ่มเติม"
              />
            </div>

            {selectedEquipment.requiresApproval && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ อุปกรณ์นี้ต้องผ่านการอนุมัติจากผู้ดูแลระบบ
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmitBooking}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ยืนยันการจอง
                </span>
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsBookingModalOpen(false)}
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
    </div>
  );
}

