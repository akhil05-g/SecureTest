"use client";

import React, { useState, useEffect } from "react";
import { useAssessment } from "@/src/context/AssessmentContext";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { getEventTypeLabel, EventType } from "@/src/types";
import {
  ShieldAlert,
  Search,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  RotateCcw,
} from "lucide-react";
import { DemoScenarioPicker } from "@/src/components/dashboard/DemoScenarioPicker";

function renderViolationPills(candidate: { recentViolations: EventType[]; totalViolations: number }) {
  if (!candidate.recentViolations || candidate.recentViolations.length === 0) {
    return <span className="text-slate-500 font-mono text-[11px]">Clean (0)</span>;
  }

  const counts: Record<string, number> = {};
  candidate.recentViolations.forEach((evt) => {
    counts[evt] = (counts[evt] || 0) + 1;
  });

  const shortNames: Record<string, string> = {
    DEVTOOLS_TRAP: "DevTools",
    PHONE_DETECTED: "Phone",
    MULTI_FACE: "Multi-Face",
    FACE_ABSENT: "Face Absent",
    GAZE_DEV: "Gaze Dev",
    TAB_BLUR: "Tab Switch",
    MULTI_SCREEN: "Multi-Screen",
    AUDIO_VOICE: "Voice",
    FULLSCREEN_EXIT: "Exit Fullscreen",
  };

  const getPillColor = (type: string) => {
    switch (type) {
      case "DEVTOOLS_TRAP":
      case "PHONE_DETECTED":
      case "MULTI_SCREEN":
        return "bg-rose-950/40 text-rose-300 border-rose-500/30";
      case "MULTI_FACE":
      case "AUDIO_VOICE":
      case "FACE_ABSENT":
        return "bg-amber-950/40 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(counts).map(([type, count]) => {
        const label = shortNames[type] || getEventTypeLabel(type as EventType);
        return (
          <span
            key={type}
            className={`inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium ${getPillColor(
              type
            )}`}
          >
            {label} {count > 1 ? `×${count}` : ""}
          </span>
        );
      })}
    </div>
  );
}

function CandidateInitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="h-7 w-7 shrink-0 rounded-md border border-slate-700 bg-slate-800 flex items-center justify-center font-mono font-bold text-cyan-400 text-[11px] shadow-sm">
      {initials || "C"}
    </div>
  );
}

