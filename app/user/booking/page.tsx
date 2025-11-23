'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function UserBookingPage() {
  const [activeTab, setActiveTab] = useState<'room' | 'equipment'>('room');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'room' | 'equipment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rooms = [
    {
      id: '1',
      name: 'ห้องประชุม A',
      capacity: 30,
      facilities: ['คอมพิวเตอร์', 'โปรเจคเตอร์', 'Wi-Fi', 'เครื่องปรับอากาศ'],
      location: 'อาคาร 1 ชั้น 2',
      available: true,
      image: '🏢',
    },
    {
      id: '2',
      name: 'ห้องประชุม B',
      capacity: 20,
      facilities: ['คอมพิวเตอร์', 'โปรเจคเตอร์', 'Wi-Fi'],
      location: 'อาคาร 1 ชั้น 3',
      available: true,
      image: '🏢',
    },
    {
      id: '3',
      name: 'ห้องสัมมนา C',
      capacity: 15,
      facilities: ['คอมพิวเตอร์', 'Wi-Fi'],
      location: 'อาคาร 2 ชั้น 1',
      available: true,
      image: '🏢',
    },
  ];

  const equipment = [
    {
      id: '1',
      name: 'โน๊ตบุ๊ค Dell',
      category: 'คอมพิวเตอร์',
      description: 'Dell Latitude 7420, Intel Core i7, RAM 16GB',
      available: 7,
      total: 10,
      image: '💻',
    },
    {
      id: '2',
      name: 'โปรเจคเตอร์ Epson',
      category: 'อุปกรณ์นำเสนอ',
      description: 'Epson Full HD สำหรับนำเสนอ',
      available: 3,
      total: 5,
      image: '📽️',
    },
    {
      id: '3',
      name: 'แท็บเล็ต iPad',
      category: 'แท็บเล็ต',
      description: 'iPad Pro 12.9 นิ้ว พร้อม Apple Pencil',
      available: 5,
      total: 8,
      image: '📱',
    },
    {
      id: '4',
      name: 'กล้องถ่ายภาพ Canon',
      category: 'กล้อง',
      description: 'Canon EOS R6 สำหรับงานถ่ายภาพ',
      available: 1,
      total: 3,
      image: '📷',
    },
  ];

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBook = (type: 'room' | 'equipment', item: any) => {
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
              <h1 className="text-2xl font-bold text-gray-800">ระบบจองห้องและอุปกรณ์</h1>
              <p className="text-sm text-gray-500 mt-1">จองห้องและอุปกรณ์ได้อย่างสะดวก</p>
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
              placeholder="ค้นหาห้องหรืออุปกรณ์..."
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
              onClick={() => setActiveTab('room')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'room'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                จองห้อง ({rooms.length})
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

        {/* Rooms Section */}
        {activeTab === 'room' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">ห้องที่สามารถจองได้</h2>
              <span className="text-sm text-gray-500">{filteredRooms.length} ห้อง</span>
            </div>
            {filteredRooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">ไม่พบห้องที่ค้นหา</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-center">
                      <div className="text-5xl mb-2">{room.image}</div>
                      <h3 className="text-xl font-bold text-white">{room.name}</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm">ความจุ: <strong>{room.capacity}</strong> คน</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{room.location}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-2">สิ่งอำนวยความสะดวก:</p>
                          <div className="flex flex-wrap gap-2">
                            {room.facilities.map((facility) => (
                              <span
                                key={facility}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700"
                        onClick={() => handleBook('room', room)}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          จองห้องนี้
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Equipment Section */}
        {activeTab === 'equipment' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">อุปกรณ์ที่สามารถจองได้</h2>
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
                      <p className="text-blue-100 text-sm mt-1">{item.category}</p>
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
        title={selectedType === 'room' ? 'จองห้อง' : 'จองอุปกรณ์'}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">รายการที่เลือก</p>
              <p className="text-xl font-bold text-gray-800">{selectedItem.name}</p>
              {selectedType === 'room' && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>ความจุ: {selectedItem.capacity} คน</span>
                  <span>•</span>
                  <span>{selectedItem.location}</span>
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
              {selectedType === 'room' && (
                <div>
                  <Input
                    type="number"
                    label="จำนวนคน"
                    placeholder="ระบุจำนวนผู้เข้าร่วม"
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
