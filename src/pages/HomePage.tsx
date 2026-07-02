import { Link } from 'react-router-dom';
import { ShieldAlert, Flame, Refrigerator, User, ArrowRight } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { format } from 'date-fns';
import { getBMICategory } from '../utils/calorieCalculator';

export default function HomePage() {
  const { profile, allergies, fridgeItems, calorieLogs } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = calorieLogs.filter((l) => l.loggedAt === today);
  const todayCalories = todayLogs.reduce((sum, l) => sum + l.caloriesKcal, 0);
  const expiringItems = fridgeItems.filter((item) => {
    if (!item.expiresAt) return false;
    const diff = Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / 86400000);
    return diff <= 3 && diff >= 0;
  });

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900">NutriScan</h1>
        <p className="text-gray-500 mt-2">AI 기반 스마트 식단관리</p>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">오늘의 칼로리</h2>
            <span className="text-sm text-gray-500">{profile.targetKcal} kcal 목표</span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todayCalories / profile.targetKcal) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-primary-dark font-medium">{todayCalories} kcal</span>
            <span className="text-gray-400">{Math.max(0, profile.targetKcal - todayCalories)} kcal 남음</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/profile"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <User className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-gray-900">내 프로필</h3>
          {profile ? (
            <p className="text-sm text-gray-500 mt-1">
              BMI {profile.bmi}{' '}
              <span className={getBMICategory(profile.bmi).color}>({getBMICategory(profile.bmi).label})</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">프로필을 설정하세요</p>
          )}
        </Link>

        <Link
          to="/allergy"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <ShieldAlert className="w-8 h-8 text-danger mb-3" />
          <h3 className="font-semibold text-gray-900">알레르기</h3>
          <p className="text-sm text-gray-500 mt-1">{allergies.length}개 등록됨</p>
        </Link>

        <Link
          to="/calories"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <Flame className="w-8 h-8 text-warning mb-3" />
          <h3 className="font-semibold text-gray-900">칼로리</h3>
          <p className="text-sm text-gray-500 mt-1">오늘 {todayLogs.length}끼 기록</p>
        </Link>

        <Link
          to="/fridge"
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <Refrigerator className="w-8 h-8 text-info mb-3" />
          <h3 className="font-semibold text-gray-900">냉장고</h3>
          <p className="text-sm text-gray-500 mt-1">{fridgeItems.length}개 재료 보유</p>
        </Link>
      </div>

      {expiringItems.length > 0 && (
        <div className="bg-warning/10 rounded-2xl p-5 border border-warning/20">
          <h3 className="font-semibold text-warning flex items-center gap-2">
            <span>유통기한 임박</span>
          </h3>
          <ul className="mt-2 space-y-1">
            {expiringItems.map((item) => (
              <li key={item.id} className="text-sm text-gray-700 flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-warning text-xs">{item.expiresAt}</span>
              </li>
            ))}
          </ul>
          <Link to="/fridge" className="text-sm text-warning font-medium mt-3 inline-flex items-center gap-1">
            냉장고 확인하기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 text-center text-xs text-gray-400">
        이 앱은 의료 조언을 제공하지 않습니다. 심각한 알레르기가 있는 경우 반드시 의사와 상담하세요.
      </div>
    </div>
  );
}
