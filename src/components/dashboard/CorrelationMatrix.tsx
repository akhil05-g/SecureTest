'use client';

import React from 'react';
import { Candidate, IntegrityEvent } from '@/src/types';
import { Activity, TrendingUp, Zap, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface CorrelationMatrixProps {
  candidate: Candidate;
  events: IntegrityEvent[];
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  candidate,
  events,
}) => {
  // Compute correlation statement
  const totalEvents = events.length;
  const highRiskEvents = events.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL');
  const autoFlagged = candidate.riskScore >= 70;

  const generateExplainabilityStatement = () => {
    if (totalEvents === 0) {
      return `Candidate ${candidate.name} maintains a normal integrity status with 0 recorded violations. All telemetry signals remain within expected baseline parameters.`;
    }

    if (autoFlagged) {
      return `Candidate ${candidate.name} reached ${candidate.riskScore}% cumulative risk due to ${totalEvents} recorded incident(s), including ${highRiskEvents.length} high-severity telemetry signals. Correlated cluster rules applied exponential multipliers for multi-signal temporal proximity.`;
    }

    return `Candidate ${candidate.name} holds a moderate risk score of ${candidate.riskScore}% based on ${totalEvents} telemetry incident(s). Signals are currently under review by compliance algorithms.`;
  };

  // Generate SVG Chart Points from events
  const chartPoints = events.map((evt, idx) => {
    // Map time string or index to x coordinate (5% to 95%)
    const x = events.length === 1 ? 50 : 5 + (idx / (events.length - 1)) * 90;
    // Map risk score to y coordinate (90% at 0 score, 10% at 100 score)
    const y = 90 - (evt.postRiskScore / 100) * 80;
    return { x, y, evt };
  });

  // Construct SVG Path String
  let polylinePoints = '5,90 ';
  chartPoints.forEach((pt) => {
    polylinePoints += `${pt.x},${pt.y} `;
  });

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Multi-Signal Temporal Correlation Matrix
            </h3>
            <p className="text-[10px] text-slate-400">
              Compound risk score progression & exponential correlation telemetry
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
          <Zap className="h-3.5 w-3.5 text-cyan-400" /> 1.8x Cluster Multiplier Active
        </span>
      </div>

      {/* Compound Risk Multiplier Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Isolated Tab Switch</span>
          <div className="text-sm font-bold text-slate-200">+10 base pts</div>
          <span className="text-[10px] text-slate-500">Harmless in isolation</span>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Isolated Gaze Drift</span>
          <div className="text-sm font-bold text-slate-200">+8 base pts</div>
          <span className="text-[10px] text-slate-500">Low temporal impact</span>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase">Correlated Burst (20s)</span>
          <div className="text-sm font-bold text-amber-300">+45 pts (+1.8x)</div>
          <span className="text-[10px] text-amber-400/80">Tab + Gaze + Audio cluster</span>
        </div>

        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 space-y-1">
          <span className="text-[10px] text-rose-400 uppercase">Critical Vector (DevTools)</span>
          <div className="text-sm font-bold text-rose-300">+50 pts (Immediate)</div>
          <span className="text-[10px] text-rose-400/80">Auto-flag escalation</span>
        </div>
      </div>

      {/* Interactive SVG Temporal Risk Progression Chart */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-cyan-400" /> Temporal Risk Trajectory (0:00 - 60:00)
          </span>
          <span className="text-[10px] text-rose-400 font-normal">-- Auto-Flag Threshold (70 pts)</span>
        </div>

        <div className="relative h-44 w-full rounded-lg border border-slate-800 bg-slate-900/80 p-3">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="90" x2="100" y2="90" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="58" x2="100" y2="58" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Red Dashed Auto-Flag Threshold line (Score 70 -> y = 34) */}
            <line x1="0" y1="34" x2="100" y2="34" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,3" />

            {/* Risk Polyline */}
            {events.length > 0 && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                points={polylinePoints}
                className="transition-all duration-500"
              />
            )}

            {/* Event Markers */}
            {chartPoints.map((pt, idx) => {
              const score = pt.evt.postRiskScore;
              let circleColor = '#10b981'; // emerald
              if (score >= 70) circleColor = '#f43f5e'; // rose
              else if (score >= 40) circleColor = '#f59e0b'; // amber

              return (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill={circleColor}
                    stroke="#0f172a"
                    strokeWidth="1"
                    className="transition-all hover:r-5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 6}
                    fill="#94a3b8"
                    fontSize="4"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {score}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Chart X-Axis Labels */}
          <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800 mt-1">
            <span>00:00 (Start)</span>
            <span>15:00</span>
            <span>30:00 (Mid)</span>
            <span>45:00</span>
            <span>60:00 (End)</span>
          </div>
        </div>
      </div>

      {/* Explainability & Audit Statement Box */}
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3.5 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-[11px]">
          <ShieldCheck className="h-4 w-4 text-cyan-400" /> Explainability & Audit Statement
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {generateExplainabilityStatement()}
        </p>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
