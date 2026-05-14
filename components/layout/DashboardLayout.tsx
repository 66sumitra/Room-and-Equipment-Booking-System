'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/providers/AuthProvider';

type UserRole = 'admin' | 'user';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  allowedRoles?: UserRole[];
  actionButton?: ReactNode;
}

export function DashboardLayout({
  children,
  title = 'ระบบจัดการ',
  allowedRoles,
  actionButton,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const userRole = role as UserRole | null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      router.replace(userRole === 'admin' ? '/dashboard' : '/user/booking');
    }
  }, [user, userRole, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center font-bold text-black">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return null;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-50">
      {/* Sidebar บนจอคอม / iPad */}
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Sidebar แบบมือถือ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative z-50 h-full w-[280px] max-w-[85vw] bg-blue-700 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
              aria-label="ปิดเมนู"
            >
              <X size={22} />
            </button>

            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-w-0 flex-1 w-full">
        {/* ปุ่มเมนูบนมือถือ */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-md"
          >
            <Menu size={18} />
            เมนู
          </button>
        </div>

        <Header title={title} actionButton={actionButton} />

        <main className="w-full overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}