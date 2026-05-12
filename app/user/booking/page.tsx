'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabaseClient';
import {
  ImageIcon,
  Search,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageSearch,
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
  const [currentUserName, setCurrentUserName] = useState('');

  const [form, setForm] = useState({
    borrowDate: '',
    borrowTime: '',
    returnDate: '',
    returnTime: '',
    reason: '',
    urgent: false,
  });

  const openWarningModal = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
  };

  const sendEmail = async (
    to: string | null | undefined,
    subject: string,
    message: string
  ) => {
    if (!to) return;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('sendEmail error:', errorData);
      }
    } catch (error) {
      console.error('sendEmail failed:', error);
    }
  };

  const formatThaiDateTime = (dateTime: string) => {
    if (!dateTime) return '-';

    return new Date(dateTime).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      const { data: profile } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      setCurrentUserEmail(userEmail);
      setCurrentUserName(profile?.name || userEmail || 'ผู้ใช้งาน');

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
    ...Array.from(new Set(equipment.map((item) => item.category).filter(Boolean))),
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

  const resetForm = () => {
    setForm({
      borrowDate: '',
      borrowTime: '',
      returnDate: '',
      returnTime: '',
      reason: '',
      urgent: false,
    });
  };

  const submitBorrow = async () => {
    if (!selected || selected.available_stock <= 0) return;

    if (!currentUserEmail) {
      openWarningModal('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      return;
    }

    if (
      !form.borrowDate ||
      !form.borrowTime ||
      !form.returnDate ||
      !form.returnTime ||
      !form.reason.trim()
    ) {
      openWarningModal('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const borrowDateTime = `${form.borrowDate}T${form.borrowTime}`;
    const returnDateTime = `${form.returnDate}T${form.returnTime}`;

    const borrowTimeValue = new Date(borrowDateTime).getTime();
    const returnTimeValue = new Date(returnDateTime).getTime();

    if (returnTimeValue <= borrowTimeValue) {
      openWarningModal('วันเวลาคืนต้องมากกว่าวันเวลาเริ่มยืม');
      return;
    }

    const borrowerName = currentUserName || currentUserEmail || 'ผู้ใช้งาน';

    const { data: insertedRequest, error: insertError } = await supabase
      .from('borrow_requests')
      .insert([
        {
          request_type: 'equipment',
          equipment_id: selected.id,
          computer_id: null,
          user_name: borrowerName,
          user_email: currentUserEmail,
          reason: form.reason.trim(),
          borrow_date: borrowDateTime,
          return_date: returnDateTime,
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
      const adminList = admins.filter((admin) => admin.email);

      await supabase.from('notifications').insert(
        adminList.map((admin) => ({
          user_email: admin.email,
          title: form.urgent ? 'มีคำขอด่วนใหม่' : 'มีคำขอใหม่',
          message: `${borrowerName} ได้ส่งคำขอยืม ${selected.name}`,
          type: form.urgent ? 'urgent_request' : 'new_request',
          related_request_id: insertedRequest.id,
        }))
      );

      await Promise.all(
        adminList.map((admin) =>
          sendEmail(
            admin.email,
            form.urgent ? 'มีคำขอยืมอุปกรณ์ด่วน' : 'มีคำขอยืมอุปกรณ์ใหม่',
            `มีคำขอยืมอุปกรณ์ใหม่จากระบบ

รายละเอียดคำขอ
ผู้ขอยืม: ${borrowerName}
อีเมลผู้ขอยืม: ${currentUserEmail}
อุปกรณ์: ${selected.name}
วันที่เริ่มยืม: ${formatThaiDateTime(borrowDateTime)}
วันที่คืน: ${formatThaiDateTime(returnDateTime)}
เหตุผล: ${form.reason.trim()}
ความเร่งด่วน: ${form.urgent ? 'เร่งด่วน' : 'ปกติ'}
สถานะ: รออนุมัติ

หมายเหตุ: ผู้ยืมต้องคืนอุปกรณ์ภายในวันและเวลาที่กำหนด หากคืนล่าช้าหรือไม่คืนตามกำหนด อาจมีค่าปรับหรือดำเนินการตามระเบียบของหน่วยงาน

กรุณาเข้าสู่ระบบเพื่อตรวจสอบและอนุมัติคำขอ`
          )
        )
      );
    }

    setOpen(false);
    setShowSuccess(true);
    resetForm();

    fetchEquipment();
  };

  return (
    <DashboardLayout
      title="ขอยืมอุปกรณ์"
      actionButton={
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Link href="/user/my-bookings" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-[13px] font-black text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600 sm:h-10 sm:px-5 sm:text-[14px]"
            >
              <Clock size={17} />
              <span>ประวัติการจอง</span>
            </Button>
          </Link>

          <Link href="/user/computer-booking" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 text-[13px] font-black text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 sm:h-10 sm:px-5 sm:text-[14px]"
            >
              <LayoutGrid size={17} />
              <span>ขอใช้คอมพิวเตอร์</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 pb-32 md:space-y-8 md:pb-20">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/40 md:p-5">
          <div className="mb-4 flex items-center gap-2 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <PackageSearch size={19} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 md:text-base">
                ค้นหาอุปกรณ์
              </h2>
              <p className="text-[11px] font-bold text-slate-400">
                เลือกอุปกรณ์ที่ต้องการยืม
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="group relative w-full rounded-2xl border border-slate-100 bg-slate-50">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่ออุปกรณ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-13 w-full border-none bg-transparent py-4 pl-12 pr-4 text-base font-bold text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-11 shrink-0 rounded-2xl border px-5 text-sm font-black whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertCircle size={22} />
            </div>

            <div>
              <p className="text-sm font-black text-amber-700">
                หมายเหตุการยืม–คืนอุปกรณ์
              </p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-amber-700/80">
                ผู้ใช้งานควรตรวจสอบวันและเวลาคืนก่อนส่งคำขอ และต้องคืนอุปกรณ์ภายในเวลาที่กำหนด
                หากคืนล่าช้าหรือไม่คืนตามกำหนด อาจมีค่าปรับหรือดำเนินการตามระเบียบของหน่วยงาน
              </p>
            </div>
          </div>
        </div>

        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {filteredEquipment.map((item, index) => (
              <div
                key={index}
                className="group flex flex-col overflow-hidden rounded-[2.2rem] border border-slate-100 bg-white font-bold shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl md:rounded-[2.5rem]"
              >
                <div className="relative flex h-72 w-full items-center justify-center overflow-hidden border-b border-slate-50 bg-slate-50 md:h-56">
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
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-lg backdrop-blur-md ${
                        item.available_stock > 0
                          ? 'border-emerald-400 bg-emerald-500/90 text-white'
                          : 'border-slate-700 bg-slate-800/90 text-white'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 animate-pulse rounded-full ${
                          item.available_stock > 0
                            ? 'bg-emerald-200'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {item.available_stock > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                  <div className="mb-6">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-blue-500">
                      {item.category}
                    </span>
                    <h3 className="line-clamp-2 text-2xl font-black leading-tight text-slate-800 transition-colors group-hover:text-blue-600 md:text-xl">
                      {item.name}
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-2">
                      <div className="rounded-2xl bg-white py-3 text-center shadow-sm">
                        <p className="mb-1 text-[10px] font-black uppercase text-slate-400">
                          ทั้งหมด
                        </p>
                        <p className="text-2xl font-black text-slate-700 md:text-lg">
                          {item.total_stock || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white py-3 text-center shadow-sm">
                        <p className="mb-1 text-[10px] font-black uppercase text-emerald-400">
                          ว่าง
                        </p>
                        <p className="text-2xl font-black text-emerald-600 md:text-lg">
                          {item.available_stock || 0}
                        </p>
                      </div>
                    </div>

                    <Button
                      disabled={item.available_stock <= 0}
                      className={`w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all ${
                        item.available_stock <= 0
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-slate-900 text-white shadow-md hover:bg-blue-600'
                      }`}
                      onClick={() => {
                        setSelected(item);
                        setOpen(true);
                      }}
                    >
                      {item.available_stock <= 0
                        ? 'ถูกยืมแล้ว'
                        : 'ขอยืมอุปกรณ์'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <Search size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-black text-slate-500">
              ไม่พบอุปกรณ์ที่ค้นหา
            </p>
            <p className="mt-1 text-sm font-bold text-slate-300">
              ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ใหม่
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`📌 ขอยืม: ${selected?.name || ''}`}
      >
        <div className="space-y-5 pt-4 font-bold text-black">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <label className="block text-[11px] font-black uppercase text-blue-500">
                วันที่เริ่มยืม
              </label>
              <input
                type="date"
                className="h-11 w-full rounded-xl border-2 border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                value={form.borrowDate}
                onChange={(e) =>
                  setForm({ ...form, borrowDate: e.target.value })
                }
              />

              <label className="block text-[11px] font-black uppercase text-blue-500">
                เวลาเริ่มยืม
              </label>
              <input
                type="time"
                className="h-11 w-full rounded-xl border-2 border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                value={form.borrowTime}
                onChange={(e) =>
                  setForm({ ...form, borrowTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <label className="block text-[11px] font-black uppercase text-emerald-500">
                วันที่คืน
              </label>
              <input
                type="date"
                className="h-11 w-full rounded-xl border-2 border-emerald-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                value={form.returnDate}
                onChange={(e) =>
                  setForm({ ...form, returnDate: e.target.value })
                }
              />

              <label className="block text-[11px] font-black uppercase text-emerald-500">
                เวลาคืน
              </label>
              <input
                type="time"
                className="h-11 w-full rounded-xl border-2 border-emerald-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                value={form.returnTime}
                onChange={(e) =>
                  setForm({ ...form, returnTime: e.target.value })
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <p className="text-sm font-black text-amber-700">
                  หมายเหตุการคืนอุปกรณ์
                </p>
                <p className="mt-1 text-xs font-bold leading-relaxed text-amber-700/80">
                  กรุณาคืนอุปกรณ์ภายในวันและเวลาที่กำหนด หากคืนล่าช้าหรือไม่คืนตามกำหนด
                  อาจมีค่าปรับหรือดำเนินการตามระเบียบของหน่วยงาน
                </p>
              </div>
            </div>
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