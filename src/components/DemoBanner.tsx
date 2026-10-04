import React from 'react';
import { AlertTriangle, LogOut, Sparkles } from 'lucide-react';

interface DemoBannerProps {
  onExitDemo: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onExitDemo }) => {
  return (
    <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between border-b border-purple-500/50">
      <div className="flex items-center gap-2 max-w-2xl">
        <span className="p-1 rounded-md bg-white/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </span>
        <span>
          <b className="uppercase tracking-wider text-amber-300">Demo Mode Active:</b> You are exploring with a sample student profile. Actions do not affect real peer listings.
        </span>
      </div>

      <button
        onClick={onExitDemo}
        className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-purple-900 transition-colors flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
      >
        <LogOut className="w-3 h-3" />
        <span>Exit Demo</span>
      </button>
    </div>
  );
};
