'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ เราตัด supabase.auth.getSession() ออก 
      // เพื่อให้ระบบเช็กผ่าน JWT Cookie ที่เราทำไว้ใน API แทน
      const res = await fetch('/api/users');

      // ตรวจสอบว่าถ้า API บอกว่าไม่มีสิทธิ์ (401) ค่อยเด้งไปหน้า Login
      if (res.status === 401) {
        alert('กรุณาล็อกอินใหม่เพื่อความปลอดภัยครับ');
        window.location.href = '/login';
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("เซิร์ฟเวอร์ตอบกลับผิดพลาด (ไม่ใช่ JSON)");
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        return;
      }
      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch Users Error:", error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ฟังก์ชันลบผู้ใช้
  const handleDelete = async (user: UserRow) => {
    if (!confirm(`ยืนยันลบผู้ใช้ ${user.fullName || user.email} ?`)) return;
    setSavingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        alert('ลบผู้ใช้เรียบร้อยแล้ว');
      }
    } catch (error) {
      alert('ลบไม่สำเร็จ');
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
          <Link href="/register">
            <Button variant="primary" size="md">เพิ่มผู้ใช้งานใหม่</Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">อีเมล</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">บทบาท</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium">{user.fullName || 'ไม่ได้ระบุ'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-700 text-sm font-bold">ลบ</button>
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