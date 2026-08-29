'use client';

import React from 'react';
import { Severity } from '../../types';

export interface SeverityPillProps {
  severity: Severity;
}

const severityConfig: Record<
  Severity,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  LOW: {
    label: 'LOW',
    bg: 'bg-slate-800/80',
    border: 'border-slate-700',
    text: 'text-slate-300',
  },
  MEDIUM: {
    label: 'MEDIUM',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  HIGH: {
    label: 'HIGH',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  CRITICAL: {
    label: 'CRITICAL',
    bg: 'bg-rose-600/15',
    border: 'border-rose-600/40',
    text: 'text-rose-400 font-semibold',
  },
};

export const SeverityPill: React.FC<SeverityPillProps> = ({ severity }) => {
  const cfg = severityConfig[severity] || severityConfig.LOW;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase border backdrop-blur-sm ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

export default SeverityPill;
