import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { loading } = useAuthStore();

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

  // 로그인 사용자 또는 게스트(횟수 소진 여부 관계없이) → 항상 통과
  // AI 기능 제한은 각 페이지의 checkAndConsume에서 처리
  return children ? <>{children}</> : <Outlet />;
}
