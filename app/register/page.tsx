'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '', // 👈 ตัวแปรชื่อ fullName
    email: '',
    password: '',
    confirmPassword: ''
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
      return setError('รหัสผ่านไม่ตรงกัน');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName, // ✅ แก้จาก formData.name เป็น formData.fullName
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

      // ✨ สมัครสำเร็จ: โชว์ติ๊กถูกเด้งๆ 1.5 วิ แล้ววาร์ป
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
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
      
      {/* 🟢 Success Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-emerald-100 text-center scale-110 transition-all">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-800">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-gray-500 font-bold mt-2">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-500 ${isSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="bg-gradient-to-r from-blue-500 to-emerald-400 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h2 className="text-2xl font-black">สร้างบัญชีใหม่</h2>
          <p className="text-sm opacity-90 font-bold">สมัครสมาชิกเพื่อเริ่มใช้งาน</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-4 font-bold">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs text-center border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">ชื่อ-นามสกุล</label>
            <input type="text" placeholder="กรุณากรอกชื่อ นามสกุล" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black font-bold" 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">อีเมล</label>
            <input type="email" placeholder="กรุณากรอกอีเมล" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black font-bold"
              onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">รหัสผ่าน</label>
            <input type="password" placeholder="กรุณากรอกรหัสผ่าน" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black font-bold"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1 uppercase">ยืนยันรหัสผ่าน</label>
            <input type="password" placeholder="กรุณากรอกรหัสผ่านอีกครั้ง" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 text-black font-bold"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
          </div>

          <button 
            type="submit" 
            disabled={loading || isSuccess}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-4 rounded-xl font-black shadow-lg hover:opacity-90 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'สมัครสมาชิก →'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-red-500 font-black hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}