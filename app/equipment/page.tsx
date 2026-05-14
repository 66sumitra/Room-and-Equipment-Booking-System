'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Camera,
  Upload,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Package,
  Pencil,
} from 'lucide-react';

export default function AdminEquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    category: '',
    total_stock: 0,
    available_stock: 0,
    broken_stock: 0,
    status: 'available',
    image_url: '',
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

  const openWarning = (message: string) => {
    setWarningMessage(message);
    setShowWarningModal(true);
  };

  const openSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      code: '',
      category: '',
      total_stock: 0,
      available_stock: 0,
      broken_stock: 0,
      status: 'available',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleNumberChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value === '' ? 0 : Number(value),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getCodePrefix = (name: string, category: string) => {
    const text = `${name} ${category}`.toLowerCase();

    if (
      text.includes('function') ||
      text.includes('generator') ||
      text.includes('สัญญาณ')
    ) {
      return 'FG';
    }

    if (
      text.includes('power') ||
      text.includes('supply') ||
      text.includes('แหล่งจ่าย') ||
      text.includes('จ่ายไฟ')
    ) {
      return 'PSU';
    }

    if (
      text.includes('digital') ||
      text.includes('experiment') ||
      text.includes('board') ||
      text.includes('บอร์ด') ||
      text.includes('ทดลอง')
    ) {
      return 'DEB';
    }

    if (
      text.includes('multimeter') ||
      text.includes('meter') ||
      text.includes('มิเตอร์') ||
      text.includes('วัดไฟ')
    ) {
      return 'DM';
    }

    if (
      text.includes('lead') ||
      text.includes('cable') ||
      text.includes('สาย') ||
      text.includes('สายวัด')
    ) {
      return 'TL';
    }

    if (
      text.includes('circuit') ||
      text.includes('วงจร') ||
      text.includes('ไฟฟ้า')
    ) {
      return 'EB';
    }

    const source = category.trim() || name.trim();

    if (!source) return 'EQ';

    const english = source
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase();

    if (english.length >= 2) return english.padEnd(3, 'X');

    return 'EQ';
  };

  const generateEquipmentCode = async (name: string, category: string) => {
    const prefix = getCodePrefix(name, category);

    const { data, error } = await supabase
      .from('equipment')
      .select('code')
      .ilike('code', `${prefix}-%`);

    if (error) throw error;

    const maxNumber = (data || []).reduce((max, item) => {
      const code = item.code || '';
      const match = code.match(new RegExp(`^${prefix}-(\\d+)$`));

      if (!match) return max;

      const number = Number(match[1]);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    const nextNumber = String(maxNumber + 1).padStart(3, '0');

    return `${prefix}-${nextNumber}`;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      openWarning('กรุณากรอกชื่ออุปกรณ์');
      return false;
    }

    if (!formData.category.trim()) {
      openWarning('กรุณากรอกหมวดหมู่อุปกรณ์');
      return false;
    }

    if (
      formData.total_stock < 0 ||
      formData.available_stock < 0 ||
      formData.broken_stock < 0
    ) {
      openWarning('จำนวนอุปกรณ์ต้องไม่ติดลบ');
      return false;
    }

    if (formData.available_stock + formData.broken_stock > formData.total_stock) {
      openWarning('จำนวนพร้อมใช้และจำนวนชำรุดรวมกันต้องไม่เกินจำนวนทั้งหมด');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setUploading(true);
    let finalImageUrl = formData.image_url;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `devices/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('device-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('device-images')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      const finalCode =
        modalMode === 'add'
          ? await generateEquipmentCode(formData.name.trim(), formData.category.trim())
          : formData.code.trim() ||
            (await generateEquipmentCode(
              formData.name.trim(),
              formData.category.trim()
            ));

      const payload = {
        name: formData.name.trim(),
        code: finalCode,
        category: formData.category.trim(),
        total_stock: formData.total_stock,
        available_stock: formData.available_stock,
        broken_stock: formData.broken_stock,
        status: formData.available_stock > 0 ? 'available' : 'busy',
        image_url: finalImageUrl,
      };

      if (modalMode === 'add') {
        const { error } = await supabase.from('equipment').insert([payload]);
        if (error) throw error;
        openSuccess(`เพิ่มอุปกรณ์ใหม่เรียบร้อยแล้ว รหัสอุปกรณ์คือ ${finalCode}`);
      } else {
        const { error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', formData.id);

        if (error) throw error;
        openSuccess('อัปเดตข้อมูลอุปกรณ์เรียบร้อยแล้ว');
      }

      setIsModalOpen(false);
      resetForm();
      fetchEquipment();
    } catch (err: any) {
      openWarning('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (item: any) => {
    setFormData({
      id: item.id || '',
      name: item.name || '',
      code: item.code || '',
      category: item.category || '',
      total_stock: item.total_stock || 0,
      available_stock: item.available_stock || 0,
      broken_stock: item.broken_stock || 0,
      status: item.status || 'available',
      image_url: item.image_url || '',
    });

    setImagePreview(item.image_url || null);
    setImageFile(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', deleteTargetId);

    if (error) {
      openWarning('ลบข้อมูลไม่สำเร็จ: ' + error.message);
      return;
    }

    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
    openSuccess('ลบข้อมูลอุปกรณ์เรียบร้อยแล้ว');
    fetchEquipment();
  };

  return (
    <DashboardLayout
      title="จัดการคลังอุปกรณ์"
      actionButton={
        <Button
          onClick={() => {
            setModalMode('add');
            resetForm();
            setIsModalOpen(true);
          }}
          variant="success"
          className="w-full rounded-2xl px-5 py-3 text-sm font-black shadow-lg sm:w-auto"
        >
          + เพิ่มอุปกรณ์ใหม่
        </Button>
      }
    >
      <div className="pb-28 md:pb-16">
        <div className="space-y-4 md:hidden">
          {equipmentList.length > 0 ? (
            equipmentList.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50"
              >
                <div className="flex gap-4 p-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        className="h-full w-full object-cover"
                        alt={item.name || 'equipment'}
                      />
                    ) : (
                      <ImageIcon className="text-slate-300" size={28} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-xl font-black leading-snug text-slate-800">
                      {item.name}
                    </p>
                    <p className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600">
                      {item.code || 'ไม่มีรหัส'}
                    </p>
                    <p className="mt-2 text-xs font-bold text-blue-500">
                      {item.category || 'ไม่ระบุหมวดหมู่'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-y border-slate-100 bg-slate-50/70">
                  <div className="p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      ทั้งหมด
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-800">
                      {item.total_stock || 0}
                    </p>
                  </div>

                  <div className="border-x border-slate-100 bg-emerald-50/70 p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-emerald-500">
                      ว่าง
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-600">
                      {item.available_stock || 0}
                    </p>
                  </div>

                  <div className="bg-red-50/70 p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-red-500">
                      พัง
                    </p>
                    <p className="mt-1 text-2xl font-black text-red-600">
                      {item.broken_stock || 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 !font-black !text-slate-700"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil size={16} />
                    แก้ไข
                  </Button>

                  <Button
                    size="sm"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 py-3 font-black text-white hover:bg-red-600"
                    onClick={() => openDeleteConfirm(item.id)}
                  >
                    <Trash2 size={16} />
                    ลบ
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <Package size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-400">
                ยังไม่มีข้อมูลอุปกรณ์
              </p>
            </div>
          )}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white text-black shadow-xl md:block">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr className="text-left text-[11px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">รูป</th>
                <th className="px-6 py-5">ชื่ออุปกรณ์ / รหัส</th>
                <th className="px-6 py-5 text-center">ทั้งหมด</th>
                <th className="px-6 py-5 text-center text-emerald-400">ว่าง</th>
                <th className="px-6 py-5 text-center text-red-400">พัง</th>
                <th className="px-6 py-5 text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {equipmentList.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          className="h-full w-full object-cover"
                          alt={item.name || 'equipment'}
                        />
                      ) : (
                        <ImageIcon className="text-gray-300" size={20} />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800">{item.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase text-blue-600">
                        {item.code || 'ไม่มีรหัส'}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-gray-400">
                        {item.category || 'ไม่ระบุหมวดหมู่'}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center font-black">
                    {item.total_stock || 0}
                  </td>

                  <td className="bg-emerald-50/50 px-6 py-4 text-center font-black text-emerald-600">
                    {item.available_stock || 0}
                  </td>

                  <td className="bg-red-50/50 px-6 py-4 text-center font-black text-red-600">
                    {item.broken_stock || 0}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!font-black !text-black"
                        onClick={() => openEditModal(item)}
                      >
                        แก้ไข
                      </Button>

                      <Button
                        size="sm"
                        className="bg-red-500 font-black text-white hover:bg-red-600"
                        onClick={() => openDeleteConfirm(item.id)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {equipmentList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center font-bold text-slate-400"
                  >
                    ยังไม่มีข้อมูลอุปกรณ์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'เพิ่มอุปกรณ์ใหม่' : 'แก้ไขข้อมูลอุปกรณ์'}
      >
        <div className="space-y-5 pt-2 font-bold text-black">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-6">
            <div className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border bg-white shadow-inner">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="h-full w-full object-cover"
                  alt="preview"
                />
              ) : (
                <Camera size={40} className="text-slate-200" />
              )}

              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <p className="text-center text-[10px] uppercase tracking-tighter text-slate-400">
              คลิกที่รูปเพื่อเปลี่ยนรูปภาพอุปกรณ์
            </p>
          </div>

           <Input
              label="ชื่ออุปกรณ์"
                     value={formData.name}
                 onChange={(e: any) =>
                  setFormData({ ...formData, name: e.target.value })
             }
          />

          <Input
            label="หมวดหมู่อุปกรณ์"
            value={formData.category}
            onChange={(e: any) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                ทั้งหมด
              </label>
              <input
                type="number"
                className="w-full rounded-xl border p-2 text-center font-black"
                value={formData.total_stock}
                onChange={(e) =>
                  handleNumberChange('total_stock', e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-emerald-500">
                พร้อมใช้
              </label>
              <input
                type="number"
                className="w-full rounded-xl border-2 border-emerald-500 p-2 text-center font-black text-emerald-700"
                value={formData.available_stock}
                onChange={(e) =>
                  handleNumberChange('available_stock', e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-red-500">
                ชำรุด
              </label>
              <input
                type="number"
                className="w-full rounded-xl border-2 border-red-500 p-2 text-center font-black text-red-700"
                value={formData.broken_stock}
                onChange={(e) =>
                  handleNumberChange('broken_stock', e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              className="flex-1 rounded-2xl bg-slate-100 !font-black !text-slate-500"
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </Button>

            <Button
              disabled={uploading}
              className="flex-[2] rounded-2xl bg-blue-600 font-black text-white shadow-lg shadow-blue-200"
              onClick={handleSave}
            >
              {uploading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลอุปกรณ์'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        <div className="flex flex-col items-center py-8 text-center font-bold">
          <div className="mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          </div>

          <h3 className="mb-2 text-2xl font-black leading-tight text-slate-800">
            สำเร็จ
          </h3>

          <p className="mb-8 max-w-[280px] text-[13px] font-bold leading-relaxed text-slate-500">
            {successMessage}
          </p>

          <Button
            className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl"
            onClick={() => setShowSuccessModal(false)}
          >
            ตกลง
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title=""
      >
        <div className="flex flex-col items-center py-8 text-center font-bold">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-200">
              <AlertCircle size={32} className="text-white" />
            </div>
          </div>

          <h3 className="mb-2 text-2xl font-black leading-tight text-slate-800">
            กรุณาตรวจสอบข้อมูล
          </h3>

          <p className="mb-8 max-w-[280px] text-[13px] font-bold leading-relaxed text-slate-500">
            {warningMessage}
          </p>

          <Button
            className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl"
            onClick={() => setShowWarningModal(false)}
          >
            ตกลง
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title=""
      >
        <div className="flex flex-col items-center py-8 text-center font-bold">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-200">
              <Trash2 size={30} className="text-white" />
            </div>
          </div>

          <h3 className="mb-2 text-2xl font-black leading-tight text-slate-800">
            ยืนยันการลบ?
          </h3>

          <p className="mb-8 max-w-[280px] text-[13px] font-bold leading-relaxed text-slate-500">
            หากลบแล้ว ข้อมูลอุปกรณ์นี้จะหายไปจากระบบ
          </p>

          <div className="flex w-full gap-3">
            <Button
              className="flex-1 rounded-2xl bg-slate-200 py-4 text-xs font-black text-slate-500"
              onClick={() => setShowDeleteConfirm(false)}
            >
              ยกเลิก
            </Button>

            <Button
              className="flex-[1.5] rounded-2xl bg-red-500 py-4 text-xs font-black text-white shadow-xl shadow-red-100"
              onClick={handleDelete}
            >
              ยืนยันลบ
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}