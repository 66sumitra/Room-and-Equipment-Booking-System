'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return alert('รหัสผ่านไม่ตรงกัน');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ถ้าอีเมลถูกใช้แล้ว ให้เด้งไปหน้า Login เลย
        if (data.message === 'อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ') {
          alert(data.message);
          router.push('/login');
          return;
        }

        alert(data.message || 'ไม่สามารถสร้างบัญชีได้');
        return;
      }

      alert('สร้างบัญชีสำเร็จแล้ว!');
      router.push('/login');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        {/* ส่วนหัวสีฟ้า-เขียวเหมือนในรูป */}
        <div className="bg-gradient-to-r from-blue-500 to-emerald-400 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h2 className="text-2xl font-black">สร้างบัญชีใหม่</h2>
          <p className="text-sm opacity-90 font-bold">สมัครสมาชิกเพื่อเริ่มใช้งาน</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-4 font-bold">
          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">ชื่อ-นามสกุล</label>
            <input type="text" placeholder="กรุณากรอกชื่อ นามสกุล" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black" 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">อีเมล</label>
            <input type="email" placeholder="กรุณากรอกอีเมล" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black"
              onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">รหัสผ่าน</label>
            <input type="password" placeholder="กรุณากรอกรหัสผ่าน" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">ยืนยันรหัสผ่าน</label>
            <input type="password" placeholder="กรุณากรอกรหัสผ่านอีกครั้ง" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-4 rounded-xl font-black shadow-lg hover:opacity-90 transition-all mt-4">
            สมัครสมาชิก →
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            มีบัญชีอยู่แล้ว? <a href="/login" className="text-red-500 font-black">เข้าสู่ระบบ</a>
          </p>
        </form>
      </div>
    </div>
  );
}