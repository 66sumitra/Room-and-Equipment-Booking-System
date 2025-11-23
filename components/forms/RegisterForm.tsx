'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // รับค่าใดๆ ก็ได้ - ไม่มี validation
    // เก็บข้อมูล register ใน localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      const email = formData.email || 'user@example.com';
      localStorage.setItem('userEmail', email);
      const userName = formData.name || formData.email?.split('@')[0] || 'User';
      localStorage.setItem('userName', userName);
    }
    
    // Redirect ไปหน้า dashboard
    router.push('/dashboard');
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600 px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">สร้างบัญชีใหม่</h2>
          <p className="text-blue-100 text-sm">สมัครสมาชิกเพื่อเริ่มใช้งาน</p>
        </div>
        
        {/* Form Content */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="text"
                name="name"
                label="ชื่อ-นามสกุล"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
                value={formData.name}
                onChange={handleChange}
                className="transition-all duration-200 hover:border-blue-400"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
            </div>
            
            <div>
              <Input
                type="text"
                name="email"
                label="อีเมล"
                placeholder="กรุณากรอกอีเมล"
                value={formData.email}
                onChange={handleChange}
                className="transition-all duration-200 hover:border-blue-400"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />
            </div>
            
            <div>
              <Input
                type="password"
                name="password"
                label="รหัสผ่าน"
                placeholder="กรุณากรอกรหัสผ่าน"
                value={formData.password}
                onChange={handleChange}
                className="transition-all duration-200 hover:border-blue-400"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
            </div>
            
            <div>
              <Input
                type="password"
                name="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="transition-all duration-200 hover:border-blue-400"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              />
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                ฉันยอมรับ{' '}
                <Link href="#" className="text-red-600 hover:text-red-700 font-medium transition-colors">
                  ข้อกำหนดและเงื่อนไข
                </Link>{' '}
                และ{' '}
                <Link href="#" className="text-red-600 hover:text-red-700 font-medium transition-colors">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </label>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <span>สมัครสมาชิก</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">หรือ</span>
            </div>
          </div>
          
          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                href="/login"
                className="font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          ระบบจองห้องคอมและอุปกรณ์
        </p>
      </div>
    </div>
  );
};
