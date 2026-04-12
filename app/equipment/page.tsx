'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
<<<<<<< HEAD
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
      id: 'dm-001',
      name: 'ดิจิทัลมัลติมิเตอร์ Fluke 177 True-RMS',
      lab: 'LAB501 - ห้องปฏิบัติการฟิสิกส์',
      description: 'วัดค่าทางไฟฟ้า True-RMS ความแม่นยำสูง สำหรับงานซ่อมบำรุง',
      category: 'เครื่องมือวัดไฟฟ้า',
      quantity: 3,
      available: 10,
    },
    {
      id: 'psu-001',
      name: 'เครื่องจ่ายไฟ DC แบบปรับค่าได้',
      lab: 'LAB0304 - ห้องไฟฟ้าอิเล็กทรอนิกส์',
      description: 'Power Supply ปรับค่าแรงดันและกระแสได้อิสระ 0-30V',
      category: 'แหล่งจ่ายไฟ (Power Supply)',
      quantity: 3,
      available: 10,
    },
    {
      id: 'nb-001',
      name: 'ออสซิลโลสโคป Tektronix TDS2002C',
      lab: 'LAB0304 - ห้องไฟฟ้าอิเล็กทรอนิกส์',
      description: 'Digital Storage Oscilloscope 60MHz 2 Channel',
      category: 'เครื่องมือวัดสัญญาณ',
      quantity: 1,
      available: 4,
    },
    {
      id: 'fg-001',
      name: 'เครื่องกำเนิดสัญญาณ (Function Generator)',
      lab: 'LAB0304 - ห้องไฟฟ้าอิเล็กทรอนิกส์',
      description: 'สร้างสัญญาณ Sine, Square, Triangle wave ได้',
      category: 'เครื่องมือวัดสัญญาณ',
      quantity: 4,
      available: 6,
    },
    {
      id: 'deb-001',
      name: 'ชุดทดลองวงจดิจิทัล (Digital Circuit)',
      lab: 'LAB0304 - ห้องไฟฟ้าอิเล็กทรอนิกส์',
      description: 'บอร์ดทดลอง NX-100 สำหรับเรียนรู้วงจร Logic Gate',
      category: 'ชุดทดลองดิจิทัล',
      quantity: 2,
      available: 12,
    },
    {
      id: 'tl-001',
      name: 'ชุดสายวัดทดสอบ (Test Leads)',
      lab: 'LAB0304 - ห้องไฟฟ้าอิเล็กทรอนิกส์',
      description: 'ชุดสายวัดแดง-ดำ หัว Banana และปากคีบ',
      category: 'อุปกรณ์เสริม (Accessories)',
      quantity: 1,
      available: 20,
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
                {equipment.lab && (
                  <p className="text-sm text-blue-600 mt-1">{equipment.lab}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{equipment.category}</p>
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
            <p className="text-xs text-gray-500 mt-2">
              พร้อมใช้งาน {equipment.available} / {equipment.quantity} รายการ
            </p>
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
              ห้องแลบ/สถานที่
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น LAB501 - ห้องทดลองฟิสิกส์"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              หมวดหมู่
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>เลือกหมวดหมู่</option>
              <option>ฟิสิกส์ประยุกต์</option>
              <option>วิศวกรรมระบบ</option>
              <option>วิศวกรรมไฟฟ้า</option>
              <option>ฟิสิกส์ขั้นสูง</option>
              <option>อื่นๆ</option>
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
                ห้องแลบ/สถานที่
              </label>
              <input
                type="text"
                defaultValue={selectedEquipment.lab}
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
                <option>ฟิสิกส์ประยุกต์</option>
                <option>วิศวกรรมระบบ</option>
                <option>วิศวกรรมไฟฟ้า</option>
                <option>ฟิสิกส์ขั้นสูง</option>
                <option>อื่นๆ</option>
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

=======
import { Input } from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminEquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // 🛠️ แก้จุดนี้: กำหนดค่าเริ่มต้นให้ครบทุกฟิลด์เพื่อกันตัวแดง
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    category: '',
    total_stock: 0,
    available_stock: 0,
    broken_stock: 0, // ยืนยันว่ามีตัวแปรนี้แน่นอน
    status: 'available'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name', { ascending: true });

    if (!error) setEquipmentList(data || []);
  };

  // ฟังก์ชันช่วยอัปเดตตัวเลขใน Form (ป้องกันการพิมพ์แล้วพัง)
  const handleNumberChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value === '' ? 0 : Number(value)
    });
  };

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      code: formData.code,
      category: formData.category,
      total_stock: formData.total_stock,
      available_stock: formData.available_stock,
      broken_stock: formData.broken_stock,
      status: formData.available_stock > 0 ? 'available' : 'busy'
    };

    if (modalMode === 'add') {
      const { error } = await supabase.from('equipment').insert([payload]);
      if (!error) alert('เพิ่มอุปกรณ์เข้าสต็อกสำเร็จ');
    } else {
      const { error } = await supabase.from('equipment')
        .update(payload)
        .eq('id', formData.id);
      if (!error) alert('อัปเดตยอดสต็อกเรียบร้อย');
    }
    setIsModalOpen(false);
    fetchEquipment();
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการอุปกรณ์นี้ออกจากคลัง?')) {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (!error) fetchEquipment();
    }
  };

  return (
    <DashboardLayout 
      title="Admin: จัดการคลังอุปกรณ์และของชำรุด" 
      actionButton={
        <Button onClick={() => { 
          setModalMode('add'); 
          setFormData({id:'', name:'', code:'', category:'', total_stock:0, available_stock:0, broken_stock:0, status:'available'}); 
          setIsModalOpen(true); 
        }} variant="success"> 
          + เพิ่มอุปกรณ์ใหม่ 
        </Button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-black">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr className="text-left text-xs font-black uppercase">
              <th className="px-6 py-4">ชื่ออุปกรณ์ / รหัส</th>
              <th className="px-6 py-4 text-center">ทั้งหมด</th>
              <th className="px-6 py-4 text-center text-emerald-400">ว่าง</th>
              <th className="px-6 py-4 text-center text-red-400">พัง</th>
              <th className="px-6 py-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {equipmentList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code} | {item.category}</p>
                </td>
                <td className="px-6 py-4 text-center font-black">{item.total_stock || 0}</td>
                <td className="px-6 py-4 text-center font-black text-emerald-600 bg-emerald-50">{item.available_stock || 0}</td>
                <td className="px-6 py-4 text-center font-black text-red-600 bg-red-50">{item.broken_stock || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="secondary" className="!text-black font-bold" onClick={() => { setFormData(item); setModalMode('edit'); setIsModalOpen(true); }}> แก้ไข </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => handleDelete(item.id)}> ลบ </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'เพิ่มอุปกรณ์ใหม่' : 'ลงยอดสต็อก/ของพัง'}>
        <div className="space-y-4 pt-2 text-black">
          <div className="grid grid-cols-2 gap-4">
            <Input label="ชื่ออุปกรณ์" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
            <Input label="รหัสอุปกรณ์ (Code)" value={formData.code} onChange={(e: any) => setFormData({...formData, code: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1 uppercase">จำนวนทั้งหมด</label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2 font-black text-center" 
                value={formData.total_stock} 
                onChange={(e) => handleNumberChange('total_stock', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-emerald-600 mb-1 uppercase">พร้อมใช้งาน</label>
              <input 
                type="number" 
                className="w-full border-2 border-emerald-500 rounded-lg p-2 font-black text-center text-emerald-700" 
                value={formData.available_stock} 
                onChange={(e) => handleNumberChange('available_stock', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-red-600 mb-1 uppercase">ชำรุด (พัง)</label>
              <input 
                type="number" 
                className="w-full border-2 border-red-500 rounded-lg p-2 font-black text-center text-red-700" 
                value={formData.broken_stock} 
                onChange={(e) => handleNumberChange('broken_stock', e.target.value)} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-gray-200 !text-black !font-black border-2 border-gray-400" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
            <Button className="flex-[2] bg-blue-600 text-white font-black" onClick={handleSave}>บันทึกยอดสต็อก</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
