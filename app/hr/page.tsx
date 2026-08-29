"use client";

import React, { useState, useMemo } from "react";
import { useAssessment } from "@/src/context/AssessmentContext";
import { TriageFunnel } from "@/src/components/dashboard/TriageFunnel";
import {
  Candidate,
  CandidateStatus,
  IntegrityEvent,
  ReviewerActionType,
  getStatusBadgeColor,
  getSeverityBadgeColor,
  getEventTypeLabel,
} from "@/src/types";
import {
  ShieldAlert,
  Search,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Zap,
  Download,
  X,
  MessageSquare,
  ShieldCheck,
  Activity,
  UserX,
} from "lucide-react";

export default function HRCommandCenter() {
  const {
    candidates,
    filteredCandidates,
    selectedCandidate,
    selectCandidate,
    liveEvents,
    policy,
    filters,
    setFilters,
    recordReviewerAction,
    loadCandidates,
  } = useAssessment();

  const [activeTab, setActiveTab] = useState<"ALL" | CandidateStatus>("ALL");
  const [modalTab, setModalTab] = useState<"timeline" | "audit">("timeline");
  const [reviewerNote, setReviewerNote] = useState("");
  const [reviewerName, setReviewerName] = useState("Sarah Jenkins (HR Lead)");
  const [isGenerating1000, setIsGenerating1000] = useState(false);

  // Generate 1,000 Candidates Demo Dataset
  const handleLoad1000DemoData = () => {
    setIsGenerating1000(true);
    setTimeout(() => {
      const statuses: CandidateStatus[] = ["NORMAL", "SUSPICIOUS", "HIGH_RISK", "AUTO_FLAGGED"];
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

      const generated: Candidate[] = Array.from({ length: 1000 }, (_, i) => {
        const id = `cand-demo-${i + 1}`;
        const name = `${names[i % names.length]} #${i + 1}`;
        const email = `candidate${i + 1}@techcorp.io`;
        const assessmentTitle = assessments[i % assessments.length];
        const riskScore = Math.floor(Math.random() * 100);

        let status: CandidateStatus = "NORMAL";
        if (riskScore >= policy.autoFlagThreshold) status = "AUTO_FLAGGED";
        else if (riskScore >= policy.autoFlagThreshold - 15) status = "HIGH_RISK";
        else if (riskScore >= policy.suspiciousThreshold) status = "SUSPICIOUS";

        const totalViolations = Math.floor(riskScore / 15);

        return {
          id,
          name,
          email,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (i % 50)}?w=150&auto=format&fit=crop&q=80`,
          assessmentTitle,
          status,
          riskScore,
          startedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
          totalViolations,
          recentViolations: totalViolations > 0 ? ["TAB_BLUR", "GAZE_DEV"] : [],
          auditTrail: [],
        };
      });

      loadCandidates(generated);
      setIsGenerating1000(false);
    }, 400);
  };

  // Selected Candidate Events
  const candidateEvents = useMemo(() => {
    if (!selectedCandidate) return [];
    return liveEvents.filter((e) => e.candidateId === selectedCandidate.id);
  }, [selectedCandidate, liveEvents]);

  const handleAction = (action: ReviewerActionType) => {
    if (!selectedCandidate) return;
    recordReviewerAction(
      selectedCandidate.id,
      action,
      reviewerNote.trim() || `Action [${action}] recorded by reviewer.`,
      reviewerName
    );
    setReviewerNote("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Triage Funnel Top Section & Quick Controls */}
      <TriageFunnel />

      {/* Main Content Layout: Candidate Table + Live Feed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Candidate Table Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Assessment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Violations</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No candidates found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => (
                    <tr
                      key={cand.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => selectCandidate(cand.id)}
                    >
                      {/* Name & Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 overflow-hidden text-xs">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                              {cand.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cand.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assessment */}
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {cand.assessmentTitle}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getStatusBadgeColor(
                            cand.status
                          )}`}
                        >
                          {cand.status}
                        </span>
                      </td>

                      {/* Risk Score Gauge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                cand.riskScore >= 70
                                  ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                                  : cand.riskScore >= 40
                                  ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${cand.riskScore}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              cand.riskScore >= 70
                                ? "text-rose-400"
                                : cand.riskScore >= 40
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {cand.riskScore}%
                          </span>
                        </div>
                      </td>

                      {/* Violations Count */}
                      <td className="px-4 py-3 font-mono font-semibold text-slate-300">
                        {cand.totalViolations} events
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCandidate(cand.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 px-2.5 py-1 text-xs font-medium text-slate-200 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Real-Time Events Feed Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Live Anomaly Stream
              </h2>
            </div>
            <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
              {liveEvents.length} events
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {liveEvents.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
                No telemetry events logged yet.
              </div>
            ) : (
              liveEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${getSeverityBadgeColor(
                        evt.severity
                      )}`}
                    >
                      {evt.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {evt.timestamp}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200">
                    {getEventTypeLabel(evt.eventType)}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {evt.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span>Conf: {evt.confidence}%</span>
                    <span className="text-cyan-400">
                      Score: {evt.preRiskScore}% → {evt.postRiskScore}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Candidate Deep-Dive Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 font-mono">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => selectCandidate(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Risk Gauge & Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Risk Score
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-rose-400 mt-0.5">
                    {selectedCandidate.riskScore}%
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Current Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-xs font-bold font-mono ${getStatusBadgeColor(
                        selectedCandidate.status
                      )}`}
                    >
                      {selectedCandidate.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Total Violations
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
                    {selectedCandidate.totalViolations} events
                  </div>
                </div>
              </div>

              {/* Navigation Tabs inside modal */}
              <div className="flex border-b border-slate-800 gap-4">
                <button
                  onClick={() => setModalTab("timeline")}
                  className={`pb-2 text-xs font-semibold font-mono border-b-2 transition-all ${
                    modalTab === "timeline"
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Violation Timeline & Snapshots
                </button>
                <button
                  onClick={() => setModalTab("audit")}
                  className={`pb-2 text-xs font-semibold font-mono border-b-2 transition-all ${
                    modalTab === "audit"
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Compliance Audit Trail ({selectedCandidate.auditTrail.length})
                </button>
              </div>

              {/* Tab 1: Violation Timeline */}
              {modalTab === "timeline" && (
                <div className="space-y-3">
                  {candidateEvents.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-mono">
                      No recorded violation snapshots for this candidate.
                    </div>
                  ) : (
                    candidateEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            [{evt.timestamp}] {getEventTypeLabel(evt.eventType)}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${getSeverityBadgeColor(
                              evt.severity
                            )}`}
                          >
                            {evt.severity} ({evt.confidence}% CONF)
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{evt.description}</p>

                        {evt.evidenceSnapshotUrl && (
                          <div className="pt-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              Camera Evidence Snapshot
                            </span>
                            <div className="mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 max-h-48">
                              <img
                                src={evt.evidenceSnapshotUrl}
                                alt="Violation Evidence"
                                className="w-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Compliance Audit Trail */}
              {modalTab === "audit" && (
                <div className="space-y-3">
                  {selectedCandidate.auditTrail.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-mono">
                      No reviewer actions recorded yet.
                    </div>
                  ) : (
                    selectedCandidate.auditTrail.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                          <span className="font-semibold text-cyan-400">{log.reviewerName}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="font-bold text-slate-200 font-mono text-xs">
                          ACTION: {log.action}
                        </div>
                        <p className="text-slate-300">{log.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Reviewer Action Panel */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Human Compliance Reviewer Action
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Reviewer Name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Add audit notes / reason for override..."
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleAction("CONFIRM_FLAG")}
                    className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                  >
                    Confirm Flag
                  </button>
                  <button
                    onClick={() => handleAction("ESCALATE")}
                    className="rounded-lg bg-orange-600 hover:bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all"
                  >
                    Escalate to HR Lead
                  </button>
                  <button
                    onClick={() => handleAction("DISMISS_FLAG")}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    Dismiss Flag (Clear)
                  </button>
                  <button
                    onClick={() => handleAction("ADD_NOTE")}
                    className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all"
                  >
                    Add Audit Note Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
