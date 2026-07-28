import React from 'react';
import { BannerType } from '../types';
import { TrendingUp, AlertTriangle, Info, X } from 'lucide-react';

interface StickyBannerProps {
  message: string;
  type: BannerType;
  onDismiss?: () => void;
}

export const StickyBanner: React.FC<StickyBannerProps> = ({ message, type, onDismiss }) => {
  let bgColor = 'bg-blue-500/15 border-blue-500/40 text-blue-400';
  let Icon = Info;

  if (type === BannerType.SUCCESS) {
    bgColor = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    Icon = TrendingUp;
  } else if (type === BannerType.ERROR) {
    bgColor = 'bg-rose-500/15 border-rose-500/40 text-rose-400';
    Icon = AlertTriangle;
  }

  return (
    <div
      className={`w-full px-3.5 py-2.5 rounded-b-xl border-t flex items-start space-x-2.5 text-xs font-semibold ${bgColor} transition-all duration-200 animate-fadeIn`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
