'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

export default function CheckInOutPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  const activeBookings = [
    {
      id: '1',
      type: 'room',
      itemName: 'ห้องประชุม A',
      userName: 'อาจารย์สมชาย',
      date: '2025-12-15',
      startTime: '09:00',
      endTime: '12:00',
      status: 'approved',
      checkedIn: false,
      qrCode: 'QR-001',
    },
    {
      id: '2',
      type: 'equipment',
      itemName: 'โน๊ตบุ๊ค Dell',
      userName: 'นักศึกษามานะ',
      date: '2025-12-15',
      startTime: '14:00',
      endTime: '17:00',
      status: 'checked_in',
      checkedIn: true,
      checkedInAt: '2025-12-15 14:05',
      qrCode: 'QR-002',
    },
    {
      id: '3',
      type: 'room',
      itemName: 'ห้องแลบคอมพิวเตอร์ 1',
      userName: 'อาจารย์สมหญิง',
      date: '2025-12-15',
      startTime: '08:00',
      endTime: '12:00',
      status: 'checked_in',
      checkedIn: true,
      checkedInAt: '2025-12-15 08:10',
      qrCode: 'QR-003',
    },
  ];

  const handleCheckIn = (booking: any) => {
    setSelectedBooking(booking);
    setIsCheckInModalOpen(true);
  };

  const handleCheckOut = (booking: any) => {
    setSelectedBooking(booking);
    setIsCheckOutModalOpen(true);
  };

  const filteredBookings = activeBookings.filter(booking =>
    booking.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.qrCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="เช็คอิน/เช็คเอาท์">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อ, QR Code, หรือชื่อผู้ยืม..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="primary" size="md">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                สแกน QR Code
              </span>
            </Button>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">การยืมที่กำลังใช้งาน</h2>
            <p className="text-sm text-gray-500 mt-1">วันนี้ ({new Date().toLocaleDateString('th-TH')})</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ยืม</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs font-mono">
                          {booking.qrCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{booking.type === 'room' ? '🏢' : '💻'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{booking.itemName}</p>
                          <p className="text-xs text-gray-500">{booking.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{booking.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{booking.startTime} - {booking.endTime}</p>
                      {booking.checkedInAt && (
                        <p className="text-xs text-gray-500">เช็คอิน: {booking.checkedInAt}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                        booking.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status === 'checked_in' ? 'เช็คอินแล้ว' :
                         booking.status === 'approved' ? 'รอเช็คอิน' :
                         booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!booking.checkedIn ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCheckIn(booking)}
                          >
                            เช็คอิน
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCheckOut(booking)}
                          >
                            เช็คเอาท์
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Check In Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="เช็คอิน"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">รายการ</p>
              <p className="text-lg font-semibold text-gray-800">{selectedBooking.itemName}</p>
              <p className="text-sm text-gray-600 mt-1">ผู้ยืม: {selectedBooking.userName}</p>
              <p className="text-sm text-gray-600">QR Code: {selectedBooking.qrCode}</p>
            </div>

            <div>
              <Input
                type="text"
                label="หมายเหตุ (ถ้ามี)"
                placeholder="ระบุหมายเหตุเพิ่มเติม"
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="success"
                className="flex-1"
                onClick={() => {
                  alert(`เช็คอินสำเร็จ! QR Code: ${selectedBooking.qrCode}`);
                  setIsCheckInModalOpen(false);
                }}
              >
                ยืนยันเช็คอิน
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCheckInModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Check Out Modal */}
      <Modal
        isOpen={isCheckOutModalOpen}
        onClose={() => setIsCheckOutModalOpen(false)}
        title="เช็คเอาท์"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">รายการ</p>
              <p className="text-lg font-semibold text-gray-800">{selectedBooking.itemName}</p>
              <p className="text-sm text-gray-600 mt-1">ผู้ยืม: {selectedBooking.userName}</p>
              <p className="text-sm text-gray-600">QR Code: {selectedBooking.qrCode}</p>
              {selectedBooking.checkedInAt && (
                <p className="text-sm text-gray-600">เช็คอินเมื่อ: {selectedBooking.checkedInAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                สภาพอุปกรณ์/ห้อง
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ปกติ</option>
                <option>มีปัญหาเล็กน้อย</option>
                <option>ชำรุด</option>
                <option>สูญหาย</option>
              </select>
            </div>

            <div>
              <Input
                type="text"
                label="หมายเหตุ (ถ้ามี)"
                placeholder="ระบุหมายเหตุเพิ่มเติม"
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  alert(`เช็คเอาท์สำเร็จ! QR Code: ${selectedBooking.qrCode}`);
                  setIsCheckOutModalOpen(false);
                }}
              >
                ยืนยันเช็คเอาท์
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCheckOutModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

