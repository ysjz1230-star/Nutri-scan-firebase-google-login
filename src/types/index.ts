export interface UserProfile {
  id: string;
  gender: 'male' | 'female';
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: 'lose' | 'maintain' | 'gain';
  bmi: number;
  tdeeKcal: number;
  targetKcal: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface Allergen {
  id: string;
  allergen: string;
  allergenKo: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  notes?: string;
}

export interface FridgeItem {
  id: string;
  name: string;
  nameEn: string;
  quantity: string;
  unit: string;
  location: 'fridge' | 'freezer' | 'pantry';
  expiresAt?: string;
  addedVia: 'camera' | 'manual';
  createdAt: string;
}

export interface CalorieLog {
  id: string;
  loggedAt: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize?: string;
  source: 'manual' | 'recipe';
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: RecipeIngredient[];
  missedIngredients: RecipeIngredient[];
  calories?: number;
  readyInMinutes?: number;
  hasAllergyWarning?: boolean;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image: string;
}

export interface DetectedIngredient {
  name: string;
  nameEn: string;
  quantity: string;
}

export type MealType = CalorieLog['mealType'];
