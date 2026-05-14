'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type UserSession = {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  };
};

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const getDisplayName = (session: UserSession) => {
    const metadata = session.user.user_metadata;

    return (
      metadata?.full_name ||
      metadata?.name ||
      session.user.email?.split('@')[0] ||
      'ผู้ใช้งาน'
    );
  };

  const goToPageByRole = async (session: UserSession) => {
    const email = session.user.email || '';
    const name = getDisplayName(session);

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('PROFILE AFTER LOGIN:', profile, profileError);

    if (!profile) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: session.user.id,
          email,
          name,
          role: 'user',
        },
      ]);

      if (insertError) {
        console.warn('CREATE USER PROFILE ERROR:', insertError);
      }
    }

    const role = profile?.role || 'user';
    const target = role === 'admin' ? '/dashboard' : '/user/booking';

    window.location.href = target;
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (!code) return;

      setGoogleLoading(true);

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        window.history.replaceState({}, document.title, window.location.pathname);

        if (error) {
          alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message);
          return;
        }

        const session =
          data.session ||
          (await supabase.auth.getSession()).data.session;

        if (!session) {
          alert('เข้าสู่ระบบด้วย Google สำเร็จ แต่ยังไม่พบ session');
          return;
        }

        await goToPageByRole(session as UserSession);
      } catch (error: any) {
        console.error('Google callback error:', error);
        alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message);
      } finally {
        setGoogleLoading(false);
      }
    };

    handleOAuthCallback();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openForgotPassword = () => {
    setForgotEmail(formData.email || '');
    setForgotMessage('');
    setForgotError('');
    setForgotOpen(true);
  };

  const handleForgotPassword = async () => {
    const email = forgotEmail.trim();

    if (!email) {
      setForgotError('กรุณากรอกอีเมล');
      return;
    }

    setForgotLoading(true);
    setForgotMessage('');
    setForgotError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setForgotError(error.message || 'ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ');
        return;
      }

      setForgotMessage(
        'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย'
      );
    } catch (error: any) {
      setForgotError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message);
        setGoogleLoading(false);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message);
      setGoogleLoading(false);
    }
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

      await goToPageByRole(session as UserSession);
    } catch (error: any) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 px-8 py-10 text-center text-white">
            <h2 className="mb-1 text-2xl font-bold">เข้าสู่ระบบ</h2>
            <p className="text-sm text-blue-100 opacity-80">
              ระบบจัดการห้องคอมพิวเตอร์และอุปกรณ์
            </p>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                name="email"
                label="อีเมลผู้ใช้งาน"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || googleLoading}
              />

              <div>
                <Input
                  type="password"
                  name="password"
                  label="รหัสผ่าน"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || googleLoading}
                />

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    disabled={loading || googleLoading}
                    className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                disabled={loading || googleLoading}
              >
                {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold text-slate-400">หรือ</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg">
                G
              </span>
              {googleLoading ? 'กำลังเข้าสู่ระบบด้วย Google...' : 'เข้าสู่ระบบด้วย Google'}
            </button>

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

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <span className="text-3xl">🔐</span>
              </div>

              <h3 className="text-2xl font-black text-slate-800">
                ลืมรหัสผ่าน
              </h3>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                กรอกอีเมลของคุณ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                name="forgotEmail"
                label="อีเมล"
                placeholder="example@gmail.com"
                value={forgotEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForgotEmail(e.target.value);
                  setForgotError('');
                  setForgotMessage('');
                }}
                disabled={forgotLoading}
              />

              {forgotError && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {forgotError}
                </div>
              )}

              {forgotMessage && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
                  {forgotMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  disabled={forgotLoading}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-500 disabled:opacity-60"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="flex-[1.5] rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 disabled:opacity-60"
                >
                  {forgotLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};