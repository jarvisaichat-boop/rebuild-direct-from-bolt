import React from 'react';
import { X } from 'lucide-react';

export const StatsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70" onClick={onClose}>
      <div className="relative w-full max-w-lg p-6 bg-[#2C2C2E] rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Statistics</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400">Advanced statistics are coming soon!</p>
      </div>
    </div>
  );
};