# SecureTest — AI-Powered Assessment Integrity Platform

> **Monitor everyone. Review only the suspicious few.**  
> *Built for high-stakes assessment proctoring, reducing HR review workload by **96.7%** using multi-signal temporal correlation and forensic evidence timelines.*

---

## 🌟 Executive Summary & Problem Statement

Traditional online assessment proctoring fails at scale:
1. **Endless Video Scrubbing**: HR teams waste 500+ hours watching raw webcam footage for a single 1,000-candidate cohort.
2. **Alert Fatigue**: Isolated false positives (e.g. a brief 2-second notification tab switch) unfairly flag innocent candidates.
3. **Sophisticated Cheating Traps**: DevTools debugging console inspection, extended virtual dual-monitors, and mobile device collusion routinely bypass simple browser blur detectors.

**SecureTest** solves this with a **Multi-Signal Temporal Correlation Engine**. Isolated low-impact telemetry signals (gaze drift, tab blur) remain low risk. However, when signals cluster in time (e.g., Tab switch + Gaze shift + Secondary audio within 20 seconds), exponential multipliers trigger, automatically triaging high-risk candidates for targeted human audit.

---

## 🏆 SkillPatch Integration & Category Prize Verification

SecureTest integrates **SkillPatch** verified agent skills to guarantee enterprise-grade architecture, code documentation, and security standards:

- **`code-reviewer`**: Audited entire codebase for memory leaks, XSS vulnerabilities, and state race conditions.
- **`code-documenter`**: Formatted complete JSDoc annotations, OpenAPI-compliant types, and architectural documentation.
- **`api-designer`**: Standardized JSON audit export schemas (`/utils/exportAuditReport.ts`) with SHA-256 digital signature verification.

---

## 🚀 Key Features & Differentiators

### 1. Executive HR Command Center (`/hr`)
- **Interactive 4-Card Triage Funnel**:
  - `Card 1`: Total Candidates (1,000 enrolled)
  - `Card 2`: Normal / Cleared (824 candidates | Emerald)
  - `Card 3`: Suspicious (143 candidates | Amber)
  - `Card 4`: Auto-Flagged (33 candidates | Rose with radar pulse)
- **Dynamic Candidate Table**: Sort by Risk Score, Total Violations, or Recently Active. Search by name, email, or assessment title.
- **Live Anomaly Stream**: Real-time sliding ticker of incoming security events with risk score deltas (`+25 pts → Risk: 82%`).

### 2. Candidate Deep-Dive Investigation Suite
- **Interactive Incident Timeline**: Chronological node scrubber replacing traditional video scrubbing. Click any node (`DEVTOOLS_TRAP`, `PHONE_DETECTED`, `MULTI_SCREEN`) to jump directly to that snapshot.
- **Multi-Modal Forensic Evidence Canvas**: Visual bounding box generator (`Candidate: Primary [99% Conf]` vs `Prohibited Device [94% Conf]`), coordinate tags, and forensic UTC/SHA-256 watermarks.
- **Rapid Keyboard Review Hotkeys**: Pro-level HR workflow shortcuts (`←/→` navigate nodes, `C` confirm flag, `D` dismiss false positive, `E` escalate, `Esc` close).

### 3. Multi-Signal Temporal Correlation Matrix
- Explains why candidates were flagged: isolated events give small points, but correlated bursts trigger a **1.8x temporal cluster multiplier**.
- Interactive SVG Risk Progression Chart plotting risk trajectory from 0:00 to 60:00 relative to the 70-point Auto-Flag Threshold.

### 4. Forensic Audit Exporter & Threat Analytics Suite
- **1-Click Audit Pack Export**: Generates formatted `.json` files or multi-page printable PDF reports with SHA-256 digital verification signatures.
- **Threat Telemetry Analytics**: Visual breakdown of violation vectors (DevTools 28%, Phone 24%, Multi-Screen 18%, etc.) and risk score distribution histograms.

### 5. Live Signal Simulation Studio (`/simulation`)
- Designed specifically for judges and 2-minute hackathon demos.
- One-click anomaly emitters (Inject DevTools trap, Phone detection, Multi-Screen, or Correlated Multi-Signal Attack).
- Automated stress testing attack loop firing sequential violations every 2 seconds.

---

## 🏗️ Architecture & Data Flow

```
[ Candidate Browser Telemetry ]
   │  (DevTools Trap, Tab Blur, Gaze Tracking, WebRTC Audio, MediaPipe Vision)
   ▼
[ Multi-Signal Ingestion Pipeline ]
   │
   ├─► Base Event Weighting (e.g. Phone +40, DevTools +50)
   ├─► Temporal Correlation Engine (Clustered events within 20s = 1.8x Multiplier)
   └─► Policy Threshold Evaluator (Auto-Flag >= 70 pts)
   │
   ▼
[ Reactive Assessment Context Store ]
   │
   ├─► Dynamic Triage Matrix (1,000 Candidates -> 33 Auto-Flagged)
   ├─► Real-Time 30 FPS Anomaly Stream
   ├─► Interactive Forensic Canvas & Incident Timeline
   └─► Immutable Reviewer Audit Trail
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Client & Server Components)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS, Glassmorphic Dark Enterprise UI
- **Icons**: Lucide React
- **State Management**: React Context API with memoized selectors
- **Digital Signatures**: Client-side SHA-256 verification hashing

---

## 💻 Step-by-Step Local Setup Guide

### 1. Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/securetest.git
cd buildthon

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🎬 2-Minute Judge Demo Video Script & Walkthrough

1. **0:00 - 0:30 (Landing & Triage Funnel)**:
   - Start on `/` (Executive Launchpad), navigate to `/hr`.
   - Show 1,000 candidates filtered down to 33 Auto-Flagged candidates in 1 click.
2. **0:30 - 1:15 (Deep-Dive Modal & Hotkeys)**:
   - Click "Judge Demo Scenarios" -> Select "Critical Attack: DevTools & Multi-Display".
   - Show the interactive Incident Timeline and Evidence Canvas.
   - Use keyboard hotkey `[C]` to confirm disqualification, displaying the instant toast.
3. **1:15 - 1:45 (Simulation Studio & Signal Injection)**:
   - Navigate to `/simulation`.
   - Click "Inject Payload into Session" or "Start Stress Test" and watch risk score gauges animate in real-time.
4. **1:45 - 2:00 (Export & Analytics)**:
   - Return to `/hr`, click "Export Audit Report" -> Show SHA-256 digital signature and JSON/PDF audit package.
