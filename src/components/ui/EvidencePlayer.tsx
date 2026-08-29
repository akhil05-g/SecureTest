'use client';

import React from 'react';
import { Camera, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { getEventTypeLabel, EventType } from '../../types';

export interface EvidencePlayerProps {
  snapshotUrl?: string;
  confidence: number;
  eventType: string;
  timestamp: string;
}

export const EvidencePlayer: React.FC<EvidencePlayerProps> = ({
  snapshotUrl,
  confidence,
  eventType,
  timestamp,
}) => {
  const normalizedType = eventType as EventType;
  const isSuspiciousEvent = [
    'PHONE_DETECTED',
    'MULTI_FACE',
    'FACE_ABSENT',
    'DEVTOOLS_TRAP',
    'MULTI_SCREEN',
    'AUDIO_VOICE',
  ].includes(eventType);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 rounded-lg mb-2 text-xs font-mono border border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400">
          <Camera className="h-4 w-4 animate-pulse" />
          <span className="font-semibold tracking-wider">AI EVIDENCE SNAPSHOT</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {timestamp}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-cyan-300 border border-slate-700">
            {getEventTypeLabel(normalizedType)}
          </span>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/80">
        {snapshotUrl ? (
          <img
            src={snapshotUrl}
            alt="Evidence Snapshot"
            className="h-full w-full object-cover"
          />
        ) : (
          /* Placeholder webcam view simulator */
          <div className="relative h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-600 bg-cyber-grid">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            <Camera className="h-12 w-12 text-slate-700 mb-2" />
            <span className="text-xs font-mono text-slate-500">LIVE FEED SNAPSHOT SIMULATION</span>
          </div>
        )}

        {/* Bounding Box 1: Primary Candidate Box (Green) */}
        {eventType !== 'FACE_ABSENT' && (
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[55%] border-2 border-emerald-500/80 rounded bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)] pointer-events-none transition-all duration-300">
            <span className="absolute -top-6 left-0 bg-emerald-950/90 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> CANDIDATE_PRIMARY
            </span>
            {/* Corner crosshairs */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
          </div>
        )}

        {/* Bounding Box 2: Secondary / Anomaly Detection Box (Red/Amber) */}
        {isSuspiciousEvent && (
          <div className="absolute top-[35%] right-[12%] w-[22%] h-[35%] border-2 border-rose-500/90 rounded bg-rose-500/10 shadow-[0_0_20px_rgba(225,29,72,0.4)] pointer-events-none animate-pulse">
            <span className="absolute -top-6 right-0 bg-rose-950/90 text-rose-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-rose-500/50 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {eventType.replace('_', ' ')}
            </span>
            {/* Corner crosshairs */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-rose-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-rose-400" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-rose-400" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-rose-400" />
          </div>
        )}

        {/* AI Confidence Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              AI Confidence
            </span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {confidence}%
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800 my-auto" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Timestamp
            </span>
            <span className="text-xs font-mono text-slate-200">{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidencePlayer;
