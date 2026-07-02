export const ALLERGEN_LIST = [
  { key: 'gluten', ko: '글루텐', emoji: '🌾' },
  { key: 'dairy', ko: '유제품', emoji: '🥛' },
  { key: 'egg', ko: '달걀', emoji: '🥚' },
  { key: 'peanut', ko: '땅콩', emoji: '🥜' },
  { key: 'tree_nut', ko: '견과류', emoji: '🌰' },
  { key: 'soy', ko: '콩', emoji: '🫘' },
  { key: 'wheat', ko: '밀', emoji: '🌾' },
  { key: 'shellfish', ko: '갑각류', emoji: '🦐' },
  { key: 'sesame', ko: '참깨', emoji: '🫘' },
  { key: 'seafood', ko: '해산물', emoji: '🐟' },
  { key: 'sulfite', ko: '아황산염', emoji: '🧪' },
  { key: 'nightshade', ko: '가지과', emoji: '🍆' },
] as const;

export const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  mild: { label: '경미', color: 'bg-blue-100 text-blue-700' },
  moderate: { label: '중간', color: 'bg-yellow-100 text-yellow-700' },
  severe: { label: '심각', color: 'bg-orange-100 text-orange-700' },
  anaphylaxis: { label: '아나필락시스', color: 'bg-red-100 text-red-700' },
};
