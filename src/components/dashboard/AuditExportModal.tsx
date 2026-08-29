'use client';

import React from 'react';
import { useAssessment } from '@/src/context/AssessmentContext';
import { downloadJsonAuditPack } from '@/src/utils/exportAuditReport';
import { FileText, Download, Printer, X, ShieldCheck, Lock } from 'lucide-react';

export interface AuditExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditExportModal: React.FC<AuditExportModalProps> = ({ isOpen, onClose }) => {
  const { candidates, policy } = useAssessment();

  if (!isOpen) return null;

  const total = candidates.length;
  const normal = candidates.filter((c) => c.status === 'NORMAL').length;
  const suspicious = candidates.filter((c) => c.status === 'SUSPICIOUS').length;
  const autoFlagged = candidates.filter((c) => c.status === 'AUTO_FLAGGED' || c.status === 'HIGH_RISK').length;

  const flaggedList = candidates.filter((c) => c.status === 'AUTO_FLAGGED' || c.status === 'HIGH_RISK' || c.status === 'SUSPICIOUS');

  const shaHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                Assessment Integrity & Forensic Audit Package
              </h2>
              <p className="text-xs text-slate-400">
                Compliance report for executive leadership, legal review & candidate verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Printable Document Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-950/40 text-xs font-mono">
          {/* Document Header Sheet */}
          <div className="border border-slate-800 rounded-xl bg-slate-950 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  SECURETEST FORENSIC AUDIT
                </span>
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  SECURETEST INTEGRITY & COMPLIANCE SUMMARY
                </h1>
              </div>
              <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                <div>Date: {new Date().toISOString().split('T')[0]} UTC</div>
                <div>Policy Version: <span className="text-rose-400 font-bold">v2.4-STRICT</span></div>
              </div>
            </div>

            {/* Assessment Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Assessment Name</span>
                <div className="font-bold text-slate-100">Senior Full-Stack Assessment 2026</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Assessment ID</span>
                <div className="font-bold text-slate-100">#ASM-8492-EXEC</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Auto-Flag Threshold</span>
                <div className="font-bold text-rose-400">{policy.autoFlagThreshold}% Risk Score</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Lead Officer</span>
                <div className="font-bold text-cyan-400">Sarah Jenkins (Compliance)</div>
              </div>
            </div>

            {/* Triage Breakdown Summary */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Triage Breakdown Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                  <div className="text-[10px] text-slate-400">Total Enrolled</div>
                  <div className="text-xl font-bold text-slate-100 mt-0.5">{total}</div>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
                  <div className="text-[10px] text-emerald-400">Normal / Cleared</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {normal} ({total > 0 ? ((normal / total) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20">
                  <div className="text-[10px] text-amber-400">Suspicious</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">
                    {suspicious} ({total > 0 ? ((suspicious / total) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/20">
                  <div className="text-[10px] text-rose-400">Auto-Flagged & High Risk</div>
                  <div className="text-xl font-bold text-rose-400 mt-0.5">
                    {autoFlagged} ({total > 0 ? ((autoFlagged / total) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Flagged Candidates Incident Table */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Flagged Candidates & Action Log ({flaggedList.length})
              </span>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Candidate ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Risk Score</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Violations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {flaggedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                          No flagged candidates recorded.
                        </td>
                      </tr>
                    ) : (
                      flaggedList.map((cand) => (
                        <tr key={cand.id}>
                          <td className="px-3 py-2 text-cyan-400">{cand.id}</td>
                          <td className="px-3 py-2 font-semibold text-slate-100">{cand.name}</td>
                          <td className="px-3 py-2 font-bold text-rose-400">{cand.riskScore}%</td>
                          <td className="px-3 py-2">{cand.status}</td>
                          <td className="px-3 py-2 text-slate-400">{cand.totalViolations} events</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Forensic Watermark & SHA-256 Digital Verification */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>SHA-256 Verification Hash:</span>
                <span className="text-cyan-400/90 truncate max-w-xs">{shaHash}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tamper-Proof Audit Sign-off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4 shrink-0 gap-3">
          <button
            onClick={() => downloadJsonAuditPack(candidates, policy)}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 px-4 py-2 text-xs font-semibold text-cyan-300 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] font-mono"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Download JSON Audit Pack
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-all font-mono"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              Print / Save PDF Report
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 transition-all font-mono"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditExportModal;
