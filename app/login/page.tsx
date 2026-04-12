<<<<<<< HEAD
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
=======
'use client';

// 1. ต้อง Import ตัว LoginForm มาจากที่ที่คุณเก็บไฟล์ไว้
import { LoginForm } from '@/components/forms/LoginForm';

// 2. จุดสำคัญ: ต้องมีคำว่า "export default" นำหน้าฟังก์ชันเสมอ
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ส่วนตกแต่งพื้นหลัง (Animation Blob) */}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
<<<<<<< HEAD
      {/* Content */}
=======
      {/* เรียกใช้ Component LoginForm ที่เราเขียน Logic แยกหน้าไว้ */}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> d808a9b0e0b00575a7ff8903497b8130125c9d87
