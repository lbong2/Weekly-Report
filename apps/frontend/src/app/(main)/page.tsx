'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 메인 페이지 - /reports로 리다이렉트
 */
export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/reports');
  }, [router]);

  return null;
}
