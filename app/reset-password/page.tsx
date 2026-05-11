'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LockKeyhole, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!password || !confirmPassword) {
      setError('กรุณากรอกรหัสผ่านใหม่ให้ครบ');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
        return;
      }

      setMessage('เปลี่ยนรหัสผ่านสำเร็จแล้ว กำลังกลับไปหน้าเข้าสู่ระบบ');

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      setError('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 px-8 py-10 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <LockKeyhole size={34} />
          </div>

          <h1 className="text-2xl font-black">ตั้งรหัสผ่านใหม่</h1>
          <p className="mt-2 text-sm font-medium text-blue-100">
            กรุณากรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่านใหม่"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setMessage('');
                }}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  setMessage('');
                }}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 hover:underline"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}