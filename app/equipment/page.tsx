'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function EquipmentPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const sampleEquipment = [
    {
      id: '1',
      name: 'โน๊ตบุ๊ค Dell',
      description: 'โน๊ตบุ๊ค Dell Latitude 7420, Intel Core i7, RAM 16GB',
      category: 'คอมพิวเตอร์',
      quantity: 10,
      available: 7,
    },
    {
      id: '2',
      name: 'โปรเจคเตอร์ Epson',
      description: 'โปรเจคเตอร์ Epson Full HD สำหรับนำเสนอ',
      category: 'อุปกรณ์นำเสนอ',
      quantity: 5,
      available: 3,
    },
    {
      id: '3',
      name: 'แท็บเล็ต iPad',
      description: 'iPad Pro 12.9 นิ้ว พร้อม Apple Pencil',
      category: 'แท็บเล็ต',
      quantity: 8,
      available: 5,
    },
  ];

  const handleEdit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsEditModalOpen(true);
  };

  const handleDelete = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout
      title="จัดการอุปกรณ์"
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
            เพิ่มอุปกรณ์
          </span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleEquipment.map((equipment) => (
          <div key={equipment.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{equipment.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{equipment.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(equipment)}
                  className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(equipment)}
                  className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{equipment.description}</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">ทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-700">{equipment.quantity}</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">ว่าง</p>
                <p className="text-2xl font-bold text-green-700">{equipment.available}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มอุปกรณ์ใหม่"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ชื่ออุปกรณ์
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรุณากรอกชื่ออุปกรณ์"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              หมวดหมู่
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>เลือกหมวดหมู่</option>
              <option>คอมพิวเตอร์</option>
              <option>อุปกรณ์นำเสนอ</option>
              <option>แท็บเล็ต</option>
              <option>กล้อง</option>
              <option>เสียง</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              คำอธิบาย
            </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="กรุณากรอกคำอธิบาย"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              จำนวนทั้งหมด
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
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
                  message: 'เพิ่มอุปกรณ์สำเร็จ!',
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

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขอุปกรณ์"
        size="md"
      >
        {selectedEquipment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่ออุปกรณ์
              </label>
              <input
                type="text"
                defaultValue={selectedEquipment.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                หมวดหมู่
              </label>
              <select
                defaultValue={selectedEquipment.category}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>คอมพิวเตอร์</option>
                <option>อุปกรณ์นำเสนอ</option>
                <option>แท็บเล็ต</option>
                <option>กล้อง</option>
                <option>เสียง</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                คำอธิบาย
              </label>
              <textarea
                defaultValue={selectedEquipment.description}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                จำนวนทั้งหมด
              </label>
              <input
                type="number"
                defaultValue={selectedEquipment.quantity}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
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
        {selectedEquipment && (
          <div className="space-y-4">
            <p className="text-gray-700">
              คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{selectedEquipment.name}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              การกระทำนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
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

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </DashboardLayout>
  );
}

