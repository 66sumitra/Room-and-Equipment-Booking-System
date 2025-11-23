'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, actionButton }) => {
  const [userName, setUserName] = useState('ผู้ใช้งาน');
  const [userInitial, setUserInitial] = useState('ผ');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'ผู้ใช้งาน';
      setUserName(storedName);
      setUserInitial(storedName.charAt(0).toUpperCase());
    }
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              {title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {actionButton}
          
          <Link href="/user/booking">
            <Button variant="secondary" size="md">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ไปหน้าจอง
              </span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-700">สวัสดี, {userName}</span>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {userInitial}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

