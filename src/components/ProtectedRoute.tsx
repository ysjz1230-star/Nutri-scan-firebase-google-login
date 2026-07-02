import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useGuestStore } from '../stores/useGuestStore';

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { freeUsesLeft } = useGuestStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-3">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 사용자 또는 무료 횟수 남은 게스트 → 통과
  if (user || freeUsesLeft > 0) {
    return children ? <>{children}</> : <Outlet />;
  }

  // 비로그인 + 무료 횟수 소진 → 로그인 페이지
  return <Navigate to="/login" replace />;
}
