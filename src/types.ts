// src/types.ts
export interface Category {
  main: string;
  sub: string;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  color: string;
  type: 'Habit' | 'Anchor Habit' | 'Life Goal Habit';
  categories: Category[];
  frequencyType: string;
  selectedDays: string[];
  timesPerPeriod: number;
  periodUnit: string;
  repeatDays: number;
  completed: Record<string, boolean | null>;
}

export interface HabitData {
    id?: number;
    name: string;
    description: string;
    color: string;
    type: string;
    categories: Category[];
    frequencyType: string;
    selectedDays: string[];
    timesPerPeriod: number;
    periodUnit: string;
    repeatDays: number;
}