"use client";

import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-50 font-mono">
                  Secure<span className="text-cyan-400">Test</span>
                </span>
                <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-400 border border-cyan-800/60">
                  v2.4
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 tracking-wider">
                Monitor. Detect. Review.
              </p>
            </div>
          </Link>
        </div>

        {/* System Health Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] font-semibold tracking-wide">
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
