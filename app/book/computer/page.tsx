'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function BookComputerPage() {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState({ start: '', end: '' });
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rooms = [
    { id: '1', name: 'ห้องคอมพิวเตอร์ LAB501', roomCode: 'LAB501', building: 'อาคาร 1', floor: '5' },
    { id: '2', name: 'ห้องคอมพิวเตอร์ LAB502', roomCode: 'LAB502', building: 'อาคาร 1', floor: '5' },
  ];

  // Mock computers - แสดงเฉพาะเครื่องที่ว่างในช่วงเวลาที่เลือก
  const availableComputers = selectedRoom && selectedDate && selectedTime.start
    ? Array.from({ length: 35 }, (_, i) => ({
        id: `pc-${i + 1}`,
        roomCode: rooms.find(r => r.id === selectedRoom)?.roomCode || 'LAB501',
        pcNumberInRoom: String(i + 1).padStart(2, '0'),
        pcCode: `${rooms.find(r => r.id === selectedRoom)?.roomCode || 'LAB501'}-PC${String(i + 1).padStart(2, '0')}`,
        position: `แถว ${String.fromCharCode(65 + Math.floor(i / 10))} ที่นั่ง ${(i % 10) + 1}`,
        status: 'available',
      }))
    : [];

  const handleSelectComputer = (computer: any) => {
    setSelectedComputer(computer);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = () => {
    setIsBookingModalOpen(false);
    setToast({
      isVisible: true,
      message: `จอง ${selectedComputer?.pcCode} สำเร็จ! รอการอนุมัติ`,
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
              <h1 className="text-2xl font-bold text-gray-800">จองคอมพิวเตอร์ในห้องคอม</h1>
              <p className="text-sm text-gray-500 mt-1">เลือกห้อง วันที่ เวลา และเครื่องที่ต้องการจอง</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/user/my-bookings">
                <Button variant="secondary" size="md">
                  ประวัติการจองของฉัน
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">

              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Select Room */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ขั้นตอนที่ 1: เลือกห้อง</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ห้องคอมพิวเตอร์</label>
              <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกห้อง --</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.roomCode}) - {room.building} ชั้น {room.floor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Select Date & Time */}
        {selectedRoom && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ขั้นตอนที่ 2: เลือกวันที่และเวลา</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  type="date"
                  label="วันที่"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="time"
                  label="เวลาเริ่มต้น"
                  value={selectedTime.start}
                  onChange={(e) => setSelectedTime({ ...selectedTime, start: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="time"
                  label="เวลาสิ้นสุด"
                  value={selectedTime.end}
                  onChange={(e) => setSelectedTime({ ...selectedTime, end: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Computer */}
        {selectedRoom && selectedDate && selectedTime.start && selectedTime.end && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ขั้นตอนที่ 3: เลือกเครื่องคอมพิวเตอร์
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              วันที่ {selectedDate} เวลา {selectedTime.start} - {selectedTime.end}
            </p>
            
            {availableComputers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>ไม่พบเครื่องที่ว่างในช่วงเวลานี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
                {availableComputers.map((computer) => (
                  <div
                    key={computer.id}
                    onClick={() => handleSelectComputer(computer)}
                    className="p-4 rounded-lg border-2 border-green-300 bg-green-50 cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="text-center">
                      <p className="font-mono font-bold text-lg text-gray-800">{computer.pcNumberInRoom}</p>
                      <p className="font-mono text-xs text-gray-600 mt-1">{computer.pcCode}</p>
                      <p className="text-xs text-green-700 font-semibold mt-2">ว่าง</p>
                      <p className="text-xs text-gray-500 mt-1">{computer.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="ยืนยันการจอง"
        size="md"
      >
        {selectedComputer && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">เครื่องที่เลือก</p>
              <p className="font-mono font-semibold text-xl text-gray-800">{selectedComputer.pcCode}</p>
              <p className="text-sm text-gray-600 mt-2">
                เครื่องที่ {selectedComputer.pcNumberInRoom} - {selectedComputer.position}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่</p>
                <p className="font-semibold text-gray-800">{selectedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">เวลา</p>
                <p className="font-semibold text-gray-800">{selectedTime.start} - {selectedTime.end}</p>
              </div>
            </div>

            <div>
              <Input
                type="text"
                label="วัตถุประสงค์"
                placeholder="เช่น ทำรายงาน, coding, ทำโปรเจค, เตรียมสอบ"
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

