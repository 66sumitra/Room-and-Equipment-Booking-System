"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, User, ArrowRight, X, Monitor } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const getCurrentOrigin = () => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  };

  const getUserName = (user: any) => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "ผู้ใช้งาน"
    );
  };

  const redirectByRole = async (user: any) => {
    const userEmail = user?.email || "";
    const userName = getUserName(user);

    if (!user?.id || !userEmail) {
      setError("ไม่พบข้อมูลอีเมลจาก Google");
      await supabase.auth.signOut();
      return;
    }

    let { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, email_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Find profile by id error:", profileError);
      setError("ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้: " + profileError.message);
      return;
    }

    if (!profile) {
      const { data: profileByEmail, error: emailProfileError } = await supabase
        .from("users")
        .select("id, role, email_verified")
        .eq("email", userEmail)
        .maybeSingle();

      if (emailProfileError) {
        console.error("Find profile by email error:", emailProfileError);
        setError(
          "ไม่สามารถตรวจสอบข้อมูลผู้ใช้จากอีเมลได้: " +
            emailProfileError.message
        );
        return;
      }

      profile = profileByEmail;
    }

    if (!profile) {
      const { data: insertedUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            email: userEmail,
            name: userName,
            role: "user",
            email_verified: true,
          },
        ])
        .select("id, role, email_verified")
        .single();

      if (insertError) {
        console.error("Create Google user profile error:", insertError);
        setError(
          "เข้าสู่ระบบด้วย Google สำเร็จ แต่สร้างข้อมูลผู้ใช้ไม่สำเร็จ: " +
            insertError.message
        );
        return;
      }

      profile = insertedUser;
    }

    if (!profile.email_verified) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ email_verified: true })
        .eq("email", userEmail);

      if (updateError) {
        console.warn("Update email verified error:", updateError);
      }
    }

    const target = profile.role === "admin" ? "/dashboard" : "/user/booking";
    window.location.replace(target);
  };

  useEffect(() => {
    let isMounted = true;

    const handleGoogleCallback = async () => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      setError("");

      try {
        if (code) {
          setGoogleLoading(true);

          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );

          window.history.replaceState({}, document.title, "/login");

          if (error) {
            console.error("Google exchange error:", error);
            if (isMounted) {
              setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + error.message);
            }
            return;
          }

          if (data.session?.user) {
            await redirectByRole(data.session.user);
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Get session error:", sessionError);
          return;
        }

        if (session?.user) {
          await redirectByRole(session.user);
          return;
        }
      } catch (err: any) {
        console.error("Google callback error:", err);
        if (isMounted) {
          setError(err?.message || "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setGoogleLoading(false);
        }
      }
    };

    handleGoogleCallback();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await redirectByRole(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openForgotPassword = () => {
    setForgotEmail(email || "");
    setForgotMessage("");
    setForgotError("");
    setForgotOpen(true);
  };

  const handleForgotPassword = async () => {
    const cleanEmail = forgotEmail.trim();

    if (!cleanEmail) {
      setForgotError("กรุณากรอกอีเมล");
      return;
    }

    setForgotLoading(true);
    setForgotMessage("");
    setForgotError("");

    try {
      const origin = getCurrentOrigin();

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        setForgotError(error.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ");
        return;
      }

      setForgotMessage(
        "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย"
      );
    } catch (err: any) {
      setForgotError(err?.message || "เกิดข้อผิดพลาดในการส่งลิงก์");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading || loading) return;

    setError("");
    setGoogleLoading(true);

    try {
      const origin = getCurrentOrigin();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err?.message || "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (!data.user) {
        setError("ไม่พบข้อมูลผู้ใช้");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, email_verified")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        setError("ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้");
        return;
      }

      if (!profile) {
        setError("ไม่พบข้อมูลผู้ใช้ในระบบ");
        return;
      }

      if (!profile.email_verified) {
        await supabase.auth.signOut();
        setError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
        return;
      }

      const target = profile.role === "admin" ? "/dashboard" : "/user/booking";
      window.location.replace(target);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fbff] px-4 py-10">
        {/* พื้นหลังให้เข้ากับหน้าแรก */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#dbeafe_1px,transparent_1px),linear-gradient(to_bottom,#dbeafe_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute right-[-140px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-100/80 blur-3xl" />

        <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
          {/* ฝั่งข้อความ เหมือนหน้าแรก */}
          <div className="hidden text-center lg:block lg:text-left">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-blue-100 bg-white/85 text-blue-600 shadow-xl shadow-blue-100 lg:mx-0">
              <Monitor size={40} />
            </div>

            <div className="mb-5 inline-flex rounded-full border border-blue-100 bg-white/80 px-5 py-2 text-sm font-black text-blue-600 shadow-sm backdrop-blur">
              ระบบจัดการการยืมอุปกรณ์และขอใช้งานคอมพิวเตอร์
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-slate-950">
              ยินดีต้อนรับเข้าสู่ระบบ
              <br />
              ยืมอุปกรณ์และขอใช้คอมพิวเตอร์
            </h1>

            <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-slate-500">
              เข้าสู่ระบบเพื่อส่งคำขอ ติดตามสถานะ และรับการแจ้งเตือนแบบเรียลไทม์
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4">
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
                <p className="text-sm font-black text-slate-900">
                  ขอใช้คอมพิวเตอร์
                </p>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                  เลือกเครื่องและช่วงเวลาที่ต้องการใช้งาน
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
                <p className="text-sm font-black text-slate-900">
                  ยืมอุปกรณ์
                </p>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                  ส่งคำขอและดูสถานะได้ในระบบ
                </p>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-lg shadow-blue-100/40 backdrop-blur">
                <p className="text-sm font-black text-slate-900">
                  อนุมัติรวดเร็ว
                </p>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
                  แอดมินตรวจสอบคำขอได้ทันที
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 p-10 text-center text-white">
              <div className="absolute left-[-40px] top-[-40px] h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute bottom-[-50px] right-[-30px] h-36 w-36 rounded-full bg-white/15 blur-2xl" />

              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                <User size={32} />
              </div>

              <h2 className="relative text-2xl font-black">ยินดีต้อนรับ</h2>

              <p className="relative mt-1 text-sm font-semibold text-blue-50 opacity-95">
                เข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-500">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="ml-1 text-xs font-bold text-slate-500">
                    อีเมล
                  </label>

                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || googleLoading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="ml-1 text-xs font-bold text-slate-500">
                    รหัสผ่าน
                  </label>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      type="password"
                      placeholder="รหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || googleLoading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={openForgotPassword}
                      disabled={loading || googleLoading}
                      className="text-xs font-black text-blue-600 hover:underline disabled:opacity-60"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black text-slate-400">หรือ</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-blue-600">
                  G
                </span>

                {googleLoading
                  ? "กำลังเข้าสู่ระบบด้วย Google..."
                  : "เข้าสู่ระบบด้วย Google"}
              </button>

              <div className="mt-8 space-y-4 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  ยังไม่มีบัญชี?{" "}
                  <Link
                    href="/register"
                    className="font-black text-red-500 hover:underline"
                  >
                    สมัครสมาชิก
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  ลืมรหัสผ่าน
                </h3>

                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  กรอกอีเมลของคุณ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  อีเมล
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError("");
                      setForgotMessage("");
                    }}
                    disabled={forgotLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-70"
                  />
                </div>
              </div>

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
                  {forgotLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}