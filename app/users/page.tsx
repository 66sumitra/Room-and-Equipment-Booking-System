<<<<<<< HEAD
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';

export default function UsersPage() {
  return (
    <DashboardLayout title="จัดการผู้ใช้งาน">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">รายชื่อผู้ใช้งาน</h2>
          <Button variant="success" size="md">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มผู้ใช้งาน
            </span>
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บทบาท
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  เสย เสย
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  say@example.com
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ผู้ดูแลระบบ
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      แก้ไข
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

=======
'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient'; // เพิ่มการนำเข้า supabase เพื่อเช็ค session

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ซ้ำๆ
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // ตรวจสอบ Session ก่อนเรียก API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('เซสชันหมดอายุ กรุณาล็อกอินใหม่');
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}` // ส่ง Token ไปด้วยถ้า API ตรวจสอบ
        }
      });

      // ตรวจสอบว่าเป็น JSON หรือไม่ (แก้ปัญหา SyntaxError: Unexpected token '<')
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (ไม่ใช่ JSON)");
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        return;
      }
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (user: UserRow, newRole: string) => {
    if (user.role === newRole) return;
    setSavingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: user.fullName, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'ไม่สามารถอัปเดตบทบาทได้');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      alert('ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`ยืนยันลบผู้ใช้ ${user.fullName || user.email} ?`)) return;
    setSavingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'ไม่สามารถลบผู้ใช้ได้');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert('ลบผู้ใช้เรียบร้อยแล้ว');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout title="จัดการผู้ใช้งาน">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">รายชื่อผู้ใช้งานระบบ</h2>
            <p className="text-sm text-slate-500">จัดการสิทธิ์และข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
          </div>
          <a href="/register">
            <Button variant="primary" size="md" className="shadow-md">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มผู้ใช้งานใหม่
              </span>
            </Button>
          </a>
        </div>

        {loading ? (
          <div className="py-20 text-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            ไม่พบข้อมูลผู้ใช้งานในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">อีเมล</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">บทบาท</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {user.fullName || <span className="text-slate-300 italic">ไม่ได้ระบุ</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-none focus:ring-2 focus:ring-blue-500 cursor-pointer 
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                        value={user.role}
                        disabled={savingId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                      >
                        <option value="admin">ADMIN (ผู้ดูแล)</option>
                        <option value="user">USER (ทั่วไป)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded hover:bg-red-50 transition-all disabled:opacity-30"
                        disabled={savingId === user.id}
                        onClick={() => handleDelete(user)}
                      >
                        ลบออก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
