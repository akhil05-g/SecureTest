'use client';

import React from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Clock,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export function IntegrityAnalytics() {
  const { candidates } = useAssessment();

  const total = candidates.length;

  // Histogram calculation
  const buckets = {
    '0-20': candidates.filter((c) => c.riskScore <= 20).length,
    '21-40': candidates.filter((c) => c.riskScore > 20 && c.riskScore <= 40).length,
    '41-60': candidates.filter((c) => c.riskScore > 40 && c.riskScore <= 60).length,
    '61-80': candidates.filter((c) => c.riskScore > 60 && c.riskScore <= 80).length,
    '81-100': candidates.filter((c) => c.riskScore > 80).length,
  };

  const maxBucketCount = Math.max(...Object.values(buckets), 1);

  const vectors = [
    { label: 'DevTools & Debugger Tampering', pct: 28, color: 'bg-rose-500' },
    { label: 'Prohibited Device / Phone Detected', pct: 24, color: 'bg-rose-500' },
    { label: 'Extended Display / Multi-Screen', pct: 18, color: 'bg-orange-500' },
    { label: 'Multiple Faces / Impersonation', pct: 15, color: 'bg-amber-500' },
    { label: 'Window / Tab Switch (Blur)', pct: 10, color: 'bg-amber-500' },
    { label: 'Secondary Audio / Voice Activity', pct: 5, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Integrity Threat Telemetry & Analytics Suite
          </h2>
          <p className="text-xs text-slate-400">
            Real-time attack vector profiling, workload reduction metrics & risk distribution analysis
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" /> AI Engine Active
        </span>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workload Efficiency KPI */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Review Workload Saved</span>
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">96.7%</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reduced <span className="text-slate-200 font-bold">500 hours</span> of raw video footage down to <span className="text-cyan-300 font-bold">16.5 hours</span> of targeted incident review.
          </p>
        </div>

        {/* Peak Threat Time Window */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Peak Threat Windows</span>
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">Min 15-25</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Secondary violation cluster detected during <span className="text-amber-300 font-bold">Minutes 40-50</span> (Complex Algorithmic Coding Challenge).
          </p>
        </div>

        {/* Multi-Signal Correlation Rate */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Correlated Attack Rate</span>
            <Zap className="h-5 w-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-300">18.4%</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-signal incidents (e.g. Tab switch paired with Phone detection within 15 seconds).
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Violation Vector Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Violation Vector Distribution
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {vectors.map((vec) => (
              <div key={vec.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">{vec.label}</span>
                  <span className="text-slate-400 font-bold">{vec.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${vec.color} transition-all duration-500`}
                    style={{ width: `${vec.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Distribution Histogram */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" /> Risk Score Distribution (Histogram)
          </h3>
          <div className="pt-6 pb-2 flex items-end justify-between gap-3 h-48 px-4 border-b border-slate-800">
            {Object.entries(buckets).map(([range, count]) => {
              const heightPct = Math.max(12, Math.round((count / maxBucketCount) * 100));
              const isHigh = range === '61-80' || range === '81-100';

              return (
                <div key={range} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 font-bold group-hover:text-cyan-400 transition-colors">
                    {count}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isHigh ? 'bg-rose-500/80 hover:bg-rose-400' : 'bg-cyan-500/80 hover:bg-cyan-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{range}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Score Bracket (0 - 100)</span>
            <span className="text-cyan-400">Total Sample: {total} Candidates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
