// src/components/DashboardComponents.tsx
import React from 'react';
import { Habit } from '../types';
import { formatDateString, getTextColorClass, getBgColorClass, getBorderColorClass, getStartOfWeek, addDays } from '../utils';
import { X, Check } from 'lucide-react';

// --- WEEKLY VIEW COMPONENTS ---
export const WeekHeader = ({ weekDates }: { weekDates: Date[] }) => (
    <>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-3">
            {weekDates.map(date => <div key={date.toISOString()}>{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>)}
        </div>
        <div className="grid grid-cols-7 text-center text-sm font-semibold">
            {weekDates.map(date => <div key={date.toISOString()}>{date.getDate()}</div>)}
        </div>
    </>
);

export const HabitRow = ({ habit, weekDates, onToggleCompletion, onEdit, streak }: { 
    habit: Habit, 
    weekDates: Date[], 
    onToggleCompletion: (habitId: number, dateString: string) => void, 
    onEdit: (habit: Habit) => void,
    streak: number // Added streak prop
}) => {
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => onEdit(habit)} className={`w-full text-left text-sm font-medium ${getTextColorClass(habit.color)}`}>
                    {habit.name}
                </button>
                {/* Display streak if it's greater than 0 */}
                {streak > 0 && (
                    <span className="text-sm font-semibold text-gray-400 flex-shrink-0 ml-4">{streak} days</span>
                )}
            </div>
            <div className="grid grid-cols-7 gap-3 items-center">
                {weekDates.map((date, i) => {
                    const dateString = formatDateString(date);
                    const isCompleted = habit.completed[dateString] === true;
                    const isFailed = habit.completed[dateString] === false;
                    const prevCompleted = i > 0 && habit.completed[formatDateString(weekDates[i-1])] === true;
                    const isConnected = isCompleted && prevCompleted;
                    const circleBg = isCompleted ? getBgColorClass(habit.color) : isFailed ? 'bg-red-900/50' : 'bg-gray-700';
                    const circleBorder = isCompleted ? getBorderColorClass(habit.color) : isFailed ? 'border-red-800/50' : 'border-gray-600';
                    return (
                        <div key={date.toISOString()} className="flex items-center justify-center relative">
                            {i > 0 && <div className={`absolute w-full h-1 ${isConnected ? getBgColorClass(habit.color) : 'bg-transparent'}`} style={{right: '50%', zIndex: 0}}></div>}
                            <button onClick={() => onToggleCompletion(habit.id, dateString)} className={`z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${circleBg} ${circleBorder}`}>
                                {isFailed && <X size={18} className="text-red-400" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MONTHLY VIEW COMPONENT ---
export const MonthView = ({ currentDate, onDateClick }: { currentDate: Date, onDateClick: (date: Date) => void }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = getStartOfWeek(firstDayOfMonth);
    const monthDates = Array.from({ length: 35 }).map((_, i) => addDays(startDay, i)); // 5 weeks
    const today = new Date(); today.setHours(0,0,0,0);

    return (
        <div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-3">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
                {monthDates.map(date => {
                    const isCurrentMonth = date.getMonth() === month;
                    const isToday = date.getTime() === today.getTime();
                    return (
                        <button key={date.toISOString()} onClick={() => onDateClick(date)}
                            className={`py-2 rounded-lg transition-colors text-lg font-semibold ${isToday ? 'bg-blue-600 text-white' : ''} ${isCurrentMonth ? 'text-white hover:bg-gray-800' : 'text-gray-600'}`}>
                            {date.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

// --- YEARLY VIEW COMPONENT ---
export const YearView = ({ currentDate, onMonthClick }: { currentDate: Date, onMonthClick: (month: number) => void }) => {
    const year = currentDate.getFullYear();
    const currentMonth = new Date().getMonth();
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <button key={i} onClick={() => onMonthClick(i)} className={`py-4 px-2 rounded-lg font-bold text-lg transition-colors ${i === currentMonth ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}>
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

// --- SIMPLE LIST VIEW COMPONENT ---
export const SimpleHabitRow = ({ habit, onToggleCompletion, onEdit }: { habit: Habit, onToggleCompletion: (habitId: number, dateString: string) => void, onEdit: (habit: Habit) => void }) => {
    const todayString = formatDateString(new Date());
    const isCompleted = habit.completed[todayString] === true;
    return (
        <div className="flex items-center justify-between py-2">
            <button onClick={() => onEdit(habit)} className={`text-base font-medium ${getTextColorClass(habit.color)}`}>
                {habit.name}
            </button>
            <button onClick={() => onToggleCompletion(habit.id, todayString)} className={`w-7 h-7 rounded-full flex-shrink-0 border-2 ${isCompleted ? `${getBgColorClass(habit.color)} ${getBorderColorClass(habit.color)}` : 'bg-[#3A3A3C] border-gray-600'}`}>
                {isCompleted && <Check size={14} className="text-white mx-auto"/>}
            </button>
        </div>
    );
};