'use client';

import React from 'react';
import { GeneratedEvidenceDetails } from '@/utils/evidenceGenerator';
import { Camera, ShieldCheck, AlertTriangle, Terminal, Monitor, Volume2, Eye, Lock } from 'lucide-react';

export interface EvidenceCanvasProps {
  evidence: GeneratedEvidenceDetails;
}

export const EvidenceCanvas: React.FC<EvidenceCanvasProps> = ({ evidence }) => {
  const { eventType, confidence, timestamp, watermark } = evidence;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl space-y-3 font-mono">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-lg text-xs border border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Camera className="h-4 w-4 animate-pulse" />
          <span>FORENSIC EVIDENCE CANVAS</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>{timestamp}</span>
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-[11px] text-cyan-300 font-bold">
            {confidence.toFixed(1)}% CONF
          </span>
        </div>
      </div>

      {/* Main Forensic Rendering Area */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
        {/* Dynamic Evidence Graphic per Event Type */}
        {eventType === 'PHONE_DETECTED' && (
          <div className="relative h-full w-full bg-slate-950 flex items-center justify-center bg-cyber-grid">
            {/* Primary Candidate Box */}
            <div className="absolute top-[20%] left-[25%] w-[38%] h-[58%] border-2 border-emerald-500 rounded bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="absolute -top-6 left-0 bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Candidate: Primary [99% Conf]
              </span>
            </div>
            {/* Prohibited Phone Box */}
            <div className="absolute top-[38%] right-[18%] w-[16%] h-[32%] border-2 border-dashed border-rose-500 rounded bg-rose-500/10 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <span className="absolute -top-6 right-0 bg-rose-950 text-rose-400 text-[10px] px-1.5 py-0.5 rounded border border-rose-500/50 whitespace-nowrap flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Prohibited Device [{confidence}% Conf]
              </span>
              <span className="absolute bottom-1 left-1 text-[9px] text-rose-300">
                x: 420, y: 310
              </span>
            </div>
          </div>
        )}

        {eventType === 'MULTI_FACE' && (
          <div className="relative h-full w-full bg-slate-950 flex items-center justify-center bg-cyber-grid">
            {/* Primary Face */}
            <div className="absolute top-[22%] left-[20%] w-[32%] h-[55%] border-2 border-emerald-500 rounded bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="absolute -top-6 left-0 bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Candidate: Primary [99% Conf]
              </span>
            </div>
            {/* Secondary Face */}
            <div className="absolute top-[28%] right-[20%] w-[26%] h-[48%] border-2 border-rose-500 rounded bg-rose-500/10 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <span className="absolute -top-6 right-0 bg-rose-950 text-rose-400 text-[10px] px-1.5 py-0.5 rounded border border-rose-500/50 whitespace-nowrap flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Secondary Face: Unregistered [{confidence}% Conf]
              </span>
            </div>
          </div>
        )}

        {eventType === 'DEVTOOLS_TRAP' && (
          <div className="h-full w-full bg-slate-950 p-4 font-mono text-xs space-y-3 overflow-hidden border border-rose-900/40">
            <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-rose-900/40 pb-2">
              <Terminal className="h-4 w-4" /> DEVTOOLS TAMPER BREACH DETECTED
            </div>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="text-rose-300 font-semibold">
                &gt; {evidence.devtoolsData?.breakpoint}
              </div>
              <div>&gt; Access Timestamp: {evidence.devtoolsData?.accessTimestamp}</div>
              <div>&gt; User-Agent: {evidence.devtoolsData?.userAgent}</div>
              <div className="text-amber-400 pt-2">&gt; ACTION: Forensic DOM snapshot captured. Execution paused by sandbox.</div>
            </div>
          </div>
        )}

        {eventType === 'MULTI_SCREEN' && (
          <div className="h-full w-full bg-slate-950 p-6 flex items-center justify-center gap-6">
            <div className="flex-1 p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-center space-y-2">
              <Monitor className="h-8 w-8 text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-emerald-300">Primary Display</div>
              <div className="text-[10px] text-slate-400">{evidence.multiScreenData?.primaryRes}</div>
            </div>
            <div className="flex-1 p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-center space-y-2 animate-pulse">
              <Monitor className="h-8 w-8 text-rose-400 mx-auto" />
              <div className="text-xs font-bold text-rose-300">Virtual / Extended Display</div>
              <div className="text-[10px] text-slate-400">{evidence.multiScreenData?.extendedRes}</div>
            </div>
          </div>
        )}

        {eventType === 'AUDIO_VOICE' && (
          <div className="h-full w-full bg-slate-950 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-orange-400 font-bold">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" /> Multi-Channel Spectrogram Spike
              </span>
              <span>+{evidence.audioData?.decibelSpikeDb} dB Voice Energy</span>
            </div>
            {/* Simulated Waveform */}
            <div className="flex items-end justify-between gap-1 h-24 px-4">
              {[15, 25, 40, 85, 95, 100, 75, 90, 60, 30, 20, 45, 80, 95, 40, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t ${h > 70 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500/60'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>{evidence.audioData?.channel}</span>
              <span>Frequency: {evidence.audioData?.frequencyHz} Hz</span>
            </div>
          </div>
        )}

        {(eventType === 'GAZE_DEV' || eventType === 'TAB_BLUR' || eventType === 'FULLSCREEN_EXIT' || eventType === 'FACE_ABSENT') && (
          <div className="relative h-full w-full bg-slate-950 flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <Eye className="h-10 w-10 text-amber-400 animate-pulse" />
            <div className="text-xs font-bold text-amber-300">
              Gaze Offset / Focus Lost for {evidence.gazeData?.offScreenDurationSec} seconds
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Vector Trajectory: [{evidence.gazeData?.gazeVectorX}, {evidence.gazeData?.gazeVectorY}]
            </div>
          </div>
        )}
      </div>

      {/* Forensic Watermark Overlay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-2 px-1 text-[10px] text-slate-500 gap-1">
        <span className="text-slate-400 font-bold">CANDIDATE ID: #{watermark.candidateId.toUpperCase()}</span>
        <span>{watermark.timestampUtc}</span>
        <span className="text-cyan-400 flex items-center gap-1">
          <Lock className="h-3 w-3" /> {watermark.sessionHash}
        </span>
      </div>
    </div>
  );
};

export default EvidenceCanvas;
