'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function BookingRulesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const rules = [
    {
      id: '1',
      userRole: 'student',
      itemType: 'computer',
      advanceBookingDays: 3,
      maxBookingHours: 4,
      timeSlotStep: 2,
    },
    {
      id: '2',
      userRole: 'teacher',
      itemType: 'computer',
      advanceBookingDays: 14,
      maxBookingHours: 8,
      timeSlotStep: 2,
    },
    {
      id: '3',
      userRole: 'student',
      itemType: 'equipment',
      advanceBookingDays: 3,
      maxBookingDays: 1,
      allowedEquipmentCategories: ['คอมพิวเตอร์', 'อุปกรณ์นำเสนอ'],
    },
    {
      id: '4',
      userRole: 'teacher',
      itemType: 'equipment',
      advanceBookingDays: 14,
      maxBookingDays: 7,
      allowedEquipmentCategories: ['ทั้งหมด'],
    },
  ];

  const handleEdit = (rule: any) => {
    setSelectedRule(rule);
    setIsEditModalOpen(true);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      student: 'นักศึกษา',
      teacher: 'อาจารย์',
      lab_admin: 'ผู้ดูแลแลบ',
      super_admin: 'ผู้ดูแลระบบ',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getItemTypeLabel = (type: string) => {
    return type === 'computer' ? 'คอมพิวเตอร์' : 'อุปกรณ์';
  };

  return (
    <DashboardLayout
      title="นโยบายการยืม"
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
            เพิ่มกฎ
          </span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>หมายเหตุ:</strong> ตั้งค่านโยบายการยืมสำหรับคอมพิวเตอร์แต่ละเครื่องและอุปกรณ์
            สามารถกำหนดสิทธิ์ตามบทบาทผู้ใช้ได้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {getRoleLabel(rule.userRole)} - {getItemTypeLabel(rule.itemType)}
                  </h3>
                </div>
                <button
                  onClick={() => handleEdit(rule)}
                  className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">ยืมล่วงหน้าได้</span>
                  <span className="font-semibold text-gray-800">{rule.advanceBookingDays} วัน</span>
                </div>
                
                {rule.itemType === 'computer' ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">สูงสุดต่อวัน</span>
                      <span className="font-semibold text-gray-800">{rule.maxBookingHours} ชั่วโมง</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">ขั้นตอนเวลา</span>
                      <span className="font-semibold text-gray-800">{rule.timeSlotStep} ชั่วโมง</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">ยืมได้สูงสุด</span>
                      <span className="font-semibold text-gray-800">{rule.maxBookingDays} วัน</span>
                    </div>
                    {rule.allowedEquipmentCategories && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 block mb-2">ประเภทอุปกรณ์ที่ยืมได้:</span>
                        <div className="flex flex-wrap gap-2">
                          {rule.allowedEquipmentCategories.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มกฎการยืม"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">บทบาทผู้ใช้</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="student">นักศึกษา</option>
              <option value="teacher">อาจารย์</option>
              <option value="lab_admin">ผู้ดูแลแลบ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทการยืม</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="computer">คอมพิวเตอร์</option>
              <option value="equipment">อุปกรณ์</option>
            </select>
          </div>
          <div>
            <Input
              type="number"
              label="ยืมล่วงหน้าได้ (วัน)"
              placeholder="เช่น 3"
              className="w-full"
            />
          </div>
          <div id="computer-fields">
            <Input
              type="number"
              label="สูงสุดต่อวัน (ชั่วโมง)"
              placeholder="เช่น 4"
              className="w-full"
            />
            <Input
              type="number"
              label="ขั้นตอนเวลา (ชั่วโมง)"
              placeholder="เช่น 2"
              className="w-full"
            />
          </div>
          <div id="equipment-fields" className="hidden">
            <Input
              type="number"
              label="ยืมได้สูงสุด (วัน)"
              placeholder="เช่น 1"
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
                  message: 'เพิ่มกฎการยืมสำเร็จ!',
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

      {/* Edit Rule Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขกฎการยืม"
        size="lg"
      >
        {selectedRule && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">บทบาทผู้ใช้</label>
              <select
                defaultValue={selectedRule.userRole}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">นักศึกษา</option>
                <option value="teacher">อาจารย์</option>
                <option value="lab_admin">ผู้ดูแลแลบ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทการยืม</label>
              <select
                defaultValue={selectedRule.itemType}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="computer">คอมพิวเตอร์</option>
                <option value="equipment">อุปกรณ์</option>
              </select>
            </div>
            <div>
              <Input
                type="number"
                label="ยืมล่วงหน้าได้ (วัน)"
                defaultValue={selectedRule.advanceBookingDays}
                className="w-full"
              />
            </div>
            {selectedRule.itemType === 'computer' ? (
              <>
                <div>
                  <Input
                    type="number"
                    label="สูงสุดต่อวัน (ชั่วโมง)"
                    defaultValue={selectedRule.maxBookingHours}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="ขั้นตอนเวลา (ชั่วโมง)"
                    defaultValue={selectedRule.timeSlotStep}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <div>
                <Input
                  type="number"
                  label="ยืมได้สูงสุด (วัน)"
                  defaultValue={selectedRule.maxBookingDays}
                  className="w-full"
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setToast({
                    isVisible: true,
                    message: 'แก้ไขกฎการยืมสำเร็จ!',
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

