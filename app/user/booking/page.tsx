'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';

type ComputerStatus = 'available' | 'maintenance' | 'damaged';

interface Computer {
  id: string;
  roomCode: string;
  pcNumberInRoom: string;
  pcCode: string;
  position: string;
  status: ComputerStatus;
}

interface ComputerRoom {
  id: string;
  name: string;
  roomCode: string;
  building: string;
  floor: string;
  description: string;
  computers: Computer[];
}

const createComputers = (roomCode: string, total: number): Computer[] =>
  Array.from({ length: total }, (_, index) => {
    const positionRow = String.fromCharCode(65 + Math.floor(index / 8));
    const positionSeat = (index % 8) + 1;
    const status: ComputerStatus =
      (index + 1) % 10 === 0 ? 'maintenance' : (index + 1) % 15 === 0 ? 'damaged' : 'available';

    return {
      id: `${roomCode.toLowerCase()}-pc-${index + 1}`,
      roomCode,
      pcNumberInRoom: String(index + 1).padStart(2, '0'),
      pcCode: `${roomCode}-PC${String(index + 1).padStart(2, '0')}`,
      position: `แถว ${positionRow} ที่นั่ง ${positionSeat}`,
      status,
    };
  });

const computerRooms: ComputerRoom[] = [
  {
    id: 'lab501',
    name: 'ห้องคอมพิวเตอร์ LAB501',
    roomCode: 'LAB501',
    building: 'อาคาร 1',
    floor: '5',
    description: 'ห้องปฏิบัติการหลักสำหรับการเรียนการสอนด้านโปรแกรมมิ่งและระบบเครือข่าย',
    computers: createComputers('LAB501', 24),
  },
  {
    id: 'lab302',
    name: 'ห้องคอมพิวเตอร์ LAB302',
    roomCode: 'LAB302',
    building: 'อาคาร 2',
    floor: '3',
    description: 'เหมาะสำหรับการอบรมระยะสั้นและการสอบมาตรฐานวิชาชีพ',
    computers: createComputers('LAB302', 20),
  },
  {
    id: 'lab215',
    name: 'ห้องคอมพิวเตอร์ LAB215',
    roomCode: 'LAB215',
    building: 'อาคาร 3',
    floor: '2',
    description: 'รองรับงานวิจัย การออกแบบสื่อ และการทำงานกลุ่มของนักศึกษา',
    computers: createComputers('LAB215', 18),
  },
];

