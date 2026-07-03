import { useState, useRef, useEffect } from 'react';
import { Refrigerator, Camera, Plus, X, Trash2, ChefHat, Upload, AlertTriangle, ArrowUpDown, Pencil, Check } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useGuestStore } from '../stores/useGuestStore';
import { differenceInDays } from 'date-fns';
import { compressImage } from '../utils/imageCompressor';
import LoginPromptModal from '../components/LoginPromptModal';
import type { DetectedIngredient, FridgeItem } from '../types';

type LocationFilter = 'all' | 'fridge' | 'freezer' | 'pantry';
type SortType = 'default' | 'name' | 'expiry';

const LOCATION_LABELS: Record<string, string> = {
  fridge: '냉장',
  freezer: '냉동',
  pantry: '팬트리',
};

function getExpiryInfo(expiresAt?: string) {
  if (!expiresAt) return null;
  const days = differenceInDays(new Date(expiresAt), new Date());
  if (days < 0)  return { label: `만료 D+${Math.abs(days)}`, dot: 'bg-red-500',   badge: 'bg-red-100 text-red-600' };
  if (days === 0) return { label: 'D-Day',                    dot: 'bg-red-500',   badge: 'bg-red-100 text-red-600' };
  if (days <= 3)  return { label: `D-${days}`,                dot: 'bg-orange-400',badge: 'bg-orange-100 text-orange-600' };
  if (days <= 7)  return { label: `D-${days}`,                dot: 'bg-yellow-400',badge: 'bg-yellow-100 text-yellow-700' };
  return           { label: `D-${days}`,                      dot: 'bg-green-400', badge: 'bg-green-100 text-green-700' };
}

