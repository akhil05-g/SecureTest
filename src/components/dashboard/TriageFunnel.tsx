"use client";

import React from "react";
import { useAssessment } from "@/context/AssessmentContext";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileSpreadsheet,
  Shield,
} from "lucide-react";
import { DemoScenarioPicker } from "@/components/dashboard/DemoScenarioPicker";

export function TriageFunnel({ onOpenExport }: { onOpenExport?: () => void }) {
  const { candidates, policy, filters, setFilters } = useAssessment();

  const totalCount = candidates.length;
  const normalCount = candidates.filter((c) => c.status === "NORMAL").length;
  const suspiciousCount = candidates.filter((c) => c.status === "SUSPICIOUS").length;
  const autoFlaggedCount = candidates.filter(
    (c) => c.status === "AUTO_FLAGGED" || c.status === "HIGH_RISK"
  ).length;

  return (
    <div className="space-y-4 font-mono">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Senior Full-Stack Engineering Assessment 2026
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
              <Shield className="h-3 w-3 text-rose-400" />
              Auto-Flag &gt;= {policy.autoFlagThreshold}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold text-[11px]">AI Integrity Engine: ONLINE</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400">30 FPS Stream Analysis</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <DemoScenarioPicker />
          <button
            type="button"
            onClick={() => {
              if (onOpenExport) onOpenExport();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* Interactive 4-Card Triage Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Total Candidates"
          count={totalCount}
          subtitle="All Enrolled"
          icon={<Users className="h-5 w-5" />}
          statusColor="cyan"
          isSelected={filters.status === "ALL"}
          onClick={() => setFilters({ status: "ALL" })}
        />

        <MetricCard
          title="Cleared / Normal"
          count={normalCount}
          subtitle="No Flags"
          icon={<CheckCircle2 className="h-5 w-5" />}
          statusColor="emerald"
          isSelected={filters.status === "NORMAL"}
          onClick={() => setFilters({ status: "NORMAL" })}
        />

        <MetricCard
          title="Suspicious"
          count={suspiciousCount}
          subtitle="Requires Review"
          icon={<AlertTriangle className="h-5 w-5" />}
          statusColor="amber"
          isSelected={filters.status === "SUSPICIOUS"}
          onClick={() => setFilters({ status: "SUSPICIOUS" })}
        />

        <MetricCard
          title="Auto-Flagged"
          count={autoFlaggedCount}
          subtitle="Critical Anomaly"
          icon={<ShieldAlert className="h-5 w-5" />}
          statusColor="rose"
          isSelected={filters.status === "AUTO_FLAGGED"}
          onClick={() => setFilters({ status: "AUTO_FLAGGED" })}
        />
      </div>
    </div>
  );
}