export default function UserBookingPage() {
  const [activeTab, setActiveTab] = useState<'computer' | 'equipment'>('computer');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'computer' | 'equipment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const equipment = [
    {
      id: 'lab501-set',
      name: 'ชุดทดลองฟิสิกส์ขั้นสูง',
      category: 'ฟิสิกส์ประยุกต์',
      lab: 'LAB501 - ห้องทดลองฟิสิกส์',
      description: 'Workstation Dell Precision + GPU NVIDIA A4000 สำหรับจำลองฟิสิกส์',
      available: 7,
      total: 10,
      image: '🔬',
    },
    {
      id: 'lab302-pj',
      name: 'ระบบสาธิตควบคุมวิศวกรรม',
      category: 'วิศวกรรมระบบ',
      lab: 'LAB302 - ห้องวิศวกรรมระบบ',
      description: 'โปรเจคเตอร์เลเซอร์ 4K พร้อมชุดแขวน เพื่อสาธิตระบบควบคุม',
      available: 3,
      total: 5,
      image: '⚙️',
    },
    {
      id: 'lab215-tab',
      name: 'ชุดบันทึกผลการทดลอง',
      category: 'วิศวกรรมไฟฟ้า',
      lab: 'LAB215 - ห้องวิศวกรรมไฟฟ้า',
      description: 'iPad Pro 12.9" + Apple Pencil สำหรับบันทึกผลการทดลอง',
      available: 5,
      total: 8,
      image: '📐',
    },
    {
      id: 'lab215-scope',
      name: 'ชุดถ่ายเก็บสนามแม่เหล็ก',
      category: 'ฟิสิกส์ขั้นสูง',
      lab: 'LAB215 - ห้องวิศวกรรมไฟฟ้า',
      description: 'Canon EOS R6 + เลนส์ Macro สำหรับเก็บภาพการทดลอง',
      available: 1,
      total: 3,
      image: '🧲',
    },
  ];

  const filteredComputerRooms = computerRooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(query) ||
      room.roomCode.toLowerCase().includes(query) ||
      `${room.building} ชั้น ${room.floor}`.toLowerCase().includes(query)
    );
  });

  const statusStyles: Record<ComputerStatus, { badge: string; border: string }> = {
    available: {
      badge: 'bg-green-100 text-green-700',
      border: 'border-green-300 bg-green-50 hover:border-green-400',
    },
    maintenance: {
      badge: 'bg-yellow-100 text-yellow-700',
      border: 'border-yellow-300 bg-yellow-50 hover:border-yellow-400',
    },
    damaged: {
      badge: 'bg-red-100 text-red-700',
      border: 'border-red-300 bg-red-50 hover:border-red-400',
    },
  };

  const statusLabels: Record<ComputerStatus, string> = {
    available: 'ว่าง',
    maintenance: 'ซ่อมบำรุง',
    damaged: 'ชำรุด',
  };

  const filteredEquipment = equipment.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.lab.toLowerCase().includes(query)
    );
  });

  const handleBook = (type: 'computer' | 'equipment', item: any) => {
    setSelectedType(type);
    setSelectedItem(item);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = () => {
    setIsBookingModalOpen(false);
    setToast({
      isVisible: true,
      message: 'ส่งคำขอจองเรียบร้อย! รอการอนุมัติจากผู้ดูแลระบบ',
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
              <h1 className="text-2xl font-bold text-gray-800">ระบบขอใช้คอมพิวเตอร์และอุปกรณ์</h1>
              <p className="text-sm text-gray-500 mt-1">เลือกห้องคอมและอุปกรณ์ที่ต้องการใช้ได้ในที่เดียว</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/user/my-bookings">
                <Button variant="secondary" size="md">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    ประวัติการจอง
                  </span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="md">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </span>
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold">
                ผ
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหาห้องคอมพิวเตอร์หรืออุปกรณ์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('computer')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'computer'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                ขอใช้คอมพิวเตอร์ ({computerRooms.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'equipment'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                จองอุปกรณ์ ({equipment.length})
              </span>
            </button>
          </div>
        </div>

        {/* Computer Rooms Section */}
        {activeTab === 'computer' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">ขอใช้คอมพิวเตอร์ในห้องปฏิบัติการ</h2>
              <span className="text-sm text-gray-500">{filteredComputerRooms.length} ห้องคอม</span>
            </div>
            {filteredComputerRooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">ไม่พบห้องคอมที่ค้นหา</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredComputerRooms.map((room) => {
                  const summary = room.computers.reduce<Record<ComputerStatus, number>>(
                    (acc, computer) => {
                      acc[computer.status] += 1;
                      return acc;
                    },
                    { available: 0, maintenance: 0, damaged: 0 }
                  );
                  const statusOrder: ComputerStatus[] = ['available', 'maintenance', 'damaged'];

                  return (
                    <div key={room.id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-sm text-blue-600 font-semibold">{room.roomCode}</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{room.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
                            <span>{room.building}</span>
                            <span>•</span>
                            <span>ชั้น {room.floor}</span>
                            <span>•</span>
                            <span>จำนวนเครื่อง {room.computers.length} เครื่อง</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {statusOrder.map((status) => (
                            <span
                              key={`${room.id}-${status}`}
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status].badge}`}
                            >
                              {statusLabels[status]}: {summary[status]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {room.computers.map((computer) => (
                          <button
                            key={computer.id}
                            type="button"
                            onClick={() =>
                              handleBook('computer', {
                                ...computer,
                                name: `${room.roomCode} - เครื่องที่ ${computer.pcNumberInRoom}`,
                                roomName: room.name,
                                building: room.building,
                                floor: room.floor,
                              })
                            }
                            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${statusStyles[computer.status].border}`}
                          >
                            <p className="font-mono font-bold text-lg text-gray-800">{computer.pcNumberInRoom}</p>
                            <p className="font-mono text-xs text-gray-600 mt-1">{computer.pcCode}</p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold mt-2 ${statusStyles[computer.status].badge}`}
                            >
                              {statusLabels[computer.status]}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">{computer.position}</p>
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-gray-500">คลิกที่หมายเลขเครื่องเพื่อส่งคำขอใช้คอมพิวเตอร์</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Equipment Section */}
        {activeTab === 'equipment' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">อุปกรณ์ในห้อง LAB ฟิสิกส์-วิศวะ</h2>
              <span className="text-sm text-gray-500">{filteredEquipment.length} รายการ</span>
            </div>
            {filteredEquipment.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">ไม่พบอุปกรณ์ที่ค้นหา</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-center">
                      <div className="text-5xl mb-2">{item.image}</div>
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">{item.lab}</p>
                      <p className="text-blue-100 text-xs">{item.category}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">ว่าง</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">{item.available}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-lg text-gray-600">{item.total}</span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700"
                        onClick={() => handleBook('equipment', item)}
                        disabled={item.available === 0}
                      >
                        {item.available === 0 ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ไม่ว่าง
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            จองอุปกรณ์นี้
                          </span>
                        )}
                      </Button>
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
        title={selectedType === 'computer' ? 'ขอใช้คอมพิวเตอร์' : 'จองอุปกรณ์'}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">รายการที่เลือก</p>
              <p className="text-xl font-bold text-gray-800">{selectedItem.name}</p>
              {selectedType === 'computer' && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>ห้อง: {selectedItem.roomName} ({selectedItem.roomCode})</span>
                  <span>•</span>
                  <span>เครื่องที่ {selectedItem.pcNumberInRoom}</span>
                  <span>•</span>
                  <span>{selectedItem.position}</span>
                </div>
              )}
              {selectedType === 'equipment' && (
                <div className="mt-2 text-sm text-gray-600">
                  <span>ว่าง: {selectedItem.available} / {selectedItem.total}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="วันที่"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="time"
                  label="เวลาเริ่มต้น"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="time"
                  label="เวลาสิ้นสุด"
                  className="w-full"
                />
              </div>
              {selectedType === 'computer' && (
                <div>
                  <Input
                    type="number"
                    label="จำนวนผู้ใช้งาน"
                    placeholder="ระบุจำนวนผู้ที่จะใช้เครื่อง"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div>
              <Input
                type="text"
                label="หัวข้อเรื่อง"
                placeholder="ระบุหัวข้อการประชุม/กิจกรรม"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                หมายเหตุ
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="primary"
                className="flex-1 bg-gradient-to-r from-blue-700 to-teal-600"
                onClick={handleSubmitBooking}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ส่งคำขอจอง
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

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
