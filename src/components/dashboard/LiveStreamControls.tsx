'use client';

import React, { useState } from 'react';
import { Activity, Play, Pause, Volume2, VolumeX, SlidersHorizontal, Filter } from 'lucide-react';

export interface LiveStreamControlsProps {
  eventCount: number;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const LiveStreamControls: React.FC<LiveStreamControlsProps> = ({
  eventCount,
  selectedFilter,
  onFilterChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<'1x' | '2x' | '5x'>('1x');
  const [isMuted, setIsMuted] = useState(false);

  const filters = [
    { key: 'ALL', label: 'All Events' },
    { key: 'DEVTOOLS_TRAP', label: 'DevTools Only' },
    { key: 'PHONE_DETECTED', label: 'Device / Phone' },
    { key: 'MULTI_FACE', label: 'Multi-Face' },
    { key: 'MULTI_SCREEN', label: 'Extended Screen' },
    { key: 'AUDIO_VOICE', label: 'Voice Activity' },
  ];

  return (
    <div className="space-y-3 font-mono text-xs border-b border-slate-800 pb-4">
      {/* Top Stream Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">Live Signal Ingestion Active (30 FPS)</span>
        </div>

        {/* Stream Play/Pause, Speed & Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-200 border border-slate-700 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value as '1x' | '2x' | '5x')}
            className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-slate-200 focus:outline-none"
          >
            <option value="1x">1x Realtime</option>
            <option value="2x">2x Fast</option>
            <option value="5x">5x Stress-Test</option>
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={isMuted ? 'Unmute Audio Chime' : 'Mute Audio Chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Threat Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
              selectedFilter === f.key
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Processed Event Counter */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
        <span>1,420 events processed in last 10 minutes</span>
        <span className="text-cyan-400">{eventCount} active alerts in feed</span>
      </div>
    </div>
  );
};

export default LiveStreamControls;
