import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Habit, HabitData, Category } from '../types';
import { getColorClass } from '../utils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habitData: HabitData) => void;
  onDeleteHabit: (habitId: number) => void;
  habitToEdit?: Habit | null;
  habitMuscleCount?: number;
  lifeGoalsCount?: number;
  totalCompletions?: number; // New prop
  highestStreak?: number;    // New prop
}

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habitData: HabitData) => void;
  onDeleteHabit: (habitId: number) => void;
  habitToEdit?: Habit | null;
  habitMuscleCount?: number;
  lifeGoalsCount?: number;
}

const LOCAL_STORAGE_CATEGORIES_KEY = 'mastery-dashboard-categories-final';

const initialPresetCategories: Record<string, string[]> = {
    'Physical': ['Exercise', 'Nutrition', 'Sleep', 'Hygiene'],
    'Mental': ['Learning', 'Mindfulness', 'Journaling', 'Reading'],
    'Emotional': ['Stress Management', 'Gratitude', 'Self-Compassion'],
    'Social': ['Relationships', 'Community', 'Networking'],
    'Career': ['Productivity', 'Skill Development', 'Professional Growth'],
    'Personal Growth': ['Hobbies', 'Creative Projects', 'New Skills'],
    'Financial': ['Budgeting', 'Saving', 'Investing'],
    'Home & Environment': ['Organization', 'Cleaning', 'Decluttering'],
    'Project': ['Side Projects', 'Creative Work', 'Business Ventures'],
    'Life': ['Life Planning', 'Goal Setting', 'Life Review']
};

const loadCategoriesFromLocalStorage = (): Record<string, string[]> => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null) return parsed;
        }
    } catch (error) { console.error('Error loading categories:', error); }
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(initialPresetCategories));
    return initialPresetCategories;
};

