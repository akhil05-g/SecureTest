"use client";

import React, { useState, useEffect } from "react";
import { useAssessment } from "@/context/AssessmentContext";
import {
  EventType,
  Severity,
  getEventTypeLabel,
  getSeverityBadgeColor,
  getStatusBadgeColor,
} from "@/types";
import {
  Zap,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Users,
  Eye,
  Terminal,
  Volume2,
  Monitor,
  Maximize,
  ShieldAlert,
  Activity,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const eventTypesList: { type: EventType; label: string; icon: React.ElementType; defaultSeverity: Severity }[] = [
  { type: "PHONE_DETECTED", label: "Mobile Phone Detected", icon: Smartphone, defaultSeverity: "CRITICAL" },
  { type: "MULTI_FACE", label: "Multiple Faces in Frame", icon: Users, defaultSeverity: "HIGH" },
  { type: "DEVTOOLS_TRAP", label: "DevTools Trap Tripped", icon: Terminal, defaultSeverity: "CRITICAL" },
  { type: "FACE_ABSENT", label: "Face Absent / Unrecognized", icon: Eye, defaultSeverity: "MEDIUM" },
  { type: "AUDIO_VOICE", label: "Secondary Voice Detected", icon: Volume2, defaultSeverity: "HIGH" },
  { type: "MULTI_SCREEN", label: "Multiple Monitors Detected", icon: Monitor, defaultSeverity: "MEDIUM" },
  { type: "GAZE_DEV", label: "Gaze Deviation", icon: Eye, defaultSeverity: "LOW" },
  { type: "FULLSCREEN_EXIT", label: "Exited Fullscreen Mode", icon: Maximize, defaultSeverity: "LOW" },
];

export default function LiveSimulationStudio() {
  const { candidates, selectedCandidate, selectCandidate, triggerViolation, liveEvents, policy } =
    useAssessment();

  const activeCandidate = selectedCandidate || candidates[0] || null;

  const [selectedEventType, setSelectedEventType] = useState<EventType>("PHONE_DETECTED");
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>("HIGH");
  const [confidence, setConfidence] = useState<number>(95);
  const [customDescription, setCustomDescription] = useState<string>("");

  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [autoSimLogs, setAutoSimLogs] = useState<string[]>([]);

  // Trigger manual violation
  const handleTriggerManual = (type?: EventType) => {
    if (!activeCandidate) return;

    const eventToFire = type || selectedEventType;
    const desc =
      customDescription.trim() ||
      `Simulated ${getEventTypeLabel(eventToFire)} injected via Live Simulation Studio.`;

    triggerViolation({
      candidateId: activeCandidate.id,
      eventType: eventToFire,
      severity: selectedSeverity,
      confidence,
      durationSec: Math.floor(Math.random() * 15) + 5,
      description: desc,
      evidenceSnapshotUrl:
        eventToFire === "PHONE_DETECTED"
          ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
          : eventToFire === "MULTI_FACE"
          ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
          : undefined,
    });
  };

  // Automated Attack Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoSimulating && activeCandidate) {
      interval = setInterval(() => {
        const randomType = eventTypesList[Math.floor(Math.random() * eventTypesList.length)];
        const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        const randomSev = severities[Math.floor(Math.random() * severities.length)];
        const randomConf = Math.floor(Math.random() * 20) + 80;

        triggerViolation({
          candidateId: activeCandidate.id,
          eventType: randomType.type,
          severity: randomSev,
          confidence: randomConf,
          durationSec: Math.floor(Math.random() * 10) + 3,
          description: `Auto-Sim sequence event: ${randomType.label} with ${randomConf}% confidence.`,
        });

        setAutoSimLogs((prev) =>
          [
            `[${new Date().toLocaleTimeString()}] Fired ${randomType.type} (${randomSev}) for ${activeCandidate.name}`,
            ...prev,
          ].slice(0, 20)
        );
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, activeCandidate, triggerViolation]);

  // Active Candidate events for chart
  const candidateEvents = liveEvents.filter(
    (e) => activeCandidate && e.candidateId === activeCandidate.id
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400 animate-bounce" />
            <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Live Simulation Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly injection & cheat detection stress-testing sandbox.
          </p>
        </div>

        {/* Target Candidate Selector */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
          <span className="text-xs font-mono text-slate-400">Target Candidate:</span>
          <select
            value={activeCandidate?.id || ""}
            onChange={(e) => selectCandidate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-400 font-semibold focus:outline-none"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.riskScore}% Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Candidate Status Overview */}
      {activeCandidate && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 backdrop-blur-sm">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Target Candidate</span>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{activeCandidate.name}</div>
            <div className="text-[11px] text-slate-400">{activeCandidate.email}</div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Current Risk Score</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-cyan-400">
                {activeCandidate.riskScore}%
              </span>
              <div className="flex-1 bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${activeCandidate.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Automated Status</span>
            <div className="mt-1">
              <span
                className={`inline-flex rounded border px-2 py-0.5 text-xs font-bold font-mono ${getStatusBadgeColor(
                  activeCandidate.status
                )}`}
              >
                {activeCandidate.status}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Threshold Check</span>
            <div className="text-xs font-mono text-slate-300 mt-1">
              Auto-Flag Limit: <span className="text-rose-400 font-bold">{policy.autoFlagThreshold}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Control Board + Risk Score Chart / Live Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomaly Trigger Control Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick-Fire Preset Buttons */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Quick Anomaly Injection Presets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {eventTypesList.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleTriggerManual(item.type)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 transition-all text-center group"
                  >
                    <Icon className="h-5 w-5 mb-1.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Violation Injection Builder */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Custom Payload Injection Builder
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Event Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Event Type</label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {eventTypesList.map((e) => (
                    <option key={e.type} value={e.type}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Severity Level</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as Severity)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              {/* Detector Confidence Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 uppercase">AI Confidence</span>
                  <span className="text-cyan-400 font-bold">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                Custom Violation Description
              </label>
              <input
                type="text"
                placeholder="E.g., Candidate holding external secondary smartphone near desk surface."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleTriggerManual()}
              className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 text-xs font-bold font-mono tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" /> Inject Payload into Session
            </button>
          </div>

          {/* Automated Stress Testing Runner */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Automated Stress Attack Loop
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fires sequential randomized violations every 2 seconds to test auto-flagging.
                </p>
              </div>

              <button
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold font-mono transition-all ${
                  isAutoSimulating
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Square className="h-4 w-4" /> Stop Stress Test
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start Stress Test
                  </>
                )}
              </button>
            </div>

            {autoSimLogs.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] text-slate-400 space-y-1 max-h-36 overflow-y-auto">
                {autoSimLogs.map((log, idx) => (
                  <div key={idx} className="text-cyan-400/90">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Event Stream / Score Progression */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Real-Time Score Progression
            </h2>

            <div className="space-y-2">
              {candidateEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No events injected into this session yet.
                </div>
              ) : (
                candidateEvents.slice(0, 10).map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{e.timestamp}</span>
                      <span
                        className={`rounded border px-1 py-0.2 ${getSeverityBadgeColor(
                          e.severity
                        )}`}
                      >
                        {e.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200">
                      {getEventTypeLabel(e.eventType)}
                    </div>
                    <div className="text-right text-[10px] font-mono text-cyan-400 font-bold">
                      Risk: {e.preRiskScore}% → {e.postRiskScore}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
