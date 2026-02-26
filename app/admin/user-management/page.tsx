'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function UserManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim() || !formData.email?.trim() || !formData.password?.trim()) {
      alert('กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
        return;
      }

      alert('เพิ่มผู้ใช้งานสำเร็จ');
      router.push('/users');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="เพิ่มผู้ใช้งาน">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl">
        <div className="mb-6">
          <Link
            href="/users"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้ารายชื่อผู้ใช้งาน
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อ-นามสกุล"
            placeholder="กรุณากรอกชื่อ นามสกุล"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="อีเมล"
            type="email"
            placeholder="กรุณากรอกอีเมล"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="กรุณากรอกรหัสผ่าน"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              บทบาท
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">ผู้ใช้งานทั่วไป</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/users">
              <Button type="button" variant="secondary" size="md">
                ยกเลิก
              </Button>
            </Link>
            <Button
              type="submit"
              variant="success"
              size="md"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