function sortItems(items: FridgeItem[], sort: SortType): FridgeItem[] {
  const arr = [...items];
  if (sort === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  if (sort === 'expiry') return arr.sort((a, b) => {
    if (!a.expiresAt && !b.expiresAt) return 0;
    if (!a.expiresAt) return 1;
    if (!b.expiresAt) return -1;
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });
  return arr;
}

async function callClaudeVision(base64: string): Promise<DetectedIngredient[]> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('.env 파일에 VITE_ANTHROPIC_API_KEY가 없습니다.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
            {
              type: 'text',
              text: `이 이미지에서 보이는 식재료(먹을 수 있는 음식 재료)만 찾아 JSON으로만 반환해줘.
중요: 포장재, 용기, 봉지, 판, 트레이, 상자, 그릇, 냄비 등 식재료가 아닌 물건은 절대 포함하지 마.
예를 들어 계란판은 제외하고 계란만 포함해야 해.
형식: { "ingredients": [{"name": "재료명(한국어)", "name_en": "English name", "quantity": "추정량"}] }
JSON 외 다른 텍스트는 절대 포함하지 마.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { ingredients: [] };
  return (parsed.ingredients ?? []).map((i: { name: string; name_en: string; quantity: string }) => ({
    name: i.name,
    nameEn: i.name_en,
    quantity: i.quantity,
  }));
}

export default function FridgePage() {
  const { fridgeItems, removeFridgeItem, addFridgeItem, updateFridgeItem, detectedIngredients, setDetectedIngredients } = useStore();
  const { user } = useAuthStore();
  const { freeUsesLeft, decrement } = useGuestStore();
  const [filter, setFilter] = useState<LocationFilter>('all');
  const [sortType, setSortType] = useState<SortType>('default');
  const [showManual, setShowManual] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: '', quantity: '', expiresAt: '', location: 'fridge' as FridgeLocation });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (item: FridgeItem) => {
    setEditingId(item.id);
    setEditDraft({ name: item.name, quantity: item.quantity, expiresAt: item.expiresAt ?? '', location: item.location });
  };

  const saveEdit = (id: string) => {
    updateFridgeItem(id, {
      name: editDraft.name,
      quantity: editDraft.quantity,
      expiresAt: editDraft.expiresAt || undefined,
      location: editDraft.location,
    });
    setEditingId(null);
  };

  // 게스트 사용 가능 여부 확인 후 횟수 차감, 초과 시 모달 표시
  const checkAndConsume = (featureName: string): boolean => {
    if (user) return true;
    if (freeUsesLeft > 0) {
      decrement();
      return true;
    }
    setLoginPrompt(featureName);
    return false;
  };

  const filtered = sortItems(
    filter === 'all' ? fridgeItems : fridgeItems.filter((i) => i.location === filter),
    sortType
  );

  const urgentItems = fridgeItems.filter((i) => {
    if (!i.expiresAt) return false;
    const days = differenceInDays(new Date(i.expiresAt), new Date());
    return days <= 3;
  });

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    if (!checkAndConsume('AI 재료 인식')) return;
    setScanError('');
    setScanning(true);
    setShowScan(true);
    try {
      const base64 = await compressImage(file);
      const detected = await callClaudeVision(base64);
      if (detected.length === 0) {
        setScanError('재료를 인식하지 못했습니다. 더 밝고 선명한 사진을 사용해보세요.');
        return;
      }
      setDetectedIngredients(detected);
    } catch (err) {
      setScanError(`오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setScanning(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Refrigerator className="w-7 h-7 text-info" />
            냉장고 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">{fridgeItems.length}개 재료 보유 중</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!checkAndConsume('AI 레시피 추천')) return;
              setShowRecipes(true);
            }}
            className="bg-warning text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-amber-600 transition-colors"
          >
            <ChefHat className="w-4 h-4" /> 레시피
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 드래그&드롭 / 클릭 업로드 영역 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
          isDragOver
            ? 'border-primary bg-green-50 scale-[1.01]'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          {isDragOver ? (
            <Upload className="w-12 h-12 text-primary animate-bounce" />
          ) : (
            <Camera className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-sm text-gray-700 font-medium">
              {isDragOver ? '여기에 놓으세요!' : '냉장고 사진을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-xs text-gray-400 mt-1">AI가 자동으로 재료를 인식합니다 · JPEG, PNG, WEBP · 최대 10MB</p>
          </div>
        </div>
      </div>

      {/* 유통기한 임박 배너 */}
      {urgentItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <span className="font-semibold">{urgentItems.map((i) => i.name).join(', ')}</span>
            {urgentItems.length === 1 ? '의' : ' 등'} 유통기한이 3일 이내입니다. 빨리 사용하세요!
          </p>
        </div>
      )}

      {/* 위치 필터 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'fridge', 'freezer', 'pantry'] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setFilter(loc)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === loc ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {loc === 'all' ? '전체' : LOCATION_LABELS[loc]} ({loc === 'all' ? fridgeItems.length : fridgeItems.filter((i) => i.location === loc).length})
          </button>
        ))}
      </div>

      {/* 정렬 버튼 */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-400 shrink-0">정렬</span>
        {([
          { type: 'default', label: '등록순' },
          { type: 'name',    label: '가나다순' },
          { type: 'expiry',  label: '유통기한 임박순' },
        ] as { type: SortType; label: string }[]).map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setSortType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortType === type ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Refrigerator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">재료가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">사진을 업로드하거나 직접 재료를 추가하세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => {
            const expiry = getExpiryInfo(item.expiresAt);
            const isEditing = editingId === item.id;

            if (isEditing) {
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary space-y-2">
                  <input
                    value={editDraft.name}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="재료명"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary"
                  />
                  {/* 보관 위치 */}
                  <div className="flex gap-1.5">
                    {(['fridge', 'freezer', 'pantry'] as FridgeLocation[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setEditDraft((d) => ({ ...d, location: loc }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          editDraft.location === loc
                            ? 'border-primary bg-primary-light text-primary-dark'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {LOCATION_LABELS[loc]}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex gap-2 text-xs text-gray-400 px-1">
                      <span className="w-28">수량</span>
                      <span className="flex-1">유통기한 선택</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={editDraft.quantity}
                        onChange={(e) => setEditDraft((d) => ({ ...d, quantity: e.target.value }))}
                        placeholder="예: 300g"
                        className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                      />
                      <input
                        type="date"
                        value={editDraft.expiresAt}
                        onChange={(e) => setEditDraft((d) => ({ ...d, expiresAt: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-gray-600"
                      /></div>
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={!editDraft.name}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-40 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {expiry && <span className={`w-2 h-2 rounded-full shrink-0 ${expiry.dot}`} />}
                    <span className="font-medium text-gray-900 truncate">{item.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">({item.nameEn})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500">{item.quantity}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {LOCATION_LABELS[item.location]}
                    </span>
                    {expiry && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expiry.badge}`}>
                        {expiry.label}
                      </span>
                    )}
                    {item.expiresAt && (
                      <span className="text-xs text-gray-400">{item.expiresAt}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-gray-300 hover:text-primary p-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeFridgeItem(item.id)} className="text-gray-300 hover:text-danger p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showScan && (
        <ScanModal
          scanning={scanning}
          detected={detectedIngredients}
          error={scanError}
          onClose={() => {
            setShowScan(false);
            setDetectedIngredients([]);
            setScanError('');
          }}
          onConfirm={(editedItems) => {
            editedItems.forEach((item) =>
              addFridgeItem({
                name: item.name,
                nameEn: item.nameEn,
                quantity: item.quantity,
                unit: '',
                location: 'fridge',
                expiresAt: item.expiresAt || undefined,
                addedVia: 'camera',
              })
            );
            setShowScan(false);
            setDetectedIngredients([]);
          }}
        />
      )}

      {showManual && <ManualAddModal onClose={() => setShowManual(false)} onAdd={addFridgeItem} />}

      {showRecipes && <RecipeModal onClose={() => setShowRecipes(false)} ingredients={fridgeItems} />}

      {loginPrompt && (
        <LoginPromptModal feature={loginPrompt} onClose={() => setLoginPrompt(null)} />
      )}
    </div>
  );
}

type FridgeLocation = 'fridge' | 'freezer' | 'pantry';

interface EditableItem {
  name: string;
  nameEn: string;
  quantity: string;
  expiresAt: string;
  location: FridgeLocation;
}

function ScanModal({
  scanning,
  detected,
  error,
  onClose,
  onConfirm,
}: {
  scanning: boolean;
  detected: DetectedIngredient[];
  error: string;
  onClose: () => void;
  onConfirm: (items: EditableItem[]) => void;
}) {
  const [editItems, setEditItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    setEditItems(
      detected.map((d) => ({ name: d.name, nameEn: d.nameEn, quantity: d.quantity, expiresAt: '', location: 'fridge' as FridgeLocation }))
    );
  }, [detected]);

  const update = (idx: number, field: keyof EditableItem, value: string) =>
    setEditItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const remove = (idx: number) =>
    setEditItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">AI 재료 인식</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {scanning ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-500 mt-4">AI가 재료를 분석하고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-danger text-sm">{error}</p>
            <button onClick={onClose} className="text-sm text-gray-500 underline">닫기</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{editItems.length}개</span> 재료 인식 ·
              이름·수량 수정, 불필요한 재료 삭제 후 추가하세요
            </p>

            <div className="space-y-2">
              {editItems.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {/* 재료명 + 삭제 */}
                  <div className="flex items-center gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => update(i, 'name', e.target.value)}
                      placeholder="재료명"
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => remove(i)}
                      className="text-gray-300 hover:text-danger shrink-0 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* 보관 위치 */}
                  <div className="flex gap-1.5">
                    {(['fridge', 'freezer', 'pantry'] as FridgeLocation[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => update(i, 'location', loc)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          item.location === loc
                            ? 'border-primary bg-primary-light text-primary-dark'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {LOCATION_LABELS[loc]}
                      </button>
                    ))}
                  </div>
                  {/* 수량 + 유통기한 */}
                  <div className="space-y-1">
                    <div className="flex gap-2 text-xs text-gray-400 px-1">
                      <span className="w-28">수량</span>
                      <span className="flex-1">유통기한 선택</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={item.quantity}
                        onChange={(e) => update(i, 'quantity', e.target.value)}
                        placeholder="예: 300g"
                        className="w-28 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                      />
                      <input
                        type="date"
                        value={item.expiresAt}
                        onChange={(e) => update(i, 'expiresAt', e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {editItems.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">모든 재료가 삭제되었습니다</p>
            ) : (
              <button
                onClick={() => onConfirm(editItems)}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                냉장고에 추가하기 ({editItems.length}개)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ManualAddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<FridgeItem, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState<'fridge' | 'freezer' | 'pantry'>('fridge');
  const [expiresAt, setExpiresAt] = useState('');

  const handleSubmit = () => {
    if (!name) return;
    onAdd({
      name,
      nameEn: nameEn || name,
      quantity: quantity || '1개',
      unit: '',
      location,
      expiresAt: expiresAt || undefined,
      addedVia: 'manual',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">재료 직접 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">재료명 (한국어) *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 닭가슴살"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">영문명 (API 연동용)</label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="예: chicken breast"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">수량</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="예: 300g"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">유통기한</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">보관 위치</label>
          <div className="flex gap-2">
            {(['fridge', 'freezer', 'pantry'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                  location === loc ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-200 text-gray-500'
                }`}
              >
                {LOCATION_LABELS[loc]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          추가하기
        </button>
      </div>
    </div>
  );
}

interface GeneratedRecipe {
  title: string;
  usedIngredients: string[];
  extraIngredients: string[];
  calories: number;
  time: number;
  steps: string[];
}

async function fetchAIRecipes(
  ingredientNames: string[],
  allergyNames: string[]
): Promise<GeneratedRecipe[]> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY가 설정되지 않았습니다.');

  const allergyNote = allergyNames.length > 0
    ? `\n주의: 다음 알레르기 재료는 절대 사용하지 마: ${allergyNames.join(', ')}`
    : '';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `냉장고 재료: ${ingredientNames.join(', ')}${allergyNote}

위 재료를 최대한 활용한 레시피 3가지를 JSON으로만 반환해줘.
형식:
{
  "recipes": [
    {
      "title": "레시피명",
      "usedIngredients": ["사용하는 냉장고 재료들"],
      "extraIngredients": ["추가로 필요한 재료들 (소금, 기름 등 기본 양념 제외)"],
      "calories": 칼로리(숫자),
      "time": 조리시간(분, 숫자),
      "steps": ["1. 조리 단계", "2. 조리 단계", "3. 조리 단계"]
    }
  ]
}
JSON 외 텍스트 없이 반환해.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recipes: [] };
  return parsed.recipes ?? [];
}

function RecipeModal({ onClose, ingredients }: { onClose: () => void; ingredients: FridgeItem[] }) {
  const { allergies } = useStore();
  const [step, setStep] = useState<'select' | 'result'>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(ingredients.map((i) => i.id)));
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const selectedItems = ingredients.filter((i) => selectedIds.has(i.id));
  const allSelected = selectedIds.size === ingredients.length;

  const toggleItem = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(ingredients.map((i) => i.id)));

  const handleGetRecipes = async () => {
    if (selectedItems.length === 0) return;
    setStep('result');
    setLoading(true);
    setError('');
    try {
      const result = await fetchAIRecipes(
        selectedItems.map((i) => i.name),
        allergies.map((a) => a.allergenKo)
      );
      setRecipes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '레시피 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">

        {/* ── Step 1: 재료 선택 ── */}
        {step === 'select' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-warning" />
                레시피 재료 선택
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">사용할 재료를 선택하세요</p>

            {ingredients.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                냉장고에 재료가 없습니다. 먼저 재료를 추가해주세요.
              </div>
            ) : (
              <>
                <button
                  onClick={toggleAll}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {ingredients.map((item) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary-light'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${selected ? 'text-primary-dark' : 'text-gray-700'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{item.quantity}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {allergies.length > 0 && (
                  <div className="bg-danger/5 rounded-xl p-3 text-xs text-gray-600 flex items-center gap-2">
                    <span>🚫</span>
                    <span>알레르기 자동 제외: {allergies.map((a) => a.allergenKo).join(', ')}</span>
                  </div>
                )}

                <button
                  onClick={handleGetRecipes}
                  disabled={selectedIds.size === 0}
                  className="w-full bg-warning text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-4 h-4" />
                  선택한 재료로 AI 레시피 추천 ({selectedIds.size}개)
                </button>
              </>
            )}
          </>
        )}

        {/* ── Step 2: 레시피 결과 ── */}
        {step === 'result' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-warning" />
                AI 추천 레시피
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 선택된 재료 */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">선택한 재료 ({selectedItems.length}개)</p>
                <button
                  onClick={() => { setStep('select'); setRecipes([]); setError(''); }}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  재료 변경 →
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedItems.map((i) => (
                  <span key={i.id} className="text-xs bg-primary-light text-primary-dark px-2 py-1 rounded-full">
                    {i.name}
                  </span>
                ))}
              </div>
            </div>

            {allergies.length > 0 && (
              <div className="bg-danger/5 rounded-xl p-3 text-xs text-gray-600 flex items-center gap-2">
                <span>🚫</span>
                <span>알레르기 제외: {allergies.map((a) => a.allergenKo).join(', ')}</span>
              </div>
            )}

            {loading && (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin w-10 h-10 border-4 border-warning border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-gray-500">AI가 레시피를 생성하고 있습니다...</p>
                <p className="text-xs text-gray-400">약 5~10초 소요</p>
              </div>
            )}

            {!loading && error && (
              <div className="py-8 text-center">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-3">
                {recipes.map((recipe, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>🔥 {recipe.calories} kcal</span>
                            <span>⏱ {recipe.time}분</span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-lg">{expandedIdx === idx ? '▲' : '▼'}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {recipe.usedIngredients.map((ing, i) => (
                          <span key={i} className="text-xs bg-primary-light text-primary-dark px-2 py-1 rounded-full">✓ {ing}</span>
                        ))}
                        {recipe.extraIngredients.map((ing, i) => (
                          <span key={i} className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">+ {ing}</span>
                        ))}
                      </div>
                    </button>
                    {expandedIdx === idx && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-600 mb-2">조리 방법</p>
                        {recipe.steps.map((step, i) => (
                          <div key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="shrink-0 w-5 h-5 bg-warning text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            <span>{step.replace(/^\d+\.\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-center text-gray-400">
              ✅ 초록 태그: 선택 재료 · 회색 태그: 추가 필요 재료
            </p>
          </>
        )}
      </div>
    </div>
  );
}
