'use client';

import React, { useState } from 'react';
import { Candidate, ReviewerActionType } from '@/src/types';
import { ShieldAlert, CheckCircle2, AlertTriangle, MessageSquare, History, UserCheck } from 'lucide-react';

export interface AuditDecisionPanelProps {
  candidate: Candidate;
  onRecordAction: (action: ReviewerActionType, notes: string, reviewerName: string) => void;
}

export const AuditDecisionPanel: React.FC<AuditDecisionPanelProps> = ({
  candidate,
  onRecordAction,
}) => {
  const [reviewerName, setReviewerName] = useState('Sarah Jenkins (Lead Integrity Officer)');
  const [notes, setNotes] = useState('');

  const handleAction = (action: ReviewerActionType) => {
    onRecordAction(
      action,
      notes.trim() || `Action [${action}] executed by ${reviewerName}.`,
      reviewerName
    );
    setNotes('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-cyan-400" /> Human Compliance Reviewer Governance
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Immutable Audit Trail</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Reviewer Officer Name
          </label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Justification & Audit Rationale
          </label>
          <input
            type="text"
            placeholder="Enter justification for disqualification or false-positive dismissal..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => handleAction('CONFIRM_FLAG')}
          className="inline-flex items-center gap-2 rounded-lg border border-rose-600/50 bg-rose-950/40 hover:bg-rose-900/60 px-4 py-2 text-xs font-semibold text-rose-300 transition-all shadow-[0_0_12px_rgba(225,29,72,0.2)]"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Confirm Disqualification
        </button>

        <button
          onClick={() => handleAction('DISMISS_FLAG')}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/50 bg-emerald-950/40 hover:bg-emerald-900/60 px-4 py-2 text-xs font-semibold text-emerald-300 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Dismiss as False Positive
        </button>

        <button
          onClick={() => handleAction('ESCALATE')}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/60 px-4 py-2 text-xs font-semibold text-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Escalate to Review Committee
        </button>

        <button
          onClick={() => handleAction('ADD_NOTE')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          Add Audit Note
        </button>
      </div>

      {/* Audit History Log */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <History className="h-3.5 w-3.5 text-cyan-400" />
          <span>Audit Trail History ({candidate.auditTrail.length})</span>
        </div>

        {candidate.auditTrail.length === 0 ? (
          <div className="text-[11px] font-mono text-slate-500 py-2">
            No reviewer governance actions recorded yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {candidate.auditTrail.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-300">{log.reviewerName}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-200 font-semibold">
                  Action: <span className="text-amber-400">{log.action}</span>
                </div>
                <p className="text-[11px] text-slate-400">{log.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDecisionPanel;
