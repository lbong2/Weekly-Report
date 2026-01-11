import { useAuthStore } from '@/lib/store/authStore';

/**
 * 인증 관련 커스텀 훅
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    _hasHydrated,
    login,
    logout,
    loadUser,
    setError,
    clearError,
  } = useAuthStore();

  // 관리자 여부
  const isAdmin = user?.role === 'ADMIN';

  // 특정 역할 체크
  const hasRole = (role: 'USER' | 'ADMIN') => {
    return user?.role === role;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    hasHydrated: _hasHydrated,
    login,
    logout,
    loadUser,
    hasRole,
    setError,
    clearError,
  };
};
