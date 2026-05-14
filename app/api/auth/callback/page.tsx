"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("กำลังเข้าสู่ระบบ...");

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
      await supabase.auth.signOut();
      window.location.href = "/login";
      return;
    }

    let { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, email_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Find profile by id error:", profileError);
      setMessage("ตรวจสอบข้อมูลผู้ใช้ไม่สำเร็จ");
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
        setMessage("ตรวจสอบข้อมูลผู้ใช้จากอีเมลไม่สำเร็จ");
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
        setMessage("สร้างข้อมูลผู้ใช้ไม่สำเร็จ: " + insertError.message);
        return;
      }

      profile = insertedUser;
    }

    if (!profile.email_verified) {
      await supabase
        .from("users")
        .update({ email_verified: true })
        .eq("email", userEmail);
    }

    const target = profile.role === "admin" ? "/dashboard" : "/user/booking";
    window.location.href = target;
  };

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Exchange code error:", error);
            setMessage("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + error.message);
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Get session error:", sessionError);
          setMessage("ตรวจสอบ session ไม่สำเร็จ");
          return;
        }

        if (!session?.user) {
          setMessage("ไม่พบ session กรุณาเข้าสู่ระบบใหม่");

          setTimeout(() => {
            window.location.href = "/login";
          }, 1200);

          return;
        }

        await redirectByRole(session.user);
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setMessage(error?.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    };

    run();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm font-bold text-slate-700">{message}</p>
      </div>
    </div>
  );
}