import { useState, useRef } from 'react';
import { Flame, Plus, X, Trash2, Sparkles, Camera } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useGuestStore } from '../stores/useGuestStore';
import { format } from 'date-fns';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { MealType } from '../types';
import LoginPromptModal from '../components/LoginPromptModal';

const MEAL_LABELS: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: '아침', emoji: '🌅' },
  lunch: { label: '점심', emoji: '☀️' },
  dinner: { label: '저녁', emoji: '🌙' },
  snack: { label: '간식', emoji: '🍪' },
};

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callClaude(messages: object[]): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, messages }),
  });
  const data = await res.json();
  return data.content[0].text as string;
}

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

type InputMode = 'manual' | 'text' | 'photo';

function AddFoodModal({
  onClose,
  onAdd,
  date,
}: {
  onClose: () => void;
  onAdd: (log: Omit<import('../types').CalorieLog, 'id'>) => void;
  date: string;
}) {
  const { user } = useAuthStore();
  const { freeUsesLeft, decrement } = useGuestStore();

  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginFeature, setLoginFeature] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAndConsume = (featureName: string): boolean => {
    if (user) return true;
    if (freeUsesLeft > 0) { decrement(); return true; }
    setLoginFeature(featureName);
    setShowLoginModal(true);
    return false;
  };

  const fillFromAI = (data: { foodName?: string; calories?: number; protein?: number; carbs?: number; fat?: number; servingSize?: string }) => {
    if (data.foodName) setFoodName(data.foodName);
    if (data.calories != null) setCalories(String(data.calories));
    if (data.protein != null) setProtein(String(data.protein));
    if (data.carbs != null) setCarbs(String(data.carbs));
    if (data.fat != null) setFat(String(data.fat));
    if (data.servingSize) setServingSize(data.servingSize);
  };

  const parseJSON = (text: string) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON 파싱 실패');
    return JSON.parse(match[0]);
  };

  const handleTextSearch = async () => {
    if (!searchQuery.trim() || isAnalyzing) return;
    if (!checkAndConsume('AI 칼로리 검색')) return;
    setIsAnalyzing(true);
    setAiError('');
    try {
      const text = await callClaude([{
        role: 'user',
        content: `음식: "${searchQuery}"\n1인분 기준 평균 영양 정보를 JSON으로만 응답하세요. 추가 설명 없이 JSON만:\n{"calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"servingSize":"예: 200g"}`,
      }]);
      const nutrition = parseJSON(text);
      setFoodName(searchQuery);
      fillFromAI(nutrition);
    } catch {
      setAiError('칼로리 정보를 가져오지 못했습니다. 직접 입력해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (!checkAndConsume('AI 사진 칼로리 인식')) return;
    setIsAnalyzing(true);
    setAiError('');
    try {
      const base64 = await fileToBase64(file);
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
      const text = await callClaude([{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: '이 음식 사진의 음식명과 1인분 기준 영양 정보를 JSON으로만 응답하세요. 추가 설명 없이 JSON만:\n{"foodName":"음식명","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"servingSize":"예: 200g"}' },
        ],
      }]);
      fillFromAI(parseJSON(text));
    } catch {
      setAiError('사진 분석에 실패했습니다. 다시 시도하거나 직접 입력해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      source: inputMode === 'manual' ? 'manual' : 'ai',
    });
    onClose();
  };

  const TABS: { mode: InputMode; icon: string; label: string }[] = [
    { mode: 'manual', icon: '✏️', label: '직접 입력' },
    { mode: 'text', icon: '🔍', label: 'AI 텍스트' },
    { mode: 'photo', icon: '📷', label: 'AI 사진' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">음식 기록</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 식사 유형 */}
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

          {/* 입력 모드 탭 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setAiError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* AI 텍스트 검색 */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                  placeholder="음식명 입력 (예: 비빔밥, 삼겹살)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleTextSearch}
                  disabled={isAnalyzing || !searchQuery.trim()}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  {isAnalyzing
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Sparkles className="w-4 h-4" />
                  }
                  {isAnalyzing ? '검색 중' : 'AI 검색'}
                </button>
              </div>
              <p className="text-xs text-gray-400">AI가 칼로리·영양소를 자동으로 입력합니다. 수정 후 기록할 수 있어요.</p>
            </div>
          )}

          {/* AI 사진 인식 */}
          {inputMode === 'photo' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
              />
              <div
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handlePhotoUpload(f);
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isAnalyzing
                    ? 'border-primary bg-green-50 cursor-wait'
                    : isDragOver
                    ? 'border-primary bg-green-50 cursor-copy'
                    : 'border-gray-200 hover:border-primary hover:bg-green-50 cursor-pointer'
                }`}
              >
                {isAnalyzing ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600 font-medium">AI가 음식을 분석 중...</p>
                    <p className="text-xs text-gray-400">잠시만 기다려주세요</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-600 font-medium">음식 사진을 업로드하세요</p>
                    <p className="text-xs text-gray-400">클릭하거나 드래그해서 업로드 · AI가 칼로리를 자동 인식</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* AI 오류 메시지 */}
          {aiError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">
              {aiError}
            </div>
          )}

          {/* 공통 입력 폼 */}
          <div className="space-y-3">
            {(inputMode !== 'text' || foodName) && (
              <>
                <FieldInput label="음식명" value={foodName} onChange={setFoodName} placeholder="예: 닭가슴살 샐러드" required />
                <FieldInput label="칼로리 (kcal)" value={calories} onChange={setCalories} placeholder="350" type="number" required />
                <div className="grid grid-cols-3 gap-3">
                  <FieldInput label="단백질 (g)" value={protein} onChange={setProtein} placeholder="30" type="number" />
                  <FieldInput label="탄수화물 (g)" value={carbs} onChange={setCarbs} placeholder="20" type="number" />
                  <FieldInput label="지방 (g)" value={fat} onChange={setFat} placeholder="10" type="number" />
                </div>
                <FieldInput label="1인분 양 (선택)" value={servingSize} onChange={setServingSize} placeholder="200g" />
              </>
            )}

            {inputMode === 'text' && !foodName && (
              <div className="text-center py-4 text-sm text-gray-400">
                위에서 음식명을 검색하면 칼로리가 자동으로 입력됩니다
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!foodName || !calories}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            기록하기
          </button>
        </div>
      </div>

      {showLoginModal && (
        <LoginPromptModal feature={loginFeature} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

function FieldInput({
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
