'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Zap,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Sparkles,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12 pb-16 font-mono">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-12 backdrop-blur-md shadow-2xl">
        {/* Radial Background Accent */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-6 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-POWERED ASSESSMENT INTEGRITY PLATFORM</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">SkillPatch Verified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            SecureTest: Monitor Everyone. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-400 bg-clip-text text-transparent">
              Review Only the Suspicious Few.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-sans">
            SecureTest transforms high-stakes assessment proctoring by eliminating endless video scrubbing. 
            Our multi-signal correlation engine automatically triages candidates, detects DevTools tampering, 
            phone usage, and extended displays, cutting HR review workload by <span className="text-cyan-400 font-bold">96.7%</span>.
          </p>

          {/* Real-time System Telemetry Banner */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-bold">Multi-Signal Correlation Engine: ACTIVE</span>
            </div>
            <span>•</span>
            <span className="text-slate-300">30 FPS Stream Analysis</span>
            <span>•</span>
            <span className="text-cyan-400">SkillPatch Standard Verified</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/hr"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Launch HR Command Center <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/simulation"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Live Simulation Studio
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Main Navigation Modules (Interactive Glassmorphic Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: HR Command Center */}
        <Link
          href="/hr"
          className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-cyan-500/50 hover:bg-slate-850 transition-all space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold border border-cyan-900 bg-cyan-950 px-2 py-0.5 rounded">
              01. MAIN HR MODULE
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              HR Command Center
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
              Triage 1,000 candidates down to 33 in seconds. Interactive ranked matrix, clickable incident timeline, and forensic evidence inspector.
            </p>
          </div>

          <div className="flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            Open Command Center <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Module 2: Live Threat Simulation Studio */}
        <Link
          href="/simulation"
          className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-amber-500/50 hover:bg-slate-850 transition-all space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold border border-amber-900 bg-amber-950 px-2 py-0.5 rounded">
              02. LIVE DEMO STUDIO
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Live Threat Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
              Real-time signal injection console for hackathon demo. Inject DevTools breach, phone detection, and watch risk gauges update instantly.
            </p>
          </div>

          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            Launch Simulator <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Module 3: Integrity Policy Configurator */}
        <Link
          href="/settings"
          className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-rose-500/50 hover:bg-slate-850 transition-all space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold border border-rose-900 bg-rose-950 px-2 py-0.5 rounded">
              03. POLICY ENGINE
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
              Policy Configurator
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
              Enterprise policy customization. Tune auto-flag thresholds, event weights, and temporal correlation multipliers dynamically.
            </p>
          </div>

          <div className="flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
            Configure Policy <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Core Architecture & Differentiators Comparison */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-md space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> SecureTest Core Architecture & Differentiators
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            How SecureTest solves traditional proctoring bottlenecks with high-confidence signal correlation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Proctoring */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <AlertTriangle className="w-4 h-4" /> Traditional Proctoring (Legacy)
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-rose-400">•</span>
                <span>Hundreds of hours of unindexed raw video recording requiring manual scrubbing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400">•</span>
                <span>Alert fatigue: Single false-positive tab blurs flag innocent candidates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400">•</span>
                <span>Easy bypass: DevTools debugging and virtual extended screens go undetected.</span>
              </li>
            </ul>
          </div>

          {/* SecureTest Approach */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" /> SecureTest AI Solution
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span><strong className="text-white">96.7% Workload Reduction:</strong> Automatic 4-card triage isolates high-risk candidates instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span><strong className="text-white">Temporal Correlation Engine:</strong> Low-risk signals compound into high risk only when clustered in time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span><strong className="text-white">Interactive Evidence Canvas:</strong> Clickable timeline replaces video scrubbing with forensic snapshots.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
