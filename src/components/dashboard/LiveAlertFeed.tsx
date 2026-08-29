'use client';

import React, { useState } from 'react';
import { useAssessment } from '@/src/context/AssessmentContext';
import { SeverityPill } from '@/src/components/ui/SeverityPill';
import { LiveStreamControls } from '@/src/components/dashboard/LiveStreamControls';
import { getEventTypeLabel, IntegrityEvent, EventType } from '@/src/types';
import {
  Activity,
  ShieldAlert,
  Smartphone,
  Users,
  Eye,
  Layers,
  Mic,
  Monitor,
  Maximize,
} from 'lucide-react';

function getEventIcon(eventType: EventType) {
  switch (eventType) {
    case 'DEVTOOLS_TRAP':
      return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    case 'PHONE_DETECTED':
      return <Smartphone className="h-4 w-4 text-rose-400" />;
    case 'MULTI_FACE':
      return <Users className="h-4 w-4 text-orange-400" />;
    case 'GAZE_DEV':
      return <Eye className="h-4 w-4 text-amber-400" />;
    case 'TAB_BLUR':
      return <Layers className="h-4 w-4 text-amber-400" />;
    case 'AUDIO_VOICE':
      return <Mic className="h-4 w-4 text-orange-400" />;
    case 'MULTI_SCREEN':
      return <Monitor className="h-4 w-4 text-rose-400" />;
    case 'FULLSCREEN_EXIT':
      return <Maximize className="h-4 w-4 text-amber-400" />;
    default:
      return <ShieldAlert className="h-4 w-4 text-cyan-400" />;
  }
}

export function LiveAlertFeed() {
  const { liveEvents, candidates, selectCandidate } = useAssessment();
  const [streamFilter, setStreamFilter] = useState('ALL');

  const filteredEvents = liveEvents.filter((e) => {
    if (streamFilter === 'ALL') return true;
    return e.eventType === streamFilter;
  });

  const getCandidateName = (candidateId: string) => {
    const cand = candidates.find((c) => c.id === candidateId);
    return cand ? cand.name : `Candidate (${candidateId})`;
  };

  const handleAlertClick = (candidateId: string) => {
    selectCandidate(candidateId);
  };

  return (
    <div id="live-anomaly-stream" className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex flex-col h-[760px]">
        {/* Stream Controls Bar at top */}
        <LiveStreamControls
          eventCount={filteredEvents.length}
          selectedFilter={streamFilter}
          onFilterChange={(f) => setStreamFilter(f)}
        />

        {/* Stream Cards List */}
        <div className="flex-1 overflow-y-auto pt-2 space-y-3 pr-1">
          {filteredEvents.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500">
              <Activity className="h-10 w-10 text-slate-700 mb-2 animate-pulse" />
              <p className="text-xs font-mono">Listening for live integrity telemetry...</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const candName = getCandidateName(evt.candidateId);
              const scoreDelta = evt.postRiskScore - evt.preRiskScore;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleAlertClick(evt.candidateId)}
                  className="group relative rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-2 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-md"
                >
                  {/* Top Row: Timestamp, Candidate, Severity */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      [{evt.timestamp}]
                    </span>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {candName}
                    </span>
                    <SeverityPill severity={evt.severity} />
                  </div>

                  {/* Event Title with Icon */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="shrink-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getEventIcon(evt.eventType)}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100">
                      {getEventTypeLabel(evt.eventType)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {evt.description}
                  </p>

                  {/* Footer: Confidence & Risk Delta */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                    <span className="text-slate-500">Conf: {evt.confidence}%</span>
                    <span className="font-bold text-rose-400">
                      +{scoreDelta} pts → Risk: {evt.postRiskScore}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

