'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('กำลังยืนยันอีเมล...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('ไม่พบ token สำหรับยืนยันอีเมล');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'ยืนยันอีเมลไม่สำเร็จ');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'ยืนยันอีเมลสำเร็จ');
      } catch (error) {
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="animate-spin text-blue-600" size={42} />
            </div>
          )}

          {status === 'success' && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="text-emerald-500" size={42} />
            </div>
          )}

          {status === 'error' && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="text-red-500" size={42} />
            </div>
          )}
        </div>

        <h1 className="mb-3 text-2xl font-black text-slate-800">
          {status === 'loading'
            ? 'กำลังตรวจสอบ'
            : status === 'success'
            ? 'ยืนยันอีเมลสำเร็จ'
            : 'ยืนยันอีเมลไม่สำเร็จ'}
        </h1>

        <p className="mb-8 text-sm font-bold leading-relaxed text-slate-500">
          {message}
        </p>

        <Link href="/login">
          <button className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-lg transition hover:bg-blue-600">
            ไปหน้าเข้าสู่ระบบ
          </button>
        </Link>
      </div>
    </div>
  );
}