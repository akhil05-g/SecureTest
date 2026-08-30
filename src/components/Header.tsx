"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Activity } from "lucide-react";

const navItems = [
  { name: "HR Command Center", href: "/hr" },
  { name: "Live Simulation", href: "/simulation" },
  { name: "Policy Settings", href: "/settings" },
  { name: "Admin Portal", href: "/admin" },
];

export default function Header() {
  const pathname = usePathname();

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

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-900/60 p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

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

      {/* Mobile Nav Sub-bar */}
      <div className="md:hidden border-t border-slate-800/60 bg-slate-900/40 px-4 py-2 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded ${
                isActive ? "text-cyan-400 bg-cyan-950/60 font-semibold" : "text-slate-400"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
