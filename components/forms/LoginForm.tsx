'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('LOGIN RESULT:', { data, error });

      if (error) {
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('SESSION AFTER LOGIN:', session);

      if (!session) {
        alert('ล็อกอินสำเร็จ แต่ session ยังไม่ถูกสร้าง');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      console.log('PROFILE AFTER LOGIN:', profile, profileError);

      const target = profile?.role === 'admin' ? '/dashboard' : '/user/booking';

      window.location.href = target;
    } catch (error: any) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-1">เข้าสู่ระบบ</h2>
          <p className="text-blue-100 text-sm opacity-80">
            ระบบจัดการห้องคอมพิวเตอร์และอุปกรณ์
          </p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              label="อีเมลผู้ใช้งาน"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              type="password"
              name="password"
              label="รหัสผ่าน"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
              disabled={loading}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};