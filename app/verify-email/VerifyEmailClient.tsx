import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 font-bold text-slate-500">
          กำลังโหลด...
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}