"use client";

import React, { useState } from "react";
import { useAssessment } from "@/src/context/AssessmentContext";
import { EventType, getEventTypeLabel } from "@/src/types";
import {
  Settings,
  Shield,
  Sliders,
  Save,
  RotateCcw,
  AlertTriangle,
  Users,
  Smartphone,
  Eye,
  Terminal,
  Volume2,
  Monitor,
  Maximize,
  CheckCircle2,
  Zap,
} from "lucide-react";

const eventTypeList: { type: EventType; icon: React.ElementType }[] = [
  { type: "PHONE_DETECTED", icon: Smartphone },
  { type: "MULTI_FACE", icon: Users },
  { type: "DEVTOOLS_TRAP", icon: Terminal },
  { type: "MULTI_SCREEN", icon: Monitor },
  { type: "FACE_ABSENT", icon: Eye },
  { type: "AUDIO_VOICE", icon: Volume2 },
  { type: "FULLSCREEN_EXIT", icon: Maximize },
  { type: "TAB_BLUR", icon: Sliders },
  { type: "GAZE_DEV", icon: Eye },
];

export default function PolicySettings() {
  const { policy, updatePolicy, candidates } = useAssessment();

  const [autoFlagThreshold, setAutoFlagThreshold] = useState<number>(policy.autoFlagThreshold);
  const [suspiciousThreshold, setSuspiciousThreshold] = useState<number>(policy.suspiciousThreshold);
  const [multiSignalBonusMultiplier, setMultiSignalBonusMultiplier] = useState<number>(
    policy.multiSignalBonusMultiplier
  );
  const [requireHumanReview, setRequireHumanReview] = useState<boolean>(policy.requireHumanReview);
  const [eventWeights, setEventWeights] = useState<Record<EventType, number>>({ ...policy.eventWeights });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleWeightChange = (type: EventType, val: number) => {
    setEventWeights((prev) => ({ ...prev, [type]: val }));
  };

  const handleSave = () => {
    updatePolicy({
      autoFlagThreshold,
      suspiciousThreshold,
      multiSignalBonusMultiplier,
      requireHumanReview,
      eventWeights,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setAutoFlagThreshold(70);
    setSuspiciousThreshold(40);
    setMultiSignalBonusMultiplier(1.5);
    setRequireHumanReview(true);
    setEventWeights({
      PHONE_DETECTED: 25,
      MULTI_FACE: 20,
      DEVTOOLS_TRAP: 25,
      MULTI_SCREEN: 15,
      FACE_ABSENT: 12,
      AUDIO_VOICE: 15,
      FULLSCREEN_EXIT: 10,
      TAB_BLUR: 8,
      GAZE_DEV: 5,
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Policy & Algorithm Threshold Settings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated risk threshold limits, anomaly weights & multi-signal multiplier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Save className="h-4 w-4" /> Save & Recalculate
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs font-mono text-emerald-400 flex items-center gap-2 glow-emerald">
          <CheckCircle2 className="h-4 w-4" />
          Policy updated successfully! Recalculated statuses for {candidates.length} candidates.
        </div>
      )}

      {/* Threshold Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Threshold Sliders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            Risk Classification Thresholds
          </h2>

          {/* Auto Flag Threshold Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Auto-Flag Threshold</span>
              <span className="text-rose-400 font-bold">{autoFlagThreshold}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              value={autoFlagThreshold}
              onChange={(e) => setAutoFlagThreshold(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Candidates reaching or exceeding this score are automatically flagged for review.
            </p>
          </div>

          {/* Suspicious Threshold Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Suspicious Warning Threshold</span>
              <span className="text-amber-400 font-bold">{suspiciousThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={suspiciousThreshold}
              onChange={(e) => setSuspiciousThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Candidates reaching this threshold are marked as suspicious for proactive monitoring.
            </p>
          </div>
        </div>

        {/* Multi-Signal & Human Review */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Advanced Algorithm Rules
          </h2>

          {/* Multi-Signal Bonus Multiplier Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Multi-Signal Bonus Multiplier</span>
              <span className="text-cyan-400 font-bold">{multiSignalBonusMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={multiSignalBonusMultiplier}
              onChange={(e) => setMultiSignalBonusMultiplier(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Applies a risk score multiplier when multiple distinct anomaly types are detected concurrently.
            </p>
          </div>

          {/* Require Human Review Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                Mandatory Human Review
              </span>
              <p className="text-[11px] text-slate-400">
                Requires HR manual confirmation before finalizing automated disqualifications.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requireHumanReview}
              onChange={(e) => setRequireHumanReview(e.target.checked)}
              className="h-5 w-5 accent-cyan-400 cursor-pointer rounded"
            />
          </div>
        </div>
      </div>

      {/* Event Weights Configuration Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          Individual Anomaly Weight Allocations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {eventTypeList.map((item) => {
            const Icon = item.icon;
            const currentWeight = eventWeights[item.type] || 10;
            return (
              <div
                key={item.type}
                className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {getEventTypeLabel(item.type)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{currentWeight} pts</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="50"
                  value={currentWeight}
                  onChange={(e) => handleWeightChange(item.type, Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
