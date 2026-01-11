'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    // Hydration이 완료될 때까지 대기
    if (!_hasHydrated) {
      return;
    }

    setIsChecking(false);

    // 인증되지 않은 경우 로그인 페이지로
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // 관리자 권한이 필요한데 관리자가 아닌 경우
    if (requireAdmin && !isAdmin) {
      router.push('/');
      return;
    }
  }, [_hasHydrated, isAuthenticated, isAdmin, requireAdmin, router]);

  // Hydration 중이거나 체크 중
  if (!_hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않았거나 권한이 없으면 null 반환
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
