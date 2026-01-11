'use client';

import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * 메인 레이아웃 (헤더 포함, 인증 필요)
 */
export default function MainLayout({
  children,
  requireAdmin = false,
}: MainLayoutProps) {
  return (
    <ProtectedRoute requireAdmin={requireAdmin}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
