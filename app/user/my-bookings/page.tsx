'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'computer' | 'equipment'>('computer');

  const computerBookings = [
    {
      id: '1',
      type: 'computer',
      itemName: 'LAB501-PC03',
      itemCode: 'LAB501-PC03',
      roomCode: 'LAB501',
      date: '2025-12-15',
      startTime: '09:00',
      endTime: '12:00',
      purpose: 'ทำรายงาน',
      status: 'approved',
      createdAt: '2025-12-10',
    },
    {
      id: '2',
      type: 'computer',
      itemName: 'LAB502-PC15',
      itemCode: 'LAB502-PC15',
      roomCode: 'LAB502',
      date: '2025-12-16',
      startTime: '14:00',
      endTime: '17:00',
      purpose: 'coding',
      status: 'pending',
      createdAt: '2025-12-11',
    },
    {
      id: '3',
      type: 'computer',
      itemName: 'LAB501-PC20',
      itemCode: 'LAB501-PC20',
      roomCode: 'LAB501',
      date: '2025-12-20',
      startTime: '10:00',
      endTime: '15:00',
      purpose: 'ทำโปรเจค',
      status: 'completed',
      createdAt: '2025-12-12',
    },
  ];

  const equipmentBookings = [
    {
      id: '1',
      type: 'equipment',
      itemName: 'โน๊ตบุ๊ค Dell',
      itemCode: 'ASSET-001',
      roomCode: 'LAB201',
      dateStart: '2025-12-15',
      dateEnd: '2025-12-16',
      purpose: 'นำเสนอโปรเจค',
      status: 'borrowed',
      createdAt: '2025-12-10',
    },
    {
      id: '2',
      type: 'equipment',
      itemName: 'กล้อง Canon EOS R6',
      itemCode: 'ASSET-002',
      roomCode: 'LAB201',
      dateStart: '2025-12-18',
      dateEnd: '2025-12-20',
      purpose: 'ถ่ายภาพงาน',
      status: 'pending',
      createdAt: '2025-12-11',
    },
  ];

  const myBookings = activeTab === 'computer' ? computerBookings : equipmentBookings;

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      borrowed: 'bg-orange-100 text-orange-700',
      returned: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      approved: 'อนุมัติแล้ว',
      pending: 'รออนุมัติ',
      rejected: 'ไม่อนุมัติ',
      completed: 'ใช้งานแล้ว',
      borrowed: 'กำลังยืม',
      returned: 'คืนแล้ว',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleViewDetail = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ประวัติการจองของฉัน</h1>
              <p className="text-sm text-gray-500 mt-1">ดูและจัดการการจองทั้งหมดของคุณ</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/book/computer">
                <Button variant="primary" size="md">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    จองคอม
                  </span>
                </Button>
              </Link>
              <Link href="/book/equipment">
                <Button variant="secondary" size="md">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    จองอุปกรณ์
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">การจองทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{myBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รออนุมัติ</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {myBookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {myBookings.filter(b => b.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('computer')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'computer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จองคอม ({computerBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'equipment'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จองอุปกรณ์ ({equipmentBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {activeTab === 'computer' ? 'การจองคอมพิวเตอร์' : 'การจองอุปกรณ์'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {myBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewDetail(booking)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{booking.itemName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    {activeTab === 'computer' ? (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-mono text-blue-600">{booking.itemCode}</span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {'date' in booking ? booking.date : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {'startTime' in booking ? booking.startTime : ''} - {'endTime' in booking ? booking.endTime : ''}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{booking.purpose}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-mono text-blue-600">{booking.itemCode}</span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {'dateStart' in booking ? booking.dateStart : ''} - {'dateEnd' in booking ? booking.dateEnd : ''}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{booking.purpose}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${booking.type === 'computer' ? '💻' : '📦'}`}></span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="รายละเอียดการจอง"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{selectedBooking.itemName}</h3>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <p className="text-sm text-gray-600">{selectedBooking.topic}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedBooking.type === 'computer' ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">รหัสเครื่อง</p>
                    <p className="font-mono font-semibold text-gray-800">{selectedBooking.itemCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ห้อง</p>
                    <p className="font-semibold text-gray-800">{selectedBooking.roomCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">วันที่</p>
                    <p className="font-semibold text-gray-800">{'date' in selectedBooking ? selectedBooking.date : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">เวลา</p>
                    <p className="font-semibold text-gray-800">
                      {'startTime' in selectedBooking ? selectedBooking.startTime : ''} - {'endTime' in selectedBooking ? selectedBooking.endTime : ''}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">วัตถุประสงค์</p>
                    <p className="font-semibold text-gray-800">{selectedBooking.purpose}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">รหัสอุปกรณ์</p>
                    <p className="font-mono font-semibold text-gray-800">{selectedBooking.itemCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ห้อง/จุดรับ</p>
                    <p className="font-semibold text-gray-800">{selectedBooking.roomCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">วันที่รับ</p>
                    <p className="font-semibold text-gray-800">{'dateStart' in selectedBooking ? selectedBooking.dateStart : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">วันที่คืน</p>
                    <p className="font-semibold text-gray-800">{'dateEnd' in selectedBooking ? selectedBooking.dateEnd : ''}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">วัตถุประสงค์</p>
                    <p className="font-semibold text-gray-800">{selectedBooking.purpose}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่จอง</p>
                <p className="font-semibold text-gray-800">{selectedBooking.createdAt}</p>
              </div>
            </div>

            {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
              <div className="pt-4 border-t">
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    alert('ยกเลิกการจองเรียบร้อย');
                    setIsDetailModalOpen(false);
                  }}
                >
                  ยกเลิกการจอง
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

