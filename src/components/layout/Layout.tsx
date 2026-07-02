import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Apple, Flame, Refrigerator, ShieldAlert, User, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useGuestStore } from '../../stores/useGuestStore';

const navItems = [
  { to: '/', icon: Apple, label: '홈' },
  { to: '/allergy', icon: ShieldAlert, label: '알레르기' },
  { to: '/calories', icon: Flame, label: '칼로리' },
  { to: '/fridge', icon: Refrigerator, label: '냉장고' },
  { to: '/profile', icon: User, label: '프로필' },
];

export default function Layout() {
  const { user, signOut } = useAuthStore();
  const { freeUsesLeft } = useGuestStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-primary-dark">
            <Apple className="w-6 h-6" />
            NutriScan
          </NavLink>

          <nav className="hidden md:flex gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-light text-primary-dark' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* 사용자 정보 + 로그아웃 */}
          {user && (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-dark text-sm font-bold">
                  {user.displayName?.[0] ?? 'U'}
                </div>
              )}
              <span className="hidden md:block text-sm text-gray-700 max-w-[120px] truncate">
                {user.displayName}
              </span>
              <button
                onClick={handleSignOut}
                title="로그아웃"
                className="p-2 text-gray-400 hover:text-danger hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 게스트 잔여 횟수 배너 */}
      {!user && freeUsesLeft > 0 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <Sparkles className="w-4 h-4 text-warning shrink-0" />
              <span>
                AI 핵심 기능 무료 체험{' '}
                <span className="font-bold text-warning">{freeUsesLeft}회</span> 남음
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-warning underline underline-offset-2 hover:text-amber-700 shrink-0"
            >
              로그인하고 무제한 사용 →
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  isActive ? 'text-primary-dark' : 'text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="md:hidden h-16" />
    </div>
  );
}
