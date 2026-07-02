import { useState } from 'react';
import { User, Save, Calculator } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { getBMICategory } from '../utils/calorieCalculator';
import type { ActivityLevel } from '../types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: '비활동적', desc: '거의 운동 없음' },
  { value: 'light', label: '가벼운 활동', desc: '주 1~3일 운동' },
  { value: 'moderate', label: '보통 활동', desc: '주 3~5일 운동' },
  { value: 'active', label: '활동적', desc: '주 6~7일 운동' },
  { value: 'very_active', label: '매우 활동적', desc: '하루 2회 이상 운동' },
];

const GOAL_OPTIONS = [
  { value: 'lose' as const, label: '체중 감량', desc: 'TDEE -500 kcal', emoji: '📉' },
  { value: 'maintain' as const, label: '체중 유지', desc: 'TDEE 유지', emoji: '⚖️' },
  { value: 'gain' as const, label: '체중 증가', desc: 'TDEE +300 kcal', emoji: '📈' },
];

export default function ProfilePage() {
  const { profile, setProfile } = useStore();

  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender ?? 'male');
  const [birthYear, setBirthYear] = useState(String(profile?.birthYear ?? 1995));
  const [height, setHeight] = useState(String(profile?.heightCm ?? ''));
  const [weight, setWeight] = useState(String(profile?.weightKg ?? ''));
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(profile?.goal ?? 'maintain');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!height || !weight || !birthYear) return;
    setProfile({
      gender,
      birthYear: parseInt(birthYear),
      heightCm: parseFloat(height),
      weightKg: parseFloat(weight),
      activityLevel: activity,
      goal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          내 프로필
        </h1>
        <p className="text-sm text-gray-500 mt-1">BMI 및 일일 칼로리 목표를 자동 계산합니다</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">성별</label>
          <div className="flex gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                  gender === g ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-200 text-gray-500'
                }`}
              >
                {g === 'male' ? '🙋‍♂️ 남성' : '🙋‍♀️ 여성'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">출생 연도</label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="1995"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">키 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">체중 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">활동 수준</label>
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActivity(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  activity === opt.value
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                <span className="text-xs text-gray-500 ml-2">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">목표</label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGoal(opt.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  goal === opt.value
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl block">{opt.emoji}</span>
                <span className="text-sm font-medium text-gray-800 block mt-1">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!height || !weight || !birthYear}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          {saved ? (
            '저장되었습니다!'
          ) : (
            <>
              <Save className="w-4 h-4" /> 저장 및 계산하기
            </>
          )}
        </button>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            계산 결과
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <ResultCard
              label="BMI"
              value={String(profile.bmi)}
              sub={getBMICategory(profile.bmi).label}
              subColor={getBMICategory(profile.bmi).color}
            />
            <ResultCard label="TDEE" value={`${profile.tdeeKcal}`} sub="kcal/일" />
            <ResultCard label="목표 칼로리" value={`${profile.targetKcal}`} sub="kcal/일" />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <div className="text-center p-3 bg-surface rounded-xl">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs mt-0.5 ${subColor ?? 'text-gray-400'}`}>{sub}</div>
    </div>
  );
}
