'use client';

import React from 'react';
import { Candidate, IntegrityEvent } from '@/src/types';
import { EvidenceCanvas } from '@/src/components/dashboard/EvidenceCanvas';
import { generateEvidenceDetails } from '@/src/utils/evidenceGenerator';
import { ShieldCheck, AlertCircle, FileText, Cpu, Clock, Activity, Zap } from 'lucide-react';

export interface EvidenceInspectorProps {
  candidate: Candidate;
  activeEvent: IntegrityEvent | null;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  candidate,
  activeEvent,
}) => {
  if (!activeEvent) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-mono text-slate-500">
        Select an incident from the timeline to inspect multi-modal forensic evidence.
      </div>
    );
  }

  const generatedDetails = generateEvidenceDetails(
    activeEvent.eventType,
    candidate.id,
    activeEvent.timestamp,
    activeEvent.confidence
  );

  const scoreDelta = activeEvent.postRiskScore - activeEvent.preRiskScore;
  const isThresholdCrossed = activeEvent.postRiskScore >= 70;

  return (
    <div className="space-y-4">
      {/* 2-Column Forensic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Snapshot & Visual Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200 uppercase">
              <Cpu className="h-4 w-4 text-cyan-400" /> Multi-Modal Forensic Canvas
            </span>
            <span className="text-[10px] text-cyan-400">AI Proctoring Engine Verified</span>
          </div>

          <EvidenceCanvas evidence={generatedDetails} />
        </div>

        {/* Right Column: Signal & Correlation Telemetry */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
            <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" /> Detector vs Policy Breakdown
            </span>
            <span className="text-[10px] text-amber-400">Signal Integrity: High</span>
          </div>

          {/* Detector & Policy Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">Detection Confidence</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-cyan-400">{activeEvent.confidence}%</span>
                <span className="text-[10px] text-slate-500">AI Model</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">Base Policy Weight</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-rose-400">+{scoreDelta}</span>
                <span className="text-[10px] text-slate-500">pts</span>
              </div>
            </div>
          </div>

          {/* Temporal Correlation Multiplier */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Temporal Correlation Multiplier
              </span>
              <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                1.5x Multiplier
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-300">
              Correlated with Window Tab Switch within 15 seconds. Exponential risk weight applied.
            </p>
          </div>

          {/* Pre-Event vs Post-Event Risk Score Delta Bar */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pre vs Post Risk Score:</span>
              <span className="font-bold text-slate-200">
                {activeEvent.preRiskScore}% → {activeEvent.postRiskScore}%
              </span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-slate-700"
                style={{ width: `${activeEvent.preRiskScore}%` }}
              />
              <div
                className={`absolute top-0 h-full transition-all ${
                  isThresholdCrossed ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-amber-500'
                }`}
                style={{
                  left: `${activeEvent.preRiskScore}%`,
                  width: `${scoreDelta}%`,
                }}
              />
            </div>
            {isThresholdCrossed && (
              <div className="text-[10px] font-bold text-rose-400 text-right uppercase">
                [AUTO-FLAG THRESHOLD CROSSED]
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceInspector;
