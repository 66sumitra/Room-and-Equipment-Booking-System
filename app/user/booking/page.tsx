'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabaseClient';
import {
  ImageIcon,
  Search,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';

export default function BookingPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    borrowDate: '',
    returnDate: '',
    reason: '',
    urgent: false,
  });

  const openWarningModal = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
  };

  useEffect(() => {
    const initPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const userEmail = user.email || '';

      setCurrentUserEmail(userEmail);
      setForm((prev) => ({
        ...prev,
        name: '',
        email: userEmail,
      }));

      fetchEquipment();
    };

    initPage();

    const channel = supabase
      .channel('booking-page-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment' },
        () => {
          fetchEquipment();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    if (!error) setEquipment(data || []);
  };

  const categories = [
    'all',
    ...Array.from(new Set(equipment.map((item) => item.category))),
  ];

  const filteredEquipment = equipment.filter((item) => {
    const itemName = item.name?.toLowerCase?.() || '';
    const itemCategory = item.category?.toLowerCase?.() || '';

    const matchesSearch =
      itemName.includes(searchTerm.toLowerCase()) ||
      itemCategory.includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const submitBorrow = async () => {
    if (!selected || selected.available_stock <= 0) return;

    if (!currentUserEmail) {
      openWarningModal('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      return;
    }

    if (!form.name.trim()) {
      openWarningModal('กรุณากรอกชื่อผู้ขอยืม');
      return;
    }

    if (!form.borrowDate || !form.returnDate || !form.reason.trim()) {
      openWarningModal('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const borrowTime = new Date(form.borrowDate).getTime();
    const returnTime = new Date(form.returnDate).getTime();

    if (returnTime <= borrowTime) {
      openWarningModal('วันเวลาคืนต้องมากกว่าวันเวลาเริ่มยืม');
      return;
    }

    const borrowerName = form.name.trim();

    const { data: insertedRequest, error: insertError } = await supabase
      .from('borrow_requests')
      .insert([
        {
          request_type: 'equipment',
          equipment_id: selected.id,
          computer_id: null,
          user_name: borrowerName,
          user_email: currentUserEmail,
          reason: form.reason,
          borrow_date: form.borrowDate,
          return_date: form.returnDate,
          urgent: form.urgent,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (insertError) {
      openWarningModal('เกิดข้อผิดพลาด: ' + insertError.message);
      return;
    }

    const { data: admins, error: adminError } = await supabase
      .from('users')
      .select('email')
      .eq('role', 'admin');

    if (!adminError && admins && admins.length > 0) {
      await supabase.from('notifications').insert(
        admins
          .filter((admin) => admin.email)
          .map((admin) => ({
            user_email: admin.email,
            title: form.urgent ? 'มีคำขอด่วนใหม่' : 'มีคำขอใหม่',
            message: `${borrowerName} ได้ส่งคำขอยืม ${selected.name}`,
            type: form.urgent ? 'urgent_request' : 'new_request',
            related_request_id: insertedRequest.id,
          }))
      );
    }

    setOpen(false);
    setShowSuccess(true);
    setSelected(null);
    setForm({
      name: '',
      email: currentUserEmail,
      borrowDate: '',
      returnDate: '',
      reason: '',
      urgent: false,
    });

    fetchEquipment();
  };

  return (
    <DashboardLayout
      title="ขอยืมอุปกรณ์"
      actionButton={
        <div className="flex flex-row flex-nowrap items-center gap-3">
          <Link href="/user/my-bookings">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border-2 border-slate-100 bg-white px-5 text-[14px] font-black uppercase tracking-wider !text-slate-500 transition-all hover:border-blue-500 hover:text-blue-600"
            >
              <Clock size={16} />
              <span>ประวัติการจอง</span>
            </Button>
          </Link>

          <Link href="/user/computer-booking">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border-2 border-transparent px-5 text-[14px] font-black uppercase tracking-wider shadow-sm shadow-blue-100"
            >
              <LayoutGrid size={16} />
              <span>ขอใช้คอมพิวเตอร์</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8 pb-20">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-50 pb-4 md:flex-row md:items-end">
            <div></div>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/40 lg:flex-row">
            <div className="group relative w-full flex-1">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"
                size={18}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่ออุปกรณ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full border-none bg-transparent pl-12 pr-6 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="mx-1 hidden h-6 w-[1px] bg-slate-100 lg:block" />

            <div className="no-scrollbar flex w-full shrink-0 items-center gap-1.5 overflow-x-auto p-1 lg:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 rounded-full border-2 px-5 text-[11px] font-black whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-50 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-50 bg-white font-bold shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
            >
              <div className="relative flex h-56 w-full items-center justify-center overflow-hidden border-b border-slate-50 bg-slate-50">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-200">
                    <ImageIcon size={50} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      No Image
                    </span>
                  </div>
                )}

                <div className="absolute bottom-5 left-5">
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 shadow-lg backdrop-blur-md ${
                      item.available_stock > 0
                        ? 'border-emerald-400 bg-emerald-500/90 text-white'
                        : 'border-slate-700 bg-slate-800/90 text-white'
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                        item.available_stock > 0
                          ? 'bg-emerald-200'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-8">
                <div className="mb-6">
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-blue-500">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-black leading-tight text-slate-800 transition-colors group-hover:text-blue-600">
                    {item.name}
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
                    <div className="flex-1 rounded-xl bg-white py-2.5 text-center shadow-sm">
                      <p className="mb-0.5 text-[8px] font-black uppercase text-slate-400">
                        ทั้งหมด
                      </p>
                      <p className="text-md font-black text-slate-700">
                        {item.total_stock || 0}
                      </p>
                    </div>
                    <div className="flex-1 rounded-xl bg-white py-2.5 text-center shadow-sm">
                      <p className="mb-0.5 text-[8px] font-black uppercase text-emerald-400">
                        ว่าง
                      </p>
                      <p className="text-md font-black text-emerald-600">
                        {item.available_stock || 0}
                      </p>
                    </div>
                  </div>

                  <Button
                    disabled={item.available_stock <= 0}
                    className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
                      item.available_stock <= 0
                        ? 'bg-slate-100 text-slate-300'
                        : 'bg-slate-900 text-white shadow-md hover:bg-blue-600'
                    }`}
                    onClick={() => {
                      setSelected(item);
                      setOpen(true);
                    }}
                  >
                    {item.available_stock <= 0 ? 'ถูกยืมเเล้ว' : 'ขอยืมอุปกรณ์'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`📌 ขอยืม: ${selected?.name || ''}`}
      >
        <div className="space-y-5 pt-4 font-bold text-black">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="ml-1 flex items-center gap-2 text-[11px] font-black uppercase text-slate-400">
                <User size={14} />
                ชื่อผู้ขอยืม
              </label>
              <Input
                placeholder="กรอกชื่อ-นามสกุล"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="ml-1 flex items-center gap-2 text-[11px] font-black uppercase text-slate-400">
                <Mail size={14} />
                อีเมลผู้ขอยืม
              </label>
              <input
                type="text"
                value={form.email}
                disabled
                className="h-11 w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-xs font-bold text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-400">
                วันเวลาเริ่มยืม
              </label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-xs font-bold"
                value={form.borrowDate}
                onChange={(e) =>
                  setForm({ ...form, borrowDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-400">
                วันเวลาคืน
              </label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-xs font-bold"
                value={form.returnDate}
                onChange={(e) =>
                  setForm({ ...form, returnDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-[11px] font-black uppercase text-slate-400">
              เหตุผลการยืม
            </label>
            <textarea
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold"
              rows={3}
              placeholder="ระบุเหตุผลความจำเป็น..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-red-100 bg-red-50/50 p-4">
            <input
              type="checkbox"
              className="h-5 w-5 accent-red-500"
              checked={form.urgent}
              onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
            />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase italic text-red-600">
                เคสเร่งด่วน!
              </span>
              <span className="text-[10px] text-red-400">
                ระบุหากต้องใช้งานทันที
              </span>
            </div>
          </label>

          <div className="flex gap-4 pt-4">
            <Button
              className="flex-1 rounded-xl bg-slate-300 py-3 text-xs font-black text-slate-500"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-[2] rounded-xl bg-blue-600 py-3 text-xs font-black text-white shadow-lg"
              onClick={submitBorrow}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showWarning} onClose={() => setShowWarning(false)} title="">
        <div className="flex flex-col items-center justify-center py-8 text-center font-bold">
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
            onClick={() => setShowWarning(false)}
          >
            ตกลง
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="">
        <div className="flex flex-col items-center justify-center py-8 text-center font-bold">
          <div className="mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          </div>

          <h3 className="mb-2 text-2xl font-black leading-tight text-slate-800">
            ส่งคำขอยืมสำเร็จ!
          </h3>

          <p className="mb-8 max-w-[240px] text-[13px] font-bold leading-relaxed text-slate-500">
            ระบบได้รับคำขอเรียบร้อยแล้ว <br />
            โปรดรอสักครู่ แอดมินกำลังตรวจสอบ
          </p>

          <div className="flex w-full flex-col gap-3 px-4">
            <Button
              className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl"
              onClick={() => setShowSuccess(false)}
            >
              ตกลง
            </Button>

            <Link href="/user/my-bookings" className="w-full">
              <button className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 underline underline-offset-4 transition-colors hover:text-blue-600">
                ตรวจสอบสถานะที่หน้าประวัติ →
              </button>
            </Link>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
}