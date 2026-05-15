'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Monitor,
  ClipboardList,
  Sparkles,
  MousePointerClick,
  CheckCircle,
  DoorOpen,
  CalendarDays,
  Clock,
} from 'lucide-react';

function generateRequestNo() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timePart = String(now.getTime()).slice(-5);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `BR-${year}${month}${day}-${timePart}${randomPart}`;
}

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatThaiDateTime(dateTime: string | null | undefined) {
  if (!dateTime) return 'ไม่ระบุ';

  return new Date(dateTime).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UserComputerBooking() {
  const [computers, setComputers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPc, setSelectedPc] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [reason, setReason] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const [popup, setPopup] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(start.getMinutes() + 10);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    setStartDateTime(toDatetimeLocalValue(start));
    setEndDateTime(toDatetimeLocalValue(end));
  }, []);

  const showPopup = (
    type: 'success' | 'error',
    title: string,
    message: string
  ) => {
    setPopup({
      open: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const getRoomName = (pc: any) => {
    return pc.room_name || pc.room_code || 'ไม่ระบุห้อง';
  };

  const rooms = useMemo(() => {
    const roomList = Array.from(
      new Set(computers.map((pc) => getRoomName(pc)).filter(Boolean))
    );

    return roomList;
  }, [computers]);

  const filteredComputers = useMemo(() => {
    if (!selectedRoom) return computers;

    return computers.filter((pc) => getRoomName(pc) === selectedRoom);
  }, [computers, selectedRoom]);

  const fetchAvailablePCs = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('computers')
        .select('*')
        .order('room_name', { ascending: true })
        .order('pc_name', { ascending: true });

      if (error) throw error;

      const allComputers = data || [];
      setComputers(allComputers);

      const roomList = Array.from(
        new Set(allComputers.map((pc) => getRoomName(pc)).filter(Boolean))
      );

      if (!selectedRoom && roomList.length > 0) {
        setSelectedRoom(roomList[0]);
      }

      if (
        selectedRoom &&
        !roomList.includes(selectedRoom) &&
        roomList.length > 0
      ) {
        setSelectedRoom(roomList[0]);
      }
    } catch (error: any) {
      console.error('fetchAvailablePCs error:', error.message);
      setComputers([]);
      showPopup('error', 'โหลดข้อมูลไม่สำเร็จ', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: any = null;

    const initPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      if (!isMounted) return;

      setCurrentUserEmail(user.email || '');
      await fetchAvailablePCs();

      if (!isMounted) return;

      const channelName = `computer-booking-realtime-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      realtimeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'computers' },
          async () => {
            if (!isMounted) return;
            await fetchAvailablePCs();
          }
        )
        .subscribe();
    };

    initPage();

    return () => {
      isMounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectRoom = (room: string) => {
    setSelectedRoom(room);
    setSelectedPc(null);
    setReason('');
  };

  const handleBooking = async () => {
    if (!selectedPc) {
      showPopup(
        'error',
        'ยังไม่ได้เลือกเครื่อง',
        'กรุณาเลือกเครื่องคอมพิวเตอร์ก่อน'
      );
      return;
    }

    if (selectedPc.status !== 'available') {
      showPopup(
        'error',
        'เครื่องไม่ว่าง',
        'เครื่องนี้ไม่ว่างแล้ว กรุณาเลือกเครื่องอื่น'
      );
      await fetchAvailablePCs();
      return;
    }

    if (!startDateTime) {
      showPopup(
        'error',
        'ข้อมูลไม่ครบ',
        'กรุณาระบุวันที่และเวลาเริ่มใช้งาน'
      );
      return;
    }

    if (!endDateTime) {
      showPopup(
        'error',
        'ข้อมูลไม่ครบ',
        'กรุณาระบุวันที่และเวลาสิ้นสุดการใช้งาน'
      );
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showPopup('error', 'รูปแบบเวลาไม่ถูกต้อง', 'กรุณาเลือกวันและเวลาใหม่');
      return;
    }

    if (start < now) {
      showPopup(
        'error',
        'เวลาไม่ถูกต้อง',
        'วันที่และเวลาเริ่มใช้งานต้องไม่เป็นเวลาย้อนหลัง'
      );
      return;
    }

    if (end <= start) {
      showPopup(
        'error',
        'เวลาไม่ถูกต้อง',
        'วันที่และเวลาสิ้นสุดการใช้งานต้องมากกว่าวันที่และเวลาเริ่มใช้งาน'
      );
      return;
    }

    if (!reason.trim()) {
      showPopup('error', 'ข้อมูลไม่ครบ', 'กรุณาระบุเหตุผลการใช้งาน');
      return;
    }

    if (!currentUserEmail) {
      showPopup('error', 'ไม่พบผู้ใช้', 'กรุณาล็อกอินก่อน');
      return;
    }

    const requestNo = generateRequestNo();

    const { data: insertedRequest, error } = await supabase
      .from('borrow_requests')
      .insert([
        {
          request_type: 'computer',
          computer_id: selectedPc.id,
          equipment_id: null,
          request_no: requestNo,
          user_name: currentUserEmail,
          user_email: currentUserEmail,
          reason: reason.trim(),
          borrow_date: start.toISOString(),
          return_date: end.toISOString(),
          urgent: false,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) {
      showPopup('error', 'เกิดข้อผิดพลาด', error.message);
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
            title: 'มีคำขอใช้คอมพิวเตอร์ใหม่',
            message: `${currentUserEmail} ได้ส่งคำขอใช้งาน ${
              selectedPc.pc_name
            } ห้อง ${getRoomName(selectedPc)} เลขคำขอ ${requestNo} เริ่มใช้งาน ${formatThaiDateTime(
              start.toISOString()
            )} ถึง ${formatThaiDateTime(end.toISOString())}`,
            type: 'new_request',
            related_request_id: insertedRequest.id,
          }))
      );
    }

    await supabase.from('notifications').insert([
      {
        user_email: currentUserEmail,
        title: 'ส่งคำขอใช้งานคอมพิวเตอร์สำเร็จ',
        message: `คุณได้ส่งคำขอใช้งาน ${
          selectedPc.pc_name
        } ห้อง ${getRoomName(
          selectedPc
        )} แล้ว เลขคำขอ ${requestNo} วันที่เริ่มใช้งาน ${formatThaiDateTime(
          start.toISOString()
        )} ถึง ${formatThaiDateTime(
          end.toISOString()
        )} กรุณารอแอดมินตรวจสอบ`,
        type: 'request_submitted',
        related_request_id: insertedRequest.id,
      },
    ]);

    setSelectedPc(null);
    setReason('');
    await fetchAvailablePCs();

    showPopup(
      'success',
      'ส่งคำขอสำเร็จ',
      `ระบบได้รับคำขอใช้งานคอมพิวเตอร์เรียบร้อยแล้ว เลขคำขอ ${requestNo} กรุณารอแอดมินตรวจสอบ`
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/user/booking"
          className="mb-6 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-bold text-slate-700 transition hover:text-blue-600 md:text-base"
        >
          <ArrowLeft size={20} />
          ย้อนกลับ
        </Link>

        <div className="mb-7 overflow-hidden rounded-[24px] border border-[#e7ecf5] bg-white shadow-[0_10px_30px_rgba(148,163,184,0.10)] md:rounded-[28px]">
          <div className="flex flex-col items-start justify-between gap-6 px-5 py-6 md:flex-row md:items-center md:px-8 md:py-7">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#eef2ff] text-[#6d7ff2] md:h-20 md:w-20 md:rounded-[24px]">
                <Monitor size={34} strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="text-[20px] font-black leading-tight text-slate-800 md:text-[23px]">
                  ขอใช้งานคอมพิวเตอร์
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-400 md:text-lg">
                  ห้องคอมพิวเตอร์ {selectedRoom || 'ทั้งหมด'}
                </p>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative flex h-28 w-64 items-end justify-end overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f7f8ff] to-[#eef3ff] px-5 py-4">
                <Sparkles
                  className="absolute left-5 top-5 text-[#91a2ff]"
                  size={16}
                />
                <Sparkles
                  className="absolute left-16 top-10 text-[#ffb86b]"
                  size={14}
                />
                <Sparkles
                  className="absolute right-16 top-7 text-[#ff9aa2]"
                  size={12}
                />
                <div className="absolute bottom-3 right-6 flex items-end gap-3">
                  <div className="h-4 w-16 rounded-full bg-[#90b4ff]" />
                  <div className="flex h-16 w-20 items-center justify-center rounded-b-[8px] rounded-t-[12px] bg-[#7e8ff6]">
                    <Monitor size={30} className="text-white" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#c9dcff]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[24px] border border-[#e7ecf5] bg-white p-4 shadow-[0_10px_30px_rgba(148,163,184,0.08)] md:p-5">
          <div className="mb-3 flex items-center gap-2 text-slate-800">
            <DoorOpen size={20} className="text-[#4d7cff]" />
            <h2 className="text-base font-black md:text-lg">
              เลือกห้องคอมพิวเตอร์
            </h2>
          </div>

          {rooms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => handleSelectRoom(room)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-black transition-all ${
                    selectedRoom === room
                      ? 'border-[#2f6df6] bg-[#2f6df6] text-white shadow-lg shadow-blue-100'
                      : 'border-[#dfe7f3] bg-white text-slate-500 hover:border-[#9fbcff] hover:bg-[#f8fbff]'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400">
              ยังไม่มีข้อมูลห้อง
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-[24px] border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_30px_rgba(148,163,184,0.10)] md:rounded-[28px] md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="text-[#4d7cff]">
                  <Monitor size={24} />
                </div>
                <h2 className="text-[18px] font-black text-slate-800 md:text-[20px]">
                  เลือกเครื่องคอมพิวเตอร์
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
                {loading ? (
                  <div className="col-span-full flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-[#dbe5f5] bg-[#fafcff]">
                    <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#4d7cff]" />
                    <p className="text-base font-bold text-slate-500">
                      กำลังโหลดข้อมูล...
                    </p>
                  </div>
                ) : filteredComputers.length > 0 ? (
                  filteredComputers.map((pc) => {
                    const isSelected = selectedPc?.id === pc.id;
                    const isAvailable = pc.status === 'available';

                    return (
                      <button
                        key={pc.id}
                        disabled={!isAvailable}
                        onClick={() => setSelectedPc(pc)}
                        className={`relative rounded-[22px] border-2 p-4 text-left transition-all duration-200 md:rounded-[24px] md:p-5 ${
                          isSelected
                            ? 'border-[#2f6df6] bg-[#f4f8ff] shadow-[0_10px_24px_rgba(47,109,246,0.18)]'
                            : isAvailable
                            ? 'border-[#d9e2f0] bg-white hover:border-[#9fbcff] hover:bg-[#f9fbff]'
                            : 'cursor-not-allowed border-[#edf1f7] bg-[#f8fafc] opacity-60'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#2f6df6] text-white">
                            <CheckCircle size={16} />
                          </div>
                        )}

                        <div className="mb-2 text-[19px] font-black leading-none text-slate-700 md:text-[21px]">
                          {pc.pc_name?.replace('PC-', '') || '-'}
                        </div>

                        <div className="text-base font-bold text-slate-500 md:text-lg">
                          {pc.pc_name}
                        </div>

                        <div className="mt-4 md:mt-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black md:text-sm ${
                              isAvailable
                                ? 'bg-[#dbf7e7] text-[#23a35b]'
                                : 'bg-[#ffe0e0] text-[#d54848]'
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isAvailable ? 'bg-[#23c766]' : 'bg-[#ff6b6b]'
                              }`}
                            />
                            {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-[24px] border border-dashed border-[#dbe5f5] bg-[#fafcff] px-6 py-12 text-center">
                    <Monitor
                      size={36}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="text-base font-black text-slate-500">
                      ไม่พบเครื่องคอมพิวเตอร์ในห้องนี้
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-[24px] border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_30px_rgba(148,163,184,0.10)] md:rounded-[28px] md:p-7">
              <div className="mb-5 flex items-center gap-3 border-b border-[#e5ebf4] pb-4">
                <div className="text-[#4d7cff]">
                  <ClipboardList size={24} />
                </div>
                <h2 className="text-[18px] font-black text-slate-800 md:text-[20px]">
                  รายละเอียดการขอใช้งาน
                </h2>
              </div>

              {selectedPc ? (
                <div className="space-y-5">
                  <div className="rounded-[22px] border border-[#e8edf5] bg-[#f8fafc] p-5">
                    <p className="mb-2 text-sm font-black uppercase tracking-wider text-slate-400">
                      เครื่องที่เลือก
                    </p>
                    <p className="text-[20px] font-black leading-none text-slate-900">
                      {selectedPc.pc_name}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      ห้อง {getRoomName(selectedPc)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-base font-black text-slate-700">
                        <CalendarDays size={17} className="text-[#4d7cff]" />
                        วันที่และเวลาเริ่มใช้งาน{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        className="h-12 w-full rounded-[18px] border-2 border-[#dde6f3] bg-white px-4 text-sm font-bold text-slate-800 focus:border-[#4d7cff] focus:outline-none focus:ring-4 focus:ring-[#4d7cff]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-base font-black text-slate-700">
                        <Clock size={17} className="text-[#4d7cff]" />
                        วันที่และเวลาสิ้นสุดการใช้งาน{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        className="h-12 w-full rounded-[18px] border-2 border-[#dde6f3] bg-white px-4 text-sm font-bold text-slate-800 focus:border-[#4d7cff] focus:outline-none focus:ring-4 focus:ring-[#4d7cff]/10"
                      />
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-blue-100 bg-blue-50/50 px-4 py-3">
                    <p className="text-xs font-black text-blue-600">
                      ช่วงเวลาที่เลือก
                    </p>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-slate-600">
                      เริ่มใช้งาน: {formatThaiDateTime(startDateTime)}
                      <br />
                      สิ้นสุดการใช้งาน: {formatThaiDateTime(endDateTime)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-black text-slate-700">
                      เหตุผลการใช้งาน <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-28 w-full rounded-[20px] border-2 border-[#dde6f3] bg-white px-4 py-4 text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:border-[#4d7cff] focus:outline-none focus:ring-4 focus:ring-[#4d7cff]/10"
                      placeholder="เช่น ใช้เรียนวิชา, ทำโครงงาน..."
                    />
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full rounded-[20px] bg-[#2f54eb] py-4 text-lg font-black text-white shadow-[0_12px_24px_rgba(47,84,235,0.22)] transition hover:bg-[#2347d8]"
                  >
                    ยืนยันคำขอใช้งาน
                  </button>
                </div>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-[#dbe5f5] bg-[#fbfcfe] px-6 py-12 text-center md:py-14">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3f6fb] text-slate-400">
                    <MousePointerClick size={38} />
                  </div>
                  <p className="text-[18px] font-black text-slate-700 md:text-[20px]">
                    กรุณาเลือกเครื่องที่ว่าง
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-400">
                    เพื่อดูรายละเอียดการขอใช้งาน
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {popup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-[22px] ${
                  popup.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {popup.type === 'success' ? (
                  <CheckCircle2 size={30} />
                ) : (
                  <AlertCircle size={30} />
                )}
              </div>

              <button
                onClick={closePopup}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mb-2 text-2xl font-black text-slate-800">
              {popup.title}
            </h3>
            <p className="mb-6 text-base font-semibold leading-relaxed text-slate-500">
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              className={`w-full rounded-[18px] py-3.5 text-base font-black text-white shadow-lg transition ${
                popup.type === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}