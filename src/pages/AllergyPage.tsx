import { useState } from 'react';
import { ShieldAlert, Plus, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { ALLERGEN_LIST, SEVERITY_LABELS } from '../utils/allergenMap';

export default function AllergyPage() {
  const { allergies, addAllergy, removeAllergy } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('moderate');
  const [customAllergen, setCustomAllergen] = useState('');
  const [notes, setNotes] = useState('');

  const registeredKeys = new Set(allergies.map((a) => a.allergen));

  const handleAdd = () => {
    const allergenKey = selectedAllergen || customAllergen;
    if (!allergenKey) return;
    const allergenInfo = ALLERGEN_LIST.find((a) => a.key === allergenKey);
    addAllergy({
      allergen: allergenKey,
      allergenKo: allergenInfo?.ko ?? customAllergen,
      severity: selectedSeverity as 'mild' | 'moderate' | 'severe' | 'anaphylaxis',
      notes: notes || undefined,
    });
    setShowAdd(false);
    setSelectedAllergen('');
    setCustomAllergen('');
    setNotes('');
    setSelectedSeverity('moderate');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-danger" />
            알레르기 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">식품 알레르기 및 건강 주의사항을 등록하세요</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>

      {allergies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 알레르기가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">알레르기를 등록하면 레시피 추천 시 자동으로 필터링됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allergies.map((allergy) => {
            const info = ALLERGEN_LIST.find((a) => a.key === allergy.allergen);
            const severity = SEVERITY_LABELS[allergy.severity];
            return (
              <div key={allergy.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info?.emoji ?? '⚠️'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{allergy.allergenKo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>
                    {allergy.notes && <p className="text-xs text-gray-400 mt-0.5">{allergy.notes}</p>}
                  </div>
                </div>
                <button
                  onClick={() => removeAllergy(allergy.id)}
                  className="text-gray-300 hover:text-danger transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">알레르기 추가</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">알레르기 항목</label>
              <div className="grid grid-cols-3 gap-2">
                {ALLERGEN_LIST.map((item) => (
                  <button
                    key={item.key}
                    disabled={registeredKeys.has(item.key)}
                    onClick={() => {
                      setSelectedAllergen(item.key);
                      setCustomAllergen('');
                    }}
                    className={`p-2 rounded-xl text-sm border transition-all ${
                      selectedAllergen === item.key
                        ? 'border-primary bg-primary-light text-primary-dark'
                        : registeredKeys.has(item.key)
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 hover:border-primary text-gray-700'
                    }`}
                  >
                    <span className="block text-lg">{item.emoji}</span>
                    <span className="block mt-0.5">{item.ko}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="직접 입력 (예: 복숭아)"
                  value={customAllergen}
                  onChange={(e) => {
                    setCustomAllergen(e.target.value);
                    setSelectedAllergen('');
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">심각도</label>
              <div className="flex gap-2">
                {Object.entries(SEVERITY_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSeverity(key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                      selectedSeverity === key ? val.color + ' border-current' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">메모 (선택)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="추가 주의사항을 입력하세요"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedAllergen && !customAllergen}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              등록하기
            </button>
          </div>
        </div>
      )}

      <div className="bg-danger/5 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600">
          이 앱의 알레르기 필터링은 참고용입니다. 심각한 알레르기가 있는 경우 반드시 의사 또는 영양 전문가와 상담하세요.
        </p>
      </div>
    </div>
  );
}
