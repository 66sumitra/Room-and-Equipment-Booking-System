'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

export default function ApprovalsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const pendingBookings = [
    {
      id: 'LAB-501-01',
      type: 'computer',
      itemName: 'LAB501 - เครื่องที่ 08',
      labName: 'ห้องคอมพิวเตอร์ LAB501',
      userName: 'อาจารย์วิชัย',
      userRole: 'teacher',
      date: '2025-12-17',
      startTime: '09:00',
      endTime: '12:00',
      topic: 'สอนวิชา Network Simulation',
      numberOfPeople: 5,
      notes: 'ต้องการเปิด GPU สำหรับจำลองโครงข่าย',
      requestedAt: '2025-12-14 10:30',
      requiresApproval: true,
    },
    {
      id: 'LAB-302-12',
      type: 'computer',
      itemName: 'LAB302 - เครื่องที่ 12',
      labName: 'ห้องคอมพิวเตอร์ LAB302',
      userName: 'นักศึกษาสมใจ',
      userRole: 'student',
      date: '2025-12-18',
      startTime: '10:00',
      endTime: '15:00',
      topic: 'ซ้อมสอบมาตรฐานวิชาชีพ',
      notes: 'ต้องการใช้ซอฟต์แวร์จำลองการควบคุม',
      requestedAt: '2025-12-14 14:20',
      requiresApproval: true,
    },
    {
      id: 'LAB-215-EQ',
      type: 'equipment',
      itemName: 'ชุดบันทึกผลการทดลอง (LAB215)',
      labName: 'ห้องวิศวกรรมไฟฟ้า LAB215',
      userName: 'อาจารย์สมชาย',
      userRole: 'teacher',
      date: '2025-12-20',
      startTime: '08:00',
      endTime: '12:00',
      topic: 'บันทึกผลโครงงานปี 4',
      numberOfPeople: 12,
      requestedAt: '2025-12-14 15:45',
      requiresApproval: true,
    },
  ];

  const handleViewDetail = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (id: string) => {
    alert(`อนุมัติการจอง #${id} เรียบร้อย`);
  };

  const handleReject = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการไม่อนุมัติการจองนี้?')) {
      alert(`ไม่อนุมัติการจอง #${id}`);
    }
  };

  const typeMeta: Record<string, { icon: string; label: string }> = {
    computer: { icon: '💻', label: 'คอมพิวเตอร์' },
    equipment: { icon: '🧲', label: 'อุปกรณ์แลบ' },
  };

  return (
    <DashboardLayout title="อนุมัติการจอง">
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">การจองที่รออนุมัติ</h2>
              <p className="text-sm text-gray-600 mt-1">ทั้งหมด {pendingBookings.length} รายการ</p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จอง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่/เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeMeta[booking.type].icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{booking.itemName}</p>
                          {booking.labName && (
                            <p className="text-xs text-gray-500">{booking.labName}</p>
                          )}
                          <p className="text-[11px] text-blue-600">
                            {typeMeta[booking.type].label}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-800">{booking.userName}</p>
                        <p className="text-xs text-gray-500">
                          {booking.userRole === 'teacher' ? 'อาจารย์' : 'นักศึกษา'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{booking.date}</div>
                      <div className="text-xs text-gray-500">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{booking.topic}</p>
                      {booking.numberOfPeople && (
                        <p className="text-xs text-gray-500">{booking.numberOfPeople} คน</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetail(booking)}
                        >
                          ดูรายละเอียด
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(booking.id)}
                        >
                          ไม่อนุมัติ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                <span className="text-2xl">{typeMeta[selectedBooking.type].icon}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedBooking.topic}</p>
              {selectedBooking.labName && (
                <p className="text-xs text-gray-500 mt-1">{selectedBooking.labName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">ผู้จอง</p>
                <p className="font-semibold text-gray-800">{selectedBooking.userName}</p>
                <p className="text-xs text-gray-500">
                  {selectedBooking.userRole === 'teacher' ? 'อาจารย์' : 'นักศึกษา'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่</p>
                <p className="font-semibold text-gray-800">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">เวลาเริ่มต้น</p>
                <p className="font-semibold text-gray-800">{selectedBooking.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">เวลาสิ้นสุด</p>
                <p className="font-semibold text-gray-800">{selectedBooking.endTime}</p>
              </div>
              {selectedBooking.numberOfPeople && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">จำนวนคน</p>
                  <p className="font-semibold text-gray-800">{selectedBooking.numberOfPeople} คน</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">วันที่ขอจอง</p>
                <p className="font-semibold text-gray-800">{selectedBooking.requestedAt}</p>
              </div>
            </div>

            {selectedBooking.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">หมายเหตุ</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="success"
                className="flex-1"
                onClick={() => {
                  handleApprove(selectedBooking.id);
                  setIsDetailModalOpen(false);
                }}
              >
                อนุมัติ
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  handleReject(selectedBooking.id);
                  setIsDetailModalOpen(false);
                }}
              >
                ไม่อนุมัติ
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDetailModalOpen(false)}
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

