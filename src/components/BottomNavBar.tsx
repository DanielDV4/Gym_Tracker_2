import React from 'react';
import { Home, Dumbbell, Code2 } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-md border-t border-[#2C2C2E] px-6 py-2.5 flex items-center justify-around z-40">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center space-y-1 transition-all ${
          activeTab === 'home' ? 'text-[#00E676] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-extrabold tracking-tight">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('workout')}
        className={`flex flex-col items-center space-y-1 transition-all ${
          activeTab === 'workout' ? 'text-[#00E676] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Dumbbell className="w-5 h-5" />
        <span className="text-[10px] font-extrabold tracking-tight">Workout</span>
      </button>

      <button
        onClick={() => setActiveTab('code')}
        className={`flex flex-col items-center space-y-1 transition-all ${
          activeTab === 'code' ? 'text-[#00E676] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Code2 className="w-5 h-5" />
        <span className="text-[10px] font-extrabold tracking-tight">Dart Code</span>
      </button>
    </nav>
  );
};
