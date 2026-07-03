import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useGuestStore } from '../stores/useGuestStore';

export default function LoginPage() {
  const { user, loading, error, signInWithGoogle } = useAuthStore();
  const { freeUsesLeft } = useGuestStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 space-y-8">
        {/* 로고 */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Apple className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NutriScan</h1>
          <p className="text-sm text-gray-500">AI 기반 스마트 식단관리</p>
        </div>

        {/* 소개 문구 */}
        <ul className="space-y-2 text-sm text-gray-600">
          {[
            '🥗 알레르기 맞춤 식단 관리',
            '🔥 BMI · 칼로리 자동 계산',
            '📷 냉장고 사진으로 재료 인식',
            '🍳 AI 레시피 추천',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* 구글 로그인 버튼 */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-2xl transition-all shadow-sm disabled:opacity-50"
        >
          {/* 구글 아이콘 SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>

        {/* 항상 둘러보기 버튼 표시 */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 rounded-2xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {freeUsesLeft > 0
            ? `먼저 둘러보기 (AI 기능 ${freeUsesLeft}회 무료)`
            : '로그인 없이 둘러보기'}
        </button>

        <p className="text-center text-xs text-gray-400">
          로그인 시{' '}
          <span className="underline cursor-pointer">서비스 이용약관</span>
          {' '}및{' '}
          <span className="underline cursor-pointer">개인정보 처리방침</span>에 동의합니다
        </p>
      </div>
    </div>
  );
}
