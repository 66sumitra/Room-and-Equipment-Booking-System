'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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