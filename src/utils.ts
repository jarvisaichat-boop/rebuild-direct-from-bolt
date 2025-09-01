// src/utils.ts
import { Habit } from './types';

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(d.setDate(diff));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDateString = (date: Date): string => date.toISOString().split('T')[0];

export const getTextColorClass = (color: string) => ({
  'blue': 'text-blue-400',
  'green': 'text-green-400',
  'purple': 'text-purple-400',
}[color] || 'text-gray-400');

export const getBgColorClass = (color: string) => ({
  'blue': 'bg-blue-500',
  'green': 'bg-green-500',
  'purple': 'bg-purple-500',
}[color] || 'bg-gray-500');

export const getBorderColorClass = (color: string) => ({
  'blue': 'border-blue-400',
  'green': 'border-green-400',
  'purple': 'border-purple-400',
}[color] || 'border-gray-400');

export const getColorClass = (colorName: string): string => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
        red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-500',
    };
    return colorMap[colorName] || 'bg-gray-500';
};

// Logic to check if a habit is scheduled on a given day
const isHabitScheduledOnDay = (habit: Habit, date: Date): boolean => {
    // This is a simplified version; a full implementation would check frequencyType, etc.
    return true; 
};

// The consecutive streak calculation logic
export const calculateStreak = (habit: Habit): number => {
    let streak = 0;
    let checkDate = new Date(); // Start from today
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365 * 2; i++) { // Check up to 2 years
        const dateString = formatDateString(checkDate);
        
        if (isHabitScheduledOnDay(habit, checkDate)) {
            if (habit.completed[dateString] === true) {
                streak++;
            } else {
                // If the day is not complete and it's not today (which might just not be done yet), the streak is broken.
                if (formatDateString(new Date()) !== dateString) {
                    break;
                }
            }
        }
        // If not scheduled, the streak is not broken, just continue.
        
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
};

// New function to calculate total completions
export const calculateTotalCompletions = (habit: Habit): number => {
    return Object.values(habit.completed).filter(status => status === true).length;
};