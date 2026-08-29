'use client';

import React, { useState } from 'react';
import { useAssessment } from '@/src/context/AssessmentContext';
import { DEMO_SCENARIOS, DemoScenario } from '@/src/utils/demoScenarios';
import { Sparkles, ChevronDown, Check, Zap } from 'lucide-react';

export function DemoScenarioPicker() {
  const { loadCandidates, selectCandidate } = useAssessment();
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-1000');

  const handleSelectScenario = (scen: DemoScenario) => {
    const candidates = scen.getCandidates();
    loadCandidates(candidates);

    if (scen.targetCandidateId) {
      selectCandidate(scen.targetCandidateId);
    } else {
      selectCandidate(null);
    }

    setActiveScenarioId(scen.id);
    setIsOpen(false);
  };

  const currentScen = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  return (
    <div className="relative font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/60 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/80 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>Judge Demo Scenarios</span>
        <span className="rounded bg-cyan-900/80 px-1.5 py-0.5 text-[10px] text-cyan-200 border border-cyan-700">
          {currentScen.badge}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1 text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> 1-Click Judge Scenarios
            </span>
            <span className="text-slate-500 font-normal">Select to Hydrate</span>
          </div>

          <div className="space-y-1.5">
            {DEMO_SCENARIOS.map((scen) => {
              const isSelected = scen.id === activeScenarioId;

              const badgeColors = {
                cyan: 'bg-cyan-950 border-cyan-800 text-cyan-300',
                rose: 'bg-rose-950 border-rose-800 text-rose-300',
                amber: 'bg-amber-950 border-amber-800 text-amber-300',
                emerald: 'bg-emerald-950 border-emerald-800 text-emerald-300',
              }[scen.color];

              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`group cursor-pointer rounded-xl border p-2.5 transition-all ${
                    isSelected
                      ? 'border-cyan-500/60 bg-slate-800/90 shadow-md'
                      : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {scen.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {scen.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[9px]">
                    <span className={`rounded border px-1.5 py-0.5 font-bold ${badgeColors}`}>
                      {scen.badge}
                    </span>
                    <span className="text-slate-500">
                      {scen.candidateCount} candidate(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoScenarioPicker;
