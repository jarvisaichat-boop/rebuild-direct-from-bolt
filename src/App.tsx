// src/App.tsx
import React, { useState, useEffect } from 'react';
import { List, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit, HabitData } from './types';
import { getStartOfWeek, addDays, formatDateString, calculateStreak, calculateTotalCompletions, getTextColorClass } from './utils';
import { WeekHeader, HabitRow, MonthView, YearView, SimpleHabitRow } from './components/DashboardComponents';
import { AddHabitModal } from './components/AddHabitModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';

const LOCAL_STORAGE_HABITS_KEY = 'mastery-dashboard-perfect-final-v6';

function loadHabitsFromStorage(): Habit[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error("Failed to load habits", e); }
  return [
    { id: 1, name: "Open App", type: 'Anchor Habit', color: 'blue', description: '', categories: [], frequencyType: 'Everyday', selectedDays: [], timesPerPeriod: 1, periodUnit: 'Week', repeatDays: 1, completed: {"2025-08-25": true, "2025-08-26": true, "2025-08-27": true}},
    { id: 2, name: "Morning Jog", type: 'Life Goal Habit', color: 'green', description: '', categories: [], frequencyType: 'Everyday', selectedDays: [], timesPerPeriod: 1, periodUnit: 'Week', repeatDays: 1, completed: {"2025-08-25": true, "2025-08-26": false}},
    { id: 3, name: "Code for 30 minutes", type: 'Habit', color: 'purple', description: '', categories: [], frequencyType: 'Everyday', selectedDays: [], timesPerPeriod: 1, periodUnit: 'Week', repeatDays: 1, completed: {}}
  ];
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabitsFromStorage);
  const [currentDate, setCurrentDate] = useState(new Date('2025-08-31T12:00:00Z'));
  const [view, setView] = useState<'week' | 'month' | 'year' | 'list'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // New state for stats
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);

  useEffect(() => { 
    localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(habits)); 
  }, [habits]);

  const navigateDate = (dir: 'prev' | 'next') => {
      setCurrentDate(prev => {
          const newDate = new Date(prev);
          if (view === 'week' || view === 'list') {
            newDate.setDate(newDate.getDate() + (dir === 'prev' ? -7 : 7));
          } else if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + (dir === 'prev' ? -1 : 1));
          } else if (view === 'year') {
            newDate.setFullYear(newDate.getFullYear() + (dir === 'prev' ? -1 : 1));
          }
          return newDate;
      });
  };

  const handleTitleClick = () => {
      if (view === 'week' || view === 'list') {
        setView('month');
      } else if (view === 'month') {
        setView('year');
      } else if (view === 'year') {
        setView('week');
      }
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('week');
  };
  
  const handleMonthClick = (monthIndex: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), monthIndex, 1));
      setView('month');
  };

  const handleOpenModal = (habit: Habit | null) => { 
    setHabitToEdit(habit); 
    if (habit) {
        setTotalCompletions(calculateTotalCompletions(habit));
        setHighestStreak(calculateStreak(habit));
    } else {
        setTotalCompletions(0);
        setHighestStreak(0);
    }
    setIsModalOpen(true); 
  };
  
  const handleSaveHabit = (habitData: HabitData) => {
    setHabits(prev => {
      if (habitData.id) {
        return prev.map(h => h.id === habitData.id ? { ...h, ...habitData, completed: h.completed } : h);
      } else {
        const newHabit: Habit = { ...habitData, id: Date.now(), completed: {} };
        return [...prev, newHabit];
      }
    });
    setIsModalOpen(false);
  };

  const handleDeleteHabit = (habitId: number) => { 
    setHabits(p => p.filter(h => h.id !== habitId)); 
    setIsModalOpen(false); 
  };

  const toggleHabitCompletion = (habitId: number, dateString: string) => {
    setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const completed = { ...h.completed };
          const current = completed[dateString];
          completed[dateString] = current === null || current === undefined ? true : (current === true ? false : null);
          return { ...h, completed };
        }
        return h;
      })
    );
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));

  // Calculate counts to pass to the modal
  const habitMuscleCount = habits.filter(h => h.type === 'Anchor Habit').length;
  const lifeGoalsCount = habits.filter(h => h.type === 'Life Goal Habit').length;

  const getHeaderText = () => {
      if (view === 'year') return currentDate.getFullYear().toString();
      if (view === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return currentDate.toLocaleDateString('en-US', { month: '2-digit' }) + ' / ' + currentDate.getFullYear();
  };

  const renderCurrentView = () => {
    switch(view) {
        case 'month': 
            return <MonthView currentDate={currentDate} onDateClick={handleDateClick} />;
        case 'year': 
            return <YearView currentDate={currentDate} onMonthClick={handleMonthClick} />;
        case 'list': 
            return (
                <div className="divide-y divide-gray-700">
                    {habits.map(habit => {
                        const rowBgClass = {
                            'Anchor Habit': 'bg-blue-900/20',
                            'Life Goal Habit': 'bg-red-900/20',
                            'Habit': 'bg-transparent'
                        }[habit.type];

                        return (
                            <div key={habit.id} className={`${rowBgClass} px-3 py-2 rounded-lg`}>
                                <SimpleHabitRow 
                                    habit={habit} 
                                    onToggleCompletion={toggleHabitCompletion} 
                                    onEdit={handleOpenModal}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        case 'week':
        default:
            return (
                <div>
                    <WeekHeader weekDates={weekDates} />
                    <hr className="border-t border-gray-700 mt-3 mb-2" />
                    <div className="space-y-2">
                      {habits.map(habit => {
                          const rowBgClass = {
                              'Anchor Habit': 'bg-blue-900/20',
                              'Life Goal Habit': 'bg-red-900/20',
                              'Habit': 'bg-transparent'
                          }[habit.type];

                          return (
                            <div key={habit.id} className={`p-3 rounded-lg ${rowBgClass}`}>
                                <HabitRow
                                    habit={habit}
                                    weekDates={weekDates}
                                    onToggleCompletion={toggleHabitCompletion}
                                    onEdit={handleOpenModal}
                                    streak={calculateStreak(habit)}
                                />
                            </div>
                          );
                      })}
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="bg-black min-h-screen text-white p-4 font-sans flex justify-center items-start pt-6">
      <div className="w-full max-w-sm mx-auto">
        <header className="flex justify-end items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            <button onClick={() => setView(v => v === 'week' ? 'list' : 'week')} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
              <List size={22} />
            </button>
            <button onClick={() => handleOpenModal(null)} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
              <Plus size={22} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
              <MoreHorizontal size={22} />
            </button>
          </div>
        </header>
        
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">Mastery Dashboard</h1>
          <p className="text-gray-400 text-base mt-2">Track your habits and build a better you, one day at a time.</p>
        </div>

        <div className="px-2">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => navigateDate('prev')} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronLeft size={24}/>
              </button>
              <button onClick={handleTitleClick} className="font-semibold text-base hover:bg-gray-800 px-3 py-1 rounded-md transition-colors">
                {getHeaderText()}
              </button>
              <button onClick={() => navigateDate('next')} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronRight size={24}/>
              </button>
            </div>
            
            {renderCurrentView()}
        </div>
      </div>
      
      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveHabit={handleSaveHabit} 
        onDeleteHabit={handleDeleteHabit}
        habitToEdit={habitToEdit}
        habitMuscleCount={habitMuscleCount}
        lifeGoalsCount={lifeGoalsCount}
        totalCompletions={totalCompletions}
        highestStreak={highestStreak}
      />
      <StatsModal isOpen={false} onClose={() => {}} />
      <SettingsModal isOpen={false} onClose={() => {}} />
    </div>
  );
}

export default App;