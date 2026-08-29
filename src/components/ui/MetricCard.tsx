'use client';

import React, { useEffect, useState } from 'react';

export interface MetricCardProps {
  title: string;
  count: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  statusColor: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  isSelected?: boolean;
  onClick?: () => void;
}

const colorMap = {
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    selectedBorder: 'border-emerald-500 glow-border-emerald ring-1 ring-emerald-500/50',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    selectedBorder: 'border-amber-500 glow-border-amber ring-1 ring-amber-500/50',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-500/60',
    selectedBorder: 'border-rose-500 glow-border-rose ring-1 ring-rose-500/50',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    glow: 'shadow-[0_0_20px_rgba(225,29,72,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(225,29,72,0.3)]',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    selectedBorder: 'border-cyan-500 glow-border-cyan ring-1 ring-cyan-500/50',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    selectedBorder: 'border-purple-500 ring-1 ring-purple-500/50',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  subtitle,
  icon,
  statusColor,
  isSelected = false,
  onClick,
}) => {
  const [displayCount, setDisplayCount] = useState<number | string>(
    typeof count === 'number' ? 0 : count
  );

  useEffect(() => {
    if (typeof count !== 'number') {
      setDisplayCount(count);
      return;
    }

    let start = 0;
    const end = count;
    const duration = 800; // ms
    const stepTime = 16; // ~60fps
    const totalSteps = Math.ceil(duration / stepTime);
    const increment = (end - start) / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setDisplayCount(end);
        clearInterval(timer);
      } else {
        start += increment;
        setDisplayCount(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [count]);

  const config = colorMap[statusColor] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300 p-5 bg-slate-900/60 ${
        onClick ? 'cursor-pointer select-none hover:-translate-y-0.5' : ''
      } ${
        isSelected
          ? `${config.selectedBorder} ${config.selectedGlow}`
          : `${config.border} ${config.glow}`
      }`}
    >
      {/* Background radial gradient accent */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${config.bg} blur-xl pointer-events-none`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {displayCount}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-700/50 ${config.bg} ${config.text}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
