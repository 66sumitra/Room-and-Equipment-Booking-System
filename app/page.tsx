import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Monitor, Package, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* วงแสงพื้นหลัง */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl" />

      {/* ลาย grid จาง ๆ */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-blue-100">
            <Monitor size={34} className="text-blue-600" />
          </div>

          <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black text-blue-600 shadow-sm backdrop-blur">
            ระบบจัดการการยืมห้องคอมพิวเตอร์และอุปกรณ์
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            ระบบยืมห้องคอมและอุปกรณ์
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-500 md:text-lg">
            ยืมห้องคอมพิวเตอร์และอุปกรณ์ได้อย่างสะดวก รวดเร็ว พร้อมติดตามสถานะคำขอได้แบบเรียลไทม์
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="rounded-2xl px-8 py-4 text-sm font-black shadow-xl shadow-blue-200 transition hover:-translate-y-0.5"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>

            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-black text-slate-700 shadow-lg shadow-slate-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
              >
                สมัครสมาชิก
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-left shadow-lg shadow-slate-100 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Monitor size={22} />
              </div>
              <h3 className="font-black text-slate-800">ขอใช้คอมพิวเตอร์</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                เลือกเครื่องและห้องที่ต้องการใช้งานได้ง่าย
              </p>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-left shadow-lg shadow-slate-100 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Package size={22} />
              </div>
              <h3 className="font-black text-slate-800">ยืมอุปกรณ์</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                ส่งคำขอยืมและติดตามสถานะได้ในระบบ
              </p>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-left shadow-lg shadow-slate-100 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-black text-slate-800">อนุมัติรวดเร็ว</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                แอดมินตรวจสอบและอนุมัติคำขอได้ทันที
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}