export function CandidateTable() {
  const { candidates, filteredCandidates, selectCandidate, filters, setFilters, loadCandidates } = useAssessment();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = candidates.length;
  const autoFlaggedCount = candidates.filter((c) => c.status === "AUTO_FLAGGED" || c.status === "HIGH_RISK").length;
  const suspiciousCount = candidates.filter((c) => c.status === "SUSPICIOUS").length;
  const normalCount = candidates.filter((c) => c.status === "NORMAL").length;

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleLoad1000DemoData = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const names = [
        "James Wilson", "Sophia Martinez", "Liam Johnson", "Emma Watson",
        "Oliver Smith", "Ava Brown", "Noah Davis", "Isabella Miller",
        "Lucas Garcia", "Mia Rodriguez", "Ethan Anderson", "Charlotte Thomas",
        "Mason Taylor", "Amelia Moore", "Logan Jackson", "Harper Martin",
      ];
      const assessments = [
        "Senior Full Stack Engineer",
        "Backend Systems Architect",
        "Cybersecurity Analyst Exam",
        "AI / ML Engineer Practical",
        "DevOps & Infrastructure Lead",
      ];

      const generated = Array.from({ length: 1000 }, (_, i) => {
        const id = `cand-${1000 + i + 1}`;
        const name = `${names[i % names.length]} #${i + 1}`;
        const email = `candidate${i + 1}@techcorp.io`;
        const assessmentTitle = assessments[i % assessments.length];
        const riskScore = Math.floor(Math.random() * 100);

        let status: "NORMAL" | "SUSPICIOUS" | "HIGH_RISK" | "AUTO_FLAGGED" = "NORMAL";
        if (riskScore >= 70) status = "AUTO_FLAGGED";
        else if (riskScore >= 55) status = "HIGH_RISK";
        else if (riskScore >= 40) status = "SUSPICIOUS";

        const totalViolations = Math.floor(riskScore / 15);

        return {
          id,
          name,
          email,
          avatar: "",
          assessmentTitle,
          status,
          riskScore,
          startedAt: "2026-08-28T09:15:00Z",
          totalViolations,
          recentViolations: totalViolations > 0 ? (["TAB_BLUR", "GAZE_DEV"] as EventType[]) : [],
          auditTrail: [],
        };
      });

      loadCandidates(generated);
      setIsGenerating(false);
    }, 200);
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs font-mono text-slate-500">
        Loading Command Center Data Grid...
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Search and Filter Control Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3 backdrop-blur-md shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by name, email, or candidate ID..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: "" });
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <DemoScenarioPicker />
            <button
              type="button"
              onClick={handleLoad1000DemoData}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all disabled:opacity-50"
            >
              <Zap className={`h-3.5 w-3.5 text-cyan-400 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Load 1,000 Dataset"}
            </button>
          </div>
        </div>

        {/* Filter Tabs & Rows Per Page */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setFilters({ status: "ALL" });
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                filters.status === "ALL"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              All ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilters({ status: "AUTO_FLAGGED" });
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                filters.status === "AUTO_FLAGGED"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-rose-300 hover:bg-slate-800/60"
              }`}
            >
              Auto-Flagged ({autoFlaggedCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilters({ status: "SUSPICIOUS" });
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                filters.status === "SUSPICIOUS"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
              }`}
            >
              Suspicious ({suspiciousCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilters({ status: "NORMAL" });
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                filters.status === "NORMAL"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60"
              }`}
            >
              Cleared ({normalCount})
            </button>
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-2 text-slate-400 text-[11px] self-end sm:self-auto">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-md bg-slate-950 border border-slate-700 px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classic High-Density Fixed-Layout Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse table-fixed min-w-[760px]">
            <thead className="bg-slate-950 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-bold w-[75px]">ID</th>
                <th className="px-3 py-2.5 font-bold w-[220px]">Candidate</th>
                <th className="px-3 py-2.5 text-center font-bold w-[95px]">Risk</th>
                <th className="px-3 py-2.5 font-bold w-[125px]">Status</th>
                <th className="px-3 py-2.5 font-bold">Violations</th>
                <th className="px-3 py-2.5 text-right font-bold w-[130px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserX className="h-8 w-8 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-300">No Candidates Found</p>
                      <p className="text-[11px] text-slate-500">
                        No candidates match the current filter or search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const riskColor =
                    cand.riskScore >= 70
                      ? "text-rose-400 bg-rose-950/30 border-rose-500/30"
                      : cand.riskScore >= 40
                      ? "text-amber-400 bg-amber-950/30 border-amber-500/30"
                      : "text-emerald-400 bg-emerald-950/30 border-emerald-500/30";

                  return (
                    <tr
                      key={cand.id}
                      onClick={() => selectCandidate(cand.id)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="px-3 py-2.5 whitespace-nowrap align-middle">
                        <span className="inline-block rounded bg-slate-950 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-slate-800">
                          #{cand.id.toUpperCase().replace("CAND-", "")}
                        </span>
                      </td>

                      {/* Candidate Name & Email */}
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-2">
                          <CandidateInitialsAvatar name={cand.name} />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors truncate text-xs">
                              {cand.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {cand.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-center align-middle">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold border ${riskColor}`}
                        >
                          {cand.riskScore}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 whitespace-nowrap align-middle">
                        <StatusBadge status={cand.status} size="sm" />
                      </td>

                      {/* Violations */}
                      <td className="px-3 py-2.5 align-middle">
                        {renderViolationPills(cand)}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap align-middle">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCandidate(cand.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/50 border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 transition-all shadow-sm"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                          Review Evidence
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-mono text-slate-400 gap-2">
          <div>
            Showing <span className="text-slate-200 font-bold">{filteredCandidates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="text-slate-200 font-bold">
              {Math.min(currentPage * pageSize, filteredCandidates.length)}
            </span>{" "}
            of <span className="text-slate-200 font-bold">{filteredCandidates.length}</span> candidates
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300 disabled:opacity-30 hover:bg-slate-800 flex items-center gap-1 text-[11px]"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>

            <span className="px-2 text-[11px]">
              Page <span className="text-slate-200 font-bold">{currentPage}</span> of{" "}
              <span className="text-slate-200 font-bold">{totalPages}</span>
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300 disabled:opacity-30 hover:bg-slate-800 flex items-center gap-1 text-[11px]"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}