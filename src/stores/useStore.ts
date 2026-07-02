import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Allergen, FridgeItem, CalorieLog, DetectedIngredient } from '../types';
import { calculateBMI, calculateTDEE, calculateTargetKcal } from '../utils/calorieCalculator';

interface AppState {
  profile: UserProfile | null;
  allergies: Allergen[];
  fridgeItems: FridgeItem[];
  calorieLogs: CalorieLog[];
  detectedIngredients: DetectedIngredient[];

  setProfile: (data: Omit<UserProfile, 'id' | 'bmi' | 'tdeeKcal' | 'targetKcal'>) => void;
  addAllergy: (allergy: Omit<Allergen, 'id'>) => void;
  removeAllergy: (id: string) => void;
  addFridgeItem: (item: Omit<FridgeItem, 'id' | 'createdAt'>) => void;
  removeFridgeItem: (id: string) => void;
  updateFridgeItem: (id: string, updates: Partial<FridgeItem>) => void;
  addCalorieLog: (log: Omit<CalorieLog, 'id'>) => void;
  removeCalorieLog: (id: string) => void;
  setDetectedIngredients: (items: DetectedIngredient[]) => void;
  addDetectedToFridge: (items: DetectedIngredient[]) => void;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      allergies: [],
      fridgeItems: [],
      calorieLogs: [],
      detectedIngredients: [],

      setProfile: (data) => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - data.birthYear;
        const bmi = calculateBMI(data.weightKg, data.heightCm);
        const tdeeKcal = calculateTDEE(data.gender, age, data.weightKg, data.heightCm, data.activityLevel);
        const targetKcal = calculateTargetKcal(tdeeKcal, data.goal);
        set({
          profile: { ...data, id: generateId(), bmi, tdeeKcal, targetKcal },
        });
      },

      addAllergy: (allergy) =>
        set((state) => ({
          allergies: [...state.allergies, { ...allergy, id: generateId() }],
        })),

      removeAllergy: (id) =>
        set((state) => ({
          allergies: state.allergies.filter((a) => a.id !== id),
        })),

      addFridgeItem: (item) =>
        set((state) => ({
          fridgeItems: [
            ...state.fridgeItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      removeFridgeItem: (id) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.filter((i) => i.id !== id),
        })),

      updateFridgeItem: (id, updates) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      addCalorieLog: (log) =>
        set((state) => ({
          calorieLogs: [...state.calorieLogs, { ...log, id: generateId() }],
        })),

      removeCalorieLog: (id) =>
        set((state) => ({
          calorieLogs: state.calorieLogs.filter((l) => l.id !== id),
        })),

      setDetectedIngredients: (items) => set({ detectedIngredients: items }),

      addDetectedToFridge: (items) =>
        set((state) => ({
          fridgeItems: [
            ...state.fridgeItems,
            ...items.map((item) => ({
              id: generateId(),
              name: item.name,
              nameEn: item.nameEn,
              quantity: item.quantity,
              unit: '',
              location: 'fridge' as const,
              addedVia: 'camera' as const,
              createdAt: new Date().toISOString(),
            })),
          ],
          detectedIngredients: [],
        })),
    }),
    { name: 'nutriscan-storage' }
  )
);
