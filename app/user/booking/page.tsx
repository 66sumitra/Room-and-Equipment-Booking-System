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

type PickerKey = 'borrowDate' | 'borrowTime' | 'returnDate' | 'returnTime';

type ActivePicker = {
  key: PickerKey;
  label: string;
  type: 'date' | 'time';
  color: 'blue' | 'emerald';
};

type DateTimeFieldProps = {
  label: string;
  type: 'date' | 'time';
  value: string;
  color: 'blue' | 'emerald';
  onOpen: () => void;
};

function formatTimeInput(input: string) {
  let value = input.replace(/[^\d.:]/g, '');

  value = value.replace('.', ':');

  if (/^\d{4}$/.test(value)) {
    value = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
  }

  if (/^\d{1}:\d{2}$/.test(value)) {
    value = `0${value}`;
  }

  return value;
}

function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function getThaiTimeText(time: string) {
  if (!isValidTime(time)) return '';

  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const minuteLabel = minute === 0 ? 'ตรง' : `${minute} นาที`;

  if (hour === 0) return `เที่ยงคืน ${minuteLabel}`;
  if (hour >= 1 && hour <= 5) return `ตี ${hour} ${minuteLabel}`;
  if (hour >= 6 && hour <= 11) return `${hour} โมงเช้า ${minuteLabel}`;
  if (hour === 12) return `เที่ยง ${minuteLabel}`;
  if (hour >= 13 && hour <= 15) return `บ่าย ${hour - 12} โมง ${minuteLabel}`;
  if (hour >= 16 && hour <= 18) return `${hour - 12} โมงเย็น ${minuteLabel}`;
  if (hour >= 19 && hour <= 23) return `${hour - 18} ทุ่ม ${minuteLabel}`;

  return '';
}

