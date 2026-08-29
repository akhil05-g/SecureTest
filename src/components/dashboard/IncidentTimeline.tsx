'use client';

import React, { useEffect } from 'react';
import { IntegrityEvent, EventType } from '@/src/types';
import { SeverityPill } from '@/src/components/ui/SeverityPill';
import {
  ShieldAlert,
  Smartphone,
  Users,
  Eye,
  Layers,
  Mic,
  Monitor,
  Maximize,
  Clock,
  Zap,
} from 'lucide-react';

export interface IncidentTimelineProps {
  events: IntegrityEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: IntegrityEvent) => void;
}

function getEventIcon(eventType: EventType) {
  switch (eventType) {
    case 'DEVTOOLS_TRAP':
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    case 'PHONE_DETECTED':
      return <Smartphone className="w-4 h-4 text-rose-400" />;
    case 'MULTI_FACE':
      return <Users className="w-4 h-4 text-orange-400" />;
    case 'GAZE_DEV':
      return <Eye className="w-4 h-4 text-amber-400" />;
    case 'TAB_BLUR':
      return <Layers className="w-4 h-4 text-amber-400" />;
    case 'AUDIO_VOICE':
      return <Mic className="w-4 h-4 text-orange-400" />;
    case 'MULTI_SCREEN':
      return <Monitor className="w-4 h-4 text-rose-400" />;
    case 'FULLSCREEN_EXIT':
      return <Maximize className="w-4 h-4 text-amber-400" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
  }
}

const eventTypeTitleMap: Record<EventType, string> = {
  DEVTOOLS_TRAP: 'DevTools Tamper Attempt',
  PHONE_DETECTED: 'Prohibited Device / Phone',
  MULTI_FACE: 'Multiple Faces in Frame',
  GAZE_DEV: 'Persistent Gaze Deviation',
  TAB_BLUR: 'Window / Tab Switch',
  AUDIO_VOICE: 'Secondary Voice Activity',
  MULTI_SCREEN: 'Extended Display Detected',
  FACE_ABSENT: 'Face Absent / Unrecognized',
  FULLSCREEN_EXIT: 'Exited Fullscreen Mode',
};

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  // Fallback to highest severity event if none selected
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sorted = [...events].sort(
        (a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      );
      onSelectEvent(sorted[0]);
    }
  }, [events, selectedEventId, onSelectEvent]);

  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs font-mono text-slate-500">
        No integrity events logged for this candidate session.
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          Chronological Incident Timeline ({events.length})
        </h3>
        <span className="text-[11px] font-mono text-slate-500">Click node to inspect evidence</span>
      </div>

      <div className="relative pl-6 space-y-4">
        {/* Connecting Gradient Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500/40 via-amber-500/40 to-rose-600/40" />

        {events.map((evt) => {
          const isSelected = evt.id === selectedEventId;
          const scoreDelta = evt.postRiskScore - evt.preRiskScore;
          const title = eventTypeTitleMap[evt.eventType] || evt.eventType;

          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className={`relative group cursor-pointer rounded-xl border transition-all p-3.5 ${
                isSelected
                  ? 'ring-1 ring-cyan-500/50 bg-slate-800/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              {/* Timeline Node Bullet */}
              <div
                className={`absolute -left-[23px] top-4 h-3 w-3 rounded-full border-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-400 border-cyan-200 ring-4 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-600 group-hover:border-cyan-400'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getEventIcon(evt.eventType)}
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-100">{title}</span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {evt.timestamp}
                      </span>
                      <span>•</span>
                      <span className="text-cyan-400">{evt.confidence.toFixed(1)}% Confidence</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityPill severity={evt.severity} />
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/30 border border-rose-500/20 px-2 py-0.5 rounded">
                    +{scoreDelta} pts → Risk: {evt.postRiskScore}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug pl-8">{evt.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentTimeline;
