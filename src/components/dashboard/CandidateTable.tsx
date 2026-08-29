'use client';

import React, { useState } from 'react';
import { useAssessment } from '@/src/context/AssessmentContext';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { RiskGauge } from '@/src/components/ui/RiskGauge';
import { getEventTypeLabel, EventType } from '@/src/types';
import { Shield, Eye, Clock, UserX, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to format violation count pills from candidate recentViolations / totalViolations
function renderViolationPills(candidate: { recentViolations: EventType[]; totalViolations: number }) {
  if (!candidate.recentViolations || candidate.recentViolations.length === 0) {
    return <span className="text-slate-500 font-mono text-xs">Clean (0)</span>;
  }

  // Count occurrences of each violation type
  const counts: Record<string, number> = {};
  candidate.recentViolations.forEach((evt) => {
    counts[evt] = (counts[evt] || 0) + 1;
  });

  const shortNames: Record<string, string> = {
    DEVTOOLS_TRAP: 'DevTools',
    PHONE_DETECTED: 'Phone',
    MULTI_FACE: 'Multi-Face',
    FACE_ABSENT: 'Face Absent',
    GAZE_DEV: 'Gaze Dev',
    TAB_BLUR: 'Tab Switch',
    MULTI_SCREEN: 'Multi-Screen',
    AUDIO_VOICE: 'Voice',
    FULLSCREEN_EXIT: 'Exit Fullscreen',
  };

  const getPillColor = (type: string) => {
    switch (type) {
      case 'DEVTOOLS_TRAP':
      case 'PHONE_DETECTED':
      case 'MULTI_SCREEN':
        return 'bg-rose-950/40 text-rose-300 border-rose-500/30';
      case 'MULTI_FACE':
      case 'AUDIO_VOICE':
      case 'FACE_ABSENT':
        return 'bg-amber-950/40 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 max-w-xs">
      {Object.entries(counts).map(([type, count]) => {
        const label = shortNames[type] || getEventTypeLabel(type as EventType);
        return (
          <span
            key={type}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium ${getPillColor(
              type
            )}`}
          >
            {label} {count > 1 ? `×${count}` : ''}
          </span>
        );
      })}
    </div>
  );
}

// Helper for start time / duration display
function formatStartedTime(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString || 'Recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export function CandidateTable() {
  const { filteredCandidates, selectCandidate } = useAssessment();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Candidate</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Risk Score</th>
                <th className="px-4 py-4">Violations Summary</th>
                <th className="px-4 py-4">Started / Session</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-500 border border-slate-700">
                        <UserX className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">No Candidates Found</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No candidates match your current search criteria or triage filter selection. Try resetting filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    onClick={() => selectCandidate(cand.id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Candidate Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-mono font-bold text-cyan-400 overflow-hidden shadow-inner">
                          {cand.avatar ? (
                            <img
                              src={cand.avatar}
                              alt={cand.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback to initial if image fails
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <span className="absolute">{cand.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                            {cand.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {cand.email}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                            {cand.assessmentTitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={cand.status} size="sm" />
                    </td>

                    {/* Risk Gauge */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="inline-block scale-90">
                        <RiskGauge score={cand.riskScore} size="sm" showLabel={false} />
                      </div>
                    </td>

                    {/* Violations Summary */}
                    <td className="px-4 py-4">
                      {renderViolationPills(cand)}
                    </td>

                    {/* Started Time / Duration */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatStartedTime(cand.startedAt)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {cand.totalViolations > 0 ? `${cand.totalViolations} logged events` : 'Clean log'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCandidate(cand.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all shadow-sm"
                      >
                        <Shield className="h-3.5 w-3.5 text-cyan-400" />
                        Review Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredCandidates.length > pageSize && (
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-5 py-3 text-xs font-mono text-slate-400">
            <div>
              Showing <span className="text-slate-200 font-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-slate-200 font-bold">
                {Math.min(currentPage * pageSize, filteredCandidates.length)}
              </span>{' '}
              of <span className="text-slate-200 font-bold">{filteredCandidates.length}</span> candidates
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
