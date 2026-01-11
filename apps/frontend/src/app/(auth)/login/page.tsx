'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // 이미 로그인되어 있으면 리포트 페이지로 리다이렉트
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/reports');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Hydration 대기 중
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 이미 로그인되어 있으면 null
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">주간보고 시스템</h1>
          <p className="mt-2 text-sm text-gray-600">
            SM 프로젝트 주간보고서 관리
          </p>
        </div>

        {/* 로그인 폼 */}
        <LoginForm />
      </div>
    </div>
  );
}
