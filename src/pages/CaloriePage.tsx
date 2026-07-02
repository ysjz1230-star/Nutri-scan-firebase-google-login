import { useState } from 'react';
import { Flame, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { format } from 'date-fns';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { MealType } from '../types';

const MEAL_LABELS: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: '아침', emoji: '🌅' },
  lunch: { label: '점심', emoji: '☀️' },
  dinner: { label: '저녁', emoji: '🌙' },
  snack: { label: '간식', emoji: '🍪' },
};

export default function CaloriePage() {
  const { profile, calorieLogs, addCalorieLog, removeCalorieLog } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayLogs = calorieLogs.filter((l) => l.loggedAt === selectedDate);
  const todayCalories = todayLogs.reduce((sum, l) => sum + l.caloriesKcal, 0);
  const todayProtein = todayLogs.reduce((sum, l) => sum + l.proteinG, 0);
  const todayCarbs = todayLogs.reduce((sum, l) => sum + l.carbsG, 0);
  const todayFat = todayLogs.reduce((sum, l) => sum + l.fatG, 0);
  const targetKcal = profile?.targetKcal ?? 2000;
  const percentage = Math.min(100, Math.round((todayCalories / targetKcal) * 100));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayLogs = calorieLogs.filter((l) => l.loggedAt === dateStr);
    return {
      day: format(d, 'E'),
      calories: dayLogs.reduce((sum, l) => sum + l.caloriesKcal, 0),
    };
  });

  const radialData = [{ name: '달성', value: percentage, fill: percentage > 100 ? '#ef4444' : '#22c55e' }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-7 h-7 text-warning" />
            칼로리 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">{selectedDate}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> 기록
        </button>
      </div>

      {!profile && (
        <div className="bg-warning/10 rounded-2xl p-4 text-sm text-warning">
          프로필을 설정하면 맞춤 칼로리 목표가 계산됩니다.
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={radialData}
              >
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f1f5f9' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{todayCalories}</div>
            <div className="text-sm text-gray-500">/ {targetKcal} kcal</div>
            <div className="text-sm font-medium mt-1" style={{ color: percentage > 100 ? '#ef4444' : '#22c55e' }}>
              {percentage}% 달성
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <MacroBar label="단백질" value={todayProtein} unit="g" color="bg-blue-400" />
          <MacroBar label="탄수화물" value={todayCarbs} unit="g" color="bg-amber-400" />
          <MacroBar label="지방" value={todayFat} unit="g" color="bg-red-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">주간 칼로리 추이</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="calories" fill="#22c55e" radius={[6, 6, 0, 0]} name="칼로리" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {Object.entries(MEAL_LABELS).map(([type, meta]) => {
        const mealLogs = todayLogs.filter((l) => l.mealType === type);
        if (mealLogs.length === 0) return null;
        return (
          <div key={type} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3">
              {meta.emoji} {meta.label}
            </h3>
            <div className="space-y-2">
              {mealLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-sm text-gray-800">{log.foodName}</span>
                    {log.servingSize && <span className="text-xs text-gray-400 ml-2">{log.servingSize}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{log.caloriesKcal} kcal</span>
                    <button onClick={() => removeCalorieLog(log.id)} className="text-gray-300 hover:text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showAdd && <AddFoodModal onClose={() => setShowAdd(false)} onAdd={addCalorieLog} date={selectedDate} />}
    </div>
  );
}

function MacroBar({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">
        {value.toFixed(0)}
        <span className="text-xs text-gray-400 ml-0.5">{unit}</span>
      </div>
      <div className={`h-1.5 rounded-full ${color} mt-1 opacity-60`} />
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function AddFoodModal({
  onClose,
  onAdd,
  date,
}: {
  onClose: () => void;
  onAdd: (log: Omit<import('../types').CalorieLog, 'id'>) => void;
  date: string;
}) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [servingSize, setServingSize] = useState('');

  const handleSubmit = () => {
    if (!foodName || !calories) return;
    onAdd({
      loggedAt: date,
      mealType,
      foodName,
      caloriesKcal: parseInt(calories),
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
      servingSize: servingSize || undefined,
      source: 'manual',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">음식 기록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">식사 유형</label>
          <div className="flex gap-2">
            {Object.entries(MEAL_LABELS).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setMealType(key as MealType)}
                className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                  mealType === key
                    ? 'border-primary bg-primary-light text-primary-dark'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}
          </div>
        </div>

        <Input label="음식명" value={foodName} onChange={setFoodName} placeholder="예: 닭가슴살 샐러드" required />
        <Input label="칼로리 (kcal)" value={calories} onChange={setCalories} placeholder="350" type="number" required />

        <div className="grid grid-cols-3 gap-3">
          <Input label="단백질 (g)" value={protein} onChange={setProtein} placeholder="30" type="number" />
          <Input label="탄수화물 (g)" value={carbs} onChange={setCarbs} placeholder="20" type="number" />
          <Input label="지방 (g)" value={fat} onChange={setFat} placeholder="10" type="number" />
        </div>

        <Input label="1인분 양 (선택)" value={servingSize} onChange={setServingSize} placeholder="200g" />

        <button
          onClick={handleSubmit}
          disabled={!foodName || !calories}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          기록하기
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
