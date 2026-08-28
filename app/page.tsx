import Link from "next/link";
import { Shield, Eye, AlertTriangle, Settings, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-400">
            <Shield className="h-3.5 w-3.5" /> Security Protocol Activated
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 font-mono">
            Secure<span className="text-cyan-400">Test</span> Operations Portal
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Real-time candidate monitoring, automated anomaly detection, and enterprise HR compliance review built for high-stakes technical assessments.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/candidate"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Candidate Portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hr"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              HR Command Center
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Candidate Portal",
            desc: "Secure test environment with real-time proctoring telemetry.",
            href: "/candidate",
            icon: Eye,
            color: "border-cyan-500/30 hover:border-cyan-500/80",
            iconColor: "text-cyan-400",
          },
          {
            title: "HR Command Center",
            desc: "Review candidate sessions, flag histories, and AI analysis.",
            href: "/hr",
            icon: Shield,
            color: "border-emerald-500/30 hover:border-emerald-500/80",
            iconColor: "text-emerald-400",
          },
          {
            title: "Live Simulation",
            desc: "Test cheat detection algorithms with simulated test scenarios.",
            href: "/simulation",
            icon: AlertTriangle,
            color: "border-amber-500/30 hover:border-amber-500/80",
            iconColor: "text-amber-400",
          },
          {
            title: "Policy Settings",
            desc: "Configure proctoring strictness, browser locks, and thresholds.",
            href: "/settings",
            icon: Settings,
            color: "border-rose-500/30 hover:border-rose-500/80",
            iconColor: "text-rose-400",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group rounded-xl border bg-slate-900/50 p-5 transition-all hover:bg-slate-900/80 ${item.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
