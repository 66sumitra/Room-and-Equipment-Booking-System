import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ระบบจองห้องคอมและอุปกรณ์
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          จองห้องคอมพิวเตอร์และอุปกรณ์ได้อย่างสะดวก รวดเร็ว
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="primary" size="lg">
              เข้าสู่ระบบ
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              สมัครสมาชิก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
