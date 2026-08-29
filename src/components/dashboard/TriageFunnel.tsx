'use client';

import React from 'react';
import { useAssessment } from '@/src/context/AssessmentContext';
import { MetricCard } from '@/src/components/ui/MetricCard';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';

import { DemoScenarioPicker } from '@/src/components/dashboard/DemoScenarioPicker';

export function TriageFunnel({ onOpenExport }: { onOpenExport?: () => void }) {
  const { candidates, policy, filters, setFilters } = useAssessment();

  // Dynamic counts derived from candidates array
  const totalCount = candidates.length;
  const normalCount = candidates.filter((c) => c.status === 'NORMAL').length;
  const suspiciousCount = candidates.filter((c) => c.status === 'SUSPICIOUS').length;
  // Card 4: Count of AUTO_FLAGGED + HIGH_RISK candidates
  const autoFlaggedCount = candidates.filter(
    (c) => c.status === 'AUTO_FLAGGED' || c.status === 'HIGH_RISK'
  ).length;

  const handleExportAuditReport = () => {
    const csvHeader = 'ID,Name,Email,Assessment,Status,Risk Score,Violations\n';
    const csvRows = candidates
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.assessmentTitle}","${c.status}",${c.riskScore},${c.totalViolations}`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      sortBy: 'risk_desc',
    });
  };

  const isFiltered = filters.status !== 'ALL' || filters.search.trim() !== '' || filters.sortBy !== 'risk_desc';

  return (
    <div className="space-y-6">
      {/* 1. Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono">
              Senior Full-Stack Engineering Assessment 2026
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.2)]">
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              Strict Mode: Auto-Flag &gt;= {policy.autoFlagThreshold}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold">AI Integrity Engine: ONLINE</span>
            <span>•</span>
            <span>30 FPS Stream Analysis</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DemoScenarioPicker />
          <button
            onClick={() => setFilters({ status: 'ALL' })}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-cyan-500/40 transition-all"
          >
            <Layers className="h-4 w-4 text-cyan-400" />
            Triage View
          </button>
          <button
            onClick={() => {
              // Scroll to anomaly stream or highlight live feed
              const liveFeed = document.getElementById('live-anomaly-stream');
              if (liveFeed) {
                liveFeed.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-amber-500/40 transition-all"
          >
            <Activity className="h-4 w-4 text-amber-400 animate-pulse" />
            Live Incidents Stream
          </button>
          <button
            onClick={() => {
              if (onOpenExport) {
                onOpenExport();
              } else {
                handleExportAuditReport();
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* 2. Interactive 4-Card Triage Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Candidates */}
        <MetricCard
          title="Total Candidates"
          count={totalCount}
          subtitle="All Enrolled Candidates"
          icon={<Users className="h-6 w-6" />}
          statusColor="cyan"
          isSelected={filters.status === 'ALL'}
          onClick={() => setFilters({ status: 'ALL' })}
        />

        {/* Card 2: Normal / Cleared */}
        <MetricCard
          title="Normal / Cleared"
          count={normalCount}
          subtitle="No Critical Integrity Issues"
          icon={<CheckCircle2 className="h-6 w-6" />}
          statusColor="emerald"
          isSelected={filters.status === 'NORMAL'}
          onClick={() => setFilters({ status: 'NORMAL' })}
        />

        {/* Card 3: Suspicious */}
        <MetricCard
          title="Suspicious"
          count={suspiciousCount}
          subtitle="Minor Telemetry Anomalies"
          icon={<AlertTriangle className="h-6 w-6" />}
          statusColor="amber"
          isSelected={filters.status === 'SUSPICIOUS'}
          onClick={() => setFilters({ status: 'SUSPICIOUS' })}
        />

        {/* Card 4: Auto-Flagged */}
        <div className="relative group">
          <MetricCard
            title="Auto-Flagged"
            count={autoFlaggedCount}
            subtitle="Auto-Flagged + High Risk"
            icon={
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-40"></span>
                <ShieldAlert className="h-6 w-6 relative z-10" />
              </div>
            }
            statusColor="rose"
            isSelected={filters.status === 'AUTO_FLAGGED'}
            onClick={() => setFilters({ status: 'AUTO_FLAGGED' })}
          />
        </div>
      </div>

      {/* 4. Quick Controls Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter candidates by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ search: '' })}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  sortBy: e.target.value as 'risk_desc' | 'risk_asc' | 'violations_desc' | 'recent',
                })
              }
              className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="risk_desc">Risk Score (High to Low)</option>
              <option value="risk_asc">Risk Score (Low to High)</option>
              <option value="violations_desc">Most Violations</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags & Reset */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Active Filters:</span>

            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded.full bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300">
                Status: {filters.status}
                <button
                  onClick={() => setFilters({ status: 'ALL' })}
                  className="hover:text-cyan-100 ml-1"
                >
                  ×
                </button>
              </span>
            )}

            {filters.search.trim() !== '' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300">
                Search: "{filters.search}"
                <button
                  onClick={() => setFilters({ search: '' })}
                  className="hover:text-cyan-100 ml-1"
                >
                  ×
                </button>
              </span>
            )}

            {filters.sortBy !== 'risk_desc' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300">
                Sort:{' '}
                {filters.sortBy === 'risk_asc'
                  ? 'Risk Low-High'
                  : filters.sortBy === 'violations_desc'
                  ? 'Most Violations'
                  : 'Recently Active'}
                <button
                  onClick={() => setFilters({ sortBy: 'risk_desc' })}
                  className="hover:text-cyan-100 ml-1"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-all ml-auto"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
