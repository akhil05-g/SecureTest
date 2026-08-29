'use client';

import React from 'react';
import { Command, ArrowLeftRight, Check, X, AlertTriangle, CornerDownLeft } from 'lucide-react';

export interface QuickReviewBarProps {
  toastMessage?: string | null;
  onConfirmFlag: () => void;
  onDismissFlag: () => void;
  onEscalate: () => void;
}

export const QuickReviewBar: React.FC<QuickReviewBarProps> = ({
  toastMessage,
  onConfirmFlag,
  onDismissFlag,
  onEscalate,
}) => {
  return (
    <div className="relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Floating Dock Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md text-xs font-mono text-slate-300 shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Command className="w-4 h-4" />
          <span>PRO HOTKEYS</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-slate-200 font-bold">← / →</kbd>
            <span>Navigate Nodes</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-rose-950 border border-rose-700 px-1.5 py-0.5 text-rose-300 font-bold">C</kbd>
            <button onClick={onConfirmFlag} className="hover:text-rose-400 transition-colors">
              Confirm Flag
            </button>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-emerald-950 border border-emerald-700 px-1.5 py-0.5 text-emerald-300 font-bold">D</kbd>
            <button onClick={onDismissFlag} className="hover:text-emerald-400 transition-colors">
              Dismiss
            </button>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-amber-950 border border-amber-700 px-1.5 py-0.5 text-amber-300 font-bold">E</kbd>
            <button onClick={onEscalate} className="hover:text-amber-400 transition-colors">
              Escalate
            </button>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-slate-200 font-bold">Esc</kbd>
            <span>Close Modal</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickReviewBar;
