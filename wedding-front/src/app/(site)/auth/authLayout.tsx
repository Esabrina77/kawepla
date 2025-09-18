'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

 

  return (
    <div className="min-h-screen bg-white-cream">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/auth-bg.jpg')] bg-cover bg-center opacity-10" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
