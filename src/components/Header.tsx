import React from 'react';
import { Zap, Code2, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-[#1C1C1E]/90 backdrop-blur-md border-b border-[#2C2C2E] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center shadow-sm shadow-[#00E676]/20">
          <Zap className="w-4 h-4 text-[#00E676]" />
        </div>
        <div>
          <h1 className="text-white font-extrabold text-base leading-tight tracking-tight">PO Tracker</h1>
          <span className="text-[10px] text-[#00E676] font-bold tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
            FLUTTER 3.27+ • DART ENGINE
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab(activeTab === 'code' ? 'workout' : 'code')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'code'
              ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/30'
              : 'bg-[#2C2C2E] text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dart Code</span>
        </button>

        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="p-1.5 rounded-md bg-[#2C2C2E] text-zinc-300 hover:text-white transition-colors"
          title={isMobileFrame ? 'Switch to Expanded View' : 'Switch to Mobile Frame'}
        >
          {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
