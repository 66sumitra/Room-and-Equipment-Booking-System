'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';
import Link from 'next/link';

export default function RoomsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const sampleRooms = [
    {
      id: '1',
<<<<<<< HEAD
      name: 'ห้องคอมพิวเตอร์ 1-0303',
      roomCode: '1-0303',
      roomType: 'computer_lab',
      building: 'อาคาร 1',
      floor: '3',
=======
      name: 'ห้องคอมพิวเตอร์ LAB501',
      roomCode: 'LAB501',
      roomType: 'computer_lab',
      building: 'อาคาร 1',
      floor: '5',
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      department: 'ภาควิชาวิทยาการคอมพิวเตอร์',
      computerCount: 40,
      equipmentCount: 5,
      createdAt: '14/11/2025',
    },
    {
      id: '2',
<<<<<<< HEAD
      name: 'ห้องคอมพิวเตอร์ 1-0103',
      roomCode: '1-0103',
      roomType: 'computer_lab',
      building: 'อาคาร 1',
      floor: '3',
=======
      name: 'ห้องคอมพิวเตอร์ LAB502',
      roomCode: 'LAB502',
      roomType: 'computer_lab',
      building: 'อาคาร 1',
      floor: '5',
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      department: 'ภาควิชาวิทยาการคอมพิวเตอร์',
      computerCount: 30,
      equipmentCount: 3,
      createdAt: '14/11/2025',
    },
<<<<<<< HEAD
   /* {
=======
    {
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      id: '3',
      name: 'ห้องแลบ LAB201',
      roomCode: 'LAB201',
      roomType: 'lab',
      building: 'อาคาร 2',
      floor: '2',
      department: 'ภาควิชาวิทยาศาสตร์',
      computerCount: 0,
      equipmentCount: 15,
      createdAt: '14/11/2025',
<<<<<<< HEAD
    },*/
=======
    },
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
  ];

  const handleEdit = (room: any) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDelete = (room: any) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleView = (room: any) => {
    setSelectedRoom(room);
    setIsViewModalOpen(true);
  };

  const getRoomTypeLabel = (type: string) => {
    const labels = {
      computer_lab: 'ห้องคอม',
      lab: 'ห้องแลบ',
      equipment_center: 'ห้องเครื่องมือ',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <DashboardLayout
<<<<<<< HEAD
      title="จัดการห้องคอมพิวเตอร์"
=======
      title="จัดการห้อง (Grouping)"
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      actionButton={
        <Button
          variant="success"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มห้อง
          </span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
<<<<<<< HEAD
            <strong>หมายเหตุ:</strong> สามารถจองคอมพิวเตอร์ 1 เครื่อง ต่อ 1 คนเท่านั้น
=======
            <strong>หมายเหตุ:</strong> ห้องใช้เป็น "กล่องรวม" สำหรับ grouping เท่านั้น ไม่มีการจองห้องทั้งห้อง
            ผู้ใช้จะจองคอมพิวเตอร์แต่ละเครื่องในห้องแทน
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 cursor-pointer" onClick={() => handleView(room)}>
                  <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">รหัส: {room.roomCode}</p>
                  <p className="text-xs text-gray-400 mt-1">สร้างเมื่อ: {room.createdAt}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="w-8 h-8 bg-red-100 rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{room.building} ชั้น {room.floor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{getRoomTypeLabel(room.roomType)}</span>
                </div>
                {room.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{room.department}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">คอมพิวเตอร์</p>
                  <p className="text-2xl font-bold text-blue-700">{room.computerCount}</p>
                </div>
                <div className="flex-1 bg-teal-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">อุปกรณ์</p>
                  <p className="text-2xl font-bold text-teal-700">{room.equipmentCount}</p>
                </div>
              </div>

              <Link href={`/admin/rooms/${room.id}/computers`}>
                <Button variant="primary" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    ดูคอมพิวเตอร์ในห้อง
                  </span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มห้องใหม่"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              label="ชื่อห้อง"
              placeholder="เช่น ห้องคอมพิวเตอร์ LAB501"
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="text"
              label="รหัสห้อง"
              placeholder="เช่น LAB501"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">ใช้เป็น prefix สำหรับรหัสเครื่อง เช่น LAB501-PC01</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                label="อาคาร"
                placeholder="เช่น อาคาร 1"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="text"
                label="ชั้น"
                placeholder="เช่น 5"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทห้อง</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="computer_lab">ห้องคอม</option>
              <option value="lab">ห้องแลบ</option>
              <option value="equipment_center">ห้องเครื่องมือ</option>
            </select>
          </div>
          <div>
            <Input
              type="text"
              label="ภาควิชา/หน่วยงาน (ถ้ามี)"
              placeholder="เช่น ภาควิชาวิทยาการคอมพิวเตอร์"
              className="w-full"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                setToast({
                  isVisible: true,
                  message: 'เพิ่มห้องสำเร็จ!',
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

      {/* View Room Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="รายละเอียดห้อง"
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">ชื่อห้อง</p>
                <p className="text-lg font-semibold text-gray-800">{selectedRoom.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">รหัสห้อง</p>
                <p className="text-lg font-semibold text-gray-800">{selectedRoom.roomCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">สถานที่</p>
                <p className="text-gray-700">{selectedRoom.building} ชั้น {selectedRoom.floor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">ประเภท</p>
                <p className="text-gray-700">{getRoomTypeLabel(selectedRoom.roomType)}</p>
              </div>
              {selectedRoom.department && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">ภาควิชา/หน่วยงาน</p>
                  <p className="text-gray-700">{selectedRoom.department}</p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">คอมพิวเตอร์</p>
                  <p className="text-3xl font-bold text-blue-700">{selectedRoom.computerCount}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">อุปกรณ์</p>
                  <p className="text-3xl font-bold text-teal-700">{selectedRoom.equipmentCount}</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link href={`/admin/rooms/${selectedRoom.id}/computers`}>
                <Button variant="primary" className="w-full">
                  ดูคอมพิวเตอร์ในห้องนี้
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขห้อง"
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                label="ชื่อห้อง"
                defaultValue={selectedRoom.name}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="text"
                label="รหัสห้อง"
                defaultValue={selectedRoom.roomCode}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  label="อาคาร"
                  defaultValue={selectedRoom.building}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="ชั้น"
                  defaultValue={selectedRoom.floor}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทห้อง</label>
              <select
                defaultValue={selectedRoom.roomType}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="computer_lab">ห้องคอม</option>
                <option value="lab">ห้องแลบ</option>
                <option value="equipment_center">ห้องเครื่องมือ</option>
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
                    message: 'แก้ไขห้องสำเร็จ!',
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="ยืนยันการลบ"
        size="sm"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <p className="text-gray-700">
              คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{selectedRoom.name}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              การกระทำนี้จะลบคอมพิวเตอร์และอุปกรณ์ทั้งหมดในห้องนี้
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setToast({
                    isVisible: true,
                    message: 'ลบห้องสำเร็จ!',
                    type: 'success',
                  });
                }}
              >
                ลบ
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
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