function DateTimeField({
  label,
  type,
  value,
  color,
  onOpen,
}: DateTimeFieldProps) {
  const displayValue = (() => {
    if (!value) return type === 'date' ? 'เลือกวันที่' : 'เลือกเวลา';

    if (type === 'date') {
      return new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return `${value} น.`;
  })();

  const colorClass =
    color === 'blue'
      ? 'border-blue-100 focus:ring-blue-100'
      : 'border-emerald-100 focus:ring-emerald-100';

  return (
    <div>
      <label
        className={`mb-2 block text-sm font-black ${
          color === 'blue' ? 'text-blue-500' : 'text-emerald-600'
        }`}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={onOpen}
        className={`flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-4 text-left outline-none transition focus:ring-4 ${colorClass}`}
      >
        <span
          className={`text-[16px] font-black leading-none ${
            value ? 'text-slate-700' : 'text-slate-400'
          }`}
        >
          {displayValue}
        </span>

        <span className="text-lg text-slate-300">
          {type === 'date' ? '📅' : '⏰'}
        </span>
      </button>
    </div>
  );
}

function DateTimePickerPopup({
  picker,
  value,
  onSelect,
  onClose,
}: {
  picker: ActivePicker;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const initialDate =
    picker.type === 'date' && value ? new Date(`${value}T00:00:00`) : today;

  const [customTime, setCustomTime] = useState(value || '');
  const [timeError, setTimeError] = useState('');
  const [selectedDay, setSelectedDay] = useState(
    String(initialDate.getDate())
  );
  const [selectedMonth, setSelectedMonth] = useState(
    String(initialDate.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(initialDate.getFullYear())
  );

  const thaiMonths = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const currentYear = today.getFullYear();
  const yearOptions = Array.from(
    { length: 4 },
    (_, index) => currentYear + index
  );

  const daysInSelectedMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    0
  ).getDate();

  const dayOptions = Array.from({ length: daysInSelectedMonth }, (_, index) => {
    return String(index + 1);
  });

  useEffect(() => {
    if (Number(selectedDay) > daysInSelectedMonth) {
      setSelectedDay(String(daysInSelectedMonth));
    }
  }, [daysInSelectedMonth, selectedDay]);

  const formatSelectedDateValue = () => {
    const month = String(selectedMonth).padStart(2, '0');
    const day = String(selectedDay).padStart(2, '0');

    return `${selectedYear}-${month}-${day}`;
  };

  const selectedDatePreview = new Date(
    `${formatSelectedDateValue()}T00:00:00`
  ).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedCustomTime = formatTimeInput(customTime);
  const timePreview = getThaiTimeText(formattedCustomTime);

  const buttonClass =
    picker.color === 'blue'
      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';

  const inputFocusClass =
    picker.color === 'blue'
      ? 'focus:border-blue-500 focus:ring-blue-100'
      : 'focus:border-emerald-500 focus:ring-emerald-100';

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/50 px-3 pb-3 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="flex max-h-[82svh] w-full max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl sm:max-w-md">
        <div
          className={`shrink-0 px-5 py-5 text-white ${
            picker.color === 'blue'
              ? 'bg-gradient-to-r from-blue-600 to-sky-500'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/75">
                เลือกข้อมูล
              </p>

              <h3 className="mt-1 text-xl font-black leading-tight">
                {picker.label}
              </h3>

              <p className="mt-1 text-xs font-bold text-white/80">
                {picker.type === 'date'
                  ? 'เลือกวัน เดือน ปี ได้เอง'
                  : 'ใช้เวลาแบบ 24 ชั่วโมง ไม่ต้องเลือก AM/PM'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-black text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {picker.type === 'date' ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-black text-slate-700">
                  เลือกวันที่
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-400">
                      วัน
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 ${inputFocusClass}`}
                    >
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-400">
                      เดือน
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 ${inputFocusClass}`}
                    >
                      {thaiMonths.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-400">
                      ปี
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 ${inputFocusClass}`}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year + 543}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center">
                  <p className="text-xs font-bold text-slate-400">
                    วันที่ที่เลือก
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-700">
                    {selectedDatePreview}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelect(formatSelectedDateValue());
                  onClose();
                }}
                className={`h-12 w-full rounded-2xl text-sm font-black text-white shadow-lg transition ${buttonClass}`}
              >
                ใช้วันที่นี้
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-black text-slate-700">
                  กรอกเวลา
                </label>

               <input
                    type="text"
                 inputMode="numeric"
                   value={customTime}
                       onChange={(e) => {
                            setCustomTime(e.target.value);
                   setTimeError('');
            }}
                     placeholder="เช่น 09.00, 13.00, 19.00"
                       className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg font-black text-slate-700 outline-none transition placeholder:text-slate-300 focus:ring-4 ${inputFocusClass}`}
                        />

                <p className="mt-2 text-xs font-bold text-slate-400">
                  ใช้เวลาแบบ 24 ชั่วโมง เช่น 09.00 = 9 โมงเช้า, 13.00 =
                  บ่ายโมง, 19.00 = 1 ทุ่ม
                </p>

                {timePreview && (
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-400">
                      เวลาที่เลือก
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-600">
                      {formattedCustomTime} น. ({timePreview})
                    </p>
                  </div>
                )}

                {timeError && (
                  <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-500">
                    {timeError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const formattedTime = formatTimeInput(customTime);

                  if (!formattedTime) {
                    setTimeError('กรุณากรอกเวลา');
                    return;
                  }

                  if (!isValidTime(formattedTime)) {
                    setTimeError(
                      'กรุณากรอกเวลาให้ถูกต้อง เช่น 09.00, 13.00 หรือ 19.00'
                    );
                    return;
                  }

                  onSelect(formattedTime);
                  onClose();
                }}
                className={`h-12 w-full rounded-2xl text-sm font-black text-white shadow-lg transition ${buttonClass} ${
                  !customTime ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                ใช้เวลานี้
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-2xl bg-slate-100 text-sm font-black text-slate-500"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [activePicker, setActivePicker] = useState<ActivePicker | null>(null);

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
    ...Array.from(
      new Set(equipment.map((item) => item.category).filter(Boolean))
    ),
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

    const borrowTimeFormatted = formatTimeInput(form.borrowTime);
    const returnTimeFormatted = formatTimeInput(form.returnTime);

    if (!isValidTime(borrowTimeFormatted) || !isValidTime(returnTimeFormatted)) {
      openWarningModal('กรุณากรอกเวลาให้ถูกต้อง เช่น 09.00, 13.00 หรือ 19.00');
      return;
    }

    const borrowDateTime = `${form.borrowDate}T${borrowTimeFormatted}`;
    const returnDateTime = `${form.returnDate}T${returnTimeFormatted}`;

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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <Link href="/user/my-bookings" className="w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
            >
              <Clock size={14} />
              <span>ประวัติการจอง</span>
            </Button>
          </Link>

          <Link href="/user/computer-booking" className="w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
            >
              <LayoutGrid size={14} />
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
                หมายเหตุ : การยืม–คืนอุปกรณ์
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

      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="flex h-[86svh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="shrink-0 bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                    แบบฟอร์มขอยืมอุปกรณ์
                  </p>

                  <h2 className="mt-2 line-clamp-3 text-[23px] font-black leading-snug">
                    {selected?.name || 'อุปกรณ์'}
                  </h2>

                  <p className="mt-3 text-xs font-bold text-white/85">
                    กรุณากรอกวัน เวลา และเหตุผลการยืมให้ครบถ้วน
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl font-bold text-white backdrop-blur transition hover:bg-white/25"
                  aria-label="ปิดหน้าต่าง"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-5 font-bold text-slate-800">
                <div className="rounded-[24px] border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-4 text-base font-black text-blue-700">
                    วันที่และเวลาเริ่มยืม
                  </p>

                  <div className="space-y-4">
                    <DateTimeField
                      label="วันที่เริ่มยืม"
                      type="date"
                      value={form.borrowDate}
                      color="blue"
                      onOpen={() =>
                        setActivePicker({
                          key: 'borrowDate',
                          label: 'วันที่เริ่มยืม',
                          type: 'date',
                          color: 'blue',
                        })
                      }
                    />

                    <DateTimeField
                      label="เวลาเริ่มยืม"
                      type="time"
                      value={form.borrowTime}
                      color="blue"
                      onOpen={() =>
                        setActivePicker({
                          key: 'borrowTime',
                          label: 'เวลาเริ่มยืม',
                          type: 'time',
                          color: 'blue',
                        })
                      }
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                  <p className="mb-4 text-base font-black text-emerald-700">
                    วันที่และเวลาคืน
                  </p>

                  <div className="space-y-4">
                    <DateTimeField
                      label="วันที่คืน"
                      type="date"
                      value={form.returnDate}
                      color="emerald"
                      onOpen={() =>
                        setActivePicker({
                          key: 'returnDate',
                          label: 'วันที่คืน',
                          type: 'date',
                          color: 'emerald',
                        })
                      }
                    />

                    <DateTimeField
                      label="เวลาคืน"
                      type="time"
                      value={form.returnTime}
                      color="emerald"
                      onOpen={() =>
                        setActivePicker({
                          key: 'returnTime',
                          label: 'เวลาคืน',
                          type: 'time',
                          color: 'emerald',
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    เหตุผลการยืม <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    placeholder="เช่น ใช้ทำโครงงาน ใช้เรียนวิชา ใช้ทดสอบอุปกรณ์..."
                    className="min-h-28 w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-[16px] font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                      <AlertCircle size={21} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-amber-700">
                        หมายเหตุ : การยืม–คืนอุปกรณ์
                      </p>
                      <p className="mt-1 text-xs font-bold leading-relaxed text-amber-700/80">
                        กรุณาคืนอุปกรณ์ภายในวันและเวลาที่กำหนด หากคืนล่าช้าหรือไม่คืนตามกำหนด
                        อาจมีค่าปรับหรือดำเนินการตามระเบียบของหน่วยงาน
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-red-100 bg-red-50 p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-red-500"
                    checked={form.urgent}
                    onChange={(e) =>
                      setForm({ ...form, urgent: e.target.checked })
                    }
                  />

                  <div>
                    <p className="text-sm font-black text-red-600">
                      เคสเร่งด่วน
                    </p>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-red-400">
                      เลือกช่องนี้หากต้องการใช้งานอุปกรณ์ทันทีหรือมีความจำเป็นเร่งด่วน
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-14 rounded-2xl bg-slate-100 text-base font-black text-slate-500 transition hover:bg-slate-200"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={submitBorrow}
                  className="h-14 rounded-2xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activePicker && (
        <DateTimePickerPopup
          picker={activePicker}
          value={form[activePicker.key]}
          onSelect={(value) =>
            setForm((prev) => ({
              ...prev,
              [activePicker.key]: value,
            }))
          }
          onClose={() => setActivePicker(null)}
        />
      )}

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