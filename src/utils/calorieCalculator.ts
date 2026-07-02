import type { ActivityLevel } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: '저체중', color: 'text-info' };
  if (bmi < 23) return { label: '정상', color: 'text-primary' };
  if (bmi < 25) return { label: '과체중', color: 'text-warning' };
  return { label: '비만', color: 'text-danger' };
}

export function calculateTDEE(
  gender: 'male' | 'female',
  age: number,
  weightKg: number,
  heightCm: number,
  activityLevel: ActivityLevel
): number {
  const bmr =
    gender === 'male'
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateTargetKcal(tdee: number, goal: 'lose' | 'maintain' | 'gain'): number {
  switch (goal) {
    case 'lose':
      return tdee - 500;
    case 'gain':
      return tdee + 300;
    default:
      return tdee;
  }
}
