import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요 없는 공개 경로
const publicPaths = ['/login'];

// 관리자만 접근 가능한 경로
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 토큰 확인 (localStorage는 서버에서 접근 불가하므로 쿠키 사용 또는 클라이언트 체크)
  // Next.js 미들웨어는 서버 사이드에서 실행되므로 localStorage에 접근 불가
  // 실제 인증 체크는 클라이언트 컴포넌트에서 수행

  // 관리자 경로 체크는 클라이언트에서 수행하도록 함
  // 여기서는 기본적인 리다이렉트만 처리

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
