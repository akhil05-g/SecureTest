'use client';

import React from 'react';
import { CandidateStatus } from '../../types';

export interface StatusBadgeProps {
  status: CandidateStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  CandidateStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    dotBg: string;
    glow: string;
  }
> = {
  NORMAL: {
    label: 'NORMAL',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dotBg: 'bg-emerald-400',
    glow: 'glow-emerald',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dotBg: 'bg-amber-400',
    glow: 'glow-amber',
  },
  HIGH_RISK: {
    label: 'HIGH RISK',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    dotBg: 'bg-orange-400',
    glow: 'glow-amber',
  },
  AUTO_FLAGGED: {
    label: 'AUTO FLAGGED',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    dotBg: 'bg-rose-500',
    glow: 'glow-rose',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const cfg = statusConfig[status] || statusConfig.NORMAL;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : 'px-3 py-1 text-xs gap-2';

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border backdrop-blur-sm ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.glow} ${sizeClasses}`}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${cfg.dotBg} opacity-75 animate-ping`}
        />
        <span className={`relative inline-flex rounded-full ${cfg.dotBg} ${dotSize}`} />
      </span>
      <span>{cfg.label}</span>
    </span>
  );
};

export default StatusBadge;
