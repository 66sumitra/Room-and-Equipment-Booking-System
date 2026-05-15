'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  UserPlus,
  Monitor,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(data.message || 'ไม่สามารถสร้างบัญชีได้');
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setLoading(false);
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fbff] px-4 py-10">
      {/* พื้นหลังให้เข้ากับหน้าแรก */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#dbeafe_1px,transparent_1px),linear-gradient(to_bottom,#dbeafe_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
      <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-3xl" />
      <div className="absolute right-[-140px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-200/70 blur-3xl" />
      <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-100/80 blur-3xl" />

      {/* Success Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4 backdrop-blur-md">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-10 text-center shadow-2xl transition-all">
            <div className="mx-auto mb-5 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={46} />
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              สมัครสมาชิกสำเร็จ!
            </h2>

            <p className="mt-2 text-sm font-bold text-slate-500">
              กำลังพาไปหน้าเข้าสู่ระบบ...
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        {/* ฝั่งข้อความให้เข้ากับหน้าแรก */}
        <div className="hidden text-center lg:block lg:text-left">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-blue-100 bg-white/85 text-blue-600 shadow-xl shadow-blue-100 lg:mx-0">
            <Monitor size={40} />
          </div>

          <div className="mb-5 inline-flex rounded-full border border-blue-100 bg-white/80 px-5 py-2 text-sm font-black text-blue-600 shadow-sm backdrop-blur">
            ระบบจัดการการยืมอุปกรณ์และขอใช้งานคอมพิวเตอร์
          </div>

          <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-slate-950">
            สร้างบัญชีเพื่อเริ่มใช้งาน
            <br />
            ระบบยืมอุปกรณ์และคอมพิวเตอร์
          </h1>

          <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-slate-500">
            สมัครสมาชิกเพื่อส่งคำขอใช้งาน ติดตามสถานะ และรับการแจ้งเตือนจากระบบได้อย่างสะดวก
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
              <p className="text-sm font-black text-slate-900">
                สมัครง่าย
              </p>
              <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                กรอกข้อมูลพื้นฐานเพื่อเริ่มใช้งานระบบ
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
              <p className="text-sm font-black text-slate-900">
                ส่งคำขอได้
              </p>
              <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                ขอใช้งานคอมพิวเตอร์และยืมอุปกรณ์
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
              <p className="text-sm font-black text-slate-900">
                ติดตามสถานะ
              </p>
              <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                ดูผลอนุมัติและประวัติได้ในระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Register Card */}
        <div
          className={`mx-auto w-full max-w-md overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-2xl shadow-slate-300/60 backdrop-blur-xl transition-all duration-500 ${
            isSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 p-9 text-center text-white">
            <div className="absolute left-[-40px] top-[-40px] h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-[-50px] right-[-30px] h-36 w-36 rounded-full bg-white/15 blur-2xl" />

            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
              <UserPlus size={32} />
            </div>

            <h2 className="relative text-2xl font-black">สร้างบัญชีใหม่</h2>

            <p className="relative mt-1 text-sm font-semibold text-blue-50 opacity-95">
              สมัครสมาชิกเพื่อเริ่มใช้งาน
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 p-8">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-500">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 ml-1 block text-xs font-bold text-slate-500">
                ชื่อ-นามสกุล
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="ระบุชื่อ-นามสกุล"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  disabled={loading || isSuccess}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 ml-1 block text-xs font-bold text-slate-500">
                อีเมล
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  placeholder="ระบุอีเมล"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={loading || isSuccess}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 ml-1 block text-xs font-bold text-slate-500">
                รหัสผ่าน
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="password"
                  placeholder="ป้อนรหัสผ่าน"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading || isSuccess}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 ml-1 block text-xs font-bold text-slate-500">
                ยืนยันรหัสผ่าน
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="password"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  disabled={loading || isSuccess}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                'สมัครสมาชิก →'
              )}
            </button>

            <p className="pt-2 text-center text-sm font-semibold text-slate-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                href="/login"
                className="font-black text-red-500 hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}