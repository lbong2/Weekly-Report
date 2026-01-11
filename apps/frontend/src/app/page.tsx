'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Hydration 완료 대기
    if (!_hasHydrated) {
      return;
    }

    // 인증 상태에 따라 리다이렉트
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/reports');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // 로딩 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
}