const saveCategoriesToLocalStorage = (categoriesMap: Record<string, string[]>) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categoriesMap));
    } catch (error) { console.error('Error saving categories:', error); }
};

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ 
    isOpen, 
    onClose, 
    onSaveHabit, 
    onDeleteHabit, 
    habitToEdit, 
    habitMuscleCount = 0, 
    lifeGoalsCount = 0,
    totalCompletions,
    highestStreak
}) => {
    const [habitName, setHabitName] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('green');
    const [habitType, setHabitType] = useState('Habit');
    const [frequencyType, setFrequencyType] = useState('Anytime');
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [timesPerPeriod, setTimesPerPeriod] = useState(1);
    const [periodUnit, setPeriodUnit] = useState('Week');
    const [repeatDays, setRepeatDays] = useState(1);
    
    const [showCategorySelection, setShowCategorySelection] = useState(false);
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
    const [customMainCategoryInput, setCustomMainCategoryInput] = useState('');
    const [customSubCategoryInput, setCustomSubCategoryInput] = useState('');
    
    const [allCategoriesMap, setAllCategoriesMap] = useState(loadCategoriesFromLocalStorage);

    const resetForm = useCallback(() => {
        setHabitName(''); setHabitDescription(''); setSelectedColor('green');
        setHabitType('Habit'); setSelectedCategories([]); setFrequencyType('Anytime');
        setSelectedDays([]); setTimesPerPeriod(1); setPeriodUnit('Week'); setRepeatDays(1);
        setShowCategorySelection(false); setSelectedMainCategory(null);
        setCustomMainCategoryInput(''); setCustomSubCategoryInput('');
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (habitToEdit) {
                setHabitName(habitToEdit.name);
                setHabitDescription(habitToEdit.description);
                setSelectedColor(habitToEdit.color);
                setHabitType(habitToEdit.type);
                setSelectedCategories(habitToEdit.categories || []);
                setFrequencyType(habitToEdit.frequencyType);
                setSelectedDays(habitToEdit.selectedDays || []);
                setTimesPerPeriod(habitToEdit.timesPerPeriod);
                setPeriodUnit(habitToEdit.periodUnit);
                setRepeatDays(habitToEdit.repeatDays);
            } else {
                resetForm();
            }
        }
    }, [isOpen, habitToEdit, resetForm]);

    const handleAddCustomMainCategory = () => {
        const trimmedInput = customMainCategoryInput.trim();
        if (trimmedInput && !allCategoriesMap[trimmedInput]) {
            const newMap = { ...allCategoriesMap, [trimmedInput]: [] };
            setAllCategoriesMap(newMap);
            saveCategoriesToLocalStorage(newMap);
            setCustomMainCategoryInput('');
        }
    };

    const handleAddCustomSubCategory = () => {
        const trimmedInput = customSubCategoryInput.trim();
        if (trimmedInput && selectedMainCategory && !allCategoriesMap[selectedMainCategory]?.includes(trimmedInput)) {
            const newMap = { 
                ...allCategoriesMap, 
                [selectedMainCategory]: [...(allCategoriesMap[selectedMainCategory] || []), trimmedInput] 
            };
            setAllCategoriesMap(newMap);
            saveCategoriesToLocalStorage(newMap);
            setCustomSubCategoryInput('');
        }
    };

    const toggleHabitCategory = (main: string, sub: string) => {
        setSelectedCategories(prev => {
            const exists = prev.some(cat => cat.main === main && cat.sub === sub);
            return exists 
                ? prev.filter(cat => !(cat.main === main && cat.sub === sub)) 
                : [...prev, { main, sub }];
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!habitName.trim()) return;
        
        onSaveHabit({
            id: habitToEdit?.id,
            name: habitName.trim(),
            description: habitDescription.trim(),
            color: selectedColor,
            type: habitType,
            categories: selectedCategories,
            frequencyType,
            selectedDays,
            timesPerPeriod,
            periodUnit,
            repeatDays,
        });
        onClose();
    };

    const handleDelete = () => {
        if (habitToEdit && onDeleteHabit) {
            onDeleteHabit(habitToEdit.id);
            onClose();
        }
    };

    if (!isOpen) return null;
    
    const colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'];
    const habitTypes = [
        { value: 'Habit', label: 'Habit', description: 'Regular habit for personal growth', color: 'green' },
        { value: 'Anchor Habit', label: 'Habit Muscle 💪', description: 'Simple habit to build your habit muscle (only 1 allowed)', color: 'blue' },
        { value: 'Life Goal Habit', label: 'Life Goals ⭐', description: 'Top priority habit for major life improvement (only 3 allowed)', color: 'red' }
    ];

    const frequencyOptions = ['Anytime', 'Everyday', 'Specific Days', 'X times per period', 'Every X days'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70" onClick={onClose}>
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 bg-[#2C2C2E] rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">{habitToEdit ? 'Edit Habit' : 'Create New Habit'}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stats Section */}
                    {habitToEdit && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center bg-[#1C1C1E] p-3 rounded-lg">
                                <div className="text-2xl font-bold text-white">{totalCompletions ?? 0}</div>
                                <div className="text-xs text-gray-400">Total Completions</div>
                            </div>
                            <div className="text-center bg-[#1C1C1E] p-3 rounded-lg">
                                <div className="text-2xl font-bold text-white">{highestStreak ?? 0}</div>
                                <div className="text-xs text-gray-400">Highest Streak</div>
                            </div>
                        </div>
                    )}

                    {/* Habit Name */}
                    <div>
                        <label htmlFor="habitName" className="block text-sm font-medium text-gray-300 mb-2">
                            Habit Name *
                        </label>
                        <input 
                            id="habitName" 
                            type="text" 
                            value={habitName} 
                            onChange={(e) => setHabitName(e.target.value)} 
                            className="w-full p-3 bg-[#1C1C1E] border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none" 
                            autoFocus 
                        />
                    </div>
                    
                    {/* Description */}
                    <div>
                        <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea 
                            id="habitDescription" 
                            value={habitDescription} 
                            onChange={(e) => setHabitDescription(e.target.value)} 
                            rows={3} 
                            className="w-full p-3 bg-[#1C1C1E] border border-gray-600 rounded-lg text-white resize-none focus:border-green-500 focus:outline-none" 
                        />
                    </div>
                    
                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Habit Color</label>
                        <div className="flex space-x-3">
                            {colorOptions.map((color) => (
                                <button 
                                    key={color} 
                                    type="button" 
                                    onClick={() => setSelectedColor(color)} 
                                    className={`w-8 h-8 rounded-full ${getColorClass(color)} border-2 transition-all ${
                                        selectedColor === color ? 'border-white' : 'border-transparent'
                                    }`}
                                >
                                    {selectedColor === color && <Check size={16} className="text-white mx-auto"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Habit Type with Smart Shrinking */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Habit Type</label>
                        <div className="space-y-3">
                            {habitTypes.map((typeOption) => {
                                const isSelected = habitType === typeOption.value;
                                const isMuscleLimit = habitMuscleCount >= 1 && typeOption.value === 'Anchor Habit';
                                const isGoalLimit = lifeGoalsCount >= 3 && typeOption.value === 'Life Goal Habit';
                                const isDisabled = (isMuscleLimit || isGoalLimit) && (!habitToEdit || habitToEdit.type !== typeOption.value);
                                const shouldShrink = isDisabled && !isSelected;
                                
                                return (
                                    <label 
                                        key={typeOption.value} 
                                        className={`flex items-start space-x-4 cursor-pointer rounded-lg border-2 transition-all ${
                                            isSelected ? `border-${typeOption.color}-500` : 'border-gray-700'
                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                                            shouldShrink ? 'py-2 px-4' : 'p-4'
                                        } bg-${typeOption.color}-900/20`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="habitType" 
                                            value={typeOption.value} 
                                            checked={isSelected} 
                                            onChange={(e) => setHabitType(e.target.value)} 
                                            disabled={isDisabled} 
                                            className="mt-1 w-4 h-4 text-green-500 bg-transparent border-gray-600 focus:ring-green-500 flex-shrink-0" 
                                        />
                                        <div>
                                            <div className="text-white font-semibold">{typeOption.label}</div>
                                            {!shouldShrink && (
                                                <div className="text-sm text-gray-400 mt-1">{typeOption.description}</div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Categories</label>
                        <div className="space-y-3">
                            {/* Selected Categories Display */}
                            {selectedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map((category, index) => (
                                        <span 
                                            key={index} 
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                                        >
                                            {category.main} → {category.sub}
                                            <button 
                                                type="button" 
                                                onClick={() => toggleHabitCategory(category.main, category.sub)} 
                                                className="text-blue-200 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Add Category Button */}
                            <button 
                                type="button" 
                                onClick={() => setShowCategorySelection(!showCategorySelection)} 
                                className="w-full p-3 bg-[#1C1C1E] border border-gray-600 rounded-lg text-left text-gray-400 hover:text-white flex items-center justify-between"
                            >
                                Add Category
                                {showCategorySelection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            
                            {/* Category Selection Panel */}
                            {showCategorySelection && (
                                <div className="p-4 bg-[#1C1C1E] rounded-lg border border-gray-600">
                                    {!selectedMainCategory ? (
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-400 mb-3">Select a main category:</div>
                                            {Object.keys(allCategoriesMap).map(mainCat => (
                                                <button 
                                                    key={mainCat} 
                                                    type="button" 
                                                    onClick={() => setSelectedMainCategory(mainCat)} 
                                                    className="w-full text-left p-3 text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    {mainCat}
                                                </button>
                                            ))}
                                            
                                            {/* Add Custom Main Category */}
                                            <div className="border-t border-gray-600 pt-3 mt-3">
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={customMainCategoryInput} 
                                                        onChange={(e) => setCustomMainCategoryInput(e.target.value)} 
                                                        placeholder="Create new main category" 
                                                        className="flex-1 p-2 bg-[#2C2C2E] border border-gray-600 rounded text-white text-sm" 
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomMainCategory()}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={handleAddCustomMainCategory} 
                                                        className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-white font-medium">{selectedMainCategory}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedMainCategory(null)} 
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="text-sm text-gray-400 mb-3">Select a subcategory:</div>
                                            
                                            {allCategoriesMap[selectedMainCategory]?.map(subCat => {
                                                const isSelected = selectedCategories.some(cat => cat.main === selectedMainCategory && cat.sub === subCat);
                                                return (
                                                    <button 
                                                        key={subCat} 
                                                        type="button" 
                                                        onClick={() => toggleHabitCategory(selectedMainCategory, subCat)} 
                                                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                                                            isSelected ? 'bg-green-600 text-white' : 'text-white hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {subCat}
                                                        {isSelected && <Check size={16} />}
                                                    </button>
                                                );
                                            })}
                                            
                                            {/* Add Custom Sub Category */}
                                            <div className="border-t border-gray-600 pt-3 mt-3">
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={customSubCategoryInput} 
                                                        onChange={(e) => setCustomSubCategoryInput(e.target.value)} 
                                                        placeholder="Create new subcategory" 
                                                        className="flex-1 p-2 bg-[#2C2C2E] border border-gray-600 rounded text-white text-sm" 
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSubCategory()}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={handleAddCustomSubCategory} 
                                                        className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Frequency Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Frequency</label>
                        <select 
                            value={frequencyType} 
                            onChange={(e) => setFrequencyType(e.target.value)} 
                            className="w-full p-3 bg-[#1C1C1E] border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                        >
                            {frequencyOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        
                        {/* Frequency-specific options */}
                        {frequencyType === 'Specific Days' && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {daysOfWeek.map(day => (
                                    <button 
                                        key={day} 
                                        type="button" 
                                        onClick={() => setSelectedDays(prev => 
                                            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                        )} 
                                        className={`p-2 rounded text-sm transition-colors ${
                                            selectedDays.includes(day) 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {frequencyType === 'X times per period' && (
                            <div className="mt-3 flex gap-3">
                                <input 
                                    type="number" 
                                    value={timesPerPeriod} 
                                    onChange={(e) => setTimesPerPeriod(parseInt(e.target.value) || 1)} 
                                    min="1" 
                                    className="w-20 p-2 bg-[#1C1C1E] border border-gray-600 rounded text-white text-center" 
                                />
                                <span className="text-gray-400 self-center">times per</span>
                                <select 
                                    value={periodUnit} 
                                    onChange={(e) => setPeriodUnit(e.target.value)} 
                                    className="flex-1 p-2 bg-[#1C1C1E] border border-gray-600 rounded text-white"
                                >
                                    <option value="Week">Week</option>
                                    <option value="Month">Month</option>
                                </select>
                            </div>
                        )}
                        
                        {frequencyType === 'Every X days' && (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-gray-400">Every</span>
                                <input 
                                    type="number" 
                                    value={repeatDays} 
                                    onChange={(e) => setRepeatDays(parseInt(e.target.value) || 1)} 
                                    min="1" 
                                    className="w-20 p-2 bg-[#1C1C1E] border border-gray-600 rounded text-white text-center" 
                                />
                                <span className="text-gray-400">days</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        {habitToEdit && (
                            <button 
                                type="button" 
                                onClick={handleDelete} 
                                className="px-5 py-2 rounded-lg bg-red-800/50 text-red-300 hover:bg-red-800/70 font-semibold mr-auto flex items-center gap-2"
                            >
                                <Trash2 size={16}/> Delete
                            </button>
                        )}
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold disabled:bg-gray-500" 
                            disabled={!habitName.trim()}
                        >
                            {habitToEdit ? 'Save' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};