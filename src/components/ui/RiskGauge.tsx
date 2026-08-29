'use client';

import React from 'react';

export interface RiskGaugeProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeConfig = {
  sm: {
    dimension: 80,
    strokeWidth: 7,
    fontSize: 'text-lg',
    labelSize: 'text-[10px]',
  },
  md: {
    dimension: 120,
    strokeWidth: 9,
    fontSize: 'text-2xl',
    labelSize: 'text-xs',
  },
  lg: {
    dimension: 160,
    strokeWidth: 12,
    fontSize: 'text-4xl',
    labelSize: 'text-sm',
  },
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const cfg = sizeConfig[size] || sizeConfig.md;

  const radius = (cfg.dimension - cfg.strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let glowClass = 'shadow-emerald-500/20';
  let labelText = 'LOW RISK';

  if (normalizedScore >= 70) {
    colorClass = 'text-rose-500';
    glowClass = 'shadow-rose-500/40';
    labelText = 'HIGH RISK';
  } else if (normalizedScore >= 40) {
    colorClass = 'text-amber-500';
    glowClass = 'shadow-amber-500/30';
    labelText = 'MODERATE';
  }

  const isHighRisk = normalizedScore >= 70;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center rounded-full ${glowClass}`}>
        {/* Radar pulsing effect for High Risk */}
        {isHighRisk && (
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping duration-1000 pointer-events-none" />
        )}

        <svg
          width={cfg.dimension}
          height={cfg.dimension}
          className="transform -rotate-90"
        >
          {/* Background Arc */}
          <circle
            cx={cfg.dimension / 2}
            cy={cfg.dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={cfg.strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />

          {/* Value Arc */}
          <circle
            cx={cfg.dimension / 2}
            cy={cfg.dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={cfg.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold text-white ${cfg.fontSize}`}>
            {Math.round(normalizedScore)}
          </span>
          {showLabel && (
            <span className={`font-semibold tracking-wider uppercase ${colorClass} ${cfg.labelSize}`}>
              {labelText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
