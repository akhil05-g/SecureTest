'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { TriageFunnel } from '@/components/dashboard/TriageFunnel';
import { CandidateTable } from '@/components/dashboard/CandidateTable';
import { LiveAlertFeed } from '@/components/dashboard/LiveAlertFeed';
import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline';
import { EvidenceInspector } from '@/components/dashboard/EvidenceInspector';
import { AuditDecisionPanel } from '@/components/dashboard/AuditDecisionPanel';
import { AuditExportModal } from '@/components/dashboard/AuditExportModal';
import { IntegrityAnalytics } from '@/components/dashboard/IntegrityAnalytics';
import { QuickReviewBar } from '@/components/dashboard/QuickReviewBar';
import { useInvestigationShortcuts } from '@/hooks/useInvestigationShortcuts';
import { IntegrityEvent, getStatusBadgeColor } from '@/types';
import { X, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

export default function HRCommandCenter() {
  const {
    selectedCandidate,
    selectCandidate,
    liveEvents,
    recordReviewerAction,
    loadCandidates,
  } = useAssessment();

  const [selectedEvent, setSelectedEvent] = useState<IntegrityEvent | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 2-Second Live Telemetry Polling Cycle
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/candidates');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((c: Record<string, unknown>) => {
              const rawEvents = (c.events as Record<string, unknown>[]) || [];
              const totalViolations = rawEvents.length;

              // Map most recent 5 events
              const recentViolations = rawEvents.slice(-5).reverse().map((evt) => {
                const eventType = (evt.eventType as string) || 'UNKNOWN_EVENT';
                const detectorConfidence = (evt.detectorConfidence as number) || 80;
                const baseSeverity = (evt.baseSeverity as number) || 5;

                let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
                if (baseSeverity >= 8) severity = 'CRITICAL';
                else if (baseSeverity >= 6) severity = 'HIGH';
                else if (baseSeverity >= 4) severity = 'MEDIUM';

                return {
                  id: (evt.id as string) || `evt-${Date.now()}`,
                  candidateId: c.id as string,
                  eventType: eventType as EventType,
                  severity,
                  confidence: detectorConfidence,
                  timestamp: evt.timestamp ? new Date(evt.timestamp as string).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
                  preRiskScore: 0,
                  postRiskScore: Math.min(100, Math.round((c.riskScore as number) || 0)),
                };
              });

              return {
                id: c.id as string,
                name: c.name as string,
                email: c.email as string,
                avatar: (c.avatar as string) || '',
                assessmentTitle: 'Enterprise Assessment',
                status: mapRiskLevelToStatus(c.riskLevel as string, c.riskScore as number),
                riskScore: Math.min(100, Math.round((c.riskScore as number) || 0)),
                startedAt: c.startTime ? new Date(c.startTime as string).toISOString() : new Date().toISOString(),
                completedAt: c.endTime ? new Date(c.endTime as string).toISOString() : undefined,
                totalViolations,
                recentViolations: recentViolations.map((v) => v.eventType),
                auditTrail: [],
              };
            });
            loadCandidates(mapped);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [loadCandidates]);

  function mapRiskLevelToStatus(riskLevel: string, riskScore: number) {
    if (riskLevel === 'CRITICAL' || riskScore >= 70) return 'AUTO_FLAGGED' as const;
    if (riskLevel === 'HIGH' || riskScore >= 55) return 'HIGH_RISK' as const;
    if (riskLevel === 'MEDIUM' || riskScore >= 40) return 'SUSPICIOUS' as const;
    return 'NORMAL' as const;
  }

  // Selected candidate's events
  const candidateEvents = useMemo(() => {
    if (!selectedCandidate) return [];
    return liveEvents.filter((e) => e.candidateId === selectedCandidate.id);
  }, [selectedCandidate, liveEvents]);

  // Keyboard navigation helpers
  const currentEventIndex = useMemo(() => {
    if (!selectedEvent || candidateEvents.length === 0) return 0;
    return candidateEvents.findIndex((e) => e.id === selectedEvent.id);
  }, [selectedEvent, candidateEvents]);

  const handleNavigateNext = () => {
    if (candidateEvents.length === 0) return;
    const nextIdx = (currentEventIndex + 1) % candidateEvents.length;
    setSelectedEvent(candidateEvents[nextIdx]);
  };

  const handleNavigatePrev = () => {
    if (candidateEvents.length === 0) return;
    const prevIdx = (currentEventIndex - 1 + candidateEvents.length) % candidateEvents.length;
    setSelectedEvent(candidateEvents[prevIdx]);
  };

  const handleConfirmFlagAction = () => {
    if (!selectedCandidate) return;
    recordReviewerAction(selectedCandidate.id, 'CONFIRM_FLAG', 'Disqualification confirmed via quick hotkey.', 'System Admin');
  };

  const handleDismissFlagAction = () => {
    if (!selectedCandidate) return;
    recordReviewerAction(selectedCandidate.id, 'DISMISS_FLAG', 'Dismissed as false positive via quick hotkey.', 'System Admin');
  };

  const handleEscalateAction = () => {
    if (!selectedCandidate) return;
    recordReviewerAction(selectedCandidate.id, 'ESCALATE', 'Escalated to committee via quick hotkey.', 'System Admin');
  };

  const handleCloseModal = () => {
    selectCandidate(null);
    setSelectedEvent(null);
  };

  const { toastMessage } = useInvestigationShortcuts({
    isOpen: !!selectedCandidate,
    onNavigateNext: handleNavigateNext,
    onNavigatePrev: handleNavigatePrev,
    onConfirmFlag: handleConfirmFlagAction,
    onDismissFlag: handleDismissFlagAction,
    onEscalate: handleEscalateAction,
    onClose: handleCloseModal,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Triage Funnel & Quick Controls */}
      <TriageFunnel onOpenExport={() => setIsExportModalOpen(true)} />

      {/* Analytics Drawer Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200">Integrity Threat Telemetry & Analytics</span>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 transition-all"
        >
          {showAnalytics ? (
            <>
              Hide Analytics <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Expand Telemetry <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {showAnalytics && <IntegrityAnalytics />}

      {/* Main Responsive Grid Layout (70% Table, 30% Live Alert Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Candidate Table (70% on lg screen = 7 cols) */}
        <div className="lg:col-span-7">
          <CandidateTable />
        </div>

        {/* Live Security Feed (30% on lg screen = 3 cols) */}
        <div className="lg:col-span-3">
          <LiveAlertFeed />
        </div>
      </div>

      {/* Forensic Audit Export Modal */}
      <AuditExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Candidate Deep-Dive Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-100 font-mono">
                      {selectedCandidate.name}
                    </h2>
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getStatusBadgeColor(
                        selectedCandidate.status
                      )}`}
                    >
                      {selectedCandidate.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Evidence Inspector & Forensic Visualizer */}
              <EvidenceInspector
                candidate={selectedCandidate}
                activeEvent={selectedEvent}
                allEvents={candidateEvents}
              />

              {/* Interactive Chronological Incident Timeline */}
              <IncidentTimeline
                events={candidateEvents}
                selectedEventId={selectedEvent?.id}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
              />

              {/* HR Governance & Audit Panel */}
              <AuditDecisionPanel
                candidate={selectedCandidate}
                onRecordAction={(action, notes, reviewerName) =>
                  recordReviewerAction(selectedCandidate.id, action, notes, reviewerName)
                }
              />

              {/* Quick Keyboard Review Bar Docked */}
              <QuickReviewBar
                toastMessage={toastMessage}
                onConfirmFlag={handleConfirmFlagAction}
                onDismissFlag={handleDismissFlagAction}
                onEscalate={handleEscalateAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


