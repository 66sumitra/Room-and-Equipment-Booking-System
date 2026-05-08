'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, User, Trash2, UserPlus, ChevronDown, Check, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

function CustomRoleSelect({
  user,
  onRoleChange,
  disabled,
}: {
  user: UserRow;
  onRoleChange: (user: UserRow, newRole: string) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options = [
    {
      value: 'admin',
      label: 'ADMIN (ผู้ดูแล)',
      color: 'bg-purple-100 text-purple-700',
      icon: <ShieldCheck size={14} />,
    },
    {
      value: 'user',
      label: 'USER (ทั่วไป)',
      color: 'bg-blue-100 text-blue-700',
      icon: <User size={14} />,
    },
  ];

  const current = options.find((o) => o.value === user.role) || options[1];

  return (
    <div className="relative inline-block w-44 font-black" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl text-[11px] transition-all border-2
          ${isOpen ? 'border-slate-400 shadow-sm' : 'border-transparent'}
          ${current.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95 active:scale-95'}`}
      >
        <div className="flex items-center gap-2">
          {current.icon}
          {current.label}
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onRoleChange(user, opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] transition-colors
                ${user.role === opt.value ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className={`p-1 rounded-lg ${opt.color}`}>{opt.icon}</div>
              <span className="flex-1 text-left">{opt.label}</span>
              {user.role === opt.value && <Check size={14} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (res.status === 403) {
        window.location.href = '/user/booking';
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('fetchUsers error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const handleRoleChange = async (user: UserRow, newRole: string) => {
    if (user.role === newRole) return;

    setSavingId(user.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ fullName: user.fullName, role: newRole }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (res.status === 403) {
        window.location.href = '/user/booking';
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || 'เปลี่ยนสิทธิ์ไม่สำเร็จ');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error('handleRoleChange error:', error);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์');
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setSavingId(userToDelete.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (res.status === 403) {
        window.location.href = '/user/booking';
        return;
      }

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || 'ลบผู้ใช้ไม่สำเร็จ');
      }
    } catch (error) {
      console.error('confirmDelete error:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    } finally {
      setSavingId(null);
      setDeleteModalOpen(false);
    }
  };

  return (
    <DashboardLayout title="จัดการผู้ใช้งาน" allowedRoles={['admin']}>
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden font-black">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">
              รายชื่อผู้ใช้งานระบบ
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 text-sm">
                พบทั้งหมด {filteredUsers.length} บัญชีในระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border-2 border-slate-200 placeholder:text-slate-400 text-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-md text-sm font-bold"
              />
            </div>

            <Link href="/register" className="shrink-0">
              <button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                <UserPlus size={20} />
                <span className="hidden sm:inline">เพิ่มสมาชิกใหม่</span>
                <span className="sm:hidden">เพิ่ม</span>
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase italic">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-white border-b border-slate-100 font-black">
                  <th className="px-8 py-5 text-[13px] text-slate-500 uppercase tracking-[0.2em]">
                    ข้อมูลสมาชิก
                  </th>
                  <th className="px-8 py-5 text-[13px] text-slate-500 uppercase tracking-[0.2em]">
                    การติดต่อ
                  </th>
                  <th className="px-8 py-5 text-[13px] text-slate-500 uppercase tracking-[0.2em]">
                    สถานะสิทธิ์
                  </th>
                  <th className="px-8 py-5 text-[13px] text-slate-500 uppercase tracking-[0.2em] text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 font-bold">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`group transition-all duration-300 ${
                      user.role === 'admin'
                        ? 'bg-purple-50/20'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <ShieldCheck size={22} />
                          ) : (
                            <User size={22} />
                          )}
                        </div>
                        <div>
                          <p className="text-slate-800 font-black text-base">
                            {user.fullName || '—'}
                          </p>
                          <p className="text-[10px] uppercase text-slate-400 font-medium tracking-wider mt-0.5">
                            UID: {user.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-slate-500 font-bold text-sm">
                      {user.email}
                    </td>

                    <td className="px-8 py-5">
                      <CustomRoleSelect
                        user={user}
                        onRoleChange={handleRoleChange}
                        disabled={savingId === user.id}
                      />
                    </td>

                    <td className="px-8 py-5 text-center">
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteModalOpen(true);
                        }}
                        className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        disabled={savingId === user.id}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-24 text-center text-slate-400 font-black tracking-widest text-xs uppercase italic">
                ไม่พบข้อมูลที่ค้นหา...
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="ลบบัญชีผู้ใช้"
      >
        <div className="p-8 text-center font-black">
          <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-inner">
            <Trash2 size={44} />
          </div>
          <h3 className="text-2xl text-slate-800 mb-2 italic">
            ยืนยันการลบบัญชีผู้ใช้
          </h3>
          <p className="text-slate-400 mb-10 leading-relaxed font-bold">
            คุณต้องการลบบัญชีผู้ใช้{' '}
            <span className="text-red-500 underline">
              "{userToDelete?.fullName || userToDelete?.email}"
            </span>
            <br />
            ออกจากระบบ ข้อมูลจะไม่สามารถกู้คืนได้
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-black"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all font-black"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}