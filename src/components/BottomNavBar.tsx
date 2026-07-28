import React from 'react';
import { Home, Dumbbell, Code2 } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E] border-t border-[#2C2C2E] px-6 py-2 flex items-center justify-around z-40">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'home' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('workout')}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'workout' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Dumbbell className="w-5 h-5" />
        <span className="text-[10px] font-bold">Workout</span>
      </button>

      <button
        onClick={() => setActiveTab('code')}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'code' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Code2 className="w-5 h-5" />
        <span className="text-[10px] font-bold">Dart Code</span>
      </button>
    </nav>
  );
